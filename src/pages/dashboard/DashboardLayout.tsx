import React, { useState } from 'react';
import { Outlet, Link, useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Compass,
  LayoutDashboard,
  BookOpen,
  GraduationCap,
  Sparkles,
  Bookmark,
  HeartHandshake,
  FileText,
  Search,
  User,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Globe,
  Landmark,
  Languages,
  Utensils,
  Hammer,
  Scroll,
  Sun,
  Music,
  Shield,
  Layers,
  HelpCircle,
} from 'lucide-react';

export const DashboardLayout: React.FC = () => {
  const { cultureId } = useParams<{ cultureId: string }>();
  const currentCulture = cultureId || 'yoruba';
  const { user, logout, switchCulture } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [collapsed, setCollapsed] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const cultures = [
    { slug: 'yoruba', name: 'Yoruba', greeting: 'Ẹ káàbọ̀' },
    { slug: 'igbo', name: 'Igbo', greeting: 'Nnọọ' },
    { slug: 'hausa', name: 'Hausa', greeting: 'Sannu da zuwa' },
  ];

  const handleCultureChange = (slug: string) => {
    switchCulture(slug);
    navigate(`/dashboard/${slug}`);
  };

  const navSections = [
    {
      title: 'Main Exploration',
      items: [
        {
          name: 'Overview',
          path: `/dashboard/${currentCulture}`,
          icon: LayoutDashboard,
          exact: true,
        },
        {
          name: 'Ask Your Roots (Gemma)',
          path: `/dashboard/${currentCulture}/ask-roots`,
          icon: Sparkles,
          highlight: true,
        },
        {
          name: 'Cultural Library',
          path: `/dashboard/${currentCulture}/library`,
          icon: BookOpen,
        },
      ],
    },
    {
      title: 'Cultural Domains',
      items: [
        {
          name: 'History & Origins',
          path: `/dashboard/${currentCulture}/category/history`,
          icon: Landmark,
        },
        {
          name: 'Language & Proverbs',
          path: `/dashboard/${currentCulture}/category/language`,
          icon: Languages,
        },
        {
          name: 'Food & Cuisine',
          path: `/dashboard/${currentCulture}/category/food`,
          icon: Utensils,
        },
        {
          name: 'Arts & Craftsmanship',
          path: `/dashboard/${currentCulture}/category/crafts`,
          icon: Hammer,
        },
        {
          name: 'Oral Stories & Folktales',
          path: `/dashboard/${currentCulture}/category/stories`,
          icon: Scroll,
        },
        {
          name: 'Festivals & Celebrations',
          path: `/dashboard/${currentCulture}/category/festivals`,
          icon: Sun,
        },
        {
          name: 'Music & Dance',
          path: `/dashboard/${currentCulture}/category/music`,
          icon: Music,
        },
        {
          name: 'Communities & Heritage',
          path: `/dashboard/${currentCulture}/category/naming`,
          icon: Globe,
        },
      ],
    },
    {
      title: 'Learning & Progress',
      items: [
        {
          name: 'Courses & Masterclasses',
          path: `/dashboard/${currentCulture}/courses`,
          icon: GraduationCap,
        },
        {
          name: 'My Learning Progress',
          path: `/dashboard/${currentCulture}/my-learning`,
          icon: Layers,
        },
        {
          name: 'Saved Resources',
          path: `/dashboard/${currentCulture}/saved`,
          icon: Bookmark,
        },
      ],
    },
    {
      title: 'Preservation & Community',
      items: [
        {
          name: 'Contribute Knowledge',
          path: `/dashboard/${currentCulture}/contribute`,
          icon: HeartHandshake,
        },
        {
          name: 'My Contributions',
          path: `/dashboard/${currentCulture}/my-contributions`,
          icon: FileText,
        },
        {
          name: 'Knowledge Gaps Registry',
          path: `/dashboard/${currentCulture}/knowledge-gaps`,
          icon: HelpCircle,
        },
      ],
    },
    {
      title: 'Account',
      items: [
        {
          name: 'Profile & Interests',
          path: `/dashboard/${currentCulture}/profile`,
          icon: User,
        },
      ],
    },
  ];

  const renderNavLinks = () => (
    <div className="space-y-6 py-4">
      {navSections.map((sec, secIdx) => (
        <div key={secIdx} className="space-y-1">
          {!collapsed && (
            <div className="px-3 text-[10px] uppercase font-bold tracking-wider text-stone-400">
              {sec.title}
            </div>
          )}
          {sec.items.map((item) => {
            const isActive = item.exact
              ? location.pathname === item.path
              : location.pathname.startsWith(item.path);

            return (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => setMobileDrawerOpen(false)}
                className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-[#163D32] text-white shadow-xs'
                    : item.highlight
                    ? 'text-[#B85C38] hover:bg-[#FAF7F0] font-bold'
                    : 'text-stone-700 hover:bg-[#FAF7F0] hover:text-[#163D32]'
                }`}
                title={collapsed ? item.name : undefined}
              >
                <item.icon
                  className={`w-4 h-4 shrink-0 ${
                    isActive ? 'text-[#D6A84F]' : item.highlight ? 'text-[#B85C38]' : 'text-stone-500'
                  }`}
                />
                {!collapsed && <span className="truncate">{item.name}</span>}
              </Link>
            );
          })}
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FAF7F0] flex flex-col">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-[#E7E5DF] h-16 flex items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileDrawerOpen(true)}
            className="lg:hidden p-2 rounded-lg text-stone-600 hover:bg-stone-100"
          >
            <Menu className="w-5 h-5" />
          </button>

          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#163D32] text-[#D6A84F] flex items-center justify-center font-bold">
              <Compass className="w-5 h-5" />
            </div>
            <span className="font-editorial text-lg font-bold text-[#163D32] hidden sm:inline">
              CultureVerse
            </span>
          </Link>
        </div>

        {/* Culture Switcher Toggle in Header */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400 hidden sm:inline">
            Active Tradition:
          </span>
          <div className="flex items-center bg-[#FAF7F0] p-1 rounded-xl border border-[#E7E5DF]">
            {cultures.map((c) => (
              <button
                key={c.slug}
                onClick={() => handleCultureChange(c.slug)}
                className={`px-3 py-1 text-xs font-semibold rounded-lg capitalize transition-all ${
                  currentCulture === c.slug
                    ? 'bg-[#163D32] text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>

          <div className="h-6 w-px bg-stone-200 mx-2 hidden sm:block" />

          {/* User profile snippet */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#163D32] text-[#D6A84F] flex items-center justify-center text-xs font-bold border border-[#D6A84F]/30">
              {user?.full_name ? user.full_name[0].toUpperCase() : 'U'}
            </div>
            <button
              onClick={() => {
                logout();
                navigate('/login');
              }}
              className="text-stone-500 hover:text-stone-900 p-1.5 rounded-lg hover:bg-stone-100"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container with Sidebar + Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Collapsible Sidebar */}
        <aside
          className={`hidden lg:flex flex-col border-r border-[#E7E5DF] bg-white transition-all duration-300 relative ${
            collapsed ? 'w-20' : 'w-64'
          }`}
        >
          <div className="p-3 border-b border-[#E7E5DF] flex items-center justify-between">
            {!collapsed && (
              <span className="text-xs font-bold uppercase tracking-wider text-[#B85C38] px-2 capitalize">
                {currentCulture} Space
              </span>
            )}
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-500 mx-auto"
              title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            >
              {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-2">
            {renderNavLinks()}
          </div>
        </aside>

        {/* Mobile Navigation Drawer */}
        {mobileDrawerOpen && (
          <div className="lg:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex">
            <div className="w-72 bg-white h-full flex flex-col p-4 overflow-y-auto shadow-2xl">
              <div className="flex items-center justify-between pb-4 border-b border-[#E7E5DF]">
                <div className="flex items-center gap-2">
                  <Compass className="w-5 h-5 text-[#163D32]" />
                  <span className="font-editorial font-bold text-base text-[#163D32]">
                    CultureVerse Menu
                  </span>
                </div>
                <button
                  onClick={() => setMobileDrawerOpen(false)}
                  className="p-1 rounded-lg text-stone-500 hover:bg-stone-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 py-2">
                {renderNavLinks()}
              </div>

              <div className="pt-4 border-t border-[#E7E5DF]">
                <button
                  onClick={() => {
                    logout();
                    navigate('/login');
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2 text-xs font-bold text-red-700 bg-red-50 rounded-xl"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
            <div className="flex-1" onClick={() => setMobileDrawerOpen(false)} />
          </div>
        )}

        {/* Dynamic Nested Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
