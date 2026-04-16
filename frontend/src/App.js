import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { AdminProvider } from './contexts/AdminContext';
import { DashboardProvider } from './contexts/DashboardContext';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import CoursesPage from './pages/CoursesPage';
import CourseDetailPage from './pages/CourseDetailPage';
import WebinarsPage from './pages/WebinarsPage';
import WebinarDetailPage from './pages/WebinarDetailPage';
import AuthPage from './pages/AuthPage';
import WelcomePage from './pages/WelcomePage';
import MyCoursesPage from './pages/MyCoursesPage';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminDashboard from './pages/AdminDashboard';
import AdminCoursesPage from './pages/AdminCoursesPage';
import AdminWebinarsPage from './pages/AdminWebinarsPage';
import AdminProgramsPage from './pages/AdminProgramsPage';
import AdminUsersPage from './pages/AdminUsersPage';
import AdminInterviewsPage from './pages/AdminInterviewsPage';
import AdminCertificationsPage from './pages/AdminCertificationsPage';
import DashboardPage from './pages/DashboardPage';
import ProgramsPage from './pages/ProgramsPage';
import InterviewsPage from './pages/InterviewsPage';
import UserProfilePage from './pages/UserProfilePage';
import ProtectedRoute from './components/ProtectedRoute';
import AdminProtectedRoute from './components/AdminProtectedRoute';

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
                <Route path="/auth" element={<><Header /><main><AuthPage /></main></>} />
                <Route path="/courses" element={<><Header /><main><CoursesPage /></main></>} />
                <Route path="/webinars" element={<><Header /><main><WebinarsPage /></main></>} />

                {/* ── Protected User Routes ── */}
                <Route path="/welcome" element={
                  <ProtectedRoute><WelcomePage /></ProtectedRoute>
                } />
                <Route path="/my-courses" element={
                  <ProtectedRoute>
                    <><Header /><main><MyCoursesPage /></main></>
                  </ProtectedRoute>
                } />
                <Route path="/courses/:id" element={
                  <ProtectedRoute>
                    <><Header /><main><CourseDetailPage /></main></>
                  </ProtectedRoute>
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
                <Route path="/programs" element={
                  <ProtectedRoute><ProgramsPage /></ProtectedRoute>
                } />
                <Route path="/interviews" element={
                  <ProtectedRoute><InterviewsPage /></ProtectedRoute>
                } />
                <Route path="/profile" element={
                  <ProtectedRoute><UserProfilePage /></ProtectedRoute>
                } />

                {/* ── Admin Routes ── */}
                <Route path="/admin/login" element={<AdminLoginPage />} />
                <Route path="/admin/dashboard" element={
                  <AdminProtectedRoute><AdminDashboard /></AdminProtectedRoute>
                } />
                <Route path="/admin/courses" element={
                  <AdminProtectedRoute><AdminCoursesPage /></AdminProtectedRoute>
                } />
                <Route path="/admin/courses/create" element={
                  <AdminProtectedRoute><AdminCoursesPage /></AdminProtectedRoute>
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
