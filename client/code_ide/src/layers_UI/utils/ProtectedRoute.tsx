import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './Context/AuthContext';

const ProtectedRoute = () => {
    const { user } = useAuth();

    if (!user) {
        // Redirect to login if not authenticated
        return <Navigate to="/login" replace />;
    }

    // Render children if authenticated
    return <Outlet />;
};

export default ProtectedRoute;
