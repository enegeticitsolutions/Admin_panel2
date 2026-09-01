import { PrismaClient, Prisma } from '@prisma/client';

export const generateInvoiceNumber = async (
  tx: Prisma.TransactionClient,
  financialYear: string = '2026-27'
): Promise<string> => {
  const counter = await tx.invoiceCounter.upsert({
    where: { financialYear },
    update: { lastCount: { increment: 1 } },
    create: { financialYear, lastCount: 1 },
  });

  const countStr = counter.lastCount.toString().padStart(5, '0');
  return `MHN/INV/${financialYear}/${countStr}`;
};

export interface BenefitTaxItem {
  benefitId?: string;
  name: string;
  quantity: number;
  unitPrice: number;
  hsnSacCode?: string | null;
  gstRate: number;
  isGstExempt: boolean;
}

export interface TaxCalculationResult {
  baseAmount: number;
  discountAmount: number;
  taxableAmount: number;
  taxAmount: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  totalAmount: number;
  items: Array<{
    benefitId?: string;
    description: string;
    hsnSacCode: string;
    taxRate: number;
    isGstExempt: boolean;
    quantity: number;
    unitPrice: number;
    amount: number;
    tax: number;
  }>;
}

/**
 * Calculates itemized GST across multiple benefits or package components
 */
export function calculateItemizedInvoice(
  items: BenefitTaxItem[],
  totalDiscount: number = 0,
  customerState: string = 'Haryana',
  companyState: string = 'Haryana'
): TaxCalculationResult {
  const isInterState = customerState.trim().toLowerCase() !== companyState.trim().toLowerCase();

  // 1. Calculate raw total base amount
  const rawBaseAmount = items.reduce((sum, it) => sum + (it.unitPrice * it.quantity), 0);

  // 2. Distribute discount proportionally across items (or apply to base)
  const discountRatio = rawBaseAmount > 0 ? Math.min(1, totalDiscount / rawBaseAmount) : 0;

  let totalTaxAmount = 0;
  let totalTaxableAmount = 0;

  const processedItems = items.map(item => {
    const rawLineTotal = item.unitPrice * item.quantity;
    const lineDiscount = rawLineTotal * discountRatio;
    const taxableAmount = Math.max(0, rawLineTotal - lineDiscount);

    const rate = item.isGstExempt ? 0 : (item.gstRate ?? 18);
    const lineTax = item.isGstExempt ? 0 : Math.round(((taxableAmount * rate) / 100) * 100) / 100;

    totalTaxableAmount += taxableAmount;
    totalTaxAmount += lineTax;

    return {
      benefitId: item.benefitId,
      description: item.name,
      hsnSacCode: item.hsnSacCode || (item.isGstExempt ? '999312' : '998399'),
      taxRate: rate,
      isGstExempt: item.isGstExempt,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      amount: Math.round(taxableAmount * 100) / 100,
      tax: lineTax,
    };
  });

  totalTaxAmount = Math.round(totalTaxAmount * 100) / 100;
  totalTaxableAmount = Math.round(totalTaxableAmount * 100) / 100;

  const cgstAmount = isInterState ? 0 : Math.round((totalTaxAmount / 2) * 100) / 100;
  const sgstAmount = isInterState ? 0 : Math.round((totalTaxAmount / 2) * 100) / 100;
  const igstAmount = isInterState ? totalTaxAmount : 0;

  const finalTotalAmount = Math.round((totalTaxableAmount + totalTaxAmount) * 100) / 100;

  return {
    baseAmount: Math.round(rawBaseAmount * 100) / 100,
    discountAmount: Math.round(totalDiscount * 100) / 100,
    taxableAmount: totalTaxableAmount,
    taxAmount: totalTaxAmount,
    cgstAmount,
    sgstAmount,
    igstAmount,
    totalAmount: finalTotalAmount,
    items: processedItems,
  };
}
