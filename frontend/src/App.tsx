import React from 'react'; // Import React
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext, AuthContextType } from './contexts/AuthContext'; // Import AuthContext and AuthContextType
import ProtectedRoute from './components/ProtectedRoute';
import SignupPage from './pages/auth/SignupPage';
import LoginPage from './pages/auth/LoginPage';
import HomePage from './pages/citizen/HomePage';
// import OfficerDashboardPage from './pages/officer/OfficerDashboardPage';
import ServicesPage from './pages/citizen/ServicesPage'; // Corrected import path and capitalization
import ServiceBookingPage from './pages/citizen/ServiceBookingPage';
import AppointmentConfirmationPage from './pages/citizen/AppointmentConfirmationPage';
import DocumentsPage from './pages/citizen/DocumentsPage';
// import AppointmentDetailPage from './pages/officer/AppointmentDetailPage';
import AIAssistantPage from './pages/citizen/AIAssistantPage';
import AnalyticsPage from './pages/officer/AnalyticsPage';
import SettingsPage from './pages/citizen/SettingsPage'; // Import SettingsPage
import ProfileEditPage from './pages/citizen/ProfileEditPage'; // Import ProfileEditPage
import { UserRole } from './types/common'; // Import UserRole from frontend types

function AppRoutes() {
  const { user, loading } = React.useContext(AuthContext) as AuthContextType; // Get user and loading from context

   // Show a loading indicator while authentication status is being determined
  if (loading) {
      return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  // Determine initial redirect based on auth status and role
  const defaultRedirect = user ? (user.role === UserRole.Citizen ? '/citizen/dashboard' : '/officer/dashboard') : '/login'; // Use UserRole enum

  return (
    <Routes>
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/login" element={<LoginPage />} />

      {/* Protected Routes - Citizen */}
      <Route
        path="/citizen/dashboard" // Corrected path
        element={
          <ProtectedRoute allowedRoles={[UserRole.Citizen]}> {/* Use allowedRoles */}
            <HomePage />
          </ProtectedRoute>
        }
      />
       <Route
        path="/citizen/services" // Corrected path
        element={
          <ProtectedRoute allowedRoles={[UserRole.Citizen]}>
            <ServicesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/citizen/services/:serviceId/book" // Corrected path
        element={
          <ProtectedRoute allowedRoles={[UserRole.Citizen]}>
            <ServiceBookingPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/citizen/appointment/confirm" // Corrected path
        element={
          <ProtectedRoute allowedRoles={[UserRole.Citizen]}>
            <AppointmentConfirmationPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/citizen/documents" // Corrected path
        element={
          <ProtectedRoute allowedRoles={[UserRole.Citizen]}>
            <DocumentsPage />
          </ProtectedRoute>
        }
      />
      <Route // AI Assistant Page
         path="/citizen/ai-assistant" // Corrected path
         element={
            <ProtectedRoute allowedRoles={[UserRole.Citizen]}>
                <AIAssistantPage />
            </ProtectedRoute>
         }
      />
       <Route // Settings Page
         path="/settings"
         element={
            <ProtectedRoute allowedRoles={[UserRole.Citizen]}>
                <SettingsPage />
            </ProtectedRoute>
         }
      />
       <Route // Profile Edit Page
         path="/profile/edit"
         element={
            <ProtectedRoute allowedRoles={[UserRole.Citizen]}>
                <ProfileEditPage />
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
        {/* <Route
            path="/officer/dashboard"
            element={
              <ProtectedRoute allowedRoles={[UserRole.GovernmentOfficer, UserRole.Admin]}>
                <OfficerDashboardPage />
              </ProtectedRoute>
            }
        />
        <Route
            path="/officer/appointments/:appointmentId"
            element={ // Use appointmentId param name consistently
              <ProtectedRoute allowedRoles={[UserRole.GovernmentOfficer, UserRole.Admin]}>
                 <AppointmentDetailPage />
              </ProtectedRoute>
            }
         /> */}
         <Route // Analytics Page
             path="/officer/analytics" // Corrected path
             element={
              <ProtectedRoute allowedRoles={[UserRole.GovernmentOfficer, UserRole.Admin]}>
                      <AnalyticsPage />
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
       {/* Add a redirect for citizen appointments */}
       <Route path="/citizens/me/appointments" element={<Navigate to="/citizen/dashboard" replace />} /> {/* Redirect to citizen dashboard */}
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
