import React, { useState } from 'react';
import { Course } from '../types';
import { api } from '../api/client';
import { X, ShieldCheck, CheckCircle2, Loader2, CreditCard, Lock } from 'lucide-react';

interface AlatPayModalProps {
  course: Course;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AlatPayModal: React.FC<AlatPayModalProps> = ({
  course,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'review' | 'processing' | 'success' | 'failed'>('review');
  const [orderRef, setOrderRef] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  if (!isOpen) return null;

  const handlePay = async () => {
    setLoading(true);
    setStep('processing');
    setErrorMsg('');

    try {
      // 1. Initiate order and payment on backend
      const initData = await api.initiateAlatPay(course.id);
      setOrderRef(initData.reference);

      // 2. Simulate 1.5s secure handshake with ALATPay banking gateway
      await new Promise((r) => setTimeout(r, 1500));

      // 3. Verify payment on backend
      const verifyData = await api.verifyAlatPay(initData.reference);
      if (verifyData.success) {
        setStep('success');
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 1800);
      } else {
        setStep('failed');
        setErrorMsg('Payment verification failed. Please try again.');
      }
    } catch (err: any) {
      console.error('Payment failure:', err);
      setStep('failed');
      setErrorMsg(err.message || 'Payment initiation failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl border border-stone-200">
        {/* Header */}
        <div className="bg-[#163D32] p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#0F2A22] flex items-center justify-center text-[#D6A84F] border border-[#D6A84F]/30">
              <CreditCard className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-editorial text-lg font-bold">ALATPay Secure Checkout</h3>
              <p className="text-[10px] text-stone-300">Official Payment Gateway for CultureVerse</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-stone-300 hover:text-white p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6">
          {step === 'review' && (
            <div className="space-y-5">
              <div className="p-4 rounded-xl bg-[#FAF7F0] border border-[#E7E5DF]">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#B85C38]">
                  Cultural Course Enrolment
                </span>
                <h4 className="font-editorial text-lg font-bold text-[#163D32] mt-1">
                  {course.title}
                </h4>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#E7E5DF] text-xs">
                  <span className="text-stone-600">Cultural Tradition</span>
                  <span className="font-semibold text-stone-900 capitalize">{course.culture_name || 'African Heritage'}</span>
                </div>
                <div className="flex items-center justify-between mt-1 text-xs">
                  <span className="text-stone-600">Total Enrolment Fee</span>
                  <span className="font-bold text-base text-[#163D32]">
                    ₦{course.price.toLocaleString()} {course.currency}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="text-xs text-stone-600 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Directly supports indigenous cultural elders and course curators.</span>
                </div>
                <div className="text-xs text-stone-600 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-stone-500 shrink-0" />
                  <span>256-bit encrypted transaction through Wema Bank / ALATPay API.</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handlePay}
                className="w-full py-3 rounded-xl bg-[#163D32] text-white hover:bg-[#0F2A22] text-sm font-bold shadow-md transition-all flex items-center justify-center gap-2"
              >
                <span>Complete Payment of ₦{course.price.toLocaleString()}</span>
              </button>
            </div>
          )}

          {step === 'processing' && (
            <div className="py-10 text-center space-y-4">
              <Loader2 className="w-10 h-10 animate-spin text-[#D6A84F] mx-auto" />
              <h4 className="font-editorial text-lg font-bold text-[#163D32]">
                Processing via ALATPay...
              </h4>
              <p className="text-xs text-stone-600 max-w-xs mx-auto">
                Communicating with the banking gateway and establishing your course access credentials in CultureVerse.
              </p>
            </div>
          )}

          {step === 'success' && (
            <div className="py-8 text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="font-editorial text-xl font-bold text-[#163D32]">
                Enrolment Confirmed!
              </h4>
              <p className="text-xs text-stone-600 max-w-xs mx-auto">
                Payment successful. Reference: <code className="font-mono">{orderRef}</code>. Redirecting to your lessons...
              </p>
            </div>
          )}

          {step === 'failed' && (
            <div className="py-6 text-center space-y-4">
              <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200">
                {errorMsg}
              </div>
              <button
                type="button"
                onClick={() => setStep('review')}
                className="px-4 py-2 rounded-lg bg-[#163D32] text-white text-xs font-semibold"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
