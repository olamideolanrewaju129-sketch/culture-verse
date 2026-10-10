import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { User, CheckCircle2, ShieldCheck, Compass } from 'lucide-react';

export const DashboardProfile: React.FC = () => {
  const { user, activeCulture, switchCulture } = useAuth();
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [biography, setBiography] = useState(user?.biography || '');
  const [preferredCulture, setPreferredCulture] = useState(activeCulture);
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    switchCulture(preferredCulture);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="font-editorial text-3xl font-bold text-[#163D32]">
          Learner Profile & Settings
        </h1>
        <p className="text-xs sm:text-sm text-stone-600">
          Manage your personal cultural preferences and learning credentials.
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-[#E7E5DF] p-6 sm:p-10 shadow-sm space-y-6">
        {saved && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Profile and cultural preference updated successfully!</span>
          </div>
        )}

        <div className="flex items-center gap-4 pb-6 border-b border-[#E7E5DF]">
          <div className="w-16 h-16 rounded-2xl bg-[#163D32] text-[#D6A84F] flex items-center justify-center font-bold text-2xl border border-[#D6A84F]/30">
            {fullName ? fullName[0].toUpperCase() : 'U'}
          </div>
          <div>
            <h3 className="font-editorial text-xl font-bold text-[#163D32]">
              {fullName || 'Learner'}
            </h3>
            <span className="text-xs text-stone-500">{user?.email}</span>
            <div className="text-[10px] uppercase font-bold text-[#B85C38] mt-1">
              Role: {user?.role || 'user'}
            </div>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
              Full Name
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-[#E7E5DF] text-xs outline-none focus:border-[#163D32]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
              Preferred Learning Focus
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'yoruba', label: 'Yoruba' },
                { id: 'igbo', label: 'Igbo' },
                { id: 'hausa', label: 'Hausa' },
              ].map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setPreferredCulture(c.id)}
                  className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all ${
                    preferredCulture === c.id
                      ? 'bg-[#163D32] text-white border-[#163D32]'
                      : 'bg-[#FAF7F0] text-stone-700 border-[#E7E5DF] hover:bg-stone-100'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-stone-500 mt-1 italic">
              You can switch between Yoruba, Igbo, and Hausa at any time with one single account.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
              Bio / Cultural Heritage Notes
            </label>
            <textarea
              rows={3}
              value={biography}
              onChange={(e) => setBiography(e.target.value)}
              placeholder="Tell us about your background or interests in African heritage..."
              className="w-full px-4 py-2.5 rounded-xl border border-[#E7E5DF] text-xs outline-none focus:border-[#163D32]"
            />
          </div>

          <div className="pt-4 border-t border-[#E7E5DF] flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#163D32] text-white hover:bg-[#0F2A22] text-xs font-bold transition-all shadow-sm"
            >
              Save Profile Preferences
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
