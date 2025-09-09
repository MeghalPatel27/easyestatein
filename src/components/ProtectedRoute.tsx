import { ReactNode, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredUserType?: string;
  redirectTo?: string;
}

const ProtectedRoute = ({ 
  children, 
  requiredUserType, 
  redirectTo = '/auth' 
}: ProtectedRouteProps) => {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      navigate(redirectTo);
      return;
    }

    if (requiredUserType && profile?.user_type !== requiredUserType) {
      // Redirect to appropriate dashboard based on user type
      if (profile?.user_type === 'buyer') {
        navigate('/buyer/dashboard');
      } else if (profile?.user_type === 'broker') {
        navigate('/broker/dashboard');
      } else {
        navigate('/');
      }
      return;
    }
  }, [user, profile, loading, navigate, requiredUserType, redirectTo]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (requiredUserType && profile?.user_type !== requiredUserType) {
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;