import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, Heart, ShieldCheck, Sparkles, Users } from 'lucide-react';

export const About: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#FAF7F0] py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-12">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E5EDE5] text-[#163D32] text-xs font-semibold">
            <Compass className="w-3.5 h-3.5 text-[#D6A84F]" />
            <span>Mission & Philosophy</span>
          </div>
          <h1 className="font-editorial text-4xl sm:text-5xl font-bold text-[#163D32]">
            Preserving African Heritage Through Intelligent Technology
          </h1>
        </div>

        <div className="bg-white rounded-3xl border border-[#E7E5DF] p-8 sm:p-12 shadow-sm space-y-8 text-stone-700 leading-relaxed text-sm sm:text-base font-serif">
          <p className="first-letter:text-5xl first-letter:font-editorial first-letter:font-bold first-letter:text-[#163D32] first-letter:mr-3 first-letter:float-left">
            CultureVerse was born out of an urgent cultural imperative: as urbanization accelerates and elder generations pass on, thousands of sacred African oral histories, complex textile loom formulas, and indigenous philosophical systems risk fading from living memory.
          </p>

          <p>
            We believe that modern artificial intelligence, specifically Google Gemma, can serve as a powerful ally for cultural preservation—provided it is anchored to truthful, community-held archives rather than unrestricted speculative generation.
          </p>

          <div className="p-6 rounded-2xl bg-[#FAF7F0] border-l-4 border-[#D6A84F] my-6 font-sans text-xs sm:text-sm text-stone-800 space-y-2">
            <h3 className="font-editorial font-bold text-base text-[#163D32]">
              Our Guiding Principles
            </h3>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Grounding over Hallucination:</strong> Gemma answers from published, verified archival sources.</li>
              <li><strong>Elders as True Curators:</strong> Traditional wisdom remains authenticated by indigenous masters.</li>
              <li><strong>Unifying Diversity:</strong> Yoruba, Igbo, and Hausa traditions are celebrated in their unique regional beauty under a single collaborative platform.</li>
            </ul>
          </div>

          <p>
            By combining persistent relational databases, rigorous editorial review, accessible online courses, and respectful AI retrieval, CultureVerse creates a dynamic cultural sanctuary for youth, researchers, and diaspora learners globally.
          </p>
        </div>
      </div>
    </div>
  );
};
