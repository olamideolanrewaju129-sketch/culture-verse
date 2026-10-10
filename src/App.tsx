import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { PublicLayout } from './components/PublicLayout';

// Public Pages
import { Home } from './pages/Home';
import { About } from './pages/About';
import { ExploreCultures } from './pages/ExploreCultures';
import { CultureDetail } from './pages/CultureDetail';
import { Library } from './pages/Library';
import { ResourceDetail } from './pages/ResourceDetail';
import { Courses } from './pages/Courses';
import { CourseDetail } from './pages/CourseDetail';
import { Contributors } from './pages/Contributors';
import { ContributorDetail } from './pages/ContributorDetail';
import { Contribute } from './pages/Contribute';
import { HowItWorks } from './pages/HowItWorks';
import { Contact } from './pages/Contact';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { ForgotPassword } from './pages/ForgotPassword';

// Dashboard & Admin
import { DashboardLayout } from './pages/dashboard/DashboardLayout';
import { DashboardOverview } from './pages/dashboard/DashboardOverview';
import { DashboardAskRoots } from './pages/dashboard/DashboardAskRoots';
import { DashboardCategoryView } from './pages/dashboard/DashboardCategoryView';
import { DashboardKnowledgeGaps } from './pages/dashboard/DashboardKnowledgeGaps';
import { DashboardMyContributions } from './pages/dashboard/DashboardMyContributions';
import { DashboardSavedResources } from './pages/dashboard/DashboardSavedResources';
import { DashboardProfile } from './pages/dashboard/DashboardProfile';
import { LessonPlayer } from './pages/dashboard/LessonPlayer';
import { AdminDashboard } from './pages/admin/AdminDashboard';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Website Pages with Navbar and Footer */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/cultures" element={<ExploreCultures />} />
            <Route path="/cultures/:cultureSlug" element={<CultureDetail />} />
            <Route path="/library" element={<Library />} />
            <Route path="/library/:resourceId" element={<ResourceDetail />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/courses/:courseId" element={<CourseDetail />} />
            <Route path="/contributors" element={<Contributors />} />
            <Route path="/contributors/:contributorId" element={<ContributorDetail />} />
            <Route path="/contribute" element={<Contribute />} />
            <Route path="/how-it-works" element={<HowItWorks />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
          </Route>

          {/* Culture-Specific Dashboards (One Shared Dashboard System) */}
          <Route path="/dashboard" element={<Navigate to="/dashboard/yoruba" replace />} />
          <Route path="/dashboard/:cultureId" element={<DashboardLayout />}>
            <Route index element={<DashboardOverview />} />
            <Route path="ask-roots" element={<DashboardAskRoots />} />
            <Route path="library" element={<Library />} />
            <Route path="category/:categorySlug" element={<DashboardCategoryView />} />
            <Route path="courses" element={<Courses />} />
            <Route path="my-learning" element={<Courses />} />
            <Route path="course/:courseId/lesson/:lessonId" element={<LessonPlayer />} />
            <Route path="saved" element={<DashboardSavedResources />} />
            <Route path="contribute" element={<Contribute />} />
            <Route path="my-contributions" element={<DashboardMyContributions />} />
            <Route path="knowledge-gaps" element={<DashboardKnowledgeGaps />} />
            <Route path="profile" element={<DashboardProfile />} />
          </Route>

          {/* Admin Dashboard */}
          <Route path="/admin" element={<AdminDashboard />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
