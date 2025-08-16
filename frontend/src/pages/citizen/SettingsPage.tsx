import React, { useState, useEffect } from 'react';
import TopBar from '../../components/TopBar';
import BottomNavigationBar from '../../components/BottomNavigationBar';
import { useNavigate } from 'react-router-dom';
import { FaChevronRight, FaMoon, FaSun } from 'react-icons/fa'; // Import icons
import { useAuth } from '../../contexts/AuthContext'; // Assuming AuthContext has user data
import api from '../../api/axios'; // Assuming axios instance

const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, fetchUser } = useAuth(); // Get user from AuthContext, and a method to refresh user data
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [receivesEmailNotifications, setReceivesEmailNotifications] = useState(user?.receives_email_notifications ?? true); // Default to true

  // --- Dark Mode Logic ---
  useEffect(() => {
    // Initialize dark mode state from localStorage or system preference
    const storedPreference = localStorage.getItem('darkMode');
    const systemPreference = window.matchMedia('(prefers-color-scheme: dark)').matches;

    const initialDarkMode = storedPreference ? storedPreference === 'true' : systemPreference;
    setIsDarkMode(initialDarkMode);

    // Apply initial class to html tag
    if (initialDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

  }, []); // Run only once on mount

  useEffect(() => {
      // Update localStorage and html class when isDarkMode state changes
      localStorage.setItem('darkMode', isDarkMode.toString());
      if (isDarkMode) {
          document.documentElement.classList.add('dark');
      } else {
          document.documentElement.classList.remove('dark');
      }
  }, [isDarkMode]);


  const handleDarkModeToggle = () => {
    setIsDarkMode(prevMode => !prevMode);
  };

  // --- Notifications Toggle Logic ---
   useEffect(() => {
       // Ensure local state matches user data from AuthContext
       if (user) {
           setReceivesEmailNotifications(user.receives_email_notifications ?? true);
       }
   }, [user]); // Update when user object in AuthContext changes


  const handleNotificationsToggle = async () => {
    if (!user) return; // Cannot update if no user is logged in

    const newNotificationStatus = !receivesEmailNotifications;
    setReceivesEmailNotifications(newNotificationStatus); // Optimistic update

    try {
      // Send update to backend
      await api.put(`/api/users/me`, {
          receives_email_notifications: newNotificationStatus,
          // Only send this field, backend should merge
      });
      // If update is successful, the AuthContext might need to be refreshed
      // or rely on a re-login/page refresh to get the updated user data.
      // For simplicity, we rely on the optimistic update. A more robust app
      // would refetch user data: await fetchUser();
       console.log(`Notifications preference updated to: ${newNotificationStatus}`);

    } catch (error) {
      console.error('Error updating notification preference:', error);
      // Revert the optimistic update on error
      setReceivesEmailNotifications(!newNotificationStatus);
      // TODO: Show error message to user
    }
  };


  return (
    <div className="flex flex-col min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <TopBar />
      <div className="flex-grow p-4 pb-20"> {/* Add padding-bottom */}
        <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-100">Settings</h1>

        {/* General Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-6 p-4">
           <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">General</h2>
           <div className="border-b border-gray-200 dark:border-gray-700 py-3 cursor-pointer" onClick={() => navigate('/profile/edit')}>
               <div className="flex items-center justify-between">
                   <span className="text-gray-700 dark:text-gray-300">Edit Profile</span>
                   <FaChevronRight className="text-gray-400" />
               </div>
           </div>
           <div className="py-3 cursor-pointer"> {/* Non-functional */}
                <div className="flex items-center justify-between">
                   <span className="text-gray-700 dark:text-gray-300">Language</span>
                   <FaChevronRight className="text-gray-400" />
               </div>
           </div>
        </div>

        {/* Appearance Section */}
         <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-6 p-4">
           <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">Appearance</h2>
           <div className="border-b border-gray-200 dark:border-gray-700 py-3 flex items-center justify-between">
               <span className="text-gray-700 dark:text-gray-300">Dark Mode</span>
               {/* Toggle Switch */}
               <label htmlFor="darkModeToggle" className="flex items-center cursor-pointer">
                   <div className="relative">
                       <input
                           type="checkbox"
                           id="darkModeToggle"
                           className="sr-only"
                           checked={isDarkMode}
                           onChange={handleDarkModeToggle}
                       />
                        <div className="block bg-gray-600 w-14 h-8 rounded-full"></div>
                         <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition ${isDarkMode ? 'translate-x-6' : ''}`}></div>
                   </div>
                    <div className="ml-3 text-gray-700 dark:text-gray-300 font-medium">
                        {isDarkMode ? <FaMoon /> : <FaSun />}
                   </div>
               </label>
           </div>
           <div className="py-3 cursor-pointer"> {/* Non-functional */}
                <div className="flex items-center justify-between">
                   <span className="text-gray-700 dark:text-gray-300">Adjust Font Size</span>
                   <FaChevronRight className="text-gray-400" />
               </div>
           </div>
        </div>


        {/* Notifications Section */}
         <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-6 p-4">
           <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">Notifications</h2>
           <div className="py-3 flex items-center justify-between">
               <span className="text-gray-700 dark:text-gray-300">Email Notifications</span> {/* Renamed from Push to Email as per backend field */}
               {/* Toggle Switch */}
               <label htmlFor="notificationsToggle" className="flex items-center cursor-pointer">
                   <div className="relative">
                       <input
                           type="checkbox"
                           id="notificationsToggle"
                           className="sr-only"
                           checked={receivesEmailNotifications}
                           onChange={handleNotificationsToggle}
                       />
                        <div className="block bg-gray-600 w-14 h-8 rounded-full"></div>
                         <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition ${receivesEmailNotifications ? 'translate-x-6' : ''}`}></div>
                   </div>
               </label>
           </div>
        </div>


        {/* Security Section */}
         <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-6 p-4">
           <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">Security</h2>
           <div className="py-3 cursor-pointer"> {/* Non-functional */}
                <div className="flex items-center justify-between">
                   <span className="text-gray-700 dark:text-gray-300">Add Passcode</span>
                   <FaChevronRight className="text-gray-400" />
               </div>
           </div>
        </div>

      </div>
      <BottomNavigationBar />
    </div>
  );
};

export default SettingsPage;

// Basic styles for the toggle switch - better to put this in your global CSS
// or use a component library. For hackathon, injecting might be simplest.
const toggleSwitchStyles = `
.dot {
  left: 4px;
  transition: transform 0.2s ease-in-out;
}
input:checked + .block {
  background-color: #3B82F6; /* Blue 500 */
}
input:checked + .block + .dot {
    transform: translateX(24px); /* Move dot 24px */
}
`;

if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.type = 'text/css';
  styleElement.innerHTML = toggleSwitchStyles;
  document.head.appendChild(styleElement);
}
