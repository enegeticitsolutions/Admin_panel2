import React, { useState, useEffect, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import {
  Plus,
  Minus,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Activity,
  Check,
} from 'lucide-react';
import { toast } from 'sonner';
import { benefitApi, zoneApi, regionApi, subscriptionApi, paymentApi } from '../../../services/api';
import { PaymentMethodSelector } from '../payment/PaymentMethodSelector';
import { LocationRegionSearch } from '../common/LocationRegionSearch';

export interface AddonBenefitModalProps {
  isOpen: boolean;
  onClose: () => void;
  subscriptionId?: string;
  beneficiaryId?: string;
  beneficiaryName?: string;
  subscriberId?: string;
  subscriberName?: string;
  subscriberPhone?: string;
  subscriberEmail?: string;
  defaultLocationId?: string;
  defaultPincode?: string;
  onSuccess?: (result: any) => void;
  // If used in wizard step without immediate DB allocation
  standaloneSelectMode?: boolean;
  onSelectAddonForWizard?: (addonData: {
    benefit: any;
    units: number;
    totalAmount: number;
    paymentDetails?: any;
  }) => void;
}

export const AddonBenefitModal: React.FC<AddonBenefitModalProps> = ({
  isOpen,
  onClose,
  subscriptionId,
  beneficiaryId,
  beneficiaryName,
  subscriberId,
  subscriberName = 'Subscriber',
  subscriberPhone = '',
  subscriberEmail = '',
  defaultLocationId = 'all',
  defaultPincode,
  onSuccess,
  standaloneSelectMode = false,
  onSelectAddonForWizard,
}) => {
  // Step 1: Addon selection, Step 2: Payment & confirmation
  const [modalStep, setModalStep] = useState<'select' | 'payment'>('select');

  // Loading States
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Data
  const [zones, setZones] = useState<any[]>([]);
  const [regions, setRegions] = useState<any[]>([]);
  const [allAddons, setAllAddons] = useState<any[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<string>(defaultLocationId);

  // Selected Add-on state
  const [selectedBenefitId, setSelectedBenefitId] = useState<string>('');
  const [quantityMultiplier, setQuantityMultiplier] = useState<number>(1);

  // Payment states (for PaymentMethodSelector)
  const [paymentMode, setPaymentMode] = useState<'offline' | 'online_link'>('offline');
  const [offlineMethod, setOfflineMethod] = useState<string>('Cash');
  const [amountPaid, setAmountPaid] = useState<string>('');
  const [transactionId, setTransactionId] = useState<string>('');
  const [paymentNote, setPaymentNote] = useState<string>('');
  const [paymentLinkDetails, setPaymentLinkDetails] = useState<any>(null);
  const [generatingLink, setGeneratingLink] = useState<boolean>(false);

  // Load Regions, Zones, and Addon Benefits on mount / open
  useEffect(() => {
    if (!isOpen) return;

    const loadData = async () => {
      setLoading(true);
      try {
        const [zonesData, regionsData, benefitsData] = await Promise.all([
          zoneApi.getAll().catch(() => []),
          regionApi.getAll().catch(() => []),
          benefitApi.getAll({ activeOnly: true }).catch(() => []),
        ]);

        setZones(zonesData || []);
        setRegions(regionsData || []);

        // Filter only benefits marked as add-ons
        const addons = (benefitsData || []).filter((b: any) => b.isAddon);
        setAllAddons(addons);
      } catch (err: any) {
        console.error('Failed to load add-on modal data', err);
        toast.error('Failed to load add-on benefits');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [isOpen]);

  // Reset modal state when closed
  useEffect(() => {
    if (!isOpen) {
      setModalStep('select');
      setSelectedBenefitId('');
      setQuantityMultiplier(1);
      setPaymentMode('offline');
      setOfflineMethod('Cash');
      setAmountPaid('');
      setTransactionId('');
      setPaymentNote('');
      setPaymentLinkDetails(null);
      setSelectedLocation(defaultLocationId);
    }
  }, [isOpen, defaultLocationId]);

  // Filter add-ons by location/region
  const filteredAddons = useMemo(() => {
    if (selectedLocation === 'all') {
      return allAddons;
    }

    // Check matching zone to find corresponding regionId
    const matchingZone = zones.find((z) => z.id === selectedLocation);
    const targetRegionId = matchingZone?.regionId || selectedLocation;

    return allAddons.filter((b) => {
      if (b.isGlobal) return true;
      const regionIds = b.regionIds || (b.regions || []).map((r: any) => r.id);
      if (!regionIds || regionIds.length === 0) return false;
      return (
        regionIds.includes(selectedLocation) ||
        regionIds.includes(targetRegionId)
      );
    });
  }, [allAddons, selectedLocation, zones]);

  // Current selected benefit object
  const selectedBenefit = useMemo(() => {
    return allAddons.find((b) => b.id === selectedBenefitId);
  }, [allAddons, selectedBenefitId]);

  // Calculate pricing
  const pricing = useMemo(() => {
    if (!selectedBenefit) return { unitPrice: 0, totalUnits: 0, totalAmount: 0, discountPrice: 0 };

    const baseUnits = selectedBenefit.addonIncludedUnits || selectedBenefit.defaultUnits || 1;
    const totalUnits = baseUnits * quantityMultiplier;

    // Price calculation
    const unitPrice =
      selectedBenefit.addonPrice !== null && selectedBenefit.addonPrice !== undefined
        ? selectedBenefit.addonPrice
        : (selectedBenefit.unitCost || 0) * baseUnits;

    const discountPrice = selectedBenefit.addonDiscountPrice || 0;
    const finalUnitPrice = discountPrice > 0 && discountPrice < unitPrice ? discountPrice : unitPrice;
    const totalAmount = finalUnitPrice * quantityMultiplier;

    return {
      unitPrice,
      discountPrice,
      finalUnitPrice,
      totalUnits,
      totalAmount,
    };
  }, [selectedBenefit, quantityMultiplier]);

  // Keep amountPaid in sync with total amount
  useEffect(() => {
    if (pricing.totalAmount > 0) {
      setAmountPaid(String(pricing.totalAmount));
    }
  }, [pricing.totalAmount]);

  const handleProceedToPayment = () => {
    if (!selectedBenefit) {
      toast.error('Please select an add-on benefit to continue');
      return;
    }
    if (standaloneSelectMode && onSelectAddonForWizard) {
      onSelectAddonForWizard({
        benefit: selectedBenefit,
        units: pricing.totalUnits,
        totalAmount: pricing.totalAmount,
      });
      onClose();
      return;
    }
    setModalStep('payment');
  };

  const handleCompleteAllocation = async (completedPaymentDetails?: any) => {
    if (!selectedBenefit) return;
    const targetSubId = subscriptionId || beneficiaryId;

    if (!targetSubId) {
      toast.error('No active subscription found to attach add-on');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        benefitId: selectedBenefit.id,
        units: pricing.totalUnits,
        amountPaid: parseFloat(amountPaid) || pricing.totalAmount,
        paymentMethod: completedPaymentDetails?.paymentMethod || (paymentMode === 'online_link' ? 'Razorpay Online' : offlineMethod),
        transactionId: completedPaymentDetails?.orderId || transactionId || undefined,
        paymentNote: paymentNote || `Add-on: ${selectedBenefit.name} (${pricing.totalUnits} ${selectedBenefit.unitLabel || 'units'})`,
      };

      const result = await subscriptionApi.allocateAddon(targetSubId, payload);
      toast.success(`🎉 ${pricing.totalUnits} ${selectedBenefit.unitLabel || 'units'} of "${selectedBenefit.name}" added successfully!`);

      if (onSuccess) {
        onSuccess(result);
      }
      onClose();
    } catch (err: any) {
      console.error('Addon allocation error:', err);
      toast.error(err.message || 'Failed to allocate add-on benefit');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[720px] max-h-[92vh] overflow-y-auto p-0 rounded-3xl border-none shadow-2xl">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-orange-500 via-[#FF7A00] to-amber-500 p-6 text-white rounded-t-3xl relative">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/30">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <DialogTitle className="text-xl font-black text-white flex items-center gap-2">
                Add-on Benefits & Services
              </DialogTitle>
              <DialogDescription className="text-white/80 text-xs mt-0.5">
                {beneficiaryName ? `Assign extra care visits & services for ${beneficiaryName}` : 'Select and allocate regional or global add-ons'}
              </DialogDescription>
            </div>
          </div>

          {/* Stepper indicator if in payment step */}
          <div className="flex gap-2 mt-4">
            <div className={`h-1.5 flex-1 rounded-full ${modalStep === 'select' ? 'bg-white' : 'bg-white/40'}`} />
            <div className={`h-1.5 flex-1 rounded-full ${modalStep === 'payment' ? 'bg-white' : 'bg-white/40'}`} />
          </div>
        </div>

        <div className="p-6 space-y-6">
          {modalStep === 'select' ? (
            <>
              {/* ── Reusable Modular Location / Google Search & Region Detector ── */}
              <LocationRegionSearch
                selectedLocationId={selectedLocation}
                regions={regions}
                zones={zones}
                defaultPincode={defaultPincode}
                onLocationChange={(locId) => setSelectedLocation(locId)}
                headerBadge={
                  <span className="text-[10px] bg-orange-100/80 text-[#FF7A00] font-bold px-2 py-0.5 rounded-full border border-orange-200">
                    {filteredAddons.length} Add-ons available
                  </span>
                }
              />

              {/* ── Add-on Benefits List ── */}
              <div className="space-y-3">
                <Label className="text-xs font-bold text-gray-600 uppercase tracking-wider block">
                  Available Add-on Benefits
                </Label>

                {loading ? (
                  <div className="py-12 text-center text-muted-foreground flex flex-col items-center gap-3">
                    <Loader2 className="w-8 h-8 animate-spin text-[#FF7A00]" />
                    <span className="text-xs font-medium">Loading Add-on benefits...</span>
                  </div>
                ) : filteredAddons.length === 0 ? (
                  <div className="py-10 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                    <AlertCircle className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-gray-600">No Add-on benefits configured for this location</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Try selecting "All Locations" or configure add-on benefits in Master Admin &gt; Add-ons Management.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-3 max-h-[300px] overflow-y-auto pr-1">
                    {filteredAddons.map((addon) => {
                      const isSelected = selectedBenefitId === addon.id;
                      const baseUnits = addon.addonIncludedUnits || addon.defaultUnits || 1;
                      const price =
                        addon.addonPrice !== null && addon.addonPrice !== undefined
                          ? addon.addonPrice
                          : (addon.unitCost || 0) * baseUnits;
                      const hasDiscount = addon.addonDiscountPrice && addon.addonDiscountPrice > 0 && addon.addonDiscountPrice < price;

                      return (
                        <div
                          key={addon.id}
                          onClick={() => setSelectedBenefitId(addon.id)}
                          className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between gap-4 ${
                            isSelected
                              ? 'border-[#FF7A00] bg-orange-50/40 shadow-sm'
                              : 'border-gray-200 hover:border-orange-200 bg-white'
                          }`}
                        >
                          <div className="flex items-start gap-3 flex-1">
                            <div
                              className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                                isSelected ? 'bg-[#FF7A00] text-white' : 'bg-gray-100 text-gray-600'
                              }`}
                            >
                              <Activity className="w-5 h-5" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-gray-800 text-sm">{addon.name}</span>
                                <Badge
                                  variant="secondary"
                                  className={`text-[8px] uppercase px-1.5 h-4 border-none ${
                                    addon.isGlobal
                                      ? 'bg-blue-100 text-blue-700'
                                      : 'bg-[#FFE6D5] text-[#FF7A00]'
                                  }`}
                                >
                                  {addon.isGlobal ? 'Global' : 'Region Based'}
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                                {addon.description || `${baseUnits} ${addon.unitLabel || 'Units'} included`}
                              </p>
                              <span className="inline-block text-[11px] font-semibold text-gray-500 mt-1">
                                Package Base: {baseUnits} {addon.unitLabel || 'visits/units'}
                              </span>
                            </div>
                          </div>

                          <div className="text-right flex flex-col items-end flex-shrink-0">
                            {hasDiscount && (
                              <span className="text-[10px] line-through text-muted-foreground">
                                ₹{price}
                              </span>
                            )}
                            <span className="text-base font-black text-gray-900">
                              ₹{hasDiscount ? addon.addonDiscountPrice : price}
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                              per {baseUnits} {addon.unitLabel || 'unit'}
                            </span>
                          </div>

                          <div className="flex-shrink-0 pl-2">
                            <div
                              className={`w-6 h-6 rounded-full flex items-center justify-center border transition-all ${
                                isSelected
                                  ? 'bg-[#FF7A00] border-[#FF7A00] text-white'
                                  : 'border-gray-300 text-transparent'
                              }`}
                            >
                              <Check className="w-3.5 h-3.5" />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* ── Quantity Multiplier ── */}
              {selectedBenefit && (
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center justify-between">
                  <div>
                    <Label className="text-xs font-bold text-gray-700 block">Quantity / Multiplier</Label>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Total: <strong className="text-gray-800">{pricing.totalUnits} {selectedBenefit.unitLabel || 'units'}</strong>
                    </p>
                  </div>
                  <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl p-1 shadow-sm">
                    <button
                      type="button"
                      disabled={quantityMultiplier <= 1}
                      onClick={() => setQuantityMultiplier(Math.max(1, quantityMultiplier - 1))}
                      className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center font-bold disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="font-black text-sm px-2 text-gray-800">{quantityMultiplier}x</span>
                    <button
                      type="button"
                      onClick={() => setQuantityMultiplier(quantityMultiplier + 1)}
                      className="w-8 h-8 rounded-lg bg-orange-100 hover:bg-orange-200 text-[#FF7A00] flex items-center justify-center font-bold transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* ── Footer Total & Next ── */}
              <div className="border-t pt-4 flex items-center justify-between">
                <div>
                  <span className="text-xs text-muted-foreground block">Total Amount</span>
                  <span className="text-2xl font-black text-gray-900">
                    ₹{pricing.totalAmount}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={onClose} className="rounded-xl">
                    Cancel
                  </Button>
                  <Button
                    onClick={handleProceedToPayment}
                    disabled={!selectedBenefit}
                    className="bg-[#FF7A00] hover:bg-orange-600 text-white font-bold rounded-xl px-6"
                  >
                    Proceed to Payment →
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* ── Payment Step ── */}
              <div className="space-y-4">
                {/* Summary Card */}
                {selectedBenefit && (
                  <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-black uppercase text-[#FF7A00] tracking-widest block">
                        Selected Add-on
                      </span>
                      <p className="font-bold text-gray-900 text-base">{selectedBenefit.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {pricing.totalUnits} {selectedBenefit.unitLabel || 'units'} · Quantity {quantityMultiplier}x
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-muted-foreground block">Amount Due</span>
                      <span className="text-xl font-black text-[#FF7A00]">₹{pricing.totalAmount}</span>
                    </div>
                  </div>
                )}

                {/* Unified PaymentMethodSelector Component */}
                <PaymentMethodSelector
                  amount={pricing.totalAmount}
                  subscriberName={subscriberName}
                  subscriberPhone={subscriberPhone}
                  subscriberEmail={subscriberEmail}
                  packageName={`Add-on: ${selectedBenefit?.name}`}
                  paymentMode={paymentMode}
                  onPaymentModeChange={setPaymentMode}
                  offlineMethod={offlineMethod}
                  onOfflineMethodChange={setOfflineMethod}
                  amountPaid={amountPaid}
                  onAmountPaidChange={setAmountPaid}
                  transactionId={transactionId}
                  onTransactionIdChange={setTransactionId}
                  paymentNote={paymentNote}
                  onPaymentNoteChange={setPaymentNote}
                  paymentLinkDetails={paymentLinkDetails}
                  generatingLink={generatingLink}
                  onPaymentCompleted={(completedDetails) => {
                    handleCompleteAllocation(completedDetails);
                  }}
                  onGenerateLink={async (channels) => {
                    setGeneratingLink(true);
                    try {
                      const res = await paymentApi.generateLink({
                        subscriberId: subscriberId || '',
                        beneficiaryId: beneficiaryId || '',
                        subscriptionId: subscriptionId || '',
                        packageType: 'addon',
                        packageName: `Add-on: ${selectedBenefit?.name} (${pricing.totalUnits} units)`,
                        amount: parseFloat(amountPaid) || pricing.totalAmount,
                        subscriberPhone,
                        subscriberEmail,
                        subscriberName,
                        duration: 'one_time',
                      });
                      const data = res?.data || res;
                      if (data && (data.shortUrl || data.orderId)) {
                        setPaymentLinkDetails(data);
                        toast.success('Add-on payment link generated successfully! 🔗');
                      }
                    } catch (err: any) {
                      toast.error(err.message || 'Failed to generate payment link');
                    } finally {
                      setGeneratingLink(false);
                    }
                  }}
                />

                {/* Footer Buttons */}
                <div className="border-t pt-4 flex items-center justify-between">
                  <Button
                    variant="outline"
                    onClick={() => setModalStep('select')}
                    className="rounded-xl"
                  >
                    ← Back to Add-ons
                  </Button>
                  {paymentMode === 'offline' && (
                    <Button
                      onClick={() => handleCompleteAllocation()}
                      disabled={submitting || !amountPaid}
                      className="bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl px-6"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Allocating...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4 mr-2" /> Confirm & Credit Units
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
