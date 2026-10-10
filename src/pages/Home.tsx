import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import { Culture, CulturalResource, Course, Contributor } from '../types';
import { CultureCard } from '../components/CultureCard';
import { ResourceCard } from '../components/ResourceCard';
import { CourseCard } from '../components/CourseCard';
import { AskYourRootsWidget } from '../components/AskYourRootsWidget';
import {
  Compass,
  ArrowRight,
  Sparkles,
  BookOpen,
  GraduationCap,
  Users,
  ShieldCheck,
  CheckCircle2,
  HeartHandshake,
  ScrollText,
} from 'lucide-react';

export const Home: React.FC = () => {
  const [cultures, setCultures] = useState<Culture[]>([]);
  const [featuredResources, setFeaturedResources] = useState<CulturalResource[]>([]);
  const [featuredCourses, setFeaturedCourses] = useState<Course[]>([]);
  const [contributors, setContributors] = useState<Contributor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [cList, rRes, crsList, ctbList] = await Promise.all([
          api.getCultures(),
          api.getResources({ limit: 4 }),
          api.getCourses(),
          api.getContributors(),
        ]);
        setCultures(cList);
        setFeaturedResources(rRes.resources);
        setFeaturedCourses(crsList.slice(0, 3));
        setContributors(ctbList.slice(0, 3));
      } catch (err) {
        console.error('Home data load error:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="min-h-screen bg-[#FAF7F0]">
      {/* 1. HERO SECTION */}
      <section className="relative pt-12 pb-20 sm:pt-20 sm:pb-28 overflow-hidden border-b border-[#E7E5DF]">
        {/* Subtle decorative background pattern */}
        <div className="absolute inset-0 african-pattern-subtle pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            {/* Top cultural Pill */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#E5EDE5] border border-[#163D32]/15 text-[#163D32] text-xs font-semibold shadow-xs">
              <span className="w-2 h-2 rounded-full bg-[#D6A84F] animate-ping" />
              <span>Gemma AI • African Cultural Preservation & Living Education</span>
            </div>

            {/* Main Headline */}
            <h1 className="font-editorial text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-[#163D32] leading-[1.1]">
              Every Culture Has a Story.{' '}
              <span className="italic text-[#B85C38] block sm:inline">Discover Yours.</span>
            </h1>

            {/* Subtext */}
            <p className="text-base sm:text-xl text-stone-600 leading-relaxed max-w-2xl mx-auto font-normal">
              An intelligent cultural learning platform combining verified African history, language, traditional crafts, and living oral traditions — powered by Google Gemma and guarded by indigenous knowledge keepers.
            </p>

            {/* CTAs */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/signup"
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#163D32] text-white hover:bg-[#0F2A22] text-sm font-bold shadow-md transition-all flex items-center justify-center gap-2 group"
              >
                <span>Begin Your Cultural Journey</span>
                <ArrowRight className="w-4 h-4 text-[#D6A84F] group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/cultures"
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-white hover:bg-stone-50 text-[#163D32] border border-[#E7E5DF] text-sm font-semibold transition-all shadow-xs flex items-center justify-center gap-2"
              >
                <span>Explore the 3 Traditions</span>
              </Link>
            </div>

            {/* Trust Badges */}
            <div className="pt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-stone-500">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Yoruba, Igbo & Hausa Curations</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#D6A84F]" />
                <span>Grounded Gemma AI Assistant</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#163D32]" />
                <span>Archived with Indigenous Elders</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. EXPLORE OUR CULTURES (Three Cards for Yoruba, Igbo, Hausa) */}
      <section className="py-20 bg-white border-b border-[#E7E5DF]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#B85C38] block mb-1">
                Root Traditions
              </span>
              <h2 className="font-editorial text-3xl sm:text-4xl font-bold text-[#163D32]">
                Explore Our Cultures
              </h2>
            </div>
            <p className="text-sm text-stone-600 max-w-md">
              Immerse yourself in structured pathways across West African heritage. Each culture features curated archives, courses, and dedicated dashboard spaces.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {cultures.map((c) => (
              <CultureCard key={c.id} culture={c} />
            ))}
          </div>
        </div>
      </section>

      {/* 3. DISCOVER CULTURAL KNOWLEDGE (Featured Articles, Stories, Resources) */}
      <section className="py-20 bg-[#FAF7F0] border-b border-[#E7E5DF]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#B85C38] block mb-1">
                Verified Archives
              </span>
              <h2 className="font-editorial text-3xl sm:text-4xl font-bold text-[#163D32]">
                Discover Cultural Knowledge
              </h2>
            </div>
            <Link
              to="/library"
              className="text-xs font-bold text-[#163D32] hover:text-[#B85C38] flex items-center gap-1 group"
            >
              <span>Browse Full Cultural Library</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#D6A84F] group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredResources.map((r) => (
              <ResourceCard key={r.id} resource={r} />
            ))}
          </div>
        </div>
      </section>

      {/* 4. LEARN THROUGH COURSES (Featured Courses & Cultural Tutorials) */}
      <section className="py-20 bg-white border-b border-[#E7E5DF]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#B85C38] block mb-1">
                Structured Learning
              </span>
              <h2 className="font-editorial text-3xl sm:text-4xl font-bold text-[#163D32]">
                Learn Through Courses
              </h2>
            </div>
            <p className="text-sm text-stone-600 max-w-md">
              Master traditional textile weaving, oral storytelling, architectural craft, and language nuances with step-by-step masterclasses.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredCourses.map((crs) => (
              <CourseCard key={crs.id} course={crs} />
            ))}
          </div>
        </div>
      </section>

      {/* 5. MEET THE KNOWLEDGE KEEPERS (Educators, Artisans, Historians, Storytellers) */}
      <section className="py-20 bg-[#FAF7F0] border-b border-[#E7E5DF]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#B85C38]">
              The Living Voices
            </span>
            <h2 className="font-editorial text-3xl sm:text-4xl font-bold text-[#163D32]">
              Meet the Knowledge Keepers
            </h2>
            <p className="text-sm text-stone-600">
              CultureVerse collaborates with master weavers, indigenous historians, linguists, and community elders to record and preserve authentic African heritage.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {contributors.map((ctb) => (
              <div key={ctb.id} className="cultural-card p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-4 mb-4">
                    <img
                      src={ctb.profile_image || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200'}
                      alt={ctb.full_name}
                      className="w-16 h-16 rounded-full object-cover border-2 border-[#D6A84F]"
                    />
                    <div>
                      <h4 className="font-editorial text-lg font-bold text-[#163D32]">
                        {ctb.full_name}
                      </h4>
                      <span className="text-xs font-semibold text-[#B85C38] capitalize">
                        {ctb.preferred_culture_name || 'Cultural Historian'}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-stone-600 leading-relaxed line-clamp-3">
                    {ctb.biography}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-[#E7E5DF] flex items-center justify-between text-xs">
                  <span className="text-stone-500">{ctb.resources_count} Archives published</span>
                  <Link
                    to={`/contributors/${ctb.id}`}
                    className="font-bold text-[#163D32] hover:text-[#B85C38] flex items-center gap-1"
                  >
                    <span>View Profile</span>
                    <ArrowRight className="w-3 h-3 text-[#D6A84F]" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. ASK YOUR ROOTS (Gemma-Powered AI Assistant Demo Section) */}
      <section className="py-20 bg-white border-b border-[#E7E5DF]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#D6A84F] bg-[#163D32] px-3 py-1 rounded-full inline-block">
              Intelligent Cultural Grounding
            </span>
            <h2 className="font-editorial text-3xl sm:text-4xl font-bold text-[#163D32]">
              Ask Your Roots with Gemma
            </h2>
            <p className="text-sm text-stone-600">
              Our cultural learning assistant uses Google Gemma to answer questions by retrieving and synthesizing verified library resources from Yoruba, Igbo, and Hausa traditions.
            </p>
          </div>

          {/* Interactive Gemma Assistant Widget */}
          <AskYourRootsWidget
            initialCulture="yoruba"
            className="shadow-xl"
            title="Ask Your Roots Interactive Assistant"
            subtitle="Type your question below or click a suggestion to see Gemma explain African heritage grounded in our actual library archives."
          />
        </div>
      </section>

      {/* 7. HELP PRESERVE HERITAGE (Encourage people to contribute) */}
      <section className="py-20 bg-[#FAF7F0] border-b border-[#E7E5DF]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#163D32] rounded-3xl p-8 sm:p-14 text-white relative overflow-hidden shadow-xl">
            <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none">
              <ScrollText className="w-96 h-96 -mr-16 -mb-16 text-[#D6A84F]" />
            </div>

            <div className="max-w-2xl space-y-6 relative z-10">
              <span className="text-xs font-bold uppercase tracking-widest text-[#D6A84F]">
                Sacred Stewardship
              </span>
              <h2 className="font-editorial text-3xl sm:text-5xl font-bold leading-tight">
                Help Preserve Heritage for the Next Generation.
              </h2>
              <p className="text-sm sm:text-base text-stone-300 leading-relaxed">
                Do you know a traditional culinary recipe from your grandmother, an oral folktale passed down in your village, or an endangered weaving craft? Submit your knowledge for peer-review by indigenous curators.
              </p>
              <div className="pt-2 flex flex-wrap gap-4">
                <Link
                  to="/contribute"
                  className="px-6 py-3 rounded-xl bg-[#D6A84F] text-[#163D32] hover:bg-[#E8C378] text-sm font-bold shadow-md transition-all flex items-center gap-2"
                >
                  <HeartHandshake className="w-4 h-4" />
                  <span>Contribute Cultural Knowledge</span>
                </Link>
                <Link
                  to="/how-it-works"
                  className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm font-semibold transition-all border border-white/20"
                >
                  <span>Learn How Review Works</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. HOW CULTUREVERSE WORKS */}
      <section className="py-20 bg-white border-b border-[#E7E5DF]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#B85C38]">
              The Lifecycle of Living Heritage
            </span>
            <h2 className="font-editorial text-3xl sm:text-4xl font-bold text-[#163D32]">
              How CultureVerse Works
            </h2>
            <p className="text-sm text-stone-600">
              From open discovery to guided learning, AI grounding, and community-driven preservation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              {
                step: '01',
                title: 'Select Cultural Path',
                desc: 'Begin with Yoruba, Igbo, or Hausa. You maintain one account and can switch cultures anytime.',
                icon: Compass,
              },
              {
                step: '02',
                title: 'Grounded AI Inquiry',
                desc: 'Ask questions in Ask Your Roots. Gemma retrieves verified archives to give factual, nuanced answers.',
                icon: Sparkles,
              },
              {
                step: '03',
                title: 'Structured Courses',
                desc: 'Enrol in free or ALATPay-powered workshops to master indigenous crafts and languages.',
                icon: GraduationCap,
              },
              {
                step: '04',
                title: 'Preserve & Bridge Gaps',
                desc: 'Highlight unrecorded topics in Knowledge Gaps and submit oral traditions to safeguard heritage.',
                icon: ScrollText,
              },
            ].map((st, i) => (
              <div key={i} className="relative p-6 rounded-2xl bg-[#FAF7F0] border border-[#E7E5DF] space-y-4">
                <span className="text-2xl font-editorial font-bold text-[#D6A84F] block">
                  {st.step}
                </span>
                <st.icon className="w-6 h-6 text-[#163D32]" />
                <h3 className="font-editorial text-lg font-bold text-[#163D32]">
                  {st.title}
                </h3>
                <p className="text-xs text-stone-600 leading-relaxed">
                  {st.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 9. FINAL CALL TO ACTION */}
      <section className="py-24 bg-[#163D32] text-white text-center relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 relative z-10 space-y-6">
          <span className="text-xs uppercase font-bold tracking-widest text-[#D6A84F]">
            Start Your Cultural Journey Today
          </span>
          <h2 className="font-editorial text-4xl sm:text-6xl font-bold tracking-tight">
            Connect With the Wisdom of Your Ancestors.
          </h2>
          <p className="text-stone-300 text-sm sm:text-lg max-w-xl mx-auto">
            Create your account, select your initial cultural focus, and unlock our cultural archives, courses, and Gemma assistant.
          </p>
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/signup"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#D6A84F] text-[#163D32] hover:bg-[#E8C378] text-sm font-bold shadow-lg transition-all"
            >
              Register for Free
            </Link>
            <Link
              to="/library"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm font-semibold transition-all border border-white/20"
            >
              Browse Cultural Library
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
