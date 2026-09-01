export interface DurationOption {
  value: string;
  label: string;
  months: number;
}

export const DURATION_OPTIONS: DurationOption[] = [
  { value: 'monthly', label: 'Monthly (1 Mo)', months: 1 },
  { value: 'three_months', label: '3 Months', months: 3 },
  { value: 'six_months', label: '6 Months', months: 6 },
  { value: 'annual', label: 'Annual (12 Mo)', months: 12 },
];

export interface WizardPricingBreakdown {
  months: number;
  durationLabel: string;
  baseMonthlyRate: number;
  undiscountedPackageTotal: number;
  packageBasePrice: number;
  packageDiscount: number;
  addonsBasePrice: number;
  totalBaseAmount: number;
  isInterState: boolean;
  gstRate: number;
  taxLabel: string;
  packageTax: number;
  addonsTax: number;
  totalTaxAmount: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  finalTotalAmount: number;
}

export function calculateWizardPricing(
  pkg: any | undefined,
  duration: string = 'monthly',
  addons: any[] = [],
  customerState: string = 'Haryana',
  companyState: string = 'Haryana'
): WizardPricingBreakdown {
  const opt = DURATION_OPTIONS.find(d => d.value === duration) || DURATION_OPTIONS[0];
  const months = opt.months;

  if (!pkg) {
    return {
      months,
      durationLabel: opt.label,
      baseMonthlyRate: 0,
      undiscountedPackageTotal: 0,
      packageBasePrice: 0,
      packageDiscount: 0,
      addonsBasePrice: 0,
      totalBaseAmount: 0,
      isInterState: false,
      gstRate: 18,
      taxLabel: 'GST (18%)',
      packageTax: 0,
      addonsTax: 0,
      totalTaxAmount: 0,
      cgstAmount: 0,
      sgstAmount: 0,
      igstAmount: 0,
      finalTotalAmount: 0,
    };
  }

  const baseMonthlyRate = Number(pkg.basePrice) || 0;
  const undiscountedPackageTotal = baseMonthlyRate * months;

  let packageBasePrice = undiscountedPackageTotal;
  if (months === 3) {
    const disc = Number(pkg.discountThreeMonths ?? 5);
    packageBasePrice = pkg.priceThreeMonths ? Number(pkg.priceThreeMonths) : Math.round(undiscountedPackageTotal * (1 - disc / 100));
  } else if (months === 6) {
    const disc = Number(pkg.discountSixMonths ?? 10);
    packageBasePrice = pkg.priceSixMonths ? Number(pkg.priceSixMonths) : Math.round(undiscountedPackageTotal * (1 - disc / 100));
  } else if (months === 12) {
    const disc = Number(pkg.discountAnnual ?? 20);
    packageBasePrice = pkg.priceTwelveMonths ? Number(pkg.priceTwelveMonths) : Math.round(undiscountedPackageTotal * (1 - disc / 100));
  } else {
    packageBasePrice = baseMonthlyRate;
  }

  const packageDiscount = Math.max(0, undiscountedPackageTotal - packageBasePrice);
  const addonsBasePrice = (addons || []).reduce((sum, a) => sum + (Number(a.totalAmount) || 0), 0);
  const totalBaseAmount = packageBasePrice + addonsBasePrice;

  // Inter-state determination (Haryana is company POS)
  const isInterState = (customerState || '').trim().toLowerCase() !== (companyState || 'Haryana').trim().toLowerCase();
  const pkgGstRate = Number(pkg.gstRate ?? 18);
  const packageTax = Math.round((packageBasePrice * pkgGstRate) / 100);

  let addonsTax = 0;
  for (const a of (addons || [])) {
    const rate = (a.benefit?.isGstExempt || a.benefit?.gstRate === 0) ? 0 : Number(a.benefit?.gstRate ?? 18);
    addonsTax += Math.round(((Number(a.totalAmount) || 0) * rate) / 100);
  }

  const totalTaxAmount = packageTax + addonsTax;
  const cgstAmount = isInterState ? 0 : Math.round(totalTaxAmount / 2);
  const sgstAmount = isInterState ? 0 : Math.round(totalTaxAmount / 2);
  const igstAmount = isInterState ? totalTaxAmount : 0;
  const finalTotalAmount = totalBaseAmount + totalTaxAmount;

  const taxLabel = isInterState ? `IGST (${pkgGstRate}%)` : `CGST (${pkgGstRate / 2}%) + SGST (${pkgGstRate / 2}%)`;

  return {
    months,
    durationLabel: opt.label,
    baseMonthlyRate,
    undiscountedPackageTotal,
    packageBasePrice,
    packageDiscount,
    addonsBasePrice,
    totalBaseAmount,
    isInterState,
    gstRate: pkgGstRate,
    taxLabel,
    packageTax,
    addonsTax,
    totalTaxAmount,
    cgstAmount,
    sgstAmount,
    igstAmount,
    finalTotalAmount,
  };
}
