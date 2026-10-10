import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../api/client';
import { Culture, CulturalResource, Course } from '../types';
import { ResourceCard } from '../components/ResourceCard';
import { CourseCard } from '../components/CourseCard';
import { AskYourRootsWidget } from '../components/AskYourRootsWidget';
import { Compass, BookOpen, GraduationCap, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';

export const CultureDetail: React.FC = () => {
  const { cultureSlug } = useParams<{ cultureSlug: string }>();
  const [culture, setCulture] = useState<(Culture & { categories: any[] }) | null>(null);
  const [resources, setResources] = useState<CulturalResource[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCultureData() {
      if (!cultureSlug) return;
      setLoading(true);
      try {
        const [cData, rData, crsData] = await Promise.all([
          api.getCultureBySlug(cultureSlug),
          api.getResources({ culture: cultureSlug, limit: 6 }),
          api.getCourses({ culture: cultureSlug }),
        ]);
        setCulture(cData);
        setResources(rData.resources);
        setCourses(crsData);
      } catch (err) {
        console.error('Culture load error:', err);
      } finally {
        setLoading(false);
      }
    }
    loadCultureData();
  }, [cultureSlug]);

  if (loading) {
    return <div className="min-h-screen bg-[#FAF7F0] flex items-center justify-center text-stone-500">Loading culture details...</div>;
  }

  if (!culture) {
    return (
      <div className="min-h-screen bg-[#FAF7F0] flex flex-col items-center justify-center space-y-4">
        <h2 className="text-xl font-bold text-[#163D32]">Culture not found</h2>
        <Link to="/cultures" className="text-sm underline text-[#B85C38]">Back to Explore Cultures</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF7F0]">
      {/* Culture Hero Banner */}
      <div className="relative bg-[#163D32] text-white py-20 overflow-hidden border-b border-[#1E5042]">
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <img
            src={culture.cover_image}
            alt={culture.name}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-[#D6A84F] bg-black/40 backdrop-blur-sm px-3 py-1 rounded-full border border-[#D6A84F]/30 inline-block">
              {culture.greeting}
            </span>
            <h1 className="font-editorial text-4xl sm:text-6xl font-bold tracking-tight">
              {culture.name}
            </h1>
            <p className="text-base sm:text-lg text-stone-200 leading-relaxed font-normal">
              {culture.description}
            </p>
            <p className="text-xs sm:text-sm text-[#D6A84F] italic border-l-2 border-[#D6A84F] pl-3">
              "{culture.hero_subtitle}"
            </p>

            <div className="pt-4 flex flex-wrap gap-4">
              <Link
                to={`/dashboard/${culture.slug}`}
                className="px-6 py-3 rounded-xl bg-[#D6A84F] text-[#163D32] hover:bg-[#E8C378] text-xs font-bold shadow-md transition-all flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>Open {culture.name} Learning Dashboard</span>
              </Link>
              <Link
                to="/signup"
                className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/20"
              >
                Register for Free
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
        {/* Culture Categories Grid */}
        {culture.categories && culture.categories.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#B85C38]">
                  Learning Domains
                </span>
                <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-[#163D32]">
                  Cultural Categories in {culture.name}
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {culture.categories.map((cat: any) => (
                <Link
                  key={cat.id}
                  to={`/library?culture=${culture.slug}&category=${cat.id}`}
                  className="p-4 rounded-xl bg-white border border-[#E7E5DF] hover:border-[#163D32] hover:shadow-sm transition-all group"
                >
                  <h4 className="font-editorial text-base font-bold text-[#163D32] group-hover:text-[#B85C38] transition-colors">
                    {cat.name}
                  </h4>
                  <p className="text-xs text-stone-500 mt-1 line-clamp-2">
                    {cat.description}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Culture-Focused Gemma Assistant */}
        <div>
          <AskYourRootsWidget
            initialCulture={culture.slug}
            title={`Ask Your Roots about ${culture.name}`}
            subtitle={`Gemma searches authenticated ${culture.name} archives in our database to formulate grounded, nuanced answers.`}
          />
        </div>

        {/* Cultural Resources Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#B85C38]">
                Preserved Archives
              </span>
              <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-[#163D32]">
                Featured {culture.name} Documentation
              </h2>
            </div>
            <Link
              to={`/library?culture=${culture.slug}`}
              className="text-xs font-bold text-[#163D32] hover:text-[#B85C38] flex items-center gap-1"
            >
              <span>View All Archives</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#D6A84F]" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {resources.map((r) => (
              <ResourceCard key={r.id} resource={r} />
            ))}
          </div>
        </div>

        {/* Cultural Courses Section */}
        {courses.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#B85C38]">
                  Skill Masterclasses
                </span>
                <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-[#163D32]">
                  Courses in {culture.name}
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {courses.map((crs) => (
                <CourseCard key={crs.id} course={crs} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
