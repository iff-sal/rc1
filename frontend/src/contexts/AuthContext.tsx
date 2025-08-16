import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import api from '../api/axios'; // Assuming your axios instance is exported as default from axios.js
import { AxiosError } from 'axios';

interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  national_id_number: string;
  role: 'citizen' | 'government_officer' | 'admin'; // Use the enum from backend if available in common types
  is_active: boolean;
  receives_email_notifications: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>; // Added type annotations
  signup: (userData: any) => Promise<void>; // Added type annotation (consider refining 'any')
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('jwtToken'));
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!token);

  useEffect(() => {
    if (token) {
      setIsAuthenticated(true);
      // Optionally fetch user data when token is present on load
      // api.get('/users/me').then(response => setUser(response.data)).catch(logout);
    } else {
      setIsAuthenticated(false);
      setUser(null);
    }
  }, [token]);

  const login = async (email: string, password: string) => { // Added type annotations
    try {
      const response = await api.post('/auth/login', { email, password });
      const { access_token, user: userData } = response.data; // Assuming backend returns { access_token, user }
      localStorage.setItem('jwtToken', access_token);
      setToken(access_token);
      setUser(userData);
    } catch (error) {
      console.error('Login failed:', error);
      if (error instanceof AxiosError && error.response?.status === 401) {
        alert('Invalid email or password');
      } else {
        alert('Login failed. Please try again.');
      }
      throw error; // Re-throw to allow handling in component
    }
  };

  const signup = async (userData: any) => { // Added type annotation (consider refining 'any')
    try {
      // Ensure the DTO matches backend requirements (e.g., includes confirm_password if needed)
      await api.post('/auth/signup', userData);
      // Do not automatically log in after signup, user should go to login page
      alert('Signup successful! Please login.');
    } catch (error) {
      console.error('Signup failed:', error);
      if (error instanceof AxiosError && error.response?.data?.message) {
         alert(`Signup failed: ${Array.isArray(error.response.data.message) ? error.response.data.message.join(', ') : error.response.data.message}`);
      } else {
        alert('Signup failed. Please try again.');
      }
      throw error; // Re-throw to allow handling in component
    }
  };

  const logout = () => {
    localStorage.removeItem('jwtToken');
    setToken(null);
    setUser(null);
    // Optionally redirect to login page here
  };

  // Attach token to subsequent requests
  useEffect(() => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete api.defaults.headers.common['Authorization'];
    }
  }, [token]);


  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export { AuthContext, AuthContextType }; // Export AuthContext and AuthContextType