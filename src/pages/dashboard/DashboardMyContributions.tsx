import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../../api/client';
import { Contribution } from '../../types';
import { FileText, Plus, Clock, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';

export const DashboardMyContributions: React.FC = () => {
  const { cultureId } = useParams<{ cultureId: string }>();
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'draft' | 'pending' | 'approved' | 'revision_requested' | 'rejected'>('all');

  useEffect(() => {
    async function load() {
      try {
        const data = await api.getMyContributions();
        setContributions(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = contributions.filter((c) => {
    if (activeTab === 'all') return true;
    return c.status === activeTab;
  });

  const statusBadge = (status: string) => {
    switch (status) {
      case 'approved':
      case 'published':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">Published</span>;
      case 'pending':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">Pending Review</span>;
      case 'draft':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-stone-100 text-stone-700">Draft</span>;
      case 'revision_requested':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">Revision Requested</span>;
      case 'rejected':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">Rejected</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-stone-100 text-stone-600">{status}</span>;
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-editorial text-3xl font-bold text-[#163D32]">
            My Cultural Contributions
          </h1>
          <p className="text-xs sm:text-sm text-stone-600">
            Track your draft submissions, elder peer reviews, and published archives in CultureVerse.
          </p>
        </div>

        <Link
          to={`/dashboard/${cultureId}/contribute`}
          className="px-5 py-2.5 rounded-xl bg-[#163D32] text-white hover:bg-[#0F2A22] text-xs font-bold transition-all flex items-center gap-2 shrink-0"
        >
          <Plus className="w-4 h-4 text-[#D6A84F]" />
          <span>New Submission</span>
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-[#E7E5DF]">
        {[
          { id: 'all', label: 'All Submissions' },
          { id: 'draft', label: 'Drafts' },
          { id: 'pending', label: 'Pending Review' },
          { id: 'approved', label: 'Published' },
          { id: 'revision_requested', label: 'Revision Requested' },
          { id: 'rejected', label: 'Rejected' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? 'bg-[#163D32] text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="py-20 text-center text-stone-500">Loading your contributions...</div>
      ) : filtered.length === 0 ? (
        <div className="p-10 rounded-2xl bg-white border border-[#E7E5DF] text-center space-y-3">
          <FileText className="w-8 h-8 text-stone-300 mx-auto" />
          <h3 className="font-editorial text-lg font-bold text-[#163D32]">
            No contributions in this state.
          </h3>
          <p className="text-xs text-stone-500">
            Preserve an authentic tradition, folktale, or recipe today.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="p-6 rounded-2xl bg-white border border-[#E7E5DF] space-y-3 shadow-xs"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase text-[#B85C38]">
                    {item.content_type.replace('_', ' ')}
                  </span>
                  <span>•</span>
                  <span className="text-[10px] text-stone-500">
                    {new Date(item.created_at).toLocaleDateString()}
                  </span>
                </div>
                {statusBadge(item.status)}
              </div>

              <h3 className="font-editorial text-xl font-bold text-[#163D32]">
                {item.title}
              </h3>

              <p className="text-xs text-stone-600 line-clamp-2">
                {item.summary || item.content}
              </p>

              {item.review_notes && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900">
                  <strong>Curator Feedback: </strong>
                  {item.review_notes}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
