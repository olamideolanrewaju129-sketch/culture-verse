import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../api/client';
import { Contributor, CulturalResource, Course } from '../types';
import { ResourceCard } from '../components/ResourceCard';
import { CourseCard } from '../components/CourseCard';
import { ArrowLeft, BookOpen, GraduationCap, Users } from 'lucide-react';

export const ContributorDetail: React.FC = () => {
  const { contributorId } = useParams<{ contributorId: string }>();
  const [contributor, setContributor] = useState<(Contributor & { resources: CulturalResource[]; courses: Course[] }) | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!contributorId) return;
      try {
        const data = await api.getContributorById(contributorId);
        setContributor(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [contributorId]);

  if (loading) {
    return <div className="min-h-screen bg-[#FAF7F0] flex items-center justify-center text-stone-500">Loading custodian biography...</div>;
  }

  if (!contributor) {
    return (
      <div className="min-h-screen bg-[#FAF7F0] flex flex-col items-center justify-center space-y-4">
        <h2 className="text-xl font-bold text-[#163D32]">Contributor not found</h2>
        <Link to="/contributors" className="text-sm underline text-[#B85C38]">Back to Contributors</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF7F0] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        <Link
          to="/contributors"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#163D32] hover:text-[#B85C38]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Knowledge Keepers</span>
        </Link>

        {/* Profile Card */}
        <div className="bg-white rounded-3xl border border-[#E7E5DF] p-6 sm:p-10 shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <img
            src={contributor.profile_image || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200'}
            alt={contributor.full_name}
            className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl object-cover border-2 border-[#D6A84F] shadow-sm shrink-0"
          />
          <div className="space-y-3">
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#E5EDE5] text-[#163D32] border border-[#163D32]/10 capitalize inline-block">
              {contributor.preferred_culture_name || 'Indigenous Educator'}
            </span>
            <h1 className="font-editorial text-3xl sm:text-4xl font-bold text-[#163D32]">
              {contributor.full_name}
            </h1>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed max-w-2xl">
              {contributor.biography}
            </p>
          </div>
        </div>

        {/* Contributor's Published Archives */}
        {contributor.resources && contributor.resources.length > 0 && (
          <div className="space-y-6">
            <h2 className="font-editorial text-2xl font-bold text-[#163D32]">
              Archival Contributions ({contributor.resources.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {contributor.resources.map((r) => (
                <ResourceCard key={r.id} resource={r} />
              ))}
            </div>
          </div>
        )}

        {/* Contributor's Courses */}
        {contributor.courses && contributor.courses.length > 0 && (
          <div className="space-y-6">
            <h2 className="font-editorial text-2xl font-bold text-[#163D32]">
              Courses Taught ({contributor.courses.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {contributor.courses.map((crs) => (
                <CourseCard key={crs.id} course={crs} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
