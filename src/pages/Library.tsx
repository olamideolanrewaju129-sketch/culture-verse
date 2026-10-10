import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../api/client';
import { CulturalResource, Culture } from '../types';
import { ResourceCard } from '../components/ResourceCard';
import { BookOpen, Search, Filter, Sparkles } from 'lucide-react';

export const Library: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCulture = searchParams.get('culture') || 'all';

  const [resources, setResources] = useState<CulturalResource[]>([]);
  const [cultures, setCultures] = useState<Culture[]>([]);
  const [selectedCulture, setSelectedCulture] = useState<string>(initialCulture);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function init() {
      try {
        const cList = await api.getCultures();
        setCultures(cList);
      } catch (e) {
        console.error(e);
      }
    }
    init();
  }, []);

  useEffect(() => {
    async function fetchFiltered() {
      setLoading(true);
      try {
        const res = await api.getResources({
          culture: selectedCulture !== 'all' ? selectedCulture : undefined,
          type: selectedType !== 'all' ? selectedType : undefined,
          search: searchQuery.trim() || undefined,
        });
        setResources(res.resources);
      } catch (err) {
        console.error('Library fetch error:', err);
      } finally {
        setLoading(false);
      }
    }

    const timer = setTimeout(() => {
      fetchFiltered();
    }, 200);

    return () => clearTimeout(timer);
  }, [selectedCulture, selectedType, searchQuery]);

  const contentTypes = [
    { id: 'all', label: 'All Formats' },
    { id: 'article', label: 'Documented History' },
    { id: 'oral_history', label: 'Oral Tradition' },
    { id: 'craft_tutorial', label: 'Craft Tutorial' },
    { id: 'recipe', label: 'Culinary Recipes' },
    { id: 'language', label: 'Language & Proverbs' },
  ];

  return (
    <div className="min-h-screen bg-[#FAF7F0] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Header */}
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E5EDE5] text-[#163D32] text-xs font-semibold">
            <BookOpen className="w-3.5 h-3.5 text-[#D6A84F]" />
            <span>Living African Cultural Repository</span>
          </div>
          <h1 className="font-editorial text-4xl sm:text-5xl font-bold text-[#163D32]">
            Cultural Library
          </h1>
          <p className="text-sm sm:text-base text-stone-600">
            Browse our authenticated archive of Yoruba, Igbo, and Hausa history, sacred textiles, linguistic expressions, oral folklore, and culinary heritage.
          </p>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white rounded-2xl border border-[#E7E5DF] p-4 sm:p-6 shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search articles, oral stories, crafts, e.g. Aso-Oke, Akwete, Tubali, Amala..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E7E5DF] focus:border-[#163D32] focus:ring-2 focus:ring-[#163D32]/10 text-sm outline-none bg-[#FAF7F0]/30 text-stone-800"
              />
            </div>

            {/* Culture Selector */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
              <button
                onClick={() => {
                  setSelectedCulture('all');
                  setSearchParams({});
                }}
                className={`px-3 py-2 text-xs font-semibold rounded-xl transition-all shrink-0 ${
                  selectedCulture === 'all'
                    ? 'bg-[#163D32] text-white shadow-xs'
                    : 'bg-[#FAF7F0] text-stone-600 hover:text-stone-900 border border-[#E7E5DF]'
                }`}
              >
                All Cultures
              </button>
              {cultures.map((c) => (
                <button
                  key={c.slug}
                  onClick={() => {
                    setSelectedCulture(c.slug);
                    setSearchParams({ culture: c.slug });
                  }}
                  className={`px-3 py-2 text-xs font-semibold rounded-xl capitalize transition-all shrink-0 ${
                    selectedCulture === c.slug
                      ? 'bg-[#163D32] text-white shadow-xs'
                      : 'bg-[#FAF7F0] text-stone-600 hover:text-stone-900 border border-[#E7E5DF]'
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          {/* Content Type Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pt-2 border-t border-[#E7E5DF]">
            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400 shrink-0">
              Format:
            </span>
            {contentTypes.map((t) => (
              <button
                key={t.id}
                onClick={() => setSelectedType(t.id)}
                className={`text-xs px-3 py-1 rounded-lg transition-colors shrink-0 ${
                  selectedType === t.id
                    ? 'bg-[#D6A84F] text-[#163D32] font-bold shadow-xs'
                    : 'text-stone-600 hover:bg-stone-100'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Results Grid */}
        {loading ? (
          <div className="text-center py-24 text-stone-500 font-medium">
            Accessing Cultural Archives...
          </div>
        ) : resources.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-[#E7E5DF] p-8 space-y-3">
            <BookOpen className="w-10 h-10 text-stone-300 mx-auto" />
            <h3 className="font-editorial text-xl font-bold text-[#163D32]">
              No archived records match your criteria.
            </h3>
            <p className="text-xs text-stone-500 max-w-sm mx-auto">
              Our library documents authentic knowledge without fabricating facts. You can suggest this topic in our Knowledge Gaps registry!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {resources.map((r) => (
              <ResourceCard key={r.id} resource={r} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
