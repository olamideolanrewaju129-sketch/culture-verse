import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../api/client';
import { CulturalResource } from '../types';
import { AskYourRootsWidget } from '../components/AskYourRootsWidget';
import { BookOpen, Clock, ArrowLeft, Bookmark, CheckCircle2, ScrollText, Sparkles, UserCheck } from 'lucide-react';

export const ResourceDetail: React.FC = () => {
  const { resourceId } = useParams<{ resourceId: string }>();
  const [resource, setResource] = useState<CulturalResource | null>(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function loadResource() {
      if (!resourceId) return;
      setLoading(true);
      try {
        const data = await api.getResourceById(resourceId);
        setResource(data);
      } catch (err) {
        console.error('Resource fetch error:', err);
      } finally {
        setLoading(false);
      }
    }
    loadResource();
  }, [resourceId]);

  const handleToggleSave = async () => {
    if (!resource) return;
    try {
      const res = await api.toggleSaveResource(resource.id);
      setSaved(res.saved);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-[#FAF7F0] flex items-center justify-center text-stone-500">Loading cultural archive...</div>;
  }

  if (!resource) {
    return (
      <div className="min-h-screen bg-[#FAF7F0] flex flex-col items-center justify-center space-y-4">
        <h2 className="text-xl font-bold text-[#163D32]">Archival record not found</h2>
        <Link to="/library" className="text-sm underline text-[#B85C38]">Back to Library</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF7F0] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center justify-between text-xs text-stone-500">
          <Link
            to="/library"
            className="flex items-center gap-1.5 text-[#163D32] hover:text-[#B85C38] font-bold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Cultural Library</span>
          </Link>

          <button
            onClick={handleToggleSave}
            className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              saved
                ? 'bg-[#163D32] text-[#D6A84F] border-[#163D32]'
                : 'bg-white text-stone-700 border-stone-200 hover:border-[#163D32]'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5 fill-current" />
            <span>{saved ? 'Bookmarked' : 'Save Resource'}</span>
          </button>
        </div>

        {/* Resource Header */}
        <div className="bg-white rounded-3xl border border-[#E7E5DF] p-6 sm:p-10 shadow-sm space-y-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#E5EDE5] text-[#163D32] border border-[#163D32]/15 capitalize">
              {resource.culture_name || 'African Culture'}
            </span>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#FAF7F0] text-[#B85C38] border border-[#E7E5DF]">
              {resource.category_name || 'Archival Documentation'}
            </span>
            <span className="text-xs text-stone-500 flex items-center gap-1 ml-auto">
              <Clock className="w-3.5 h-3.5" />
              {resource.read_time_minutes} min read
            </span>
          </div>

          <h1 className="font-editorial text-3xl sm:text-5xl font-bold text-[#163D32] leading-tight">
            {resource.title}
          </h1>

          <p className="text-base sm:text-lg text-stone-600 font-serif italic border-l-4 border-[#D6A84F] pl-4 py-1 leading-relaxed">
            {resource.summary}
          </p>

          {/* Media image if present */}
          {resource.media_url && (
            <div className="rounded-2xl overflow-hidden max-h-96 w-full bg-stone-100 border border-stone-200">
              <img
                src={resource.media_url}
                alt={resource.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Body Content */}
          <div className="prose prose-stone max-w-none text-stone-800 leading-relaxed text-sm sm:text-base whitespace-pre-line pt-4 border-t border-[#E7E5DF]">
            {resource.content}
          </div>

          {/* Sources and Archival References */}
          {resource.sources && resource.sources.length > 0 && (
            <div className="mt-8 pt-6 border-t border-[#E7E5DF] space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#163D32]">
                <ScrollText className="w-4 h-4 text-[#D6A84F]" />
                <span>Documented Sources and Citations</span>
              </div>
              <div className="space-y-2">
                {resource.sources.map((src) => (
                  <div key={src.id} className="p-3 rounded-xl bg-[#FAF7F0] border border-[#E7E5DF] text-xs space-y-1">
                    <div className="font-bold text-stone-900">{src.source_title}</div>
                    {src.author && <div className="text-stone-600">Author: {src.author}</div>}
                    {src.notes && <div className="text-stone-500 italic">{src.notes}</div>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Embedded Gemma Cultural Inquirer grounded on this article */}
        <AskYourRootsWidget
          initialCulture={resource.culture_slug || 'all'}
          title={`Ask Gemma about "${resource.title}"`}
          subtitle="Explore questions about this specific tradition, techniques, or related oral histories."
        />
      </div>
    </div>
  );
};
