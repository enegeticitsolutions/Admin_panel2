import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { paymentApi } from '../../services/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { ShieldCheck, CheckCircle2, Loader2, CreditCard, Sparkles, Phone, User, Lock, AlertCircle, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

export default function CheckoutPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [paymentData, setPaymentData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [isPaid, setIsPaid] = useState(false);

  useEffect(() => {
    if (!orderId) return;
    setLoading(true);
    paymentApi
      .getStatus(orderId)
      .then((data) => {
        if (data) {
          setPaymentData(data);
          if (data.status === 'success' || data.isSubscriptionActive) {
            setIsPaid(true);
          }
        } else {
          setError('Order not found');
        }
      })
      .catch((err) => {
        setError(err.message || 'Failed to load order');
      })
      .finally(() => setLoading(false));
  }, [orderId]);

  const handleSimulatePayment = async () => {
    if (!orderId) return;
    setProcessing(true);
    try {
      const res = await paymentApi.simulatePay(orderId, {
        paymentMethod: 'razorpay_online',
      });
      setIsPaid(true);
      toast.success('Payment completed successfully! Subscription activated 🎉');
    } catch (err: any) {
      toast.error(err.message || 'Payment simulation failed');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <Loader2 className="w-10 h-10 text-orange-600 animate-spin mx-auto" />
          <p className="text-sm font-semibold text-slate-600">Loading payment checkout...</p>
        </div>
      </div>
    );
  }

  if (error || !paymentData) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center border-red-200">
          <CardContent className="p-8 space-y-4">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto text-red-600">
              <AlertCircle className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-slate-800">Invalid Payment Link</h2>
            <p className="text-sm text-slate-500">{error || 'This order does not exist or has expired.'}</p>
            <Button onClick={() => navigate('/')} variant="outline" className="w-full">
              Return to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-slate-50 to-orange-100/50 flex flex-col justify-between p-4 sm:p-6 font-sans">
      {/* Brand Header */}
      <header className="max-w-lg mx-auto w-full flex items-center justify-between py-4">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-orange-600 text-white flex items-center justify-center font-extrabold text-xl shadow-md">
            M
          </div>
          <div>
            <h1 className="font-extrabold text-slate-900 leading-none">MaiHoonNa Care</h1>
            <p className="text-[10px] text-slate-500 font-medium">Senior Care Subscription Checkout</p>
          </div>
        </div>
        <div className="flex items-center gap-1 text-xs text-green-700 bg-green-100 border border-green-200 px-2.5 py-1 rounded-full font-bold">
          <ShieldCheck className="w-4 h-4" /> 256-bit SSL Secure
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-lg mx-auto w-full my-auto">
        <Card className="border-2 border-orange-200/80 shadow-xl rounded-3xl overflow-hidden bg-white/90 backdrop-blur-md">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-orange-600 to-amber-600 text-white p-6 text-center space-y-1">
            <Badge className="bg-white/20 text-white border-none text-[10px] font-extrabold uppercase tracking-wider mb-1">
              Payment Checkout Order
            </Badge>
            <h2 className="text-2xl font-black capitalize">{paymentData.packageType || 'Care Package'}</h2>
            <p className="text-orange-100 text-xs font-mono">Order ID: {orderId}</p>
          </div>

          <CardContent className="p-6 space-y-6">
            {/* Amount Badge */}
            <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5 flex justify-between items-center">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Total Payable Amount</p>
                <p className="text-3xl font-black text-orange-600">₹{paymentData.amount}</p>
              </div>
              <div>
                {isPaid ? (
                  <Badge className="bg-green-600 text-white font-bold text-xs py-1.5 px-3 rounded-full flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> PAID
                  </Badge>
                ) : (
                  <Badge variant="outline" className="border-amber-400 text-amber-800 bg-amber-50 font-extrabold text-xs py-1 px-3 rounded-full">
                    🟡 PENDING
                  </Badge>
                )}
              </div>
            </div>

            {/* Subscriber & Beneficiary Info */}
            <div className="space-y-3 bg-slate-50 rounded-2xl p-4 border border-slate-200 text-sm">
              <div className="flex justify-between items-center border-b border-slate-200/80 pb-2">
                <span className="text-slate-500 flex items-center gap-1.5 text-xs font-semibold">
                  <User className="w-4 h-4 text-orange-600" /> Customer / Subscriber
                </span>
                <span className="font-bold text-slate-800">{paymentData.subscriberName}</span>
              </div>
              {paymentData.subscriberPhone && (
                <div className="flex justify-between items-center border-b border-slate-200/80 pb-2">
                  <span className="text-slate-500 flex items-center gap-1.5 text-xs font-semibold">
                    <Phone className="w-4 h-4 text-orange-600" /> Contact Phone
                  </span>
                  <span className="font-bold text-slate-800">+91 {paymentData.subscriberPhone}</span>
                </div>
              )}
              {paymentData.beneficiaryName && (
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 flex items-center gap-1.5 text-xs font-semibold">
                    <HeartPulse className="w-4 h-4 text-orange-600" /> Beneficiary
                  </span>
                  <span className="font-bold text-slate-800">{paymentData.beneficiaryName}</span>
                </div>
              )}
            </div>

            {/* Actions: Paid vs Pending */}
            {isPaid ? (
              <div className="bg-green-50 border-2 border-green-300 rounded-2xl p-6 text-center space-y-3">
                <div className="w-14 h-14 rounded-full bg-green-600 text-white flex items-center justify-center mx-auto shadow-lg animate-bounce">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-black text-green-900">Payment Successfully Completed!</h3>
                <p className="text-xs text-green-700 font-medium">
                  Your MaiHoonNa Care Package subscription is now fully active. A confirmation receipt has been sent to your registered contact.
                </p>
                <div className="pt-2">
                  <Button onClick={() => window.close()} variant="outline" className="border-green-600 text-green-700 font-bold hover:bg-green-100">
                    Close Window
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4 pt-2">
                <p className="text-xs font-black uppercase text-slate-400 tracking-wider text-center">
                  Select Payment Method
                </p>

                {/* Simulated Payment Action */}
                <Button
                  onClick={handleSimulatePayment}
                  disabled={processing}
                  className="w-full py-6 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white font-extrabold text-base shadow-lg hover:shadow-orange-600/30 transition-all gap-2"
                >
                  {processing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" /> Verifying Online Payment...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-5 h-5" /> Pay ₹{paymentData.amount} Now (Test Online Mode)
                    </>
                  )}
                </Button>

                <p className="text-[11px] text-slate-500 text-center flex items-center justify-center gap-1">
                  <Lock className="w-3.5 h-3.5 text-slate-400" /> Powered by Razorpay Payment Gateway Test Gateway
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="max-w-lg mx-auto w-full text-center py-4 text-xs text-slate-400">
        © {new Date().getFullYear()} MaiHoonNa Care Services Private Limited. All rights reserved.
      </footer>
    </div>
  );
}

function HeartPulse(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
      <path d="M3.22 12H9.5l.5-1 2 4.5 2-7 1.5 3.5h5.27"/>
    </svg>
  );
}
