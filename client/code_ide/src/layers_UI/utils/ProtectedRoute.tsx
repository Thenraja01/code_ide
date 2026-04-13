import { useMeQuery } from '@/hooks/useAuth.hooks';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
  const { data: user } = useMeQuery();

    if (!user) {
        // Redirect to login if not authenticated
        return <Navigate to="/login" replace />;
    }

    // Render children if authenticated
    return <Outlet />;
};

export default ProtectedRoute;
