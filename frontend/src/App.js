import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { AdminProvider } from './contexts/AdminContext';
import { DashboardProvider } from './contexts/DashboardContext';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import AboutUsPage from './pages/AboutUsPage';
import WebinarsPage from './pages/WebinarsPage';
import WebinarDetailPage from './pages/WebinarDetailPage';
import AuthPage from './pages/AuthPage';
import WelcomePage from './pages/WelcomePage';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminDashboard from './pages/AdminDashboard';
import AdminWebinarsPage from './pages/AdminWebinarsPage';
import AdminProgramsPage from './pages/AdminProgramsPage';
import AdminUsersPage from './pages/AdminUsersPage';
import AdminInterviewsPage from './pages/AdminInterviewsPage';
import AdminCertificationsPage from './pages/AdminCertificationsPage';
import DashboardPage from './pages/DashboardPage';
import ProgramsPage from './pages/ProgramsPage';
import CoursesPage from './pages/CoursesPage';
import InterviewsPage from './pages/InterviewsPage';
import UserProfilePage from './pages/UserProfilePage';
import EnrollVerifyPhonePage from './pages/EnrollVerifyPhonePage';
import EnrollPaymentPage from './pages/EnrollPaymentPage';
import CourseContentPage from './pages/CourseContentPage';
import CertificationLibraryPage from './pages/CertificationLibraryPage';
import CertificationProgramPage from './pages/CertificationProgramPage';
import CertificationWorkspacePage from './pages/CertificationWorkspacePage';
import CertificateVerificationPage from './pages/CertificateVerificationPage';
import TermsOfServicePage from './pages/TermsOfServicePage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import ProtectedRoute from './components/ProtectedRoute';
import AdminProtectedRoute from './components/AdminProtectedRoute';
import { useAuth } from './contexts/AuthContext';

function ProgramsRoute() {
  const { currentUser } = useAuth();

  if (currentUser) {
    return (
      <ProtectedRoute>
        <ProgramsPage />
      </ProtectedRoute>
    );
  }

  return (
    <>
      <Header />
      <main><CoursesPage /></main>
      <Footer />
    </>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AdminProvider>
          <DashboardProvider>
            <div className="App">
              <Routes>
                {/* ── Public Routes ── */}
                <Route path="/" element={<><Header /><main><HomePage /></main><Footer /></>} />
                <Route path="/about-us" element={<><Header /><main><AboutUsPage /></main><Footer /></>} />
                <Route path="/terms-of-service" element={<><Header /><main><TermsOfServicePage /></main><Footer /></>} />
                <Route path="/privacy-policy" element={<><Header /><main><PrivacyPolicyPage /></main><Footer /></>} />
                <Route path="/auth" element={<><Header /><main><AuthPage /></main></>} />
                <Route path="/courses" element={<Navigate to="/programs" replace />} />
                <Route path="/webinars" element={<><Header /><main><WebinarsPage /></main></>} />
                <Route path="/verify-certificate" element={<><Header /><main><CertificateVerificationPage /></main><Footer /></>} />

                {/* ── Protected User Routes ── */}
                <Route path="/welcome" element={
                  <ProtectedRoute><WelcomePage /></ProtectedRoute>
                } />
                <Route path="/my-courses" element={
                  <Navigate to="/dashboard" replace />
                } />
                <Route path="/courses/:id" element={
                  <Navigate to="/programs" replace />
                } />
                <Route path="/webinars/:id" element={
                  <ProtectedRoute>
                    <><Header /><main><WebinarDetailPage /></main><Footer /></>
                  </ProtectedRoute>
                } />

                {/* ── Dashboard Platform Routes ── */}
                <Route path="/dashboard" element={
                  <ProtectedRoute><DashboardPage /></ProtectedRoute>
                } />
                <Route path="/programs" element={<ProgramsRoute />} />
                <Route path="/programs/:programId/learn" element={
                  <ProtectedRoute><CourseContentPage /></ProtectedRoute>
                } />
                <Route path="/programs/:programId/learn/:lessonId" element={
                  <ProtectedRoute><CourseContentPage /></ProtectedRoute>
                } />
                <Route path="/interviews" element={
                  <ProtectedRoute><InterviewsPage /></ProtectedRoute>
                } />
                <Route path="/certification" element={
                  <ProtectedRoute><CertificationLibraryPage /></ProtectedRoute>
                } />
                <Route path="/certification/program/:identifier" element={
                  <ProtectedRoute><CertificationProgramPage /></ProtectedRoute>
                } />
                <Route path="/certification/workspace/:enrollmentId" element={
                  <ProtectedRoute><CertificationWorkspacePage /></ProtectedRoute>
                } />
                <Route path="/profile" element={
                  <ProtectedRoute><UserProfilePage /></ProtectedRoute>
                } />

                {/* ── Enrollment Flow Routes ── */}
                <Route path="/enroll/:programId/phone" element={<EnrollVerifyPhonePage />} />
                <Route path="/enroll/:programId/payment" element={<EnrollPaymentPage />} />

                {/* ── Admin Routes ── */}
                <Route path="/admin/login" element={<AdminLoginPage />} />
                <Route path="/admin/dashboard" element={
                  <AdminProtectedRoute><AdminDashboard /></AdminProtectedRoute>
                } />
                <Route path="/admin/courses" element={
                  <Navigate to="/admin/programs" replace />
                } />
                <Route path="/admin/courses/create" element={
                  <Navigate to="/admin/programs" replace />
                } />
                <Route path="/admin/webinars" element={
                  <AdminProtectedRoute><AdminWebinarsPage /></AdminProtectedRoute>
                } />
                <Route path="/admin/webinars/create" element={
                  <AdminProtectedRoute><AdminWebinarsPage /></AdminProtectedRoute>
                } />
                <Route path="/admin/programs" element={
                  <AdminProtectedRoute><AdminProgramsPage /></AdminProtectedRoute>
                } />
                <Route path="/admin/users" element={
                  <AdminProtectedRoute><AdminUsersPage /></AdminProtectedRoute>
                } />
                <Route path="/admin/interviews" element={
                  <AdminProtectedRoute><AdminInterviewsPage /></AdminProtectedRoute>
                } />
                <Route path="/admin/certifications" element={
                  <AdminProtectedRoute><AdminCertificationsPage /></AdminProtectedRoute>
                } />
              </Routes>
            </div>
          </DashboardProvider>
        </AdminProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
