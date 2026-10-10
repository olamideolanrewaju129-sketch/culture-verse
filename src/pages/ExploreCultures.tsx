import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { Culture } from '../types';
import { CultureCard } from '../components/CultureCard';
import { Compass, Sparkles } from 'lucide-react';

export const ExploreCultures: React.FC = () => {
  const [cultures, setCultures] = useState<Culture[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCultures() {
      try {
        const list = await api.getCultures();
        setCultures(list);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchCultures();
  }, []);

  return (
    <div className="min-h-screen bg-[#FAF7F0] py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E5EDE5] text-[#163D32] text-xs font-semibold">
            <Compass className="w-3.5 h-3.5 text-[#D6A84F]" />
            <span>Living Traditions of Africa</span>
          </div>
          <h1 className="font-editorial text-4xl sm:text-5xl font-bold text-[#163D32]">
            Explore Root Cultures
          </h1>
          <p className="text-sm sm:text-base text-stone-600">
            Journey into Yoruba, Igbo, and Hausa civilizations. Each culture offers dedicated archival libraries, language resources, structured courses, and interactive AI grounding.
          </p>
        </div>

        {loading ? (
          <div className="text-center py-20 text-stone-500">Loading cultures...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {cultures.map((c) => (
              <CultureCard key={c.id} culture={c} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
