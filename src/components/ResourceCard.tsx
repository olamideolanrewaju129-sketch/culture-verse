import React from 'react';
import { Link } from 'react-router-dom';
import { CulturalResource } from '../types';
import { BookOpen, Clock, ArrowRight, Bookmark } from 'lucide-react';

interface ResourceCardProps {
  resource: CulturalResource;
  onToggleSave?: (id: string) => void;
  isSaved?: boolean;
}

export const ResourceCard: React.FC<ResourceCardProps> = ({
  resource,
  onToggleSave,
  isSaved = false,
}) => {
  const typeLabels: Record<string, string> = {
    article: 'Documented History',
    oral_history: 'Oral Tradition',
    craft_tutorial: 'Traditional Craft',
    recipe: 'Culinary Heritage',
    language: 'Language & Expressions',
    interview: 'Elder Interview',
  };

  const cultureBadges: Record<string, string> = {
    cult_yoruba: 'bg-amber-100 text-amber-900 border-amber-300',
    yoruba: 'bg-amber-100 text-amber-900 border-amber-300',
    cult_igbo: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    igbo: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    cult_hausa: 'bg-rose-100 text-rose-900 border-rose-300',
    hausa: 'bg-rose-100 text-rose-900 border-rose-300',
  };

  const cultureKey = resource.culture_slug || resource.culture_id;
  const badgeStyle = cultureBadges[cultureKey] || 'bg-stone-100 text-stone-800 border-stone-200';

  return (
    <div className="cultural-card overflow-hidden flex flex-col group h-full">
      {/* Media Banner */}
      {resource.media_url ? (
        <div className="h-44 overflow-hidden relative bg-stone-200">
          <img
            src={resource.media_url}
            alt={resource.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?q=80&w=800&auto=format&fit=crop';
            }}
          />
          <div className="absolute top-3 left-3 flex gap-2">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shadow-sm ${badgeStyle}`}>
              {resource.culture_name || 'African Heritage'}
            </span>
          </div>
        </div>
      ) : (
        <div className="h-28 bg-[#163D32]/5 p-4 flex items-center justify-between border-b border-[#E7E5DF]">
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shadow-sm ${badgeStyle}`}>
            {resource.culture_name || 'African Heritage'}
          </span>
          <span className="text-[10px] uppercase font-bold tracking-wider text-stone-500">
            {typeLabels[resource.content_type] || resource.content_type}
          </span>
        </div>
      )}

      {/* Body */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 text-[11px] text-stone-500 mb-2">
            <span className="uppercase tracking-wider font-semibold text-[#B85C38]">
              {resource.category_name || typeLabels[resource.content_type]}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {resource.read_time_minutes} min read
            </span>
          </div>

          <h3 className="font-editorial text-lg font-bold text-[#163D32] group-hover:text-[#B85C38] transition-colors line-clamp-2">
            {resource.title}
          </h3>

          <p className="text-xs text-stone-600 mt-2 line-clamp-3 leading-relaxed">
            {resource.summary}
          </p>
        </div>

        {/* Card Footer */}
        <div className="pt-4 mt-4 border-t border-[#E7E5DF] flex items-center justify-between">
          <Link
            to={`/library/${resource.id}`}
            className="text-xs font-bold text-[#163D32] hover:text-[#B85C38] flex items-center gap-1 group/btn"
          >
            <span>Read Documentation</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#D6A84F] group-hover/btn:translate-x-1 transition-transform" />
          </Link>

          {onToggleSave && (
            <button
              type="button"
              onClick={() => onToggleSave(resource.id)}
              className={`p-1.5 rounded-lg border transition-colors ${
                isSaved
                  ? 'bg-[#163D32] text-[#D6A84F] border-[#163D32]'
                  : 'bg-stone-50 text-stone-500 border-stone-200 hover:text-[#163D32]'
              }`}
              title={isSaved ? 'Remove Bookmark' : 'Save Resource'}
            >
              <Bookmark className="w-3.5 h-3.5 fill-current" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
