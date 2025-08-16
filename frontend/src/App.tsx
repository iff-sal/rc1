import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import SignupPage from './pages/auth/SignupPage';
import LoginPage from './pages/auth/LoginPage';
import HomePage from './pages/citizen/HomePage';
import OfficerDashboardPage from './pages/officer/OfficerDashboardPage';
import ServicesPage from './pages/citizen/ServicesPage'; // Import ServicesPage
import ServiceBookingPage from './pages/citizen/ServiceBookingPage'; // Import ServiceBookingPage
import AppointmentConfirmationPage from './pages/citizen/AppointmentConfirmationPage'; // Import AppointmentConfirmationPage


function AppRoutes() {
  const { user, token, loading } = useAuth(); // Use loading state from AuthContext

   // Show a loading indicator while authentication status is being determined
  if (loading) {
      return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  // Determine initial redirect based on auth status and role
  const defaultRedirect = user ? (user.role === 'citizen' ? '/citizen/dashboard' : '/officer/dashboard') : '/login';

  return (
    <Routes>
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/login" element={<LoginPage />} />

      {/* Protected Routes */}
      <Route
        path="/citizen/dashboard"
        element={
          <ProtectedRoute requiredRoles={['citizen']}>
            <HomePage />
          </ProtectedRoute>
        }
      />
       <Route
        path="/officer/dashboard"
        element={
          <ProtectedRoute requiredRoles={['government_officer', 'admin']}> {/* Assuming admin can also access officer dashboard */}
            <OfficerDashboardPage />
          </ProtectedRoute>
        }
      />
       <Route // Services Browse Page
        path="/services"
        element={
          <ProtectedRoute requiredRoles={['citizen']}>
            <ServicesPage />
          </ProtectedRoute>
        }
      />
      <Route // Service Booking Page
        path="/services/:serviceId"
        element={
          <ProtectedRoute requiredRoles={['citizen']}>
            <ServiceBookingPage />
          </ProtectedRoute>
        }
      />
      <Route // Appointment Confirmation Page
        path="/appointments/confirm"
        element={
          <ProtectedRoute requiredRoles={['citizen']}> {/* Only citizen confirms their appointment */}
            <AppointmentConfirmationPage />
          </ProtectedRoute>
        }
      />


      {/* Default redirect */}
      {/* Redirect based on auth state. If loading is false and user is null, redirect to login.
          If loading is false and user exists, redirect based on role. */}
      <Route path="/" element={<Navigate to={defaultRedirect} replace />} />

      {/* Fallback for unknown routes */}
      <Route path="*" element={<Navigate to={defaultRedirect} replace />} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;
