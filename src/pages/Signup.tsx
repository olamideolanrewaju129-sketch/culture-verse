import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Check, ArrowRight, AlertCircle, Loader2, Sparkles, Compass } from 'lucide-react';

export const Signup: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedCulture, setSelectedCulture] = useState<'yoruba' | 'igbo' | 'hausa'>('yoruba');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register } = useAuth();
  const navigate = useNavigate();

  const cultureCards = [
    {
      id: 'yoruba',
      name: 'Yoruba',
      image: '/Culture-images/culture-1.jpg',
      greeting: 'Ẹ káàbọ̀',
      description: 'Language, history, food, proverbs, crafts, oral traditions, and festivals.',
      initialDashboard: '/dashboard/yoruba',
      highlights: 'Àṣọ-Òkè, Ọ̀yọ́ Empire, Òwe Yorùbá, Àmàlà',
    },
    {
      id: 'igbo',
      name: 'Igbo',
      image: '/Culture-images/culture-2.jpg',
      greeting: 'Nnọọ',
      description: 'History, language, food, arts, storytelling, and community traditions.',
      initialDashboard: '/dashboard/igbo',
      highlights: 'Akwete Weaving, Iri Ji Festival, Ọdịnala, Ofe Owerri',
    },
    {
      id: 'hausa',
      name: 'Hausa',
      image: '/Culture-images/culture-3.jpg',
      greeting: 'Sannu da zuwa',
      description: 'History, language, cuisine, architecture, oral traditions, and festivals.',
      initialDashboard: '/dashboard/hausa',
      highlights: 'Tubali Architecture, Kano Dye Pits, Durbar, Tuwo Shinkafa',
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!fullName.trim() || !email.trim() || !password.trim()) {
      setError('Please fill in all required registration fields.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);

    try {
      await register(fullName.trim(), email.trim(), password, selectedCulture);
      // Successfully registered and authenticated -> navigate to chosen culture dashboard
      navigate(`/dashboard/${selectedCulture}`);
    } catch (err: any) {
      console.error('Registration failed:', err);
      setError(err?.message || 'Failed to create your account. Please check details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F0] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#E5EDE5] text-[#163D32] text-xs font-semibold border border-[#163D32]/10">
            <Compass className="w-3.5 h-3.5 text-[#D6A84F]" />
            <span>CultureVerse Registration</span>
          </div>
          <h1 className="font-editorial text-3xl sm:text-5xl font-bold text-[#163D32]">
            Begin Your Cultural Learning Journey.
          </h1>
          <p className="text-sm sm:text-base text-stone-600 max-w-xl mx-auto">
            Choose where you would like to begin. You can explore other cultures at any time.
          </p>
        </div>

        {/* Culture Selection Cards */}
        <div className="space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-[#B85C38] text-center">
            Step 1: Select Your Preferred Starting Culture
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {cultureCards.map((c) => {
              const isSelected = selectedCulture === c.id;
              return (
                <div
                  key={c.id}
                  onClick={() => setSelectedCulture(c.id as any)}
                  className={`cursor-pointer rounded-2xl overflow-hidden border-2 transition-all duration-300 relative flex flex-col justify-between ${
                    isSelected
                      ? 'border-[#163D32] ring-4 ring-[#163D32]/15 shadow-xl bg-white scale-[1.02]'
                      : 'border-[#E7E5DF] bg-white/70 hover:border-[#D6A84F] hover:bg-white'
                  }`}
                >
                  {/* Selected check indicator */}
                  {isSelected && (
                    <div className="absolute top-3 right-3 z-20 w-7 h-7 rounded-full bg-[#163D32] text-[#D6A84F] flex items-center justify-center shadow-md">
                      <Check className="w-4 h-4 stroke-[3]" />
                    </div>
                  )}

                  {/* Card Image */}
                  <div className="h-40 relative overflow-hidden bg-stone-200">
                    <img
                      src={c.image}
                      alt={c.name}
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?q=80&w=800';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                    <div className="absolute bottom-3 left-3">
                      <span className="text-[10px] font-bold text-[#D6A84F] uppercase tracking-wider block">
                        {c.greeting}
                      </span>
                      <h3 className="font-editorial text-xl font-bold text-white">
                        {c.name} Culture
                      </h3>
                    </div>
                  </div>

                  {/* Card Text */}
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <p className="text-xs text-stone-700 leading-relaxed font-medium">
                        {c.description}
                      </p>
                      <div className="mt-2 text-[10px] text-stone-500 italic">
                        Topics: {c.highlights}
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-[#E7E5DF] flex items-center justify-between text-[11px]">
                      <span className="text-stone-500">Initial Dashboard</span>
                      <span className={`font-semibold font-mono ${isSelected ? 'text-[#163D32]' : 'text-stone-400'}`}>
                        {c.initialDashboard}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <p className="text-[11px] text-stone-500 text-center italic mt-2">
            Important: The selected culture is your preferred learning experience, not a declaration of ethnicity. You use one account across all three cultures and can switch at any time.
          </p>
        </div>

        {/* Step 2: Account Details Form */}
        <div className="bg-white rounded-2xl border border-[#E7E5DF] p-6 sm:p-8 max-w-xl mx-auto shadow-sm space-y-6">
          <div className="text-center pb-2 border-b border-[#E7E5DF]">
            <h2 className="font-editorial text-xl font-bold text-[#163D32]">
              Step 2: Create Your Account
            </h2>
            <p className="text-xs text-stone-500 mt-1">
              Starting path: <strong className="capitalize text-[#163D32]">{selectedCulture} Heritage</strong>
            </p>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Adeola Adeleke / Emeka Okafor / Amina Bello"
                className="w-full px-4 py-2.5 rounded-xl border border-[#E7E5DF] focus:border-[#163D32] focus:ring-2 focus:ring-[#163D32]/10 text-sm outline-none bg-[#FAF7F0]/40"
              />
            </div>

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

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                Password
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
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
                  <span>Creating Your Cultural Profile...</span>
                </>
              ) : (
                <>
                  <span>Create Account & Open Dashboard</span>
                  <ArrowRight className="w-4 h-4 text-[#D6A84F] group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="text-center pt-2 text-xs text-stone-600">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-[#163D32] hover:text-[#B85C38]">
              Sign in here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
