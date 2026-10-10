import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../api/client';
import { Culture, CulturalResource, Course } from '../../types';
import { ResourceCard } from '../../components/ResourceCard';
import { CourseCard } from '../../components/CourseCard';
import { AskYourRootsWidget } from '../../components/AskYourRootsWidget';
import {
  Sparkles,
  BookOpen,
  GraduationCap,
  ArrowRight,
  Compass,
  Clock,
  CheckCircle2,
  Bookmark,
  HelpCircle,
} from 'lucide-react';

export const DashboardOverview: React.FC = () => {
  const { cultureId } = useParams<{ cultureId: string }>();
  const currentCulture = cultureId || 'yoruba';

  const [culture, setCulture] = useState<(Culture & { categories: any[] }) | null>(null);
  const [resources, setResources] = useState<CulturalResource[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  const greetings: Record<string, { welcome: string; intro: string }> = {
    yoruba: {
      welcome: 'Ẹ káàbọ̀! Welcome to Yoruba Heritage.',
      intro:
        'Rooted in Ilé-Ifẹ̀, Yoruba civilization illuminates human understanding through deep proverb philosophies (Òwe), sacred royal textiles of Àṣọ-Òkè, and living oral lineages.',
    },
    igbo: {
      welcome: 'Nnọọ! Welcome to Igbo Heritage.',
      intro:
        'Celebrated for indigenous democratic council governance, complex loom mastery of Akwete cloth, the sacred agrarian rhythm of the Iri Ji New Yam festival, and proverb lore.',
    },
    hausa: {
      welcome: 'Sannu da zuwa! Welcome to Hausa Heritage.',
      intro:
        'Discover centuries of Sahelian Tubali earthen architecture, the millennium-old indigo dye pits of Kofar Mata in Kano, poetic oral wisdom, and the historic Durbar processions.',
    },
  };

  const currentGreeting =
    greetings[currentCulture] || {
      welcome: `Welcome to ${currentCulture.toUpperCase()} Heritage.`,
      intro: 'Explore authentic cultural archives and courses grounded in living indigenous heritage.',
    };

  useEffect(() => {
    async function loadDashboardData() {
      setLoading(true);
      try {
        const [cData, rData, crsData] = await Promise.all([
          api.getCultureBySlug(currentCulture),
          api.getResources({ culture: currentCulture, limit: 6 }),
          api.getCourses({ culture: currentCulture }),
        ]);
        setCulture(cData);
        setResources(rData.resources);
        setCourses(crsData);
      } catch (err) {
        console.error('Dashboard load error:', err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, [currentCulture]);

  if (loading) {
    return <div className="py-20 text-center text-stone-500">Loading {currentCulture} dashboard...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto space-y-10">
      {/* 1. Welcome Message & Cultural Introduction Card */}
      <div className="relative rounded-3xl overflow-hidden bg-[#163D32] text-white p-6 sm:p-10 shadow-lg border border-[#1E5042]">
        <div className="absolute inset-0 opacity-15 pointer-events-none">
          {culture?.cover_image && (
            <img
              src={culture.cover_image}
              alt={culture.name}
              className="w-full h-full object-cover"
            />
          )}
        </div>

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/40 text-[#D6A84F] text-xs font-bold border border-[#D6A84F]/30 backdrop-blur-sm">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Dedicated Learning Space</span>
          </div>

          <h1 className="font-editorial text-3xl sm:text-5xl font-bold tracking-tight">
            {currentGreeting.welcome}
          </h1>

          <p className="text-sm sm:text-base text-stone-200 leading-relaxed font-light">
            {currentGreeting.intro}
          </p>

          <div className="pt-2 flex flex-wrap gap-3">
            <Link
              to={`/dashboard/${currentCulture}/ask-roots`}
              className="px-5 py-2.5 rounded-xl bg-[#D6A84F] text-[#163D32] hover:bg-[#E8C378] text-xs font-bold shadow-sm transition-all flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Ask Gemma Assistant</span>
            </Link>
            <Link
              to={`/dashboard/${currentCulture}/library`}
              className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/20 transition-all flex items-center gap-1.5"
            >
              <BookOpen className="w-3.5 h-3.5 text-[#D6A84F]" />
              <span>Browse Cultural Library</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Continue Learning / Active Courses Bar */}
      {courses.length > 0 && (
        <div className="bg-white rounded-2xl border border-[#E7E5DF] p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-[#163D32]" />
              <h3 className="font-editorial text-xl font-bold text-[#163D32]">
                Continue Learning
              </h3>
            </div>
            <Link
              to={`/dashboard/${currentCulture}/courses`}
              className="text-xs font-bold text-[#163D32] hover:text-[#B85C38]"
            >
              View all courses →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {courses.slice(0, 3).map((crs) => (
              <div
                key={crs.id}
                className="p-4 rounded-xl border border-[#E7E5DF] bg-[#FAF7F0] flex flex-col justify-between"
              >
                <div>
                  <span className="text-[10px] font-bold uppercase text-[#B85C38]">
                    {crs.difficulty} • {crs.duration_minutes} mins
                  </span>
                  <h4 className="font-editorial text-base font-bold text-[#163D32] mt-1 line-clamp-1">
                    {crs.title}
                  </h4>
                </div>
                <div className="pt-3 mt-3 border-t border-[#E7E5DF] flex items-center justify-between text-xs">
                  <span className="font-semibold text-stone-700">
                    {crs.price === 0 ? 'Free' : `₦${crs.price.toLocaleString()}`}
                  </span>
                  <Link
                    to={`/courses/${crs.id}`}
                    className="font-bold text-[#163D32] hover:underline flex items-center gap-1"
                  >
                    <span>Open Syllabus</span>
                    <ArrowRight className="w-3 h-3 text-[#D6A84F]" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. Explore Categories */}
      {culture?.categories && culture.categories.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-editorial text-2xl font-bold text-[#163D32]">
              Explore Categories in {culture.name}
            </h3>
            <span className="text-xs text-stone-500">
              {culture.categories.length} Specialized domains
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {culture.categories.map((cat) => (
              <Link
                key={cat.id}
                to={`/dashboard/${currentCulture}/category/${cat.slug}`}
                className="p-4 rounded-xl bg-white border border-[#E7E5DF] hover:border-[#163D32] hover:shadow-xs transition-all group"
              >
                <h4 className="font-editorial text-sm font-bold text-[#163D32] group-hover:text-[#B85C38] transition-colors truncate">
                  {cat.name}
                </h4>
                <p className="text-[11px] text-stone-500 mt-1 line-clamp-2">
                  {cat.description}
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* 4. Interactive Gemma Ask Your Roots Shortcut Widget */}
      <AskYourRootsWidget
        initialCulture={currentCulture}
        title={`Ask Your Roots: ${culture?.name || currentCulture}`}
        subtitle={`Gemma answers cultural questions grounded directly in ${currentCulture} library archives.`}
      />

      {/* 5. Featured Cultural Stories & Recently Added Knowledge */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="font-editorial text-2xl font-bold text-[#163D32]">
            Recently Added Cultural Archives
          </h3>
          <Link
            to={`/dashboard/${currentCulture}/library`}
            className="text-xs font-bold text-[#163D32] hover:text-[#B85C38] flex items-center gap-1"
          >
            <span>Full Library</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#D6A84F]" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {resources.map((r) => (
            <ResourceCard key={r.id} resource={r} />
          ))}
        </div>
      </div>
    </div>
  );
};
