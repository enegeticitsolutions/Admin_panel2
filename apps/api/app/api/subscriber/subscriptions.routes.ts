import { Router, Request, Response, RequestHandler } from 'express';
import rateLimit from 'express-rate-limit';
import { authenticate, AuthRequest } from '../shared/deps';
import * as subscriptionService from '../../services/subscriber/subscription_service';
import { validateCoupon } from '../../services/coupon_service';
import prisma from '../../core/database';
import { createOrder, verifyPaymentSignature } from '../../services/razorpay_service';
import { config } from '../../core/config';
import { sendAddonPurchaseNotifications } from '../../services/notification_service';
import { generateUUID } from '../../utils/helpers';
import { generateInvoiceNumber, calculateGST } from '../../utils/invoice_utils';

const router = Router();

// Payment & Order Rate Limiter (max 30 requests per 15 mins per IP)
const paymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: { success: false, message: 'Too many payment requests from this IP. Please try again after 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// ─── GST rate used everywhere in checkout (server-side source of truth) ───────
const GST_RATE = 0.18; // 18%

// ─────────────────────────────────────────────────────────────────────────────
// Helper: Calculate multi-month price for a package using its discount tiers
// ─────────────────────────────────────────────────────────────────────────────
function getMultiMonthPackagePrice(pkg: any, monthlyBase: number, durationMonths: number): number {
  if (durationMonths === 3) {
    const disc = pkg.discountThreeMonths ?? 5;
    return pkg.priceThreeMonths ? pkg.priceThreeMonths : Math.round(monthlyBase * 3 * (1 - disc / 100));
  } else if (durationMonths === 6) {
    const disc = pkg.discountSixMonths ?? 10;
    return pkg.priceSixMonths ? pkg.priceSixMonths : Math.round(monthlyBase * 6 * (1 - disc / 100));
  } else if (durationMonths === 12) {
    const disc = pkg.discountAnnual ?? 20;
    return pkg.priceTwelveMonths ? pkg.priceTwelveMonths : Math.round(monthlyBase * 12 * (1 - disc / 100));
  }
  // Default: 1 month = monthly base
  return monthlyBase;
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper to calculate exact pricing (used by both preview and create-order)
// ─────────────────────────────────────────────────────────────────────────────
async function calculatePricing(
  packageId: string, 
  couponCode: string | undefined, 
  userId: string,
  selectedAddons?: Array<{ benefitId: string; quantity: number }>,
  durationMonths: number = 1
) {
  const pkg: any = await prisma.subscriptionPackage.findFirst({
    where: {
      OR: [{ id: packageId }, { type: packageId }],
      isActive: true,
    },
    select: {
      id: true, name: true, type: true, basePrice: true,
      discountThreeMonths: true, discountSixMonths: true, discountAnnual: true,
      priceThreeMonths: true, priceSixMonths: true, priceTwelveMonths: true,
    } as any,
  });

  if (!pkg) {
    throw new Error('Package not found or inactive');
  }

  const months = Math.max(1, Math.floor(Number(durationMonths) || 1));

  // Resolve multi-month package price (with built-in duration discount)
  const monthlyBase: number = (pkg as any).basePrice;
  let packageBasePrice = getMultiMonthPackagePrice(pkg as any, monthlyBase, months);
  // Duration discount embedded in the multi-month price
  const durationDiscount = Math.round(monthlyBase * months) - packageBasePrice;

  let addonsTotalPrice = 0;
  const addonsBreakdown: any[] = [];

  if (selectedAddons && Array.isArray(selectedAddons) && selectedAddons.length > 0) {
    for (const addonItem of selectedAddons) {
      if (!addonItem.benefitId) continue;
      const q = Math.max(1, Math.floor(Number(addonItem.quantity) || 1));
      const benefit = await prisma.benefit.findUnique({
        where: { id: addonItem.benefitId },
        select: { id: true, name: true, unitLabel: true, addonPrice: true, addonDiscountPrice: true, addonIncludedUnits: true }
      });
      if (benefit && benefit.addonPrice) {
        const unitP = benefit.addonDiscountPrice ?? benefit.addonPrice;
        const itemTotal = unitP * q;
        addonsTotalPrice += itemTotal;
        addonsBreakdown.push({
          benefitId: benefit.id,
          name: benefit.name,
          unitLabel: benefit.unitLabel,
          quantity: q,
          includedUnits: (benefit.addonIncludedUnits || 1) * q,
          unitPrice: unitP,
          totalPrice: itemTotal
        });
      }
    }
  }

  const basePrice: number = packageBasePrice + addonsTotalPrice;
  let discountApplied = durationDiscount; // Start with duration discount baked in
  let finalBase = basePrice;
  let couponValid = false;
  let couponId: string | null = null;
  let couponMessage: string | undefined;

  if (couponCode && couponCode.trim()) {
    const code = couponCode.trim().toUpperCase();

    const previousSubs = await prisma.subscription.count({
      where: { subscriberId: userId }
    });
    const isFirstTime = previousSubs === 0;

    const validation = await validateCoupon(code, userId, (pkg as any).type, basePrice, isFirstTime);

    if (validation.isValid) {
      discountApplied += validation.discountApplied;
      finalBase = validation.finalAmount;
      couponValid = true;
      couponId = validation.couponId || null;
    } else {
      couponMessage = validation.message;
    }
  }

  const tax = parseFloat((finalBase * GST_RATE).toFixed(2));
  const total = parseFloat((finalBase + tax).toFixed(2));

  // Compute projected start / end dates (shown in order summary — actual dates set at activation)
  const now = new Date();
  const projectedStartDate = now.toISOString().split('T')[0]; // YYYY-MM-DD
  const projectedEnd = new Date(now);
  projectedEnd.setMonth(projectedEnd.getMonth() + months);
  const projectedEndDate = projectedEnd.toISOString().split('T')[0];

  return {
    pkg,
    durationMonths: months,
    packageBasePrice,
    addonsTotalPrice,
    addonsBreakdown,
    basePrice,
    discountApplied,
    finalBase,
    tax,
    total,
    couponValid,
    couponId,
    couponMessage,
    projectedStartDate,
    projectedEndDate,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /subscriber/subscriptions/checkout/preview
// Server-side pricing calculation — no client-side math ever trusted.
// Body: { packageId, couponCode?, selectedAddons?, durationMonths? }
// Returns: { packageName, basePrice, ..., durationMonths, projectedStartDate, projectedEndDate }
// ─────────────────────────────────────────────────────────────────────────────
router.post('/checkout/preview', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { packageId, couponCode, selectedAddons, durationMonths } = req.body;

    if (!packageId) {
      return res.status(400).json({ success: false, message: 'packageId is required' });
    }

    const months = Math.max(1, Math.floor(Number(durationMonths) || 1));

    try {
      const pricing = await calculatePricing(packageId, couponCode, userId, selectedAddons, months);
      
      return res.json({
        success: true,
        data: {
          packageId: pricing.pkg.id,
          packageName: pricing.pkg.name,
          packageBasePrice: pricing.packageBasePrice,
          addonsTotalPrice: pricing.addonsTotalPrice,
          addonsBreakdown: pricing.addonsBreakdown,
          basePrice: pricing.basePrice,
          gstRate: GST_RATE,
          discountApplied: pricing.discountApplied,
          tax: pricing.tax,
          total: pricing.total,
          couponValid: pricing.couponValid,
          couponId: pricing.couponId,
          couponMessage: pricing.couponMessage,
          // Duration info for order summary display
          durationMonths: pricing.durationMonths,
          projectedStartDate: pricing.projectedStartDate,
          projectedEndDate: pricing.projectedEndDate,
        },
      });
    } catch (err: any) {
      return res.status(404).json({ success: false, message: err.message });
    }
  } catch (error: any) {
    console.error('[Checkout Preview Error]:', error);
    res.status(500).json({ success: false, message: 'Failed to calculate checkout pricing' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /subscriber/subscriptions/create-order
// Server-side calculation -> create razorpay order
// Body: { packageId, couponCode?, selectedAddons?, durationMonths? }
// ─────────────────────────────────────────────────────────────────────────────
router.post('/create-order', paymentLimiter as unknown as RequestHandler, authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { packageId, couponCode, selectedAddons, durationMonths } = req.body;

    if (!packageId) {
      return res.status(400).json({ success: false, message: 'packageId is required' });
    }

    const months = Math.max(1, Math.floor(Number(durationMonths) || 1));
    const pricing = await calculatePricing(packageId, couponCode, userId, selectedAddons, months);
    
    // Receipt ID must be max 40 chars. 
    // Format: rcpt_ + first 8 chars of userId + _ + timestamp (total ~27 chars)
    const shortUserId = userId.substring(0, 8);
    const receiptId = `rcpt_${shortUserId}_${Date.now()}`.substring(0, 40);
    
    // Create the Razorpay Order
    const order = await createOrder(pricing.total, receiptId);
    
    res.json({
      success: true,
      data: {
        order_id: order.id,
        amount: order.amount,
        currency: order.currency,
        receipt: order.receipt
      }
    });

  } catch (error: any) {
    console.error('[Razorpay Create Order Error]:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to create order' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /subscriber/subscriptions/:subscriptionId/link-beneficiary
// Links an existing beneficiary to an unlinked care plan.
// ─────────────────────────────────────────────────────────────────────────────
router.post('/:subscriptionId/link-beneficiary', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { subscriptionId } = req.params;
    const { beneficiaryId } = req.body;

    if (!beneficiaryId) {
      return res.status(400).json({ success: false, message: 'beneficiaryId is required' });
    }

    // 1. Verify subscription ownership and ensure it's unlinked
    const subscription = await prisma.subscription.findUnique({
      where: { id: subscriptionId }
    });

    if (!subscription) {
      return res.status(404).json({ success: false, message: 'Subscription not found' });
    }
    if (subscription.subscriberId !== userId) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }
    if (subscription.beneficiaryId) {
      return res.status(400).json({ success: false, message: 'Subscription is already linked to a beneficiary' });
    }

    // 2. Verify beneficiary ownership
    const beneficiary = await prisma.beneficiary.findUnique({
      where: { id: beneficiaryId }
    });

    if (!beneficiary) {
      return res.status(404).json({ success: false, message: 'Beneficiary not found' });
    }
    if (beneficiary.subscriberId !== userId) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    // 3. Link them in a transaction (Update Subscription and reset dates from activation moment)
    await prisma.$transaction(async (tx) => {
      const newStart = new Date();
      const newEnd = new Date(newStart);
      let months = 1;
      if (subscription.startDate && subscription.endDate) {
        const diffDays = Math.round((new Date(subscription.endDate).getTime() - new Date(subscription.startDate).getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays >= 300) months = 12;
        else if (diffDays >= 150) months = 6;
        else if (diffDays >= 70) months = 3;
        else months = 1;
      } else if (subscription.duration === 'annual') {
        months = 12;
      } else if (subscription.duration === 'six_months') {
        months = 6;
      }
      newEnd.setMonth(newEnd.getMonth() + months);

      await tx.subscription.update({
        where: { id: subscriptionId },
        data: { 
          beneficiaryId: beneficiaryId,
          startDate: newStart,
          endDate: newEnd,
          isActive: true,
        }
      });

      await tx.payment.updateMany({
        where: { subscriptionId: subscriptionId },
        data: { 
          beneficiaryId: beneficiaryId,
          planStartDate: newStart,
          planEndDate: newEnd,
        }
      });
    });

    res.json({
      success: true,
      message: 'Successfully linked beneficiary to care plan',
    });

  } catch (error: any) {
    console.error('[Link Beneficiary Error]:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to link beneficiary' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /subscriber/subscriptions/purchase
// ─────────────────────────────────────────────────────────────────────────────
router.post('/purchase', paymentLimiter as unknown as RequestHandler, authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!; // Use authenticated userId
    const { 
      packageId, 
      beneficiaryData, 
      medicalData, 
      emergencyContacts, 
      couponCode,
      selectedAddons,
      durationMonths,
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature
    } = req.body;

    if (!packageId) {
      throw new Error("Missing required payload field: packageId is required.");
    }

    // Check duplicate payment claim / replay prevention
    if (razorpay_payment_id && !razorpay_payment_id.startsWith('DEV_MOCK_PAYMENT_')) {
      const existingPayment = await prisma.payment.findFirst({
        where: {
          OR: [
            { gatewayPaymentId: razorpay_payment_id },
            { transactionId: razorpay_payment_id }
          ]
        }
      });
      if (existingPayment) {
        return res.status(409).json({
          success: false,
          message: 'This payment transaction has already been processed and claimed.'
        });
      }
    }

    // Verify Payment Signature if payment details are provided
    if (razorpay_payment_id && razorpay_order_id && razorpay_signature) {
      if (razorpay_signature === 'DEV_MOCK_SIGNATURE' || config.nodeEnv === 'development') {
        console.log("⚠️ DEV MODE: Bypassing Razorpay Signature Verification using mock signature.");
      } else {
        const isValid = verifyPaymentSignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);
        if (!isValid) {
          throw new Error("Invalid payment signature. Payment verification failed.");
        }
      }
    }

    const result = await subscriptionService.purchaseSubscription(
      userId,
      packageId,
      beneficiaryData,
      medicalData,
      emergencyContacts,
      couponCode,
      selectedAddons,
      durationMonths,
      {
        razorpay_payment_id,
        razorpay_order_id,
        razorpay_signature
      }
    );

    // Generate new token containing the updated subscriber role
    const { createToken } = require('../../core/security');
    const newToken = createToken({ sub: userId, role: 'subscriber' });
    const updatedUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, phone: true, name: true, age: true, role: true }
    });

    const responseData = result as any;
    if (responseData.success) {
      responseData.token = newToken;
      responseData.user = updatedUser;
    }

    res.json(responseData);
  } catch (error: any) {
    console.error('[Purchase Error]:', error);
    res.status(400).json({ success: false, message: error.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /subscriber/subscriptions/activate
// ─────────────────────────────────────────────────────────────────────────────
router.post('/activate', authenticate, async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthRequest;
    const userId = authReq.userId;
    const { beneficiaryId, beneficiaryData, medicalData, emergencyContacts } = req.body;

    if (!beneficiaryId) {
      return res.status(400).json({
        success: false,
        message: 'beneficiaryId is required'
      });
    }

    const result = await subscriptionService.activateSubscription(
      userId as string,
      beneficiaryId,
      beneficiaryData || {},
      medicalData,
      emergencyContacts
    );

    // Generate new token containing the updated subscriber role
    const { createToken } = require('../../core/security');
    const newToken = createToken({ sub: userId as string, role: 'subscriber' });
    const updatedUser = await prisma.user.findUnique({
      where: { id: userId as string },
      select: { id: true, phone: true, name: true, age: true, role: true }
    });

    res.json({
      success: true,
      message: 'Subscription activated successfully',
      data: {
        ...result,
        token: newToken,
        user: updatedUser
      }
    });
  } catch (error: any) {
    console.error('[Activate Subscription Error]:', error);
    res.status(400).json({ success: false, message: error.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /subscriber/subscriptions/unlinked-check
// Check if the authenticated user has an active subscription with no beneficiary
// ─────────────────────────────────────────────────────────────────────────────
router.get('/unlinked-check', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const unlinkedSub = await prisma.subscription.findFirst({
      where: { subscriberId: userId, isActive: true, beneficiaryId: null },
      include: { package: true }
    });

    res.json({
      success: true,
      hasUnlinkedSubscription: !!unlinkedSub,
      subscription: unlinkedSub ? {
        id: unlinkedSub.id,
        packageType: unlinkedSub.packageType,
        packageName: (unlinkedSub.package as any)?.name || unlinkedSub.packageType,
        startDate: unlinkedSub.startDate,
        endDate: unlinkedSub.endDate
      } : null
    });
  } catch (error: any) {
    console.error('[Unlinked Check Error]:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /subscriber/subscriptions/link-beneficiary
// Link a beneficiary to an existing unlinked subscription
// Body: { beneficiaryData, medicalData?, emergencyContacts?, preferencesData? }
// ─────────────────────────────────────────────────────────────────────────────
router.post('/link-beneficiary', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { beneficiaryData, medicalData, emergencyContacts, preferencesData } = req.body;

    if (!beneficiaryData) {
      return res.status(400).json({ success: false, message: 'beneficiaryData is required' });
    }

    const result = await subscriptionService.linkBeneficiaryToSubscription(
      userId,
      beneficiaryData,
      medicalData,
      emergencyContacts,
      preferencesData
    );

    // Generate new token containing the updated subscriber role
    const { createToken } = require('../../core/security');
    const newToken = createToken({ sub: userId, role: 'subscriber' });
    const updatedUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, phone: true, name: true, age: true, role: true }
    });

    res.json({
      success: true,
      message: 'Beneficiary linked successfully',
      beneficiaryId: result.beneficiaryId,
      beneficiaryName: result.beneficiaryName,
      token: newToken,
      user: updatedUser
    });
  } catch (error: any) {
    console.error('[Link Beneficiary Error]:', error);
    res.status(400).json({ success: false, message: error.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /subscriber/subscriptions/packages
// ─────────────────────────────────────────────────────────────────────────────
router.get('/packages', async (req: Request, res: Response) => {
  try {
    const regionId = req.query.regionId as string | undefined;
    const packages = await subscriptionService.getSubscriptionPackages(regionId);
    res.json({ success: true, data: packages });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

function formatAddonUnitText(count: number, rawLabel?: string | null): string {
  if (!rawLabel) return count === 1 ? '1 unit' : `${count} units`;
  let clean = rawLabel.trim().replace(/^per\s+/i, '');
  const lower = clean.toLowerCase();

  if (lower === 'visit') clean = count === 1 ? 'visit' : 'visits';
  else if (lower === 'hour' || lower === 'hr' || lower === 'hours' || lower === 'hrs') clean = count === 1 ? 'hour' : 'hours';
  else if (lower === 'session') clean = count === 1 ? 'session' : 'sessions';
  else if (lower === 'test') clean = count === 1 ? 'test' : 'tests';
  else if (lower === 'trip') clean = count === 1 ? 'trip' : 'trips';
  else if (lower === 'consult' || lower === 'consultation') clean = count === 1 ? 'consult' : 'consults';
  else if (lower === 'order') clean = count === 1 ? 'order' : 'orders';
  else if (lower === 'request') clean = count === 1 ? 'request' : 'requests';
  else if (lower === 'day') clean = count === 1 ? 'day' : 'days';
  else if (lower === 'month') clean = count === 1 ? 'month' : 'months';
  else {
    if (count !== 1 && !lower.endsWith('s')) {
      clean = clean + 's';
    }
  }

  return `${count} ${clean}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper: Calculate add-on pricing (same GST_RATE as main checkout)
// ─────────────────────────────────────────────────────────────────────────────
async function calculateAddonPricing(benefitId: string, subscriptionId: string, userId: string, quantity: number = 1) {
  const q = Math.max(1, Math.floor(Number(quantity) || 1));

  // 1. Fetch the benefit and assert it is an active add-on
  const benefit = await prisma.benefit.findUnique({
    where: { id: benefitId },
    include: { benefitType: { select: { name: true } } }
  });

  if (!benefit) throw new Error('Benefit not found');
  if (!benefit.isAddon) throw new Error('This benefit is not available as an add-on');
  if (!benefit.isActive) throw new Error('This benefit is not currently active');
  if (benefit.addonPrice === null || benefit.addonPrice === undefined) throw new Error('Add-on price is not configured for this benefit');

  // 2. Verify subscription ownership and load beneficiary info for notification
  const subscription = await prisma.subscription.findFirst({
    where: { id: subscriptionId, subscriberId: userId, isActive: true },
    include: { beneficiary: { select: { id: true, name: true, userId: true } } }
  });
  if (!subscription) throw new Error('Active subscription not found or access denied');

  // 3. Calculate pricing — scaled by quantity `q`
  const singleBasePrice = benefit.addonDiscountPrice ?? benefit.addonPrice;
  const singleOriginalPrice = benefit.addonPrice;
  const singleUnits = benefit.addonIncludedUnits ?? 1;

  const basePrice = parseFloat((singleBasePrice * q).toFixed(2));
  const originalPrice = parseFloat((singleOriginalPrice * q).toFixed(2));
  const tax = parseFloat((basePrice * GST_RATE).toFixed(2));
  const total = parseFloat((basePrice + tax).toFixed(2));
  const includedUnits = singleUnits * q;

  return {
    benefit,
    subscription,
    quantity: q,
    unitPrice: singleBasePrice,
    unitIncludedUnits: singleUnits,
    basePrice,
    originalPrice,
    hasDiscount: !!(benefit.addonDiscountPrice && benefit.addonDiscountPrice < benefit.addonPrice),
    tax,
    total,
    includedUnits
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /subscriber/subscriptions/addons/available
// Returns all active benefits marked as add-ons
// ─────────────────────────────────────────────────────────────────────────────
router.get('/addons/available', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const regionId = req.query.regionId as string | undefined;

    const addons = await prisma.benefit.findMany({
      where: {
        isAddon: true,
        isActive: true,
        OR: [
          { isGlobal: true },
          regionId ? {
            isGlobal: false,
            benefitRegions: {
              some: { regionId }
            }
          } : null
        ].filter(Boolean) as any
      },
      include: { benefitType: { select: { id: true, name: true, iconCode: true } } },
      orderBy: [{ benefitType: { displayOrder: 'asc' } }, { displayOrder: 'asc' }]
    });

    return res.json({ success: true, data: addons });
  } catch (error: any) {
    console.error('[Addon Available Error]:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /subscriber/subscriptions/addon/preview
// Returns pricing breakdown for an add-on before payment.
// Body: { subscriptionId, benefitId, quantity? }
// ─────────────────────────────────────────────────────────────────────────────
router.post('/addon/preview', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { subscriptionId, benefitId, quantity } = req.body;

    if (!subscriptionId || !benefitId) {
      return res.status(400).json({ success: false, message: 'subscriptionId and benefitId are required' });
    }

    const p = await calculateAddonPricing(benefitId, subscriptionId, userId, quantity);

    return res.json({
      success: true,
      data: {
        benefitId: p.benefit.id,
        benefitName: p.benefit.name,
        benefitTypeName: p.benefit.benefitType?.name,
        unitLabel: p.benefit.unitLabel,
        quantity: p.quantity,
        unitPrice: p.unitPrice,
        unitIncludedUnits: p.unitIncludedUnits,
        includedUnits: p.includedUnits,
        originalPrice: p.originalPrice,
        basePrice: p.basePrice,
        hasDiscount: p.hasDiscount,
        gstRate: GST_RATE,
        tax: p.tax,
        total: p.total,
      }
    });
  } catch (error: any) {
    console.error('[Addon Preview Error]:', error);
    res.status(400).json({ success: false, message: error.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /subscriber/subscriptions/addon/create-order
// Creates a Razorpay order for an add-on purchase.
// Body: { subscriptionId, benefitId, quantity? }
// ─────────────────────────────────────────────────────────────────────────────
router.post('/addon/create-order', paymentLimiter as unknown as RequestHandler, authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { subscriptionId, benefitId, quantity } = req.body;

    if (!subscriptionId || !benefitId) {
      return res.status(400).json({ success: false, message: 'subscriptionId and benefitId are required' });
    }

    const p = await calculateAddonPricing(benefitId, subscriptionId, userId, quantity);

    const shortUserId = userId.substring(0, 8);
    const receiptId = `rcpt_ao_${shortUserId}_${Date.now()}`.substring(0, 40);

    const order = await createOrder(p.total, receiptId);

    return res.json({
      success: true,
      data: {
        order_id: order.id,
        amount: order.amount,
        currency: order.currency,
        receipt: order.receipt,
        benefitName: p.benefit.name,
        total: p.total,
        quantity: p.quantity,
        includedUnits: p.includedUnits,
      }
    });
  } catch (error: any) {
    console.error('[Addon Create Order Error]:', error);
    res.status(400).json({ success: false, message: error.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /subscriber/subscriptions/addon/purchase
// Verifies payment and credits the benefit units to the subscription.
// Body: { subscriptionId, benefitId, quantity?, razorpay_payment_id, razorpay_order_id, razorpay_signature }
// ─────────────────────────────────────────────────────────────────────────────
router.post('/addon/purchase', paymentLimiter as unknown as RequestHandler, authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { subscriptionId, benefitId, quantity, razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;

    if (!subscriptionId || !benefitId) {
      return res.status(400).json({ success: false, message: 'subscriptionId and benefitId are required' });
    }

    // Check duplicate payment claim / replay prevention
    if (razorpay_payment_id && !razorpay_payment_id.startsWith('DEV_MOCK_PAYMENT_')) {
      const existingPayment = await prisma.payment.findFirst({
        where: {
          OR: [
            { gatewayPaymentId: razorpay_payment_id },
            { transactionId: razorpay_payment_id }
          ]
        }
      });
      if (existingPayment) {
        return res.status(409).json({
          success: false,
          message: 'This payment transaction has already been processed and claimed.'
        });
      }
    }

    // 1. Verify payment signature (same pattern as /purchase)
    if (razorpay_payment_id && razorpay_order_id && razorpay_signature) {
      if (razorpay_signature === 'DEV_MOCK_SIGNATURE' && config.nodeEnv === 'development') {
        console.log('⚠️ DEV MODE: Bypassing Razorpay Signature Verification for addon purchase.');
      } else {
        const isValid = verifyPaymentSignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);
        if (!isValid) {
          return res.status(400).json({ success: false, message: 'Invalid payment signature. Payment verification failed.' });
        }
      }
    }

    // 2. Validate pricing again server-side (never trust client)
    const p = await calculateAddonPricing(benefitId, subscriptionId, userId, quantity);

    // 3. Credit units in a transaction
    const updatedBalance = await prisma.$transaction(async (tx) => {
      // Upsert the SubscriptionBenefitBalance (create if this benefit wasn't in the original package)
      const existingBalance = await tx.subscriptionBenefitBalance.findFirst({
        where: { subscriptionId, benefitId }
      });

      let balance;
      if (existingBalance) {
        // Top up existing balance
        balance = await tx.subscriptionBenefitBalance.update({
          where: { id: existingBalance.id },
          data: {
            totalUnits: existingBalance.totalUnits + p.includedUnits,
            availableUnits: existingBalance.availableUnits + p.includedUnits,
          }
        });

        // Write audit transaction
        await tx.benefitTransaction.create({
          data: {
            balanceId: balance.id,
            transactionType: 'ALLOCATED',
            units: p.includedUnits,
            totalBefore: existingBalance.totalUnits,
            totalAfter: balance.totalUnits,
            reservedBefore: existingBalance.reservedUnits,
            reservedAfter: existingBalance.reservedUnits,
            usedBefore: existingBalance.usedUnits,
            usedAfter: existingBalance.usedUnits,
            availableBefore: existingBalance.availableUnits,
            availableAfter: balance.availableUnits,
            reason: `Add-on purchase: ${p.benefit.name} × ${p.includedUnits} units | ${razorpay_payment_id || 'DEV'}`,
          }
        });
      } else {
        // Create a fresh balance row for this benefit (wasn't in the original package)
        balance = await tx.subscriptionBenefitBalance.create({
          data: {
            subscriptionId,
            benefitId,
            snapshotBenefitName: p.benefit.name,
            snapshotUnitLabel: p.benefit.unitLabel,
            totalUnits: p.includedUnits,
            availableUnits: p.includedUnits,
            usedUnits: 0,
            reservedUnits: 0,
            unit: p.benefit.unitLabel,
          }
        });

        await tx.benefitTransaction.create({
          data: {
            balanceId: balance.id,
            transactionType: 'ALLOCATED',
            units: p.includedUnits,
            totalBefore: 0,
            totalAfter: p.includedUnits,
            reservedBefore: 0,
            reservedAfter: 0,
            usedBefore: 0,
            usedAfter: 0,
            availableBefore: 0,
            availableAfter: p.includedUnits,
            reason: `Add-on purchase (new benefit): ${p.benefit.name} × ${p.includedUnits} units | ${razorpay_payment_id || 'DEV'}`,
          }
        });
      }

      // Generate invoice
      const invoiceNumber = await generateInvoiceNumber(tx as any);
      const gstCalc = calculateGST(p.basePrice, 0, GST_RATE, false);
      const invoiceId = generateUUID();
      const beneficiaryId = p.subscription.beneficiaryId || null;

      await tx.invoice.create({
        data: {
          id: invoiceId,
          invoiceNumber,
          invoiceType: 'SERVICE',
          status: 'PAID',
          subscriberId: userId,
          beneficiaryId,
          subscriptionId: subscriptionId,
          baseAmount: p.basePrice,
          discountAmount: 0,
          taxAmount: gstCalc.taxAmount,
          totalAmount: p.total,
          placeOfSupply: 'Haryana', // Default state for add-on unless fetched
          cgstAmount: gstCalc.cgstAmount,
          sgstAmount: gstCalc.sgstAmount,
          igstAmount: gstCalc.igstAmount,
          issuedAt: new Date(),
          paidAt: new Date(),
          items: {
            create: [{
              description: `Add-on: ${p.benefit.name}`,
              quantity: p.quantity || 1,
              unitPrice: p.unitPrice,
              amount: p.basePrice,
              taxRate: GST_RATE * 100
            }]
          }
        }
      });

      // Create Payment Record
      const txId = razorpay_payment_id || `TXN-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
      await tx.payment.create({
        data: {
          id: generateUUID(),
          subscriberId: userId,
          beneficiaryId,
          subscriptionId: subscriptionId,
          invoiceId: invoiceId,
          packageType: 'ADD_ON',
          baseAmount: p.basePrice,
          taxAmount: gstCalc.taxAmount,
          amountPaid: p.total,
          currency: 'INR',
          paymentStatus: 'success',
          transactionId: txId,
          gatewayName: 'RAZORPAY',
          gatewayOrderId: razorpay_order_id,
          gatewayPaymentId: razorpay_payment_id,
          gatewaySignature: razorpay_signature,
          planStartDate: new Date(),
          planEndDate: p.subscription.endDate || new Date(),
          isSubscriptionActive: true,
          paidAt: new Date()
        }
      });

      return balance;
    });

    // 4. Dispatch Push Notifications & In-App DB Notifications (via Central Service)
    sendAddonPurchaseNotifications({
      subscriberId: userId,
      beneficiaryUserId: p.subscription.beneficiary?.userId,
      beneficiaryName: p.subscription.beneficiary?.name || 'care plan',
      benefitName: p.benefit.name,
      unitsText: formatAddonUnitText(p.includedUnits, p.benefit.unitLabel),
      subscriptionId,
      benefitId,
    });

    return res.json({
      success: true,
      message: `${p.benefit.name} add-on successfully activated! ${p.includedUnits} ${p.benefit.unitLabel || 'units'} added.`,
      data: {
        benefitName: p.benefit.name,
        unitsAdded: p.includedUnits,
        newTotal: updatedBalance.totalUnits,
        newAvailable: updatedBalance.availableUnits,
      }
    });
  } catch (error: any) {
    console.error('[Addon Purchase Error]:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;