import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../../api/client';
import { KnowledgeGap } from '../../types';
import { HelpCircle, ThumbsUp, Plus, Sparkles, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

export const DashboardKnowledgeGaps: React.FC = () => {
  const { cultureId } = useParams<{ cultureId: string }>();
  const [gaps, setGaps] = useState<KnowledgeGap[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [whyItMatters, setWhyItMatters] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);

  const fetchGaps = async () => {
    try {
      const data = await api.getKnowledgeGaps(cultureId);
      setGaps(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGaps();
  }, [cultureId]);

  const handleVote = async (gapId: string) => {
    try {
      await api.voteKnowledgeGap(gapId);
      fetchGaps();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    setSubmitting(true);
    try {
      await api.createKnowledgeGap({
        title: title.trim(),
        description: description.trim(),
        why_it_matters: whyItMatters.trim(),
        culture_id: cultureId === 'igbo' ? 'cult_igbo' : cultureId === 'hausa' ? 'cult_hausa' : 'cult_yoruba',
        category_id: 'cat_yo_crafts',
      });
      setSuccessMsg(true);
      setTitle('');
      setDescription('');
      setWhyItMatters('');
      setModalOpen(false);
      fetchGaps();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E5EDE5] text-[#163D32] text-xs font-semibold">
            <HelpCircle className="w-3.5 h-3.5 text-[#D6A84F]" />
            <span>Community Crowdsourcing</span>
          </div>
          <h1 className="font-editorial text-3xl font-bold text-[#163D32] mt-1">
            Knowledge Gaps Registry
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 max-w-xl">
            Notice a missing traditional practice, dialect expression, or craft? Suggest it here so community elders and researchers can document it.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="px-5 py-2.5 rounded-xl bg-[#163D32] text-white hover:bg-[#0F2A22] text-xs font-bold shadow-sm transition-all flex items-center gap-2 shrink-0"
        >
          <Plus className="w-4 h-4 text-[#D6A84F]" />
          <span>Suggest a Knowledge Gap</span>
        </button>
      </div>

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Knowledge gap submitted! Custodians and researchers can now see this request.</span>
        </div>
      )}

      {/* Gaps List */}
      {loading ? (
        <div className="py-20 text-center text-stone-500">Checking gaps registry...</div>
      ) : gaps.length === 0 ? (
        <div className="p-10 rounded-2xl bg-white border border-[#E7E5DF] text-center space-y-3">
          <Sparkles className="w-8 h-8 text-[#D6A84F] mx-auto" />
          <h3 className="font-editorial text-lg font-bold text-[#163D32]">
            No open knowledge gaps registered yet.
          </h3>
          <p className="text-xs text-stone-500">
            Be the first to request documentation on a traditional topic!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {gaps.map((gap) => (
            <div
              key={gap.id}
              className="p-6 rounded-2xl bg-white border border-[#E7E5DF] hover:border-[#163D32] transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6"
            >
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#E5EDE5] text-[#163D32] uppercase">
                    {gap.culture_name || 'African Heritage'}
                  </span>
                  <span className="text-[10px] text-stone-500">
                    Status: <strong className="capitalize text-amber-700">{gap.status}</strong>
                  </span>
                </div>
                <h3 className="font-editorial text-xl font-bold text-[#163D32]">
                  {gap.title}
                </h3>
                <p className="text-xs text-stone-600 leading-relaxed">
                  {gap.description}
                </p>
                {gap.why_it_matters && (
                  <p className="text-[11px] text-[#B85C38] italic">
                    Why it matters: {gap.why_it_matters}
                  </p>
                )}
              </div>

              <div className="flex sm:flex-col items-center gap-2 shrink-0">
                <button
                  onClick={() => handleVote(gap.id)}
                  className="px-4 py-2 rounded-xl bg-[#FAF7F0] hover:bg-[#E5EDE5] border border-[#E7E5DF] hover:border-[#163D32] text-xs font-bold text-[#163D32] transition-colors flex items-center gap-1.5"
                >
                  <ThumbsUp className="w-3.5 h-3.5 text-[#D6A84F]" />
                  <span>{gap.votes_count} Interest Votes</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Suggest Gap Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-stone-200">
            <div className="flex items-center justify-between pb-3 border-b border-[#E7E5DF]">
              <h3 className="font-editorial text-xl font-bold text-[#163D32]">
                Suggest a Cultural Knowledge Gap
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-stone-400 hover:text-stone-700">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                  Topic or Tradition to Document
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Natural Indigo Dye Extraction in Ancient Oyo"
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E7E5DF] text-xs outline-none focus:border-[#163D32]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                  What information is currently missing?
                </label>
                <textarea
                  rows={3}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Explain what details, elder accounts, or historical records are needed..."
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E7E5DF] text-xs outline-none focus:border-[#163D32]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                  Why does this matter for preservation?
                </label>
                <input
                  type="text"
                  value={whyItMatters}
                  onChange={(e) => setWhyItMatters(e.target.value)}
                  placeholder="e.g. Few living weavers know the exact mordant recipe"
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E7E5DF] text-xs outline-none focus:border-[#163D32]"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs text-stone-600 hover:bg-stone-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-[#163D32] text-white text-xs font-bold hover:bg-[#0F2A22]"
                >
                  {submitting ? 'Submitting...' : 'Register Gap'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
