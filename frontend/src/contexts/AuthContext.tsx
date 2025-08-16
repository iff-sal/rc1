// frontend/src/contexts/AuthContext.tsx
import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../api/axios'; // Import the axios instance for fetchUser
import { UserRole } from '../types/common'; // Import UserRole

// Define the User interface and EXPORT IT
export interface User {
  id: number;
  username: string; // Consider if username is still relevant or just email/id
  role: UserRole; // Use the imported UserRole enum
  first_name?: string;
  last_name?: string; // Add last_name property
  phone_number?: string; // Add phone_number property
  email?: string;
  receives_email_notifications?: boolean; // Add receives_email_notifications
  // Add other user properties as needed
}

// Define the AuthContextType
export interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (userData: User) => void;
  logout: () => void;
  fetchUser: () => Promise<void>; // Add fetchUser method
}

// Create the AuthContext
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Create the AuthProvider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

   // Implement fetchUser method
   const fetchUser = async () => {
       setLoading(true); // Set loading while fetching
       try {
           const token = localStorage.getItem('token');
           if (token) {
               // Make an API call to fetch the current user's data
               // Assuming this endpoint exists and returns the User object matching the interface
               const response = await api.get<User>('/api/users/me');
               setUser(response.data);
               localStorage.setItem('user', JSON.stringify(response.data)); // Update stored user data
           } else {
               // No token, clear user state and storage
               setUser(null);
               localStorage.removeItem('user');
           }
       } catch (error) {
           console.error('Error fetching user data:', error);
           // Clear user and tokens/data on error to ensure a clean state
           setUser(null);
           localStorage.removeItem('user');
           localStorage.removeItem('token');
           // Optionally redirect to login if fetch fails on a protected route
       } finally {
           setLoading(false); // Set loading to false after fetch attempt
       }
   };

  useEffect(() => {
    // Function to check if user is authenticated and fetch user data on initial load
    const checkAuthAndFetchUser = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
           // If token exists, try to fetch user data to validate the token and get latest user info
           await fetchUser();
        } else {
           // No token, set user to null and stop loading
           setUser(null);
           setLoading(false);
           localStorage.removeItem('user'); // Ensure no stale user data
        }
      } catch (error) {
        // This catch block might be redundant if fetchUser handles errors internally,
        // but kept for robustness during initial load.
        console.error('Error during initial auth check or fetch:', error);
         setUser(null);
         setLoading(false);
         localStorage.removeItem('token');
         localStorage.removeItem('user');
      }
    };

    checkAuthAndFetchUser();
  }, []); // Empty dependency array means this runs once on mount

  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData)); // Store user data (be cautious with sensitive info)
     // Token should ideally be set by the login API call success handler, not here.
     // The login call in LoginPage.tsx already handles setting the token.
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user'); // Remove user data
    localStorage.removeItem('token'); // Remove token on logout
    // Optionally redirect to login page
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, fetchUser }}> {/* Provide fetchUser */}
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
