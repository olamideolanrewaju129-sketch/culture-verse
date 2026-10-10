import React from 'react';
import { Link } from 'react-router-dom';
import { Course } from '../types';
import { Clock, GraduationCap, ArrowRight, ShieldCheck } from 'lucide-react';

interface CourseCardProps {
  course: Course;
  onEnroll?: (course: Course) => void;
}

export const CourseCard: React.FC<CourseCardProps> = ({ course, onEnroll }) => {
  return (
    <div className="cultural-card overflow-hidden flex flex-col group h-full">
      {/* Cover Image */}
      <div className="h-48 relative overflow-hidden bg-stone-200">
        <img
          src={course.cover_image}
          alt={course.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?q=80&w=800&auto=format&fit=crop';
          }}
        />
        <div className="absolute top-3 left-3 flex gap-2">
          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-black/60 text-[#D6A84F] backdrop-blur-sm border border-[#D6A84F]/30">
            {course.difficulty}
          </span>
        </div>
        <div className="absolute bottom-3 right-3">
          <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-[#163D32] text-white shadow-sm border border-[#D6A84F]/20">
            {course.price === 0 ? 'Free Workshop' : `₦${course.price.toLocaleString()} via ALATPay`}
          </span>
        </div>
      </div>

      {/* Course Info */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 text-[11px] text-stone-500 mb-2">
            <span className="font-semibold text-[#B85C38] uppercase tracking-wider">
              {course.culture_name || 'African Culture'}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {course.duration_minutes} minutes
            </span>
          </div>

          <h3 className="font-editorial text-lg font-bold text-[#163D32] group-hover:text-[#B85C38] transition-colors line-clamp-2">
            {course.title}
          </h3>

          <p className="text-xs text-stone-600 mt-2 line-clamp-3 leading-relaxed">
            {course.description}
          </p>

          {course.instructor_name && (
            <div className="mt-3 text-[11px] text-stone-500 flex items-center gap-1.5">
              <span>Taught by:</span>
              <span className="font-semibold text-stone-800">{course.instructor_name}</span>
            </div>
          )}
        </div>

        {/* Action Link */}
        <div className="pt-4 mt-4 border-t border-[#E7E5DF] flex items-center justify-between">
          <Link
            to={`/courses/${course.id}`}
            className="text-xs font-bold text-[#163D32] hover:text-[#B85C38] flex items-center gap-1 group/btn"
          >
            <span>View Syllabus</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#D6A84F] group-hover/btn:translate-x-1 transition-transform" />
          </Link>

          {onEnroll ? (
            <button
              onClick={() => onEnroll(course)}
              className="px-3.5 py-1.5 rounded-lg bg-[#163D32] hover:bg-[#0F2A22] text-white text-xs font-semibold transition-colors flex items-center gap-1"
            >
              <GraduationCap className="w-3.5 h-3.5 text-[#D6A84F]" />
              <span>{course.price === 0 ? 'Enrol Free' : 'Enrol Now'}</span>
            </button>
          ) : (
            <Link
              to={`/courses/${course.id}`}
              className="px-3.5 py-1.5 rounded-lg bg-[#E5EDE5] hover:bg-[#163D32] text-[#163D32] hover:text-white text-xs font-semibold transition-colors flex items-center gap-1"
            >
              <span>Explore Course</span>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};
