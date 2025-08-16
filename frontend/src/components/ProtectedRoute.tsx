import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext, AuthContextType } from '../contexts/AuthContext'; // Adjust the import path as needed
import { UserRole } from '../common/enums'; // Adjust the import path and ensure this enum exists

interface ProtectedRouteProps {
  requiredRoles?: UserRole[];
  children: React.ReactNode; // Add this line
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ requiredRoles }) => {
  const { user, token, isLoading } = useContext(AuthContext) as AuthContextType;

  // You might want a loading state check here if user/token loading is asynchronous
  if (isLoading) {
    return <div>Loading...</div>; // Or a spinner component
  }

  if (!token || !user) {
    // Redirect to login if no token or user
    return <Navigate to="/login" replace />;
  }

  if (requiredRoles && !requiredRoles.includes(user.role)) {
    // Redirect or show forbidden message if user's role is not allowed
    // For simplicity, redirecting to login or a generic unauthorized page
    console.warn(`User with role ${user.role} attempted to access a restricted route.`);
    // You might want to redirect to a specific unauthorized page instead
    return <Navigate to="/login" replace />;
  }

  // If authenticated and role matches (or no role required), render the child routes/elements
 return <>{children}</>;
};

export default ProtectedRoute;