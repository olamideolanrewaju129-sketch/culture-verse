import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Compass, Sparkles, BookOpen, GraduationCap, Users, Menu, X, ArrowRight, Globe } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, activeCulture, switchCulture, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cultureDropdownOpen, setCultureDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const cultures = [
    { slug: 'yoruba', name: 'Yoruba', flag: 'Ọ̀yọ́' },
    { slug: 'igbo', name: 'Igbo', flag: 'Ọdịnala' },
    { slug: 'hausa', name: 'Hausa', flag: 'Kano' },
  ];

  const handleCultureSwitch = (slug: string) => {
    switchCulture(slug);
    setCultureDropdownOpen(false);
    if (user) {
      navigate(`/dashboard/${slug}`);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-[#FAF7F0]/95 backdrop-blur-md border-b border-[#E7E5DF]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-xl bg-[#163D32] flex items-center justify-center text-[#D6A84F] shadow-sm transition-transform group-hover:scale-105 border border-[#D6A84F]/30">
              <Compass className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-editorial text-2xl font-bold tracking-tight text-[#163D32]">
                  CultureVerse
                </span>
                <span className="inline-block w-2 h-2 rounded-full bg-[#D6A84F]"></span>
              </div>
              <span className="text-[10px] uppercase tracking-widest font-semibold text-[#B85C38] block -mt-1">
                Preserve • Learn • Connect
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            <Link
              to="/cultures"
              className="text-sm font-medium text-[#252923] hover:text-[#163D32] flex items-center gap-1.5 transition-colors"
            >
              <Globe className="w-4 h-4 text-[#D6A84F]" />
              Explore Cultures
            </Link>
            <Link
              to="/library"
              className="text-sm font-medium text-[#252923] hover:text-[#163D32] flex items-center gap-1.5 transition-colors"
            >
              <BookOpen className="w-4 h-4 text-[#D6A84F]" />
              Library
            </Link>
            <Link
              to="/courses"
              className="text-sm font-medium text-[#252923] hover:text-[#163D32] flex items-center gap-1.5 transition-colors"
            >
              <GraduationCap className="w-4 h-4 text-[#D6A84F]" />
              Courses
            </Link>
            <Link
              to="/contributors"
              className="text-sm font-medium text-[#252923] hover:text-[#163D32] flex items-center gap-1.5 transition-colors"
            >
              <Users className="w-4 h-4 text-[#D6A84F]" />
              Contributors
            </Link>
            <Link
              to="/about"
              className="text-sm font-medium text-[#252923] hover:text-[#163D32] transition-colors"
            >
              About
            </Link>
          </nav>

          {/* Actions & Culture Selector */}
          <div className="hidden lg:flex items-center gap-4">
            {/* Quick Culture Switcher */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setCultureDropdownOpen(!cultureDropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#E5EDE5] text-[#163D32] text-xs font-semibold hover:bg-[#163D32] hover:text-white transition-all border border-[#163D32]/10"
              >
                <span className="w-2 h-2 rounded-full bg-[#D6A84F]"></span>
                <span className="capitalize">{activeCulture}</span>
                <span className="text-[10px] text-stone-500 hover:text-stone-300">▼</span>
              </button>

              {cultureDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-[#E7E5DF] py-2 z-50">
                  <div className="px-3 py-1 text-[11px] font-bold text-stone-400 uppercase tracking-wider">
                    Select Cultural Focus
                  </div>
                  {cultures.map((c) => (
                    <button
                      key={c.slug}
                      onClick={() => handleCultureSwitch(c.slug)}
                      className={`w-full text-left px-4 py-2 text-xs flex items-center justify-between hover:bg-[#FAF7F0] ${
                        activeCulture === c.slug ? 'font-bold text-[#163D32] bg-[#E5EDE5]/60' : 'text-stone-700'
                      }`}
                    >
                      <span>{c.name} Culture</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-stone-100 text-stone-600">
                        {c.flag}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <Link
                  to={`/dashboard/${activeCulture}`}
                  className="px-4 py-2 text-xs font-bold rounded-lg bg-[#163D32] text-white hover:bg-[#0F2A22] transition-colors shadow-sm flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#D6A84F]" />
                  Dashboard
                </Link>
                {user?.role === 'admin' && (
                  <Link
                    to="/admin"
                    className="px-3 py-2 text-xs font-bold rounded-lg bg-[#B85C38] text-white hover:bg-[#974524] transition-colors"
                  >
                    Admin
                  </Link>
                )}
                <button
                  onClick={logout}
                  className="text-xs text-stone-600 hover:text-stone-900 font-medium"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="text-xs font-semibold text-[#163D32] hover:text-[#B85C38] px-3 py-2 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="px-4 py-2 text-xs font-bold rounded-lg bg-[#163D32] text-white hover:bg-[#0F2A22] transition-colors shadow-sm flex items-center gap-1.5 group"
                >
                  Get Started
                  <ArrowRight className="w-3.5 h-3.5 text-[#D6A84F] group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden flex items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-stone-700 hover:bg-[#E5EDE5] focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#FAF7F0] border-b border-[#E7E5DF] px-4 pt-2 pb-6 space-y-4">
          <div className="flex flex-col space-y-3 pt-2">
            <Link
              to="/cultures"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg text-sm font-medium text-stone-800 hover:bg-[#E5EDE5]"
            >
              Explore Cultures
            </Link>
            <Link
              to="/library"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg text-sm font-medium text-stone-800 hover:bg-[#E5EDE5]"
            >
              Cultural Library
            </Link>
            <Link
              to="/courses"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg text-sm font-medium text-stone-800 hover:bg-[#E5EDE5]"
            >
              Course Catalogue
            </Link>
            <Link
              to="/contributors"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg text-sm font-medium text-stone-800 hover:bg-[#E5EDE5]"
            >
              Knowledge Keepers
            </Link>
            <Link
              to="/about"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg text-sm font-medium text-stone-800 hover:bg-[#E5EDE5]"
            >
              About Mission
            </Link>
            <Link
              to="/how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg text-sm font-medium text-stone-800 hover:bg-[#E5EDE5]"
            >
              How It Works
            </Link>
          </div>

          <div className="pt-4 border-t border-[#E7E5DF] flex flex-col gap-3">
            <div className="text-xs font-semibold text-stone-500 uppercase">Select Culture:</div>
            <div className="grid grid-cols-3 gap-2">
              {cultures.map((c) => (
                <button
                  key={c.slug}
                  onClick={() => {
                    handleCultureSwitch(c.slug);
                    setMobileMenuOpen(false);
                  }}
                  className={`py-2 px-3 text-xs rounded-lg border font-medium ${
                    activeCulture === c.slug
                      ? 'bg-[#163D32] text-white border-[#163D32]'
                      : 'bg-white text-stone-800 border-stone-200'
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>

            {isAuthenticated ? (
              <div className="pt-2 flex flex-col gap-2">
                <Link
                  to={`/dashboard/${activeCulture}`}
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 rounded-lg bg-[#163D32] text-white text-sm font-semibold"
                >
                  Open {activeCulture.toUpperCase()} Dashboard
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-center py-2 text-xs text-stone-600"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="pt-2 flex flex-col gap-2">
                <Link
                  to="/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 rounded-lg bg-[#163D32] text-white text-sm font-semibold"
                >
                  Get Started
                </Link>
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2 text-sm text-[#163D32] font-medium"
                >
                  Sign In
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
