import React, { useState, useEffect } from 'react';
import { CreditCard, Link2, Copy, Check, MessageSquare, Mail, Send, AlertCircle, Loader2, Sparkles, Smartphone, RefreshCw, CheckCircle2 } from 'lucide-react';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { toast } from 'sonner';
import { paymentApi } from '../../../services/api';

export const OFFLINE_PAYMENT_METHODS = ['Cash', 'Bank Transfer', 'Cheque', 'UPI', 'NEFT/RTGS', 'Other'];

export interface PaymentLinkData {
  orderId: string;
  shortUrl: string;
  status: 'pending' | 'paid' | 'success' | 'expired' | 'failed';
  whatsappUrl?: string;
}

interface PaymentMethodSelectorProps {
  amount: number;
  subscriberName: string;
  subscriberPhone: string;
  subscriberEmail?: string;
  packageName?: string;
  paymentMode: 'offline' | 'online_link';
  onPaymentModeChange: (mode: 'offline' | 'online_link') => void;
  offlineMethod: string;
  onOfflineMethodChange: (method: string) => void;
  amountPaid: string;
  onAmountPaidChange: (val: string) => void;
  transactionId: string;
  onTransactionIdChange: (val: string) => void;
  paymentNote: string;
  onPaymentNoteChange: (val: string) => void;
  paymentLinkDetails?: PaymentLinkData | null;
  onGenerateLink?: (channels: { whatsapp: boolean; email: boolean; sms: boolean }) => Promise<void>;
  generatingLink?: boolean;
  onPaymentCompleted?: (details: any) => void;
}

export const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  amount,
  subscriberName,
  subscriberPhone,
  subscriberEmail,
  packageName,
  paymentMode,
  onPaymentModeChange,
  offlineMethod,
  onOfflineMethodChange,
  amountPaid,
  onAmountPaidChange,
  transactionId,
  onTransactionIdChange,
  paymentNote,
  onPaymentNoteChange,
  paymentLinkDetails,
  onGenerateLink,
  generatingLink = false,
  onPaymentCompleted,
}) => {
  const [copied, setCopied] = useState(false);
  const [sendWhatsapp, setSendWhatsapp] = useState(true);
  const [sendEmail, setSendEmail] = useState(true);
  const [sendSms, setSendSms] = useState(false);
  const [liveStatus, setLiveStatus] = useState<'pending' | 'paid' | 'expired' | 'failed'>('pending');
  const [checkingStatus, setCheckingStatus] = useState(false);

  // Sync initial status when paymentLinkDetails updates
  useEffect(() => {
    if (paymentLinkDetails?.status === 'paid' || paymentLinkDetails?.status === 'success') {
      setLiveStatus('paid');
    } else if (paymentLinkDetails?.status === 'expired') {
      setLiveStatus('expired');
    } else {
      setLiveStatus('pending');
    }
  }, [paymentLinkDetails]);

  // Live Status Polling Effect (Every 3 seconds when link is PENDING)
  useEffect(() => {
    if (!paymentLinkDetails?.orderId || liveStatus === 'paid') return;

    let isMounted = true;
    const pollInterval = setInterval(async () => {
      try {
        const res = await paymentApi.getStatus(paymentLinkDetails.orderId);
        const data = res?.data || res;
        if (isMounted && data) {
          if (data.status === 'paid' || data.status === 'success' || data.isSubscriptionActive) {
            setLiveStatus('paid');
            toast.success('Payment Received via Razorpay! Subscription Activated 🎉');
            if (onPaymentCompleted) onPaymentCompleted(data);
          } else if (data.status === 'expired') {
            setLiveStatus('expired');
          }
        }
      } catch (e) {}
    }, 3000);

    return () => {
      isMounted = false;
      clearInterval(pollInterval);
    };
  }, [paymentLinkDetails?.orderId, liveStatus, onPaymentCompleted]);

  const handleManualCheck = async () => {
    if (!paymentLinkDetails?.orderId) return;
    setCheckingStatus(true);
    try {
      const res = await paymentApi.getStatus(paymentLinkDetails.orderId);
      const data = res?.data || res;
      if (data) {
        if (data.status === 'paid' || data.status === 'success' || data.isSubscriptionActive) {
          setLiveStatus('paid');
          toast.success('Payment Verified! Subscription Active 🎉');
          if (onPaymentCompleted) onPaymentCompleted(data);
        } else {
          toast.info(`Payment status: ${data.status || 'pending'}`);
        }
      }
    } catch (err: any) {
      toast.error(err.message || 'Status check failed');
    } finally {
      setCheckingStatus(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Payment link copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const formattedWhatsappText = encodeURIComponent(
    `Hi ${subscriberName},\n\nYour MaiHoonNa ${packageName || 'Care Package'} payment link is ready.\n\nAmount: ₹${amountPaid || amount}\n\nPay securely here:\n${paymentLinkDetails?.shortUrl}\n\nThank you!`
  );
  const directWhatsappUrl = `https://wa.me/91${subscriberPhone.replace(/\D/g, '')}?text=${formattedWhatsappText}`;

  return (
    <div className="space-y-6">
      {/* Payment Mode Selection (Offline vs Online Link) */}
      <div className="space-y-2">
        <Label className="text-xs font-black uppercase text-gray-500 tracking-wider">Payment Mode</Label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => onPaymentModeChange('offline')}
            className={`flex items-center gap-3 p-4 rounded-2xl border-2 text-left transition-all ${
              paymentMode === 'offline'
                ? 'border-orange-500 bg-orange-50/60 ring-2 ring-orange-400/20'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <div className={`p-2.5 rounded-xl ${paymentMode === 'offline' ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-500'}`}>
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-gray-800 text-sm">Collect Offline Payment</p>
              <p className="text-xs text-gray-500">Cash, Cheque, Bank Transfer, In-person UPI</p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => onPaymentModeChange('online_link')}
            className={`flex items-center gap-3 p-4 rounded-2xl border-2 text-left transition-all ${
              paymentMode === 'online_link'
                ? 'border-orange-500 bg-orange-50/60 ring-2 ring-orange-400/20'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <div className={`p-2.5 rounded-xl ${paymentMode === 'online_link' ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-500'}`}>
              <Link2 className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-gray-800 text-sm">Generate Online Payment Link</p>
              <p className="text-xs text-gray-500">Send Razorpay link via WhatsApp/Email/SMS</p>
            </div>
          </button>
        </div>
      </div>

      {/* ── MODE A: Offline Payment Form ── */}
      {paymentMode === 'offline' && (
        <div className="space-y-4 pt-2">
          <div className="space-y-1">
            <Label htmlFor="amount">Amount Collected (₹) *</Label>
            <Input
              id="amount"
              type="number"
              value={amountPaid}
              onChange={(e) => onAmountPaidChange(e.target.value)}
              placeholder="e.g. 4999"
              className="text-lg font-bold"
            />
            {amount > 0 && parseFloat(amountPaid) < amount && amountPaid !== '' && (
              <p className="text-xs text-amber-600 flex items-center gap-1 mt-1">
                <AlertCircle className="w-3 h-3" /> Amount is less than package price — discount of ₹
                {(amount - parseFloat(amountPaid)).toFixed(0)} will be recorded.
              </p>
            )}
          </div>

          <div className="space-y-1">
            <Label>Payment Method</Label>
            <div className="flex flex-wrap gap-2">
              {OFFLINE_PAYMENT_METHODS.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => onOfflineMethodChange(m)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold border-2 transition-all ${
                    offlineMethod === m
                      ? 'border-orange-500 bg-orange-500 text-white shadow-xs'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-orange-200'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="txn">Transaction ID / Ref (optional)</Label>
            <Input
              id="txn"
              value={transactionId}
              onChange={(e) => onTransactionIdChange(e.target.value)}
              placeholder="e.g. UPI ref: 1234567890"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="pay-note">Notes (optional)</Label>
            <Input
              id="pay-note"
              value={paymentNote}
              onChange={(e) => onPaymentNoteChange(e.target.value)}
              placeholder="e.g. Handed cash to coordinator"
            />
          </div>
        </div>
      )}

      {/* ── MODE B: Online Payment Link Generator ── */}
      {paymentMode === 'online_link' && (
        <div className="space-y-5 pt-2">
          {/* Customer info card */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
            <p className="text-xs font-black text-gray-400 uppercase tracking-wider">Customer Details</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-xs text-gray-500">Subscriber</p>
                <p className="font-bold text-gray-800">{subscriberName}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Phone</p>
                <p className="font-bold text-gray-800">+91 {subscriberPhone}</p>
              </div>
              {subscriberEmail && (
                <div>
                  <p className="text-xs text-gray-500">Email</p>
                  <p className="font-bold text-gray-800">{subscriberEmail}</p>
                </div>
              )}
              <div>
                <p className="text-xs text-gray-500">Amount Payable</p>
                <p className="font-extrabold text-orange-600 text-base">₹{amountPaid || amount}</p>
              </div>
            </div>
          </div>

          {/* Share Channels */}
          {!paymentLinkDetails && (
            <div className="space-y-3">
              <Label className="text-xs font-black uppercase text-gray-500 tracking-wider">Send Payment Link Via</Label>
              <div className="flex flex-wrap gap-4">
                <label className="flex items-center gap-2 cursor-pointer select-none text-sm font-semibold text-gray-700">
                  <input
                    type="checkbox"
                    checked={sendWhatsapp}
                    onChange={(e) => setSendWhatsapp(e.target.checked)}
                    className="w-4 h-4 text-orange-600 accent-orange-600 rounded"
                  />
                  <MessageSquare className="w-4 h-4 text-green-600" /> WhatsApp
                </label>
                <label className="flex items-center gap-2 cursor-pointer select-none text-sm font-semibold text-gray-700">
                  <input
                    type="checkbox"
                    checked={sendEmail}
                    onChange={(e) => setSendEmail(e.target.checked)}
                    className="w-4 h-4 text-orange-600 accent-orange-600 rounded"
                  />
                  <Mail className="w-4 h-4 text-blue-600" /> Email
                </label>
                <label className="flex items-center gap-2 cursor-pointer select-none text-sm font-semibold text-gray-700">
                  <input
                    type="checkbox"
                    checked={sendSms}
                    onChange={(e) => setSendSms(e.target.checked)}
                    className="w-4 h-4 text-orange-600 accent-orange-600 rounded"
                  />
                  <Smartphone className="w-4 h-4 text-purple-600" /> SMS
                </label>
              </div>

              {onGenerateLink && (
                <Button
                  type="button"
                  disabled={generatingLink}
                  onClick={() => onGenerateLink({ whatsapp: sendWhatsapp, email: sendEmail, sms: sendSms })}
                  className="w-full py-6 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white font-bold shadow-md gap-2 text-base mt-2"
                >
                  {generatingLink ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" /> Generating Razorpay Link...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" /> Generate & Send Payment Link
                    </>
                  )}
                </Button>
              )}
            </div>
          )}

          {/* ── Generated Link Card with Dynamic State Machine ── */}
          {paymentLinkDetails && (
            <div className={`border-2 rounded-2xl p-5 space-y-4 transition-all ${
              liveStatus === 'paid'
                ? 'bg-green-50/90 border-green-300'
                : liveStatus === 'expired'
                ? 'bg-red-50/90 border-red-300'
                : 'bg-orange-50/80 border-orange-200'
            }`}>
              {/* State Machine Status Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {liveStatus === 'paid' ? (
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  ) : liveStatus === 'expired' ? (
                    <AlertCircle className="w-5 h-5 text-red-600" />
                  ) : (
                    <span className="w-3 h-3 rounded-full bg-amber-500 animate-pulse"></span>
                  )}
                  <span className={`text-xs font-black uppercase tracking-wider ${
                    liveStatus === 'paid' ? 'text-green-800' : liveStatus === 'expired' ? 'text-red-800' : 'text-amber-800'
                  }`}>
                    {liveStatus === 'paid' ? 'Payment Received & Activated' : liveStatus === 'expired' ? 'Link Expired' : 'Payment Link Generated'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full border ${
                    liveStatus === 'paid'
                      ? 'bg-green-100 text-green-800 border-green-300'
                      : liveStatus === 'expired'
                      ? 'bg-red-100 text-red-800 border-red-300'
                      : 'bg-amber-100 text-amber-800 border-amber-300'
                  }`}>
                    {liveStatus === 'paid' ? '🟢 PAID & ACTIVATED' : liveStatus === 'expired' ? '🔴 EXPIRED' : '🟡 PENDING PAYMENT'}
                  </span>

                  {liveStatus === 'pending' && (
                    <Button
                      type="button"
                      onClick={handleManualCheck}
                      disabled={checkingStatus}
                      variant="outline"
                      className="h-7 px-2.5 text-[10px] font-bold bg-white text-amber-900 border-amber-300 hover:bg-amber-100"
                    >
                      <RefreshCw className={`w-3 h-3 mr-1 ${checkingStatus ? 'animate-spin' : ''}`} />
                      Check Status
                    </Button>
                  )}
                </div>
              </div>

              {/* Status Celebration Banner */}
              {liveStatus === 'paid' ? (
                <div className="bg-green-600 text-white rounded-xl p-4 text-center space-y-1 shadow-sm">
                  <p className="font-black text-sm">🎉 Payment Successfully Received via Razorpay!</p>
                  <p className="text-xs text-green-100">Subscription has been automatically marked as ACTIVE in your system.</p>
                </div>
              ) : (
                <div className="space-y-1">
                  <p className="text-xs text-gray-500">Order ID: <span className="font-mono font-bold text-gray-800">{paymentLinkDetails.orderId}</span></p>
                  <div className="flex items-center gap-2 mt-1">
                    <Input
                      readOnly
                      value={paymentLinkDetails.shortUrl}
                      className="bg-white font-mono text-xs font-semibold text-orange-900 border-orange-200"
                    />
                    <Button
                      type="button"
                      onClick={() => handleCopy(paymentLinkDetails.shortUrl)}
                      variant="outline"
                      className="bg-white hover:bg-orange-100 text-orange-700 border-orange-300 shrink-0 font-bold"
                    >
                      {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                      {copied ? 'Copied' : 'Copy Link'}
                    </Button>
                    <a
                      href={paymentLinkDetails.shortUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shrink-0 transition-all shadow-xs"
                    >
                      Open Link ↗
                    </a>
                  </div>
                </div>
              )}

              {/* Action Sharing Buttons */}
              {liveStatus === 'pending' && (
                <div className="flex flex-wrap gap-2 pt-2">
                  <a
                    href={directWhatsappUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold text-xs shadow-sm transition-all"
                  >
                    <MessageSquare className="w-4 h-4" /> Send via WhatsApp Web
                  </a>
                  <Button
                    type="button"
                    onClick={() => handleCopy(paymentLinkDetails.shortUrl)}
                    variant="outline"
                    className="px-4 py-2.5 rounded-xl bg-white hover:bg-gray-50 text-gray-700 font-bold text-xs border-gray-300"
                  >
                    <Send className="w-3.5 h-3.5" /> Share Link
                  </Button>
                </div>
              )}

              <p className="text-[11px] text-amber-700 italic text-center pt-1">
                🔒 Subscription will automatically activate immediately upon verified Razorpay payment confirmation.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
