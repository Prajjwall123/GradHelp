import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { isAuthenticated } from '../utils/authHelper';

const PrivateRoute = ({ children, requiredRole }) => {
    const { currentUser } = useAuth();
    const location = useLocation();
    const isAuth = isAuthenticated();

    if (!isAuth) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (requiredRole && currentUser?.role !== requiredRole) {
        return <Navigate to="/unauthorized" state={{ from: location }} replace />;
    }

    return children || <Outlet />;

};

export default PrivateRoute;
