import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { Culture } from '../types';
import { useAuth } from '../context/AuthContext';
import { HeartHandshake, CheckCircle2, AlertCircle, Loader2, Sparkles, ScrollText, ShieldCheck } from 'lucide-react';

export const Contribute: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const [cultures, setCultures] = useState<Culture[]>([]);
  const [cultureId, setCultureId] = useState('cult_yoruba');
  const [contentType, setContentType] = useState('oral_history');
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [sourceReferences, setSourceReferences] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const cList = await api.getCultures();
        setCultures(cList);
        if (cList.length > 0) setCultureId(cList[0].id);
      } catch (e) {
        console.error(e);
      }
    }
    load();
  }, []);

  const handleSubmit = async (isDraft: boolean) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (!title.trim() || !content.trim()) {
      setError('Please provide at least a title and the cultural documentation content.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await api.submitContribution({
        title: title.trim(),
        summary: summary.trim() || title.trim(),
        content: content.trim(),
        culture_id: cultureId,
        category_id: 'cat_yo_stories', // default fallback
        content_type: contentType,
        source_references: sourceReferences.trim() || 'Oral account passed down by family/community lineage.',
        status: isDraft ? 'draft' : 'pending',
      });
      setSuccess(true);
      setTitle('');
      setSummary('');
      setContent('');
      setSourceReferences('');
    } catch (err: any) {
      setError(err?.message || 'Failed to submit contribution.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F0] py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-10">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E5EDE5] text-[#163D32] text-xs font-semibold">
            <HeartHandshake className="w-3.5 h-3.5 text-[#D6A84F]" />
            <span>Community Cultural Stewardship</span>
          </div>
          <h1 className="font-editorial text-4xl sm:text-5xl font-bold text-[#163D32]">
            Contribute Cultural Knowledge
          </h1>
          <p className="text-sm sm:text-base text-stone-600">
            Help preserve authentic oral histories, ancestral recipes, textile weaves, and indigenous wisdom before they are lost to time.
          </p>
        </div>

        {/* Guidelines Box */}
        <div className="p-6 rounded-2xl bg-[#E5EDE5]/60 border border-[#163D32]/10 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#163D32]">
            <ShieldCheck className="w-4 h-4 text-[#D6A84F]" />
            <span>CultureVerse Preservation Standards</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-stone-700">
            <div>
              <strong className="block text-stone-900 mb-1">Authentic Origin</strong>
              Only submit traditions you have directly learned, practiced, or researched within legitimate communities.
            </div>
            <div>
              <strong className="block text-stone-900 mb-1">Distinguish Sources</strong>
              Clearly state whether an account is oral history, family lineage practice, or documented historical record.
            </div>
            <div>
              <strong className="block text-stone-900 mb-1">Elder Peer Review</strong>
              All contributions are reviewed by indigenous educators before publishing to the live library.
            </div>
          </div>
        </div>

        {/* Contribution Form */}
        <div className="bg-white rounded-3xl border border-[#E7E5DF] p-6 sm:p-10 shadow-sm space-y-6">
          {success && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <strong>Thank you!</strong> Your cultural submission has been received and queued for review by our indigenous curators.
              </div>
            </div>
          )}

          {error && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                Culture
              </label>
              <select
                value={cultureId}
                onChange={(e) => setCultureId(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-[#E7E5DF] focus:border-[#163D32] text-sm outline-none bg-[#FAF7F0]/40 text-stone-800"
              >
                {cultures.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                Format
              </label>
              <select
                value={contentType}
                onChange={(e) => setContentType(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-[#E7E5DF] focus:border-[#163D32] text-sm outline-none bg-[#FAF7F0]/40 text-stone-800"
              >
                <option value="oral_history">Oral Tradition / Folktale</option>
                <option value="craft_tutorial">Traditional Craft Tutorial</option>
                <option value="recipe">Indigenous Culinary Recipe</option>
                <option value="language">Linguistic Expression / Proverb</option>
                <option value="article">Documented Historical Record</option>
                <option value="interview">Community Elder Interview</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
              Title of Contribution
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Origin of Akwete Weaving Patterns in Ukwa East"
              className="w-full px-4 py-2.5 rounded-xl border border-[#E7E5DF] focus:border-[#163D32] text-sm outline-none bg-[#FAF7F0]/40 text-stone-800"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
              Brief Summary (1-2 sentences)
            </label>
            <input
              type="text"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Summarize the core lineage, context, or significance"
              className="w-full px-4 py-2.5 rounded-xl border border-[#E7E5DF] focus:border-[#163D32] text-sm outline-none bg-[#FAF7F0]/40 text-stone-800"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
              Full Knowledge Content & Details
            </label>
            <textarea
              rows={8}
              required
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write the full narrative, oral account, ingredient proportions, or step-by-step techniques..."
              className="w-full px-4 py-3 rounded-xl border border-[#E7E5DF] focus:border-[#163D32] text-sm outline-none bg-[#FAF7F0]/40 text-stone-800"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
              Sources, Family Lineage, or Citations
            </label>
            <input
              type="text"
              value={sourceReferences}
              onChange={(e) => setSourceReferences(e.target.value)}
              placeholder="e.g. Narrated by Elder Chukwuma (Age 84), Aba / Historical archives of Oyo"
              className="w-full px-4 py-2.5 rounded-xl border border-[#E7E5DF] focus:border-[#163D32] text-sm outline-none bg-[#FAF7F0]/40 text-stone-800"
            />
          </div>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-end gap-3 border-t border-[#E7E5DF]">
            <button
              type="button"
              disabled={loading}
              onClick={() => handleSubmit(true)}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-[#E7E5DF] hover:bg-stone-50 text-xs font-semibold text-stone-700 transition-colors"
            >
              Save as Draft
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={() => handleSubmit(false)}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#163D32] text-white hover:bg-[#0F2A22] text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#D6A84F]" />
                  <span>Submitting for Review...</span>
                </>
              ) : (
                <span>Submit for Cultural Review</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
