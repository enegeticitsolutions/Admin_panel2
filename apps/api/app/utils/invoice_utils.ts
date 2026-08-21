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

export const calculateGST = (
  baseAmount: number,
  discountAmount: number,
  gstRate: number = 18,
  isInterState: boolean = false
) => {
  const taxableAmount = Math.max(0, baseAmount - discountAmount);
  const taxAmount = (taxableAmount * gstRate) / 100;
  let cgstAmount = 0;
  let sgstAmount = 0;
  let igstAmount = 0;

  if (isInterState) {
    igstAmount = taxAmount;
  } else {
    cgstAmount = taxAmount / 2;
    sgstAmount = taxAmount / 2;
  }

  return {
    taxableAmount,
    taxAmount,
    cgstAmount,
    sgstAmount,
    igstAmount,
    totalAmount: taxableAmount + taxAmount,
  };
};
