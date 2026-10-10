import React from 'react';
import { useParams } from 'react-router-dom';
import { AskYourRootsWidget } from '../../components/AskYourRootsWidget';
import { Sparkles, Compass, ShieldCheck } from 'lucide-react';

export const DashboardAskRoots: React.FC = () => {
  const { cultureId } = useParams<{ cultureId: string }>();
  const currentCulture = cultureId || 'yoruba';

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E5EDE5] text-[#163D32] text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-[#D6A84F]" />
          <span>Gemma 4 26B AI Assistant</span>
        </div>
        <h1 className="font-editorial text-3xl sm:text-4xl font-bold text-[#163D32]">
          Ask Your Roots
        </h1>
        <p className="text-sm text-stone-600">
          Ask any question about Yoruba, Igbo, or Hausa history, sacred customs, weaving, food, or expressions. Gemma answers grounded in our authentic database library archives.
        </p>
      </div>

      <AskYourRootsWidget
        initialCulture={currentCulture}
        className="shadow-md"
        title="Interactive Cultural Learning Assistant"
        subtitle="Every answer is grounded in verified documentation, with citations and direct links to library sources."
      />
    </div>
  );
};
