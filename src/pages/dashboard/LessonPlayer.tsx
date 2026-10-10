import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../../api/client';
import { Course, Lesson } from '../../types';
import {
  GraduationCap,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  PlayCircle,
  Clock,
  Check,
  ChevronLeft,
} from 'lucide-react';

export const LessonPlayer: React.FC = () => {
  const { cultureId, courseId, lessonId } = useParams<{
    cultureId: string;
    courseId: string;
    lessonId: string;
  }>();

  const [course, setCourse] = useState<Course | null>(null);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    async function load() {
      if (!courseId) return;
      setLoading(true);
      try {
        const data = await api.getCourseById(courseId);
        setCourse(data);

        // Find current lesson
        let found: Lesson | null = null;
        for (const mod of data.modules || []) {
          for (const l of mod.lessons || []) {
            if (l.id === lessonId) {
              found = l;
              break;
            }
          }
          if (found) break;
        }

        if (!found && data.modules?.[0]?.lessons?.[0]) {
          found = data.modules[0].lessons[0];
        }

        setCurrentLesson(found);
        setIsCompleted(found?.completed || false);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [courseId, lessonId]);

  const handleMarkComplete = async () => {
    if (!course || !currentLesson) return;
    try {
      await api.markLessonComplete(course.id, currentLesson.id);
      setIsCompleted(true);
    } catch (err) {
      console.error(err);
    }
  };

  // Find next lesson
  let nextLesson: Lesson | null = null;
  let prevLesson: Lesson | null = null;
  if (course && currentLesson) {
    const allLessons: Lesson[] = [];
    course.modules?.forEach((m) => allLessons.push(...m.lessons));
    const idx = allLessons.findIndex((l) => l.id === currentLesson.id);
    if (idx > 0) prevLesson = allLessons[idx - 1];
    if (idx < allLessons.length - 1) nextLesson = allLessons[idx + 1];
  }

  if (loading) {
    return <div className="py-20 text-center text-stone-500">Loading lesson player...</div>;
  }

  if (!course || !currentLesson) {
    return (
      <div className="py-20 text-center space-y-3">
        <h3 className="text-lg font-bold text-[#163D32]">Lesson not found</h3>
        <Link to={`/dashboard/${cultureId}/courses`} className="text-xs text-[#B85C38] underline">
          Return to Courses
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Link
        to={`/courses/${course.id}`}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-[#163D32] hover:text-[#B85C38]"
      >
        <ChevronLeft className="w-4 h-4" />
        <span>Exit Player to Course Details</span>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Lesson Content Area */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-[#E7E5DF] p-6 sm:p-10 shadow-sm space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-[#E7E5DF]">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#B85C38]">
                {course.title}
              </span>
              <h1 className="font-editorial text-2xl sm:text-3xl font-bold text-[#163D32]">
                {currentLesson.title}
              </h1>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-stone-500 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {currentLesson.duration_minutes} mins
              </span>
            </div>
          </div>

          {/* Lesson Content */}
          <div className="prose prose-stone max-w-none text-stone-800 leading-relaxed text-sm sm:text-base whitespace-pre-line">
            {currentLesson.content}
          </div>

          {/* Complete & Navigation Bar */}
          <div className="pt-6 border-t border-[#E7E5DF] flex flex-col sm:flex-row items-center justify-between gap-4">
            <button
              onClick={handleMarkComplete}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                isCompleted
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-[#163D32] text-white hover:bg-[#0F2A22]'
              }`}
            >
              {isCompleted ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Lesson Completed</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 text-[#D6A84F]" />
                  <span>Mark Lesson Complete</span>
                </>
              )}
            </button>

            <div className="flex items-center gap-3">
              {prevLesson && (
                <button
                  onClick={() =>
                    navigate(`/dashboard/${cultureId}/course/${course.id}/lesson/${prevLesson.id}`)
                  }
                  className="px-4 py-2 rounded-xl border border-[#E7E5DF] hover:bg-stone-50 text-xs font-semibold text-stone-700 flex items-center gap-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Previous</span>
                </button>
              )}
              {nextLesson && (
                <button
                  onClick={() =>
                    navigate(`/dashboard/${cultureId}/course/${course.id}/lesson/${nextLesson.id}`)
                  }
                  className="px-4 py-2 rounded-xl bg-[#D6A84F] hover:bg-[#E8C378] text-[#163D32] text-xs font-bold flex items-center gap-1"
                >
                  <span>Next Lesson</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Modules & Lessons Sidebar */}
        <div className="bg-white rounded-3xl border border-[#E7E5DF] p-6 shadow-sm space-y-4 h-fit">
          <h3 className="font-editorial text-lg font-bold text-[#163D32] pb-3 border-b border-[#E7E5DF]">
            Course Lessons
          </h3>

          <div className="space-y-4">
            {course.modules?.map((mod, mIdx) => (
              <div key={mod.id} className="space-y-2">
                <span className="text-[11px] font-bold uppercase text-stone-400">
                  Module {mIdx + 1}: {mod.title}
                </span>
                <div className="space-y-1">
                  {mod.lessons?.map((lsn) => (
                    <button
                      key={lsn.id}
                      onClick={() =>
                        navigate(`/dashboard/${cultureId}/course/${course.id}/lesson/${lsn.id}`)
                      }
                      className={`w-full text-left p-2.5 rounded-xl text-xs flex items-center justify-between transition-colors ${
                        lsn.id === currentLesson.id
                          ? 'bg-[#163D32] text-white font-bold'
                          : 'hover:bg-[#FAF7F0] text-stone-700'
                      }`}
                    >
                      <span className="truncate pr-2">{lsn.title}</span>
                      {lsn.completed && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
