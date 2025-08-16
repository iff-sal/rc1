// frontend/src/components/ProtectedRoute.tsx
import React, { ReactNode, useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext, AuthContextType } from '../contexts/AuthContext';
import { UserRole } from '../types/common'; // Import UserRole

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles: UserRole[]; // Add allowedRoles property
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user, loading } = useContext(AuthContext) as AuthContextType;

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>; // Or a spinner
  }

  // If user is not logged in, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If user is logged in but role is not allowed, redirect to an unauthorized page or dashboard
  if (!allowedRoles.includes(user.role)) {
    // Determine redirect based on user role if not allowed
    const redirectPath = user.role === UserRole.Citizen ? '/citizen/dashboard' : '/officer/dashboard';
    return <Navigate to={redirectPath} replace />;
  }

  // If user is logged in and role is allowed, render the children
  return <>{children}</>;
};

export default ProtectedRoute;
