import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Compass, ArrowRight, CheckCircle2 } from 'lucide-react';

export const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F0] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-2xl border border-[#E7E5DF] p-8 shadow-sm space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-[#163D32] text-[#D6A84F] flex items-center justify-center mx-auto border border-[#D6A84F]/30 shadow-xs">
            <Compass className="w-6 h-6" />
          </div>
          <h1 className="font-editorial text-2xl font-bold text-[#163D32]">
            Reset Your Password
          </h1>
          <p className="text-xs text-stone-600">
            Enter your registered email and we'll send you recovery instructions.
          </p>
        </div>

        {submitted ? (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs space-y-2 text-center">
            <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto" />
            <p className="font-bold">Recovery Link Dispatched</p>
            <p>
              If an account is associated with <strong>{email}</strong>, check your inbox for password reset instructions.
            </p>
            <div className="pt-3">
              <Link to="/login" className="font-bold text-[#163D32] underline">
                Return to Login
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@example.com"
                className="w-full px-4 py-2.5 rounded-xl border border-[#E7E5DF] focus:border-[#163D32] focus:ring-2 focus:ring-[#163D32]/10 text-sm outline-none bg-[#FAF7F0]/40"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-[#163D32] text-white hover:bg-[#0F2A22] text-sm font-bold shadow-md transition-all flex items-center justify-center gap-2 group"
            >
              <span>Send Recovery Link</span>
              <ArrowRight className="w-4 h-4 text-[#D6A84F] group-hover:translate-x-1 transition-transform" />
            </button>
          </form>
        )}

        <div className="pt-2 text-center text-xs text-stone-600 border-t border-[#E7E5DF]">
          Remembered your password?{' '}
          <Link to="/login" className="font-bold text-[#163D32] hover:text-[#B85C38]">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};
