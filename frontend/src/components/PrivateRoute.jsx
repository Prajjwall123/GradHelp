import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { isAuthenticated } from '../utils/authHelper';

const PrivateRoute = ({ children, requiredRole }) => {
    const { currentUser } = useAuth();
    const location = useLocation();
    const isAuth = isAuthenticated();

    // If not authenticated, redirect to login with return URL
    if (!isAuth) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Check if user has required role when requiredRole is specified
    if (requiredRole && currentUser?.role !== requiredRole) {
        return <Navigate to="/unauthorized" state={{ from: location }} replace />;
    }

    // If authenticated and has required role (or no role required), render the children or outlet
    return children || <Outlet />;

};

export default PrivateRoute;
