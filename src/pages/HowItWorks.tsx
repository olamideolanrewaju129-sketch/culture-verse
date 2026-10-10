import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, Sparkles, GraduationCap, HeartHandshake, ShieldCheck, CheckCircle2, ArrowRight } from 'lucide-react';

export const HowItWorks: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#FAF7F0] py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-16">
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E5EDE5] text-[#163D32] text-xs font-semibold">
            <Compass className="w-3.5 h-3.5 text-[#D6A84F]" />
            <span>Architecture of Cultural Preservation</span>
          </div>
          <h1 className="font-editorial text-4xl sm:text-5xl font-bold text-[#163D32]">
            How CultureVerse Works
          </h1>
          <p className="text-sm sm:text-base text-stone-600">
            A harmonious bridge between living oral traditions, persistent relational archives, and Google Gemma AI capabilities.
          </p>
        </div>

        {/* 4 Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-2xl border border-[#E7E5DF] p-8 space-y-4 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-[#163D32] text-[#D6A84F] flex items-center justify-center font-bold">
              1
            </div>
            <h3 className="font-editorial text-2xl font-bold text-[#163D32]">
              Persistent Cultural Database
            </h3>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              PostgreSQL / relational storage holds our permanent library of cultural traditions, courses, lessons, registered users, and peer-reviewed contributions. Gemma is the AI inference engine, not the storage system.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-[#E7E5DF] p-8 space-y-4 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-[#D6A84F] text-[#163D32] flex items-center justify-center font-bold">
              2
            </div>
            <h3 className="font-editorial text-2xl font-bold text-[#163D32]">
              Grounded Gemma AI Inquiries
            </h3>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              When a user asks a question in "Ask Your Roots", our backend first retrieves relevant, published cultural records from the database. Gemma synthesizes answers directly based on these authoritative sources, transparently noting any regional variation.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-[#E7E5DF] p-8 space-y-4 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-[#B85C38] text-white flex items-center justify-center font-bold">
              3
            </div>
            <h3 className="font-editorial text-2xl font-bold text-[#163D32]">
              Elder & Contributor Peer-Review
            </h3>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              Anyone can submit oral traditions or family folklore, but they remain drafts or pending review until authorized cultural curators approve them for publication, maintaining sacred integrity.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-[#E7E5DF] p-8 space-y-4 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-[#1E5042] text-[#D6A84F] flex items-center justify-center font-bold">
              4
            </div>
            <h3 className="font-editorial text-2xl font-bold text-[#163D32]">
              Structured Masterclasses & ALATPay
            </h3>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              Learners can take structured courses in traditional crafts (Àṣọ-Òkè weaving, Akwete loomed patterns, Tubali masonry). Paid workshops are securely processed through ALATPay to directly compensate cultural elders.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center pt-8">
          <Link
            to="/signup"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-[#163D32] text-white font-bold text-sm shadow-md hover:bg-[#0F2A22]"
          >
            <span>Start Your Cultural Journey</span>
            <ArrowRight className="w-4 h-4 text-[#D6A84F]" />
          </Link>
        </div>
      </div>
    </div>
  );
};
