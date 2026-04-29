"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  CreditCard,
  Wallet,
  Banknote,
  ShieldCheck,
  CheckCircle2,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import axiosInstance from "apps/user-ui/src/utils/axiosInstance";
import toast from "react-hot-toast";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import StripePaymentForm from "./StripePaymentForm";

// Initialize Stripe with the user's actual account ID from terminal logs
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ||
    "pk_test_51PXzbSSGnmKVDMGjMqZWNz1dVlfYkrLFxKz8odWopqSVaZjh6HMA1ykIybHoDmGYbfC35RcmxpfCXDjhzmglqh3T00C3MjQgjL",
);

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBack: () => void;
  onComplete: (method: string) => void;
  sessionId: string | null;
  sessionData: any;
  totalAmount: number;
}

const PaymentModal = ({
  isOpen,
  onClose,
  onBack,
  onComplete,
  sessionId,
  sessionData,
  totalAmount,
}: PaymentModalProps) => {
  const [selectedMethod, setSelectedMethod] = useState("stripe");
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isLoadingSecret, setIsLoadingSecret] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const paymentMethods = [
    {
      id: "stripe",
      title: "Credit / Debit Card",
      desc: "Instant & Secure checkout",
      icon: CreditCard,
      color: "text-blue-500",
      bgColor: "bg-blue-50",
    },
    {
      id: "cod",
      title: "Cash on Delivery",
      desc: "Pay when you receive",
      icon: Banknote,
      color: "text-emerald-500",
      bgColor: "bg-emerald-50",
    },
  ];

  // Fetch Payment Intent Secret when Stripe is selected
  useEffect(() => {
    if (selectedMethod === "stripe" && isOpen && sessionId && !clientSecret) {
      fetchClientSecret();
    }
  }, [selectedMethod, isOpen, sessionId]);

  const fetchClientSecret = async () => {
    setIsLoadingSecret(true);
    try {
      const sellerStripeAccountId = sessionData?.sellers?.[0]?.stripeAccountId;

      console.log("[Stripe] Initiating Payment Intent for session:", sessionId);
      console.log("[Stripe] Using Account ID:", sellerStripeAccountId);

      const res = await axiosInstance.post("/order/api/create-payment-intent", {
        amount: totalAmount,
        sellerStripeAccountId: sellerStripeAccountId,
        sessionId: sessionId,
      });

      if (res.data.clientSecret) {
        console.log("[Stripe] Client Secret received successfully");
        setClientSecret(res.data.clientSecret);
      } else {
        throw new Error("No client secret returned from server");
      }
    } catch (error: any) {
      console.error("[Stripe] Initialization Error:", error.message);
      toast.error(
        error.response?.data?.message || "Failed to initialize payment",
      );
    } finally {
      setIsLoadingSecret(false);
    }
  };

  const handleCODSuccess = async () => {
    setIsProcessing(true);
    try {
      await axiosInstance.post("/order/api/create-cod-order", {
        sessionId: sessionId,
      });
      onComplete("Cash on Delivery");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to place COD order");
    } finally {
      setIsProcessing(false);
    }
  };

  // Memoize options to prevent re-initialization loops
  const stripeOptions = React.useMemo(() => {
    if (!clientSecret) return null;
    return {
      clientSecret,
      appearance: {
        theme: "stripe" as const,
        variables: {
          colorPrimary: "#47718F",
        },
      },
    };
  }, [clientSecret]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      <div className="relative bg-white w-full max-w-2xl h-[90vh] md:h-auto rounded-[40px] shadow-2xl overflow-hidden animate-slide-up flex flex-col">
        {/* Header */}
        <div className="px-10 py-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/50 shrink-0">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              Checkout Payment
            </h2>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
              Order Total: ${totalAmount.toFixed(2)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-3 hover:bg-white rounded-2xl transition-all shadow-sm border border-transparent hover:border-slate-100"
          >
            <X size={20} className="text-slate-400" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-10 space-y-8 custom-scrollbar">
          {/* Tabs */}
          <div className="grid grid-cols-2 gap-4">
            {paymentMethods.map((method) => (
              <button
                key={method.id}
                disabled={isProcessing}
                onClick={() => setSelectedMethod(method.id)}
                className={`p-6 rounded-[32px] border-2 transition-all flex flex-col items-center gap-3 ${
                  selectedMethod === method.id
                    ? "bg-[#47718F]/5 border-[#47718F]"
                    : "bg-white border-slate-50 hover:border-slate-100"
                }`}
              >
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    selectedMethod === method.id
                      ? "bg-[#47718F] text-white"
                      : `${method.bgColor} ${method.color}`
                  }`}
                >
                  <method.icon size={20} />
                </div>
                <div className="text-center">
                  <h4 className="text-sm font-black text-slate-800 tracking-tight">
                    {method.title}
                  </h4>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                    {method.desc}
                  </p>
                </div>
              </button>
            ))}
          </div>

          {/* Dynamic Content */}
          <div className="pt-4">
            {selectedMethod === "stripe" ? (
              isLoadingSecret ? (
                <div className="py-20 flex flex-col items-center justify-center gap-4">
                  <Loader2 className="animate-spin text-[#47718F]" size={32} />
                  <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">
                    Connecting to Stripe Secure...
                  </p>
                </div>
              ) : clientSecret && stripeOptions ? (
                <Elements stripe={stripePromise} options={stripeOptions}>
                  <StripePaymentForm
                    totalAmount={totalAmount}
                    sessionId={sessionId!}
                    onSuccess={() => onComplete("Stripe Card")}
                  />
                </Elements>
              ) : (
                <div className="text-center py-10 bg-red-50 rounded-[32px] border border-red-100">
                  <p className="text-sm text-red-500 font-bold">
                    Failed to load payment system. Please try again.
                  </p>
                  <button
                    onClick={fetchClientSecret}
                    className="mt-4 text-xs font-black text-[#47718F] uppercase underline tracking-widest"
                  >
                    Retry Connection
                  </button>
                </div>
              )
            ) : (
              <div className="space-y-8 animate-fade-in">
                <div className="bg-emerald-50/50 p-10 rounded-[40px] border-2 border-emerald-100 text-center space-y-4">
                  <div className="w-20 h-20 bg-white rounded-[28px] flex items-center justify-center mx-auto shadow-sm text-emerald-500">
                    <Banknote size={40} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-800">
                      Cash on Delivery
                    </h3>
                    <p className="text-sm text-slate-500 mt-2 max-w-xs mx-auto font-medium">
                      You can pay with cash or card when your order arrives at
                      your doorstep.
                    </p>
                  </div>
                </div>

                <button
                  disabled={isProcessing}
                  onClick={handleCODSuccess}
                  className="w-full py-5 bg-emerald-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-emerald-100 hover:bg-emerald-600 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="animate-spin" size={18} />
                      Processing Order...
                    </>
                  ) : (
                    <>
                      Confirm Order with COD
                      <CheckCircle2 size={18} />
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-10 py-8 border-t border-slate-50 bg-slate-50/30 flex items-center justify-between shrink-0">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-all"
          >
            <ArrowLeft size={16} />
            Back to Details
          </button>
          <div className="flex items-center gap-2">
            <ShieldCheck size={14} className="text-green-500" />
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.1em]">
              PCI DSS Compliant
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
