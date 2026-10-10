import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, Heart, ShieldCheck, Sparkles, Globe, BookOpen } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#163D32] text-stone-200 border-t border-[#1E5042] pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-[#1E5042]">
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#0F2A22] flex items-center justify-center text-[#D6A84F] border border-[#D6A84F]/30">
                <Compass className="w-5 h-5" />
              </div>
              <span className="font-editorial text-2xl font-bold tracking-tight text-white">
                CultureVerse
              </span>
            </div>
            <p className="text-sm text-stone-300 leading-relaxed max-w-sm">
              An intelligent African cultural preservation and learning platform powered by Gemma. Grounded in authentic oral histories, verified archival documentation, and living community knowledge.
            </p>
            <div className="flex items-center gap-2 pt-2 text-xs text-[#D6A84F]">
              <Sparkles className="w-4 h-4" />
              <span>Gemma AI Assistant grounded on real cultural library resources</span>
            </div>
          </div>

          {/* Cultural Paths */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#D6A84F]">
              Explore Cultures
            </h4>
            <ul className="space-y-2 text-sm text-stone-300">
              <li>
                <Link to="/cultures/yoruba" className="hover:text-white transition-colors">
                  Yoruba Heritage
                </Link>
              </li>
              <li>
                <Link to="/cultures/igbo" className="hover:text-white transition-colors">
                  Igbo Heritage
                </Link>
              </li>
              <li>
                <Link to="/cultures/hausa" className="hover:text-white transition-colors">
                  Hausa Heritage
                </Link>
              </li>
              <li>
                <Link to="/cultures" className="hover:text-white transition-colors flex items-center gap-1">
                  <Globe className="w-3.5 h-3.5 text-[#D6A84F]" />
                  All Traditions
                </Link>
              </li>
            </ul>
          </div>

          {/* Learning & Preservation */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#D6A84F]">
              Preserve & Learn
            </h4>
            <ul className="space-y-2 text-sm text-stone-300">
              <li>
                <Link to="/library" className="hover:text-white transition-colors flex items-center gap-1">
                  <BookOpen className="w-3.5 h-3.5 text-[#D6A84F]" />
                  Cultural Library
                </Link>
              </li>
              <li>
                <Link to="/courses" className="hover:text-white transition-colors">
                  Course Catalogue
                </Link>
              </li>
              <li>
                <Link to="/contribute" className="hover:text-white transition-colors">
                  Contribute Knowledge
                </Link>
              </li>
              <li>
                <Link to="/contributors" className="hover:text-white transition-colors">
                  Knowledge Keepers
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" className="hover:text-white transition-colors">
                  Preservation Process
                </Link>
              </li>
            </ul>
          </div>

          {/* Platform & Community */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#D6A84F]">
              Community & Trust
            </h4>
            <ul className="space-y-2 text-sm text-stone-300">
              <li>
                <Link to="/about" className="hover:text-white transition-colors">
                  About Mission
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white transition-colors">
                  Contact Team
                </Link>
              </li>
              <li className="flex items-center gap-1 text-xs text-stone-400 pt-2">
                <ShieldCheck className="w-4 h-4 text-[#D6A84F]" />
                Secure payments with ALATPay
              </li>
              <li className="text-[11px] text-stone-400">
                Ethical AI policy: AI assists, communities verify.
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-400 gap-4">
          <p>© {new Date().getFullYear()} CultureVerse. Preserving authentic African heritage for generations to come.</p>
          <div className="flex items-center gap-1">
            <span>Built with care for African cultural preservation</span>
            <Heart className="w-3.5 h-3.5 text-[#B85C38] fill-current" />
          </div>
        </div>
      </div>
    </footer>
  );
};
