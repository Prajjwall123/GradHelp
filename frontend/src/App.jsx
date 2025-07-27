import './App.css'
import { createBrowserRouter, RouterProvider } from "react-router-dom";
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
const PageNotFound = lazy(() => import("./core/public/PageNotFound"));
const Unauthorized = lazy(() => import("./core/public/Unauthorized"));

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
  ];

  // Protected routes (authentication required)
  const protectedRoutes = [
    { path: "/", element: <Suspense fallback={<div>Loading...</div>}><Dashboard /></Suspense> },
    { path: "/profile", element: <Suspense fallback={<div>Loading...</div>}><ProfileStepper /></Suspense> },
    { path: "/my-applications", element: <Suspense fallback={<div>Loading...</div>}><Applications /></Suspense> },
    { path: "/sop-writer", element: <Suspense fallback={<div>Loading...</div>}><SOPWriter /></Suspense> },
  ];

  // Public university/course routes (no auth required)
  const universityRoutes = [
    { path: "/universities", element: <Suspense fallback={<div>Loading...</div>}><Universities /></Suspense> },
    { path: "/university/:id", element: <Suspense fallback={<div>Loading...</div>}><UniversityDetailDynamic /></Suspense> },
    { path: "/course/:id", element: <Suspense fallback={<div>Loading...</div>}><CourseDetail /></Suspense> },
  ];

  // Create the router configuration
  const router = createBrowserRouter([
    // Public routes
    ...publicRoutes,

    // Public university/course routes
    ...universityRoutes,

    // Protected routes
    {
      element: <PrivateRoute />,
      children: protectedRoutes,
    },

    // 404 - Keep this last
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
