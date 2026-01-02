import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Route Protection
import { ProtectedRoute, PublicRoute } from './components/ProtectedRoute';

// Layouts
import AdminLayout from './layouts/AdminLayout';
import CenterLayout from './layouts/CenterLayout';
import AuthLayout from './layouts/AuthLayout';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import TutorSignup from './pages/auth/TutorSignup';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import VerifyEmail from './pages/auth/VerifyEmail';
import VerificationPending from './pages/auth/VerificationPending';

// Public Pages (Student-facing)
import Home from './pages/public/Home';
import About from './pages/public/About';
import Contact from './pages/public/Contact';
import Privacy from './pages/public/Privacy';
import Terms from './pages/public/Terms';
import Courses from './pages/public/Courses';
import CourseDetail from './pages/public/CourseDetail';
import LearningCentersListing from './pages/public/LearningCentersListing';
import LearningCenterDetail from './pages/public/LearningCenterDetail';
import BecomePartner from './pages/public/BecomePartner';
import PackDetail from './pages/public/PackDetail';
import Tutors from './pages/public/Tutors';
import TutorDetail from './pages/public/TutorDetail';
import TuitionPacks from './pages/public/TuitionPacks';
import BecomeTutor from './pages/public/BecomeTutor';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import PartnersList from './pages/admin/PartnersList';
import CenterContractConfiguration from './pages/admin/CenterContractConfiguration';
import PartnerSettlementsOverview from './pages/admin/PartnerSettlementsOverview';
import CenterSettlementDetails from './pages/admin/CenterSettlementDetails';
import ProcessSettlement from './pages/admin/ProcessSettlement';
import StudentRegistration from './pages/admin/StudentRegistration';
import PackEnrollment from './pages/admin/PackEnrollment';
import PasswordResetCenter from './pages/admin/PasswordResetCenter';
import AnalyticsDashboard from './pages/admin/AnalyticsDashboard';
import UserManagement from './pages/admin/UserManagement';
import ApplicationsManagement from './pages/admin/ApplicationsManagement';
import SystemSettings from './pages/admin/SystemSettings';
import CourseList from './pages/admin/CourseList';
import CourseEditor from './pages/admin/CourseEditor';
import CurriculumBuilder from './pages/admin/CurriculumBuilder';
import PackManagement from './pages/admin/PackManagement';
import OrderManagement from './pages/admin/OrderManagement';
import CountryManagement from './pages/admin/CountryManagement';
import TutorManagement from './pages/admin/TutorManagement';
import TuitionPackManagement from './pages/admin/TuitionPackManagement';
import SubjectManagement from './pages/admin/SubjectManagement';
import AdminManagement from './pages/admin/AdminManagement';

// Tutor Pages
import TutorLayout from './layouts/TutorLayout';
import TutorRegistration from './pages/tutor/TutorRegistration';
import TutorPending from './pages/tutor/TutorPending';
import TutorDashboard from './pages/tutor/TutorDashboard';
import TutorProfileEdit from './pages/tutor/TutorProfileEdit';
import TutorAvailability from './pages/tutor/TutorAvailability';
import TutorSessions from './pages/tutor/TutorSessions';

// Center Pages
import CenterDashboard from './pages/center/CenterDashboard';
import RevenueDashboard from './pages/center/RevenueDashboard';
import StudentFeeTracker from './pages/center/StudentFeeTracker';
import SettlementHistory from './pages/center/SettlementHistory';
import TeacherProgressTracker from './pages/center/TeacherProgressTracker';

// Student Pages
import StudentLayout from './layouts/StudentLayout';
import StudentDashboard from './pages/student/StudentDashboard';
import MyLearning from './pages/student/MyLearning';
import MyPayments from './pages/student/MyPayments';
import MyCertificates from './pages/student/MyCertificates';
import StudentProfile from './pages/student/StudentProfile';
import MySessions from './pages/student/MySessions';

// Checkout Pages
import Cart from './pages/checkout/Cart';
import Checkout from './pages/checkout/Checkout';
import OrderConfirmation from './pages/checkout/OrderConfirmation';
import PaymentCallback from './pages/checkout/PaymentCallback';

// Session Pages (LiveKit Video)
import SessionRoom from './pages/session/SessionRoom';
import SessionRecording from './pages/session/SessionRecording';
import RecordingLayout from './pages/session/RecordingLayout';
import WhiteboardRecordView from './pages/session/WhiteboardRecordView';

// Role constants
const ROLES = {
  STUDENT: 'student',
  CENTER_ADMIN: 'center_admin',
  TABSERA_ADMIN: 'tabsera_admin',
  TUTOR: 'tutor',
};

function App() {
  return (
    <Routes>
      {/* ===================== */}
      {/* AUTH ROUTES */}
      {/* ===================== */}
      <Route element={<AuthLayout />}>
        <Route 
          path="/login" 
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } 
        />
        <Route 
          path="/register" 
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          } 
        />
        <Route 
          path="/forgot-password" 
          element={
            <PublicRoute>
              <ForgotPassword />
            </PublicRoute>
          } 
        />
        <Route
          path="/reset-password"
          element={
            <PublicRoute>
              <ResetPassword />
            </PublicRoute>
          }
        />
        <Route
          path="/verify-email"
          element={<VerifyEmail />}
        />
        <Route
          path="/verify-pending"
          element={
            <ProtectedRoute>
              <VerificationPending />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* ===================== */}
      {/* PUBLIC ROUTES */}
      {/* Student Course Catalog */}
      {/* ===================== */}
      <Route path="/" element={<Home />} />
      <Route path="/courses" element={<Courses />} />
      <Route path="/courses/:id" element={<CourseDetail />} />
      <Route path="/packs/:slug" element={<PackDetail />} />
      <Route path="/tutors" element={<Tutors />} />
      <Route path="/tutors/:id" element={<TutorDetail />} />
      <Route path="/tuition" element={<TuitionPacks />} />
      <Route path="/centers" element={<LearningCentersListing />} />
      <Route path="/centers/:id" element={<LearningCenterDetail />} />
      <Route path="/partner" element={<BecomePartner />} />
      <Route path="/become-tutor" element={<BecomeTutor />} />
      <Route path="/tutor/signup" element={<TutorSignup />} />
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/terms" element={<Terms />} />

      {/* ===================== */}
      {/* CHECKOUT ROUTES */}
      {/* ===================== */}
      <Route path="/cart" element={<Cart />} />
      <Route
        path="/checkout"
        element={
          <ProtectedRoute roles={[ROLES.STUDENT]}>
            <Checkout />
          </ProtectedRoute>
        }
      />
      <Route path="/order-confirmation/:orderId" element={<OrderConfirmation />} />

      {/* ===================== */}
      {/* PAYMENT CALLBACK ROUTES */}
      {/* WaafiPay HPP redirects */}
      {/* ===================== */}
      <Route path="/payment/callback" element={<PaymentCallback />} />
      <Route path="/payment/success" element={<PaymentCallback />} />
      <Route path="/payment/failure" element={<PaymentCallback />} />

      {/* ===================== */}
      {/* VIDEO SESSION ROUTES */}
      {/* LiveKit video rooms */}
      {/* ===================== */}
      <Route
        path="/session/:sessionId"
        element={
          <ProtectedRoute roles={[ROLES.STUDENT, ROLES.TUTOR]}>
            <SessionRoom />
          </ProtectedRoute>
        }
      />
      <Route
        path="/session/:sessionId/recording"
        element={
          <ProtectedRoute roles={[ROLES.STUDENT, ROLES.TUTOR, ROLES.TABSERA_ADMIN]}>
            <SessionRecording />
          </ProtectedRoute>
        }
      />

      {/* ===================== */}
      {/* RECORDING LAYOUT ROUTES */}
      {/* Public - accessed by LiveKit Egress */}
      {/* ===================== */}
      <Route path="/recording-layout/:sessionId" element={<RecordingLayout />} />
      <Route path="/whiteboard-record/:sessionId" element={<WhiteboardRecordView />} />

      {/* ===================== */}
      {/* TUTOR ROUTES */}
      {/* ===================== */}
      <Route
        path="/tutor/register"
        element={
          <ProtectedRoute roles={[ROLES.STUDENT]}>
            <TutorRegistration />
          </ProtectedRoute>
        }
      />
      <Route
        path="/tutor/pending"
        element={
          <ProtectedRoute roles={[ROLES.TUTOR]}>
            <TutorPending />
          </ProtectedRoute>
        }
      />

      {/* ===================== */}
      {/* TUTOR PORTAL ROUTES */}
      {/* Protected: Approved Tutors only */}
      {/* ===================== */}
      <Route
        path="/tutor"
        element={
          <ProtectedRoute roles={[ROLES.TUTOR]}>
            <TutorLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<TutorDashboard />} />
        <Route path="profile" element={<TutorProfileEdit />} />
        <Route path="availability" element={<TutorAvailability />} />
        <Route path="sessions" element={<TutorSessions />} />
      </Route>

      {/* ===================== */}
      {/* ADMIN PORTAL ROUTES */}
      {/* Protected: TABSERA Admin only */}
      {/* ===================== */}
      <Route 
        path="/admin" 
        element={
          <ProtectedRoute roles={[ROLES.TABSERA_ADMIN]}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="analytics" element={<AnalyticsDashboard />} />
        <Route path="users" element={<UserManagement />} />
        <Route path="applications" element={<ApplicationsManagement />} />
        <Route path="settings" element={<SystemSettings />} />
        <Route path="courses" element={<CourseList />} />
        <Route path="courses/new" element={<CourseEditor />} />
        <Route path="courses/:id" element={<CourseEditor />} />
        <Route path="courses/:id/curriculum" element={<CurriculumBuilder />} />
        <Route path="packs" element={<PackManagement />} />
        <Route path="partners" element={<PartnersList />} />
        <Route path="partners/:id" element={<CenterContractConfiguration />} />
        <Route path="contracts/:id" element={<CenterContractConfiguration />} />
        <Route path="settlements" element={<PartnerSettlementsOverview />} />
        <Route path="settlements/:id" element={<CenterSettlementDetails />} />
        <Route path="settlements/process" element={<ProcessSettlement />} />
        <Route path="students" element={<StudentRegistration />} />
        <Route path="students/enroll" element={<PackEnrollment />} />
        <Route path="password-reset" element={<PasswordResetCenter />} />
        <Route path="orders" element={<OrderManagement />} />
        <Route path="countries" element={<CountryManagement />} />
        <Route path="tutors" element={<TutorManagement />} />
        <Route path="tuition-packs" element={<TuitionPackManagement />} />
        <Route path="subjects" element={<SubjectManagement />} />
        <Route path="admin-users" element={<AdminManagement />} />
      </Route>

      {/* ===================== */}
      {/* LEARNING CENTER PORTAL ROUTES */}
      {/* Protected: Center Admin only */}
      {/* ===================== */}
      <Route 
        path="/center" 
        element={
          <ProtectedRoute roles={[ROLES.CENTER_ADMIN]}>
            <CenterLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<CenterDashboard />} />
        <Route path="revenue" element={<RevenueDashboard />} />
        <Route path="fees" element={<StudentFeeTracker />} />
        <Route path="settlements" element={<SettlementHistory />} />
        <Route path="progress" element={<TeacherProgressTracker />} />
      </Route>

      {/* ===================== */}
      {/* STUDENT PORTAL ROUTES */}
      {/* Protected: Students only */}
      {/* ===================== */}
      <Route 
        path="/student" 
        element={
          <ProtectedRoute roles={[ROLES.STUDENT]}>
            <StudentLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<StudentDashboard />} />
        <Route path="my-learning" element={<MyLearning />} />
        <Route path="payments" element={<MyPayments />} />
        <Route path="certificates" element={<MyCertificates />} />
        <Route path="profile" element={<StudentProfile />} />
        <Route path="sessions" element={<MySessions />} />
      </Route>

      {/* ===================== */}
      {/* CATCH ALL - 404 */}
      {/* ===================== */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
