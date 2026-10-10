import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Compass, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const loggedUser = await login(email.trim(), password);
      const targetCulture = loggedUser.preferred_culture_slug || 'yoruba';
      navigate(`/dashboard/${targetCulture}`);
    } catch (err: any) {
      console.error('Login failed:', err);
      setError(err?.message || 'Invalid email or password. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F0] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-2xl border border-[#E7E5DF] p-8 shadow-sm space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-[#163D32] text-[#D6A84F] flex items-center justify-center mx-auto border border-[#D6A84F]/30 shadow-xs">
            <Compass className="w-6 h-6" />
          </div>
          <h1 className="font-editorial text-2xl sm:text-3xl font-bold text-[#163D32]">
            Welcome Back to CultureVerse
          </h1>
          <p className="text-xs text-stone-600">
            Continue exploring Yoruba, Igbo, and Hausa cultural knowledge.
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@cultureverse.org or your registered email"
              className="w-full px-4 py-2.5 rounded-xl border border-[#E7E5DF] focus:border-[#163D32] focus:ring-2 focus:ring-[#163D32]/10 text-sm outline-none bg-[#FAF7F0]/40"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
                Password
              </label>
              <Link
                to="/forgot-password"
                className="text-[11px] text-[#B85C38] hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Your password"
              className="w-full px-4 py-2.5 rounded-xl border border-[#E7E5DF] focus:border-[#163D32] focus:ring-2 focus:ring-[#163D32]/10 text-sm outline-none bg-[#FAF7F0]/40"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-[#163D32] text-white hover:bg-[#0F2A22] text-sm font-bold shadow-md transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-[#D6A84F]" />
                <span>Signing In...</span>
              </>
            ) : (
              <>
                <span>Sign In to Dashboard</span>
                <ArrowRight className="w-4 h-4 text-[#D6A84F] group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        <div className="pt-2 text-center text-xs text-stone-600 border-t border-[#E7E5DF]">
          Don't have an account?{' '}
          <Link to="/signup" className="font-bold text-[#163D32] hover:text-[#B85C38]">
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
};
