import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import SignupPage from './pages/auth/SignupPage';
import LoginPage from './pages/auth/LoginPage';
import HomePage from './pages/citizen/HomePage';
import OfficerDashboardPage from './pages/officer/OfficerDashboardPage';

function AppRoutes() {
  const { user, token } = useAuth();

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

      {/* Default redirect */}
      <Route path="/" element={<Navigate to={defaultRedirect} replace />} />

      {/* Fallback for unknown routes (optional) */}
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