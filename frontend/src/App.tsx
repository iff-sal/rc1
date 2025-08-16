import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import SignupPage from './pages/auth/SignupPage';
import LoginPage from './pages/auth/LoginPage';
import HomePage from './pages/citizen/HomePage';
import OfficerDashboardPage from './pages/officer/OfficerDashboardPage';
import ServicesPage from './pages/citizen/ServicesPage';
import ServiceBookingPage from './pages/citizen/ServiceBookingPage';
import AppointmentConfirmationPage from './pages/citizen/AppointmentConfirmationPage';
import DocumentsPage from './pages/citizen/DocumentsPage';
import AppointmentDetailPage from './pages/officer/AppointmentDetailPage';
import AIAssistantPage from './pages/citizen/AIAssistantPage'; // Import AIAssistantPage


function AppRoutes() {
  const { user, token, loading } = useAuth();

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

      {/* Protected Routes - Citizen */}
      <Route
        path="/citizen/dashboard"
        element={
          <ProtectedRoute requiredRoles={['citizen']}>
            <HomePage />
          </ProtectedRoute>
        }
      />
       <Route
        path="/services"
        element={
          <ProtectedRoute requiredRoles={['citizen']}>
            <ServicesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/services/:serviceId"
        element={
          <ProtectedRoute requiredRoles={['citizen']}>
            <ServiceBookingPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/appointments/confirm"
        element={
          <ProtectedRoute requiredRoles={['citizen']}>
            <AppointmentConfirmationPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/documents"
        element={
          <ProtectedRoute requiredRoles={['citizen']}>
            <DocumentsPage />
          </ProtectedRoute>
        }
      />
      <Route // AI Assistant Page
         path="/ai-assistant"
         element={
            <ProtectedRoute requiredRoles={['citizen']}>
                <AIAssistantPage />
            </ProtectedRoute>
         }
      />

       {/* TODO: Add route for viewing individual citizen appointment details if needed */}
       {/* <Route
            path="/appointments/:id"
            element={
              <ProtectedRoute requiredRoles={['citizen']}>
                 <CitizenAppointmentDetailsPage /> // Create this page later
              </ProtectedRoute>
            }
         /> */}


        {/* Protected Routes - Officer/Admin */}
        <Route
            path="/officer/dashboard"
            element={
              <ProtectedRoute requiredRoles={['government_officer', 'admin']}>
                <OfficerDashboardPage />
              </ProtectedRoute>
            }
        />
        <Route
            path="/officer/appointments/:appointmentId"
            element={
              <ProtectedRoute requiredRoles={['government_officer', 'admin']}>
                 <AppointmentDetailPage />
              </ProtectedRoute>
            }
         />
         {/* TODO: Add routes for officer document review directly if needed */}
         {/* <Route
             path="/officer/documents/:documentId"
             element={
                 <ProtectedRoute requiredRoles={['government_officer', 'admin']}>
                     <OfficerDocumentReviewPage /> // If a separate page is needed
                 </ProtectedRoute>
             }
         /> */}


      {/* Default redirect */}
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
