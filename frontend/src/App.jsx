import './App.css'
import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import { lazy, Suspense, useEffect, useState } from "react";
import { ToastContainer } from "react-toastify";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { path } from 'framer-motion/client';
import PrivateRoute from './components/PrivateRoute';
import { AuthProvider } from './contexts/AuthContext';

const queryClient = new QueryClient();

const Home = lazy(() => import("./core/public/Home"));
const Login = lazy(() => import("./core/public/Login"));
const Register = lazy(() => import("./core/public/Register"));
const VerifyOtp = lazy(() => import("./core/public/VerifyOtp"));
const ForgotPassword = lazy(() => import("./core/public/ForgotPassword"));
const ResetPassword = lazy(() => import("./core/public/ResetPassword"));
const Dashboard = lazy(() => import("./core/public/Dashboard"));
const CourseDetail = lazy(() => import("./core/public/CourseDetail"));
const Universities = lazy(() => import("./core/public/Universities"));
const Courses = lazy(() => import("./core/public/Courses"));
const UniversityDetailDynamic = lazy(() => import("./core/public/UniversityDetailDynamic"));
const ProfileStepper = lazy(() => import("./core/private/ProfileStepper"));
const SOPWriter = lazy(() => import("./core/public/SOPWriter"));
const Applications = lazy(() => import("./core/private/Applications"));
const AboutUs = lazy(() => import("./core/public/AboutUs"));
const ContactUs = lazy(() => import("./core/public/ContactUs"));
const Help = lazy(() => import("./core/public/Help"));
const PageNotFound = lazy(() => import('./core/public/PageNotFound'));
const Unauthorized = lazy(() => import("./core/public/Unauthorized"));
const MyPlan = lazy(() => import("./core/private/MyPlan"));

// Admin Components
const AdminLayout = lazy(() => import("./core/admin/AdminLayout"));
const AdminDashboard = lazy(() => import("./core/admin/AdminDashboard"));
const AdminApplications = lazy(() => import("./core/admin/AdminApplications"));
const AdminUniversities = lazy(() => import("./core/admin/AdminUniversities"));
const AdminCourses = lazy(() => import("./core/admin/AdminCourses"));
const AdminScholarships = lazy(() => import("./core/admin/AdminScholarships"));
const AdminUsers = lazy(() => import("./core/admin/AdminUsers"));
const AdminLogs = lazy(() => import("./core/admin/AdminLogs"));
const SecuritySettings = lazy(() => import("./components/settings/SecuritySettings"));

function App() {
  const [count, setCount] = useState(0)

  // Public routes (no authentication required)
  const publicRoutes = [
    { path: "/login", element: <Suspense fallback={<div>Loading...</div>}><Login /></Suspense> },
    { path: "/register", element: <Suspense fallback={<div>Loading...</div>}><Register /></Suspense> },
    { path: "/verify-otp", element: <Suspense fallback={<div>Loading...</div>}><VerifyOtp /></Suspense> },
    { path: "/forgot-password", element: <Suspense fallback={<div>Loading...</div>}><ForgotPassword /></Suspense> },
    { path: "/reset-password", element: <Suspense fallback={<div>Loading...</div>}><ResetPassword /></Suspense> },
    { path: "/unauthorized", element: <Suspense fallback={<div>Loading...</div>}><Unauthorized /></Suspense> },
    { path: "/about", element: <Suspense fallback={<div>Loading...</div>}><AboutUs /></Suspense> },
    { path: "/contact", element: <Suspense fallback={<div>Loading...</div>}><ContactUs /></Suspense> },
    { path: "/help", element: <Suspense fallback={<div>Loading...</div>}><Help /></Suspense> },
    { path: "/programs", element: <Suspense fallback={<div>Loading...</div>}><Courses /></Suspense> },
    { path: "/", element: <Suspense fallback={<div>Loading...</div>}><Dashboard /></Suspense> },

  ];

  // Protected routes (authentication required)
  const protectedRoutes = [
    { path: "/profile", element: <Suspense fallback={<div>Loading...</div>}><ProfileStepper /></Suspense> },
    { path: "/my-plan", element: <Suspense fallback={<div>Loading...</div>}><MyPlan /></Suspense> },
    { path: "/my-applications", element: <Suspense fallback={<div>Loading...</div>}><Applications /></Suspense> },
    { path: "/sop-writer", element: <Suspense fallback={<div>Loading...</div>}><SOPWriter /></Suspense> },
    { path: "/settings/security", element: <Suspense fallback={<div>Loading...</div>}><SecuritySettings /></Suspense> },
  ];

  // Public university/course routes (no auth required)
  const universityRoutes = [
    { path: "/universities", element: <Suspense fallback={<div>Loading...</div>}><Universities /></Suspense> },
    { path: "/university/:id", element: <Suspense fallback={<div>Loading...</div>}><UniversityDetailDynamic /></Suspense> },
    { path: "/course/:id", element: <Suspense fallback={<div>Loading...</div>}><CourseDetail /></Suspense> },
  ];

  const adminRoutes = [
    {
      path: "/admin",
      element: (
        <PrivateRoute requiredRole="admin">
          <Suspense fallback={<div>Loading Admin...</div>}>
            <AdminLayout />
          </Suspense>
        </PrivateRoute>
      ),
      children: [
        { index: true, element: <Navigate to="dashboard" replace /> },
        { path: "dashboard", element: <AdminDashboard /> },
        { path: "users", element: <AdminUsers /> },
        { path: "applications", element: <AdminApplications /> },
        { path: "universities", element: <AdminUniversities /> },
        { path: "courses", element: <AdminCourses /> },
        { path: "scholarships", element: <AdminScholarships /> },
        { path: "logs", element: <AdminLogs /> },
        { path: "*", element: <Navigate to="dashboard" replace /> }
      ]
    }
  ];


  const router = createBrowserRouter([
    ...publicRoutes,
    ...universityRoutes,
    {
      element: <PrivateRoute />,
      children: protectedRoutes,
    },
    ...adminRoutes,
    { path: "*", element: <Suspense fallback={<div>Loading...</div>}><PageNotFound /></Suspense> },
  ]);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
          <RouterProvider router={router} />
        </Suspense>
        <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
