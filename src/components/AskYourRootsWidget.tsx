import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import { AiAskResponse } from '../types';
import { Sparkles, Send, BookOpen, AlertCircle, CheckCircle2, Loader2, ArrowRight } from 'lucide-react';

interface AskYourRootsWidgetProps {
  initialCulture?: string;
  className?: string;
  title?: string;
  subtitle?: string;
}

export const AskYourRootsWidget: React.FC<AskYourRootsWidgetProps> = ({
  initialCulture = 'all',
  className = '',
  title = 'Ask Your Roots',
  subtitle = 'Explore African heritage with our Gemma-powered cultural learning assistant, grounded in verified library archives.',
}) => {
  const [question, setQuestion] = useState('');
  const [culture, setCulture] = useState(initialCulture);
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<AiAskResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const sampleQuestions = [
    {
      q: 'What is Àṣọ-Òkè, how is it traditionally made, and why is it important in Yoruba culture?',
      culture: 'yoruba',
      label: 'Yoruba • Àṣọ-Òkè Textiles',
    },
    {
      q: 'Explain the spiritual, agricultural, and communal symbolism of the Iri Ji New Yam festival in Igbo heritage.',
      culture: 'igbo',
      label: 'Igbo • Iri Ji Festival',
    },
    {
      q: 'What are the architectural principles of Hausa Tubali earthen buildings and the indigo dye pits of Kano?',
      culture: 'hausa',
      label: 'Hausa • Tubali Architecture',
    },
  ];

  const handleAsk = async (queryToAsk?: string, cultureToUse?: string) => {
    const q = (queryToAsk || question).trim();
    const c = cultureToUse || culture;

    if (!q) {
      setError('Please type a cultural question to explore.');
      return;
    }

    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const data = await api.askYourRoots(q, c);
      setResponse(data);
    } catch (err: any) {
      console.error('Ask Your Roots failed:', err);
      setError(err?.message || 'Failed to receive cultural answer. Please verify your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSample = (sample: { q: string; culture: string }) => {
    setQuestion(sample.q);
    setCulture(sample.culture);
    handleAsk(sample.q, sample.culture);
  };

  return (
    <div className={`bg-white rounded-2xl border border-[#E7E5DF] p-6 sm:p-8 shadow-sm ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-[#E7E5DF]">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#163D32] flex items-center justify-center text-[#D6A84F] shrink-0 border border-[#D6A84F]/30 shadow-inner">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-editorial text-2xl font-bold text-[#163D32]">{title}</h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#E5EDE5] text-[#163D32] border border-[#163D32]/20">
                Gemma 4 26B
              </span>
            </div>
            <p className="text-xs sm:text-sm text-stone-600 mt-1">{subtitle}</p>
          </div>
        </div>

        {/* Culture Filter Toggle */}
        <div className="flex items-center gap-1.5 bg-[#FAF7F0] p-1 rounded-xl border border-[#E7E5DF] self-start sm:self-auto">
          {['all', 'yoruba', 'igbo', 'hausa'].map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCulture(c)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg capitalize transition-all ${
                culture === c
                  ? 'bg-[#163D32] text-white shadow-sm'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/50'
              }`}
            >
              {c === 'all' ? 'All Cultures' : c}
            </button>
          ))}
        </div>
      </div>

      {/* Suggestion Chips */}
      <div className="mb-4">
        <span className="text-[11px] uppercase tracking-wider font-bold text-stone-500 block mb-2">
          Try asking about:
        </span>
        <div className="flex flex-wrap gap-2">
          {sampleQuestions.map((sample, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSelectSample(sample)}
              className="text-xs px-3 py-1.5 rounded-full bg-[#FAF7F0] hover:bg-[#E5EDE5] text-[#163D32] border border-[#E7E5DF] hover:border-[#163D32] transition-colors flex items-center gap-1.5 text-left"
            >
              <Sparkles className="w-3 h-3 text-[#D6A84F]" />
              <span>{sample.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleAsk();
        }}
        className="space-y-3"
      >
        <div className="relative">
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask about traditions, weaving, proverbs, ceremonies, dishes, or historical origins..."
            rows={3}
            className="w-full px-4 py-3 rounded-xl border border-[#E7E5DF] focus:border-[#163D32] focus:ring-2 focus:ring-[#163D32]/10 outline-none text-sm text-stone-800 placeholder-stone-400 resize-none bg-[#FAF7F0]/40"
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="text-[11px] text-stone-500 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Grounded in CultureVerse published archives — distinguishing facts from oral traditions</span>
          </div>

          <button
            type="submit"
            disabled={loading || !question.trim()}
            className="px-5 py-2.5 rounded-xl bg-[#163D32] text-white hover:bg-[#0F2A22] disabled:opacity-50 disabled:cursor-not-allowed text-xs font-bold transition-all shadow-sm flex items-center gap-2 group"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-[#D6A84F]" />
                <span>Consulting Gemma & Archives...</span>
              </>
            ) : (
              <>
                <span>Ask Question</span>
                <Send className="w-3.5 h-3.5 text-[#D6A84F] group-hover:translate-x-0.5 transition-transform" />
              </>
            )}
          </button>
        </div>
      </form>

      {/* Error state */}
      {error && (
        <div className="mt-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 flex items-start gap-3 text-xs">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Notice: </span>
            {error}
          </div>
        </div>
      )}

      {/* Answer and Sources */}
      {response && (
        <div className="mt-8 pt-6 border-t border-[#E7E5DF] animate-fadeIn">
          {/* Answer Box */}
          <div className="bg-[#FAF7F0] rounded-xl p-6 border border-[#E7E5DF] space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span className="text-xs font-bold uppercase tracking-wider text-[#163D32]">
                  Cultural Learning Insight
                </span>
              </div>
              <span className="text-[11px] text-stone-500 bg-white px-2 py-0.5 rounded border border-[#E7E5DF]">
                Model: {response.model || 'Gemma'}
              </span>
            </div>

            <div className="prose prose-sm max-w-none text-stone-800 leading-relaxed whitespace-pre-line text-sm font-sans">
              {response.answer}
            </div>
          </div>

          {/* Supporting Cultural Library Sources */}
          {response.sources && response.sources.length > 0 && (
            <div className="mt-6">
              <div className="flex items-center gap-2 mb-3">
                <BookOpen className="w-4 h-4 text-[#B85C38]" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700">
                  Supporting Archives & References ({response.sources.length})
                </h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {response.sources.map((src, i) => (
                  <Link
                    key={i}
                    to={`/library/${src.resourceId || src.id || src.slug}`}
                    className="p-3 rounded-xl bg-white border border-[#E7E5DF] hover:border-[#163D32] transition-all hover:shadow-sm flex items-start justify-between group"
                  >
                    <div>
                      <div className="text-xs font-bold text-[#163D32] group-hover:text-[#B85C38] transition-colors">
                        {src.title}
                      </div>
                      {src.culture_name && (
                        <div className="text-[10px] text-stone-500 mt-1">
                          {src.culture_name} • {src.category_name || 'Archival Record'}
                        </div>
                      )}
                    </div>
                    <ArrowRight className="w-4 h-4 text-stone-400 group-hover:text-[#163D32] group-hover:translate-x-0.5 transition-transform shrink-0 ml-2 mt-1" />
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
