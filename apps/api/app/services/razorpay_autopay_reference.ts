/*
================================================================================
Razorpay Subscriptions (Autopay) Reference Implementation

This code is commented out for future use. It demonstrates how to create a 
Razorpay Plan, create a Subscription, and handle the Webhook for auto-renewals.
================================================================================

import Razorpay from 'razorpay';
import { config } from '../../core/config';
import prisma from '../../core/database';

const razorpay = new Razorpay({
  key_id: config.razorpayKeyId,
  key_secret: config.razorpayKeySecret,
});

// -----------------------------------------------------------------------------
// 1. Create a Razorpay Plan
// -----------------------------------------------------------------------------
// Plans dictate the billing frequency and amount. You typically create these
// once and store the `plan_id` in your database.
export async function createRazorpayPlan(packageName: string, amountInINR: number, interval: number = 1) {
  try {
    const plan = await razorpay.plans.create({
      period: 'monthly',
      interval: interval, // e.g., 1 for every month
      item: {
        name: packageName,
        amount: Math.round(amountInINR * 100), // Amount in paise
        currency: 'INR',
        description: `Monthly subscription for ${packageName}`
      }
    });
    return plan.id;
  } catch (error) {
    console.error('Error creating plan:', error);
    throw error;
  }
}

// -----------------------------------------------------------------------------
// 2. Create a Subscription
// -----------------------------------------------------------------------------
// Instead of creating an Order (which is one-time), you create a Subscription.
// The frontend will pass this subscription.id to the Razorpay checkout.
export async function createAutopaySubscription(planId: string, totalCount: number = 12) {
  try {
    const subscription = await razorpay.subscriptions.create({
      plan_id: planId,
      customer_notify: 1, // Let Razorpay send emails
      total_count: totalCount, // How many times it should renew (e.g. 12 months)
      // addons: [...] // If you want to charge a setup fee initially
    });
    return subscription;
  } catch (error) {
    console.error('Error creating subscription:', error);
    throw error;
  }
}

// -----------------------------------------------------------------------------
// 3. Webhook Handler
// -----------------------------------------------------------------------------
// You MUST register a Webhook in Razorpay pointing to /api/shared/callbacks/razorpay
// Events to listen to: 'subscription.charged', 'subscription.halted', 'subscription.cancelled'
export async function handleRazorpayWebhook(event: any) {
  const { event: eventName, payload } = event;
  
  if (eventName === 'subscription.charged') {
    const subEntity = payload.subscription.entity;
    const paymentEntity = payload.payment.entity;

    // 1. Find the local subscription in DB using razorpay_subscription_id
    // 2. Add new monthly hours to PackageHoursLog
    // 3. Extend the endDate and renewalDate
    // 4. Log the payment success
    
    console.log(`Subscription ${subEntity.id} successfully charged!`);
    // Example:
    // await prisma.subscription.update({
    //   where: { razorpaySubscriptionId: subEntity.id },
    //   data: {
    //     endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)), // Extend 1 month
    //     visitsTotal: { increment: 4 }, // Add 4 visits
    //   }
    // });
  } 
  else if (eventName === 'subscription.halted' || eventName === 'subscription.cancelled') {
    // Handle failures / cancellations
    // Example:
    // await prisma.subscription.update({
    //   where: { razorpaySubscriptionId: payload.subscription.entity.id },
    //   data: { isActive: false }
    // });
  }
}
*/
