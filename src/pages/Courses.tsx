import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { Course, Culture } from '../types';
import { CourseCard } from '../components/CourseCard';
import { AlatPayModal } from '../components/AlatPayModal';
import { GraduationCap, Filter, ShieldCheck, Sparkles } from 'lucide-react';

export const Courses: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [cultures, setCultures] = useState<Culture[]>([]);
  const [selectedCulture, setSelectedCulture] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [selectedCourseForPayment, setSelectedCourseForPayment] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [cList, crsList] = await Promise.all([
          api.getCultures(),
          api.getCourses(),
        ]);
        setCultures(cList);
        setCourses(crsList);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filteredCourses = courses.filter((c) => {
    if (selectedCulture !== 'all' && c.culture_slug !== selectedCulture && c.culture_id !== selectedCulture) {
      return false;
    }
    if (selectedDifficulty !== 'all' && c.difficulty !== selectedDifficulty) {
      return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-[#FAF7F0] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Header */}
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E5EDE5] text-[#163D32] text-xs font-semibold">
            <GraduationCap className="w-3.5 h-3.5 text-[#D6A84F]" />
            <span>Structured African Cultural Education</span>
          </div>
          <h1 className="font-editorial text-4xl sm:text-5xl font-bold text-[#163D32]">
            Course Catalogue
          </h1>
          <p className="text-sm sm:text-base text-stone-600">
            Learn master textile weaving, language proverbs, traditional architecture, and oral storytelling directly from verified African master practitioners.
          </p>
        </div>

        {/* Filter Bar */}
        <div className="bg-white rounded-2xl border border-[#E7E5DF] p-4 sm:p-6 shadow-sm flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto">
            <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">
              Culture:
            </span>
            <button
              onClick={() => setSelectedCulture('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                selectedCulture === 'all'
                  ? 'bg-[#163D32] text-white'
                  : 'bg-[#FAF7F0] text-stone-600 hover:text-stone-900 border border-[#E7E5DF]'
              }`}
            >
              All Cultures
            </button>
            {cultures.map((c) => (
              <button
                key={c.slug}
                onClick={() => setSelectedCulture(c.slug)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all ${
                  selectedCulture === c.slug
                    ? 'bg-[#163D32] text-white'
                    : 'bg-[#FAF7F0] text-stone-600 hover:text-stone-900 border border-[#E7E5DF]'
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">
              Level:
            </span>
            {['all', 'Beginner', 'Intermediate', 'Advanced'].map((lvl) => (
              <button
                key={lvl}
                onClick={() => setSelectedDifficulty(lvl)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  selectedDifficulty === lvl
                    ? 'bg-[#D6A84F] text-[#163D32]'
                    : 'text-stone-600 hover:bg-stone-100'
                }`}
              >
                {lvl === 'all' ? 'All Levels' : lvl}
              </button>
            ))}
          </div>
        </div>

        {/* Course Grid */}
        {loading ? (
          <div className="text-center py-20 text-stone-500">Loading masterclasses...</div>
        ) : filteredCourses.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-[#E7E5DF] p-8 text-stone-500">
            No courses found matching criteria.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {filteredCourses.map((crs) => (
              <CourseCard
                key={crs.id}
                course={crs}
                onEnroll={(c) => setSelectedCourseForPayment(c)}
              />
            ))}
          </div>
        )}

        {/* ALATPay Modal */}
        {selectedCourseForPayment && (
          <AlatPayModal
            course={selectedCourseForPayment}
            isOpen={!!selectedCourseForPayment}
            onClose={() => setSelectedCourseForPayment(null)}
            onSuccess={() => {
              alert('Successfully enrolled! You can now access all course lessons.');
            }}
          />
        )}
      </div>
    </div>
  );
};
