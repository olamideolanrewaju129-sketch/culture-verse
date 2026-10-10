import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import { Contribution } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { ShieldCheck, CheckCircle2, XCircle, RotateCcw, FileText, Users, BookOpen, AlertCircle } from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [pending, setPending] = useState<Contribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewNotes, setReviewNotes] = useState<Record<string, string>>({});
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const [s, p] = await Promise.all([
        api.getAdminStats(),
        api.getPendingContributions(),
      ]);
      setStats(s);
      setPending(p);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleReview = async (id: string, status: 'approved' | 'rejected' | 'revision_requested') => {
    try {
      const notes = reviewNotes[id] || '';
      await api.reviewContribution(id, status, notes);
      setActionMsg(`Contribution ${status} successfully!`);
      setTimeout(() => setActionMsg(null), 3000);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-[#FAF7F0] flex items-center justify-center text-stone-500">Loading admin portal...</div>;
  }

  return (
    <div className="min-h-screen bg-[#FAF7F0] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-900 text-[#D6A84F] text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>CultureVerse Archival Administration</span>
            </div>
            <h1 className="font-editorial text-3xl sm:text-4xl font-bold text-[#163D32] mt-1">
              Editorial Review & Platform Management
            </h1>
            <p className="text-xs sm:text-sm text-stone-600">
              Review draft oral histories, traditional recipes, and textile tutorials submitted by community stewards.
            </p>
          </div>
        </div>

        {actionMsg && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{actionMsg}</span>
          </div>
        )}

        {/* Platform Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-white border border-[#E7E5DF] space-y-1">
              <span className="text-[11px] font-bold uppercase text-stone-400">Total Users</span>
              <div className="text-2xl font-bold font-editorial text-[#163D32]">{stats.usersCount}</div>
            </div>
            <div className="p-5 rounded-2xl bg-white border border-[#E7E5DF] space-y-1">
              <span className="text-[11px] font-bold uppercase text-stone-400">Published Archives</span>
              <div className="text-2xl font-bold font-editorial text-[#163D32]">{stats.resourcesCount}</div>
            </div>
            <div className="p-5 rounded-2xl bg-white border border-[#E7E5DF] space-y-1">
              <span className="text-[11px] font-bold uppercase text-stone-400">Cultural Courses</span>
              <div className="text-2xl font-bold font-editorial text-[#163D32]">{stats.coursesCount}</div>
            </div>
            <div className="p-5 rounded-2xl bg-white border border-[#E7E5DF] space-y-1">
              <span className="text-[11px] font-bold uppercase text-amber-700">Pending Review</span>
              <div className="text-2xl font-bold font-editorial text-amber-600">{stats.pendingContributionsCount}</div>
            </div>
          </div>
        )}

        {/* Pending Review Submissions */}
        <div className="bg-white rounded-3xl border border-[#E7E5DF] p-6 sm:p-10 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-[#E7E5DF]">
            <h2 className="font-editorial text-2xl font-bold text-[#163D32]">
              Pending Submissions Awaiting Elder Approval ({pending.length})
            </h2>
          </div>

          {pending.length === 0 ? (
            <div className="py-12 text-center text-stone-500 text-xs">
              All community contributions have been reviewed. Excellent!
            </div>
          ) : (
            <div className="space-y-6">
              {pending.map((item) => (
                <div
                  key={item.id}
                  className="p-6 rounded-2xl border border-[#E7E5DF] bg-[#FAF7F0]/40 space-y-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#E5EDE5] text-[#163D32] uppercase">
                        {item.culture_name || 'African Culture'}
                      </span>
                      <h3 className="font-editorial text-xl font-bold text-[#163D32] mt-1">
                        {item.title}
                      </h3>
                      <div className="text-[11px] text-stone-500 mt-0.5">
                        Format: <strong className="capitalize">{item.content_type.replace('_', ' ')}</strong> • Submitted by: {item.contributor_name || 'Community Member'}
                      </div>
                    </div>
                    <span className="text-xs text-stone-400">
                      {new Date(item.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-stone-700 leading-relaxed bg-white p-4 rounded-xl border border-stone-200 whitespace-pre-line">
                    {item.content}
                  </p>

                  {item.source_references && (
                    <div className="text-xs text-stone-600 italic">
                      Lineage / References: {item.source_references}
                    </div>
                  )}

                  {/* Review Notes Input */}
                  <div>
                    <input
                      type="text"
                      placeholder="Add editorial notes or guidance for the contributor..."
                      value={reviewNotes[item.id] || ''}
                      onChange={(e) =>
                        setReviewNotes({ ...reviewNotes, [item.id]: e.target.value })
                      }
                      className="w-full px-4 py-2 rounded-xl border border-[#E7E5DF] text-xs outline-none bg-white"
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
                    <button
                      onClick={() => handleReview(item.id, 'rejected')}
                      className="px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-800 text-xs font-bold transition-colors flex items-center gap-1.5"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Reject</span>
                    </button>
                    <button
                      onClick={() => handleReview(item.id, 'revision_requested')}
                      className="px-4 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-800 text-xs font-bold transition-colors flex items-center gap-1.5"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Request Revision</span>
                    </button>
                    <button
                      onClick={() => handleReview(item.id, 'approved')}
                      className="px-5 py-2 rounded-xl bg-[#163D32] hover:bg-[#0F2A22] text-white text-xs font-bold transition-colors shadow-sm flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#D6A84F]" />
                      <span>Approve & Publish to Library</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
