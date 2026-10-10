import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../api/client';
import { CulturalResource } from '../../types';
import { ResourceCard } from '../../components/ResourceCard';
import { BookOpen, ArrowLeft } from 'lucide-react';

export const DashboardCategoryView: React.FC = () => {
  const { cultureId, categorySlug } = useParams<{ cultureId: string; categorySlug: string }>();
  const [resources, setResources] = useState<CulturalResource[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await api.getResources({
          culture: cultureId,
          search: categorySlug,
        });
        setResources(res.resources);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [cultureId, categorySlug]);

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <Link
        to={`/dashboard/${cultureId}`}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-[#163D32] hover:text-[#B85C38]"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to {cultureId?.toUpperCase()} Dashboard</span>
      </Link>

      <div className="space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-[#B85C38]">
          Category Archive
        </span>
        <h1 className="font-editorial text-3xl font-bold text-[#163D32] capitalize">
          {categorySlug?.replace('-', ' ')} in {cultureId}
        </h1>
        <p className="text-xs sm:text-sm text-stone-600">
          Showing verified records and oral histories catalogued under this tradition.
        </p>
      </div>

      {loading ? (
        <div className="py-20 text-center text-stone-500">Loading records...</div>
      ) : resources.length === 0 ? (
        <div className="p-8 rounded-2xl bg-white border border-[#E7E5DF] text-center space-y-3">
          <BookOpen className="w-8 h-8 text-stone-300 mx-auto" />
          <p className="text-xs text-stone-600">No records found yet for this category.</p>
          <Link
            to={`/dashboard/${cultureId}/knowledge-gaps`}
            className="text-xs font-bold text-[#163D32] underline"
          >
            Suggest this as a Knowledge Gap
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {resources.map((r) => (
            <ResourceCard key={r.id} resource={r} />
          ))}
        </div>
      )}
    </div>
  );
};
