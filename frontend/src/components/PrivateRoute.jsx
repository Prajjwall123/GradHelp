import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { isAuthenticated } from '../utils/auth';

const PrivateRoute = ({ roles = [] }) => {
    const { user } = useAuth();
    const location = useLocation();
    const isAuth = isAuthenticated();

    // If not authenticated, redirect to login with return URL
    if (!isAuth) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Check if user has required role
    if (roles.length > 0 && !roles.includes(user?.role)) {
        return <Navigate to="/unauthorized" state={{ from: location }} replace />;
    }

    // If authenticated and has required role, render the child routes
    return <Outlet />;
};

export default PrivateRoute;
