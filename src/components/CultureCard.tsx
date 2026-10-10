import React from 'react';
import { Link } from 'react-router-dom';
import { Culture } from '../types';
import { ArrowRight, BookOpen, GraduationCap } from 'lucide-react';

interface CultureCardProps {
  culture: Culture;
  featured?: boolean;
}

export const CultureCard: React.FC<CultureCardProps> = ({ culture, featured = false }) => {
  return (
    <div className="cultural-card overflow-hidden flex flex-col group h-full">
      {/* Cover Image */}
      <div className="relative h-56 sm:h-64 overflow-hidden bg-stone-200">
        <img
          src={culture.cover_image}
          alt={culture.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={(e) => {
            // fallback if local file path fails
            (e.target as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?q=80&w=1200&auto=format&fit=crop';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        
        {/* Culture Badge & Greeting */}
        <div className="absolute bottom-4 left-4 right-4">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#D6A84F] bg-black/40 backdrop-blur-sm px-2.5 py-1 rounded-full border border-[#D6A84F]/30 inline-block mb-1.5">
            {culture.greeting}
          </span>
          <h3 className="font-editorial text-2xl font-bold text-white tracking-wide">
            {culture.name}
          </h3>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 flex-1 flex flex-col justify-between">
        <div className="space-y-3">
          <p className="text-sm text-stone-600 line-clamp-3 leading-relaxed">
            {culture.description}
          </p>
          <p className="text-xs text-stone-500 italic border-l-2 border-[#D6A84F] pl-3 py-0.5">
            "{culture.hero_subtitle}"
          </p>
        </div>

        {/* Action Links */}
        <div className="pt-6 mt-4 border-t border-[#E7E5DF] flex items-center justify-between gap-3">
          <Link
            to={`/cultures/${culture.slug}`}
            className="text-xs font-bold text-[#163D32] hover:text-[#B85C38] flex items-center gap-1 group/link"
          >
            <span>Explore Heritage</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#D6A84F] group-hover/link:translate-x-1 transition-transform" />
          </Link>

          <Link
            to={`/dashboard/${culture.slug}`}
            className="px-3.5 py-1.5 rounded-lg bg-[#E5EDE5] hover:bg-[#163D32] text-[#163D32] hover:text-white text-xs font-semibold transition-colors flex items-center gap-1.5"
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
