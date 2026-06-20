"use client";

import React, { useState } from "react";
import {
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { Loader2, ShieldCheck, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";

interface StripePaymentFormProps {
  onSuccess: (paymentIntentId?: string) => void;
  totalAmount: number;
  sessionId: string;
}

const StripePaymentForm = ({ onSuccess, totalAmount, sessionId }: StripePaymentFormProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Fallback timeout: If Stripe doesn't load in 10s, show error
  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (!isReady) {
        setLoadError("Stripe is taking too long to load. Please check your internet connection or API keys.");
      }
    }, 10000);
    return () => clearTimeout(timer);
  }, [isReady]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements || !isReady) return;

    setIsProcessing(true);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.origin + `/order-success/${sessionId}`,
      },
      redirect: "if_required",
    });

    if (error) {
      toast.error(error.message || "Payment failed");
      setIsProcessing(false);
    } else if (paymentIntent && paymentIntent.status === "succeeded") {
      toast.success("Payment successful!");
      onSuccess(paymentIntent.id);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white p-6 rounded-[32px] border-2 border-slate-50 shadow-sm relative min-h-[150px]">
        {loadError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white z-20 p-6 text-center">
             <p className="text-xs font-bold text-red-500 mb-4">{loadError}</p>
             <button 
               type="button"
               onClick={() => window.location.reload()}
               className="text-[10px] font-black text-[#47718F] uppercase underline tracking-widest"
             >
               Refresh Page
             </button>
          </div>
        )}
        {!isReady && !loadError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white z-10 gap-3">
             <Loader2 className="animate-spin text-[#47718F]" size={24} />
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Loading Card Fields...</p>
          </div>
        )}
        <PaymentElement 
          onReady={() => {
            console.log("Stripe Payment Element Ready");
            setIsReady(true);
          }}
          options={{
            layout: "accordion",
          }}
        />
      </div>

      {/* Trust Banner */}
      <div className="bg-slate-50 p-6 rounded-[32px] border border-slate-100 flex items-center gap-4">
        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm text-green-500">
          <ShieldCheck size={24} />
        </div>
        <div className="flex-1">
          <h5 className="text-xs font-black text-slate-800 uppercase tracking-widest">Secure Stripe Payment</h5>
          <p className="text-[10px] text-slate-400 font-medium mt-0.5">Your payment is processed securely by Stripe.</p>
        </div>
      </div>

      <button
        type="submit"
        disabled={!stripe || isProcessing || !isReady}
        className="w-full py-5 bg-[#47718F] text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-[#47718F]/20 hover:bg-[#365870] active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
      >
        {isProcessing ? (
          <>
            <Loader2 className="animate-spin" size={18} />
            Verifying Transaction...
          </>
        ) : (
          <>
            Pay ${totalAmount.toFixed(2)} Now
            <CheckCircle2 size={18} />
          </>
        )}
      </button>
    </form>
  );
};

export default StripePaymentForm;
