import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { Course } from '../types';
import { useAuth } from '../context/AuthContext';
import { AlatPayModal } from '../components/AlatPayModal';
import {
  GraduationCap,
  Clock,
  ArrowLeft,
  CheckCircle2,
  Lock,
  PlayCircle,
  CreditCard,
  User,
  ShieldCheck,
} from 'lucide-react';

export const CourseDetail: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [payModalOpen, setPayModalOpen] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    async function loadCourse() {
      if (!courseId) return;
      setLoading(true);
      try {
        const data = await api.getCourseById(courseId);
        setCourse(data);
      } catch (err) {
        console.error('Course fetch error:', err);
      } finally {
        setLoading(false);
      }
    }
    loadCourse();
  }, [courseId]);

  if (loading) {
    return <div className="min-h-screen bg-[#FAF7F0] flex items-center justify-center text-stone-500">Loading syllabus...</div>;
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-[#FAF7F0] flex flex-col items-center justify-center space-y-4">
        <h2 className="text-xl font-bold text-[#163D32]">Course not found</h2>
        <Link to="/courses" className="text-sm underline text-[#B85C38]">Back to Courses</Link>
      </div>
    );
  }

  const handleStartLearning = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (course.price > 0 && !course.is_enrolled) {
      setPayModalOpen(true);
    } else {
      // Find first lesson to play
      const firstLesson = course.modules?.[0]?.lessons?.[0];
      const targetCulture = course.culture_slug || 'yoruba';
      if (firstLesson) {
        navigate(`/dashboard/${targetCulture}/course/${course.id}/lesson/${firstLesson.id}`);
      } else {
        navigate(`/dashboard/${targetCulture}/courses`);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F0] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        <Link
          to="/courses"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#163D32] hover:text-[#B85C38]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Course Catalogue</span>
        </Link>

        {/* Hero Card */}
        <div className="bg-white rounded-3xl border border-[#E7E5DF] overflow-hidden shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-3">
            <div className="lg:col-span-2 p-6 sm:p-10 space-y-6">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#E5EDE5] text-[#163D32] border border-[#163D32]/15 capitalize">
                  {course.culture_name || 'African Culture'}
                </span>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#FAF7F0] text-[#B85C38] border border-[#E7E5DF]">
                  Level: {course.difficulty}
                </span>
                <span className="text-xs text-stone-500 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {course.duration_minutes} minutes of guided lessons
                </span>
              </div>

              <h1 className="font-editorial text-3xl sm:text-4xl font-bold text-[#163D32] leading-tight">
                {course.title}
              </h1>

              <p className="text-sm sm:text-base text-stone-600 leading-relaxed">
                {course.description}
              </p>

              {course.instructor_name && (
                <div className="flex items-center gap-3 pt-3 border-t border-[#E7E5DF]">
                  <div className="w-10 h-10 rounded-full bg-[#163D32] text-[#D6A84F] flex items-center justify-center font-bold">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-stone-900">
                      Master Instructor: {course.instructor_name}
                    </div>
                    {course.instructor_bio && (
                      <p className="text-[11px] text-stone-500 max-w-md line-clamp-1">
                        {course.instructor_bio}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar Pricing Box */}
            <div className="bg-[#FAF7F0] p-6 sm:p-8 border-t lg:border-t-0 lg:border-l border-[#E7E5DF] flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="rounded-xl overflow-hidden shadow-xs border border-stone-200">
                  <img
                    src={course.cover_image}
                    alt={course.title}
                    className="w-full h-44 object-cover"
                  />
                </div>

                <div className="space-y-1">
                  <div className="text-xs text-stone-500 uppercase tracking-wider font-semibold">
                    Enrolment Fee
                  </div>
                  <div className="text-2xl sm:text-3xl font-bold font-editorial text-[#163D32]">
                    {course.price === 0 ? 'Free Workshop' : `₦${course.price.toLocaleString()} ${course.currency}`}
                  </div>
                  {course.price > 0 && (
                    <div className="text-[11px] text-stone-500 flex items-center gap-1">
                      <CreditCard className="w-3.5 h-3.5 text-stone-400" />
                      <span>Instant checkout with ALATPay</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <button
                  type="button"
                  onClick={handleStartLearning}
                  className="w-full py-3.5 rounded-xl bg-[#163D32] text-white hover:bg-[#0F2A22] text-sm font-bold shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <GraduationCap className="w-4 h-4 text-[#D6A84F]" />
                  <span>
                    {course.is_enrolled
                      ? 'Continue Learning'
                      : course.price === 0
                      ? 'Enrol For Free'
                      : 'Enrol via ALATPay'}
                  </span>
                </button>

                <div className="text-[11px] text-stone-500 flex items-center gap-1.5 justify-center">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Direct learning progress tracking saved in database</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modules and Lessons Curriculum */}
        <div className="bg-white rounded-3xl border border-[#E7E5DF] p-6 sm:p-10 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-[#E7E5DF]">
            <h2 className="font-editorial text-2xl font-bold text-[#163D32]">
              Course Syllabus & Curriculum
            </h2>
            <span className="text-xs text-stone-500">
              {course.modules?.length || 0} Modules
            </span>
          </div>

          <div className="space-y-4">
            {course.modules?.map((mod, modIdx) => (
              <div
                key={mod.id}
                className="rounded-2xl border border-[#E7E5DF] overflow-hidden bg-[#FAF7F0]/40"
              >
                <div className="p-4 bg-[#FAF7F0] border-b border-[#E7E5DF] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-[#D6A84F] bg-[#163D32] px-2 py-0.5 rounded">
                      Module {modIdx + 1}
                    </span>
                    <h3 className="font-editorial text-base font-bold text-[#163D32]">
                      {mod.title}
                    </h3>
                  </div>
                  <span className="text-xs text-stone-500">
                    {mod.lessons?.length || 0} lessons
                  </span>
                </div>

                <div className="divide-y divide-[#E7E5DF]">
                  {mod.lessons?.map((lsn, lsnIdx) => (
                    <div
                      key={lsn.id}
                      className="p-4 flex items-center justify-between hover:bg-white transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <PlayCircle className="w-4 h-4 text-stone-400" />
                        <div>
                          <div className="text-xs font-semibold text-stone-800">
                            {lsn.title}
                          </div>
                          <span className="text-[10px] text-stone-500">
                            {lsn.duration_minutes} min lesson
                          </span>
                        </div>
                      </div>

                      {course.is_enrolled || course.price === 0 ? (
                        <button
                          onClick={handleStartLearning}
                          className="text-xs font-bold text-[#163D32] hover:underline"
                        >
                          Start Lesson
                        </button>
                      ) : (
                        <Lock className="w-3.5 h-3.5 text-stone-400" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ALATPay Checkout Modal */}
        {payModalOpen && (
          <AlatPayModal
            course={course}
            isOpen={payModalOpen}
            onClose={() => setPayModalOpen(false)}
            onSuccess={() => {
              setCourse({ ...course, is_enrolled: true });
              const targetCulture = course.culture_slug || 'yoruba';
              navigate(`/dashboard/${targetCulture}/courses`);
            }}
          />
        )}
      </div>
    </div>
  );
};
