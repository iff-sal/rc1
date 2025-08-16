import React, { useState, useEffect } from 'react';
import TopBar from '../../components/TopBar';
import { useNavigate } from 'react-router-dom';
import { FaSpinner } from 'react-icons/fa'; // Import icons (removed FaArrowLeft)
import { useAuth } from '../../contexts/AuthContext'; // Assuming AuthContext has user data and fetchUser method
import api from '../../api/axios'; // Assuming axios instance
// Removed the backend DTO import as interface is redefined below


// Redefine DTO if not accessible
interface FrontendUpdateUserDto {
    first_name?: string;
    last_name?: string;
    phone_number?: string;
}


const ProfileEditPage: React.FC = () => {
  const navigate = useNavigate();
  // Now fetchUser exists on AuthContextType
  const { user, loading: authLoading, fetchUser } = useAuth(); // Get user data and a method to refresh it from the updated AuthContext

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  // Removed unused local loading state: const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false); // State for save operation
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Load user data into form fields on mount or when user data from context changes
  useEffect(() => {
    // Use authLoading from context to determine if user data is still being fetched initially
    if (!authLoading) {
        if (user) {
            // last_name and phone_number now exist on User type
            setFirstName(user.first_name || '');
            setLastName(user.last_name || '');
            setPhoneNumber(user.phone_number || '');
            // Removed setLoading(false);
        } else {
            // If user is null after authLoading is false, user is not logged in
            // Removed setLoading(false);
            // Optionally redirect to login or show an error
             setError('User data not available. Please log in.');
             // navigate('/login'); // Consider redirecting if this page requires authentication
        }
    }
  }, [user, authLoading, navigate]); // Add navigate to dependency array as per react-hooks/exhaustive-deps rule


  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!user || saving) return;

    setSaving(true);
    setError(null);
    setSuccess(null);

    const updatePayload: FrontendUpdateUserDto = {
        first_name: firstName,
        last_name: lastName,
        phone_number: phoneNumber,
    };

     // Optional: Only send fields that have actually changed
     // const changedPayload: FrontendUpdateUserDto = {};
     // if (firstName !== user.first_name) changedPayload.first_name = firstName;
     // if (lastName !== user.last_name) changedPayload.last_name = lastName;
     // if (phoneNumber !== user.phone_number) changedPayload.phone_number = phoneNumber;
     // Use changedPayload if you want to send minimal data


    try {
      // Send update to backend
      await api.put(`/api/users/me`, updatePayload);

      setSuccess('Profile updated successfully!');
      // Refresh user data in AuthContext using the new fetchUser method
      await fetchUser(); // This is important to keep the user object in sync

       // Optional: Redirect back to settings after a delay
       setTimeout(() => {
           navigate('/settings');
       }, 1500);


    } catch (err: any) {
      console.error('Error saving profile:', err);
       const errorMessage = err.response?.data?.message || 'Failed to save profile. Please try again.';
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };


   // Use authLoading from context for the initial loading state
   if (authLoading) {
       return (
           <div className="flex flex-col min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
               {/* TopBar might need user data, so render it after authLoading */}
               { !authLoading && <TopBar />}
               <div className="flex-grow p-4 text-center text-gray-600 dark:text-gray-300">Loading profile data...</div>
           </div>
       );
   }

    // If not authLoading but user is null, maybe show an error or redirect
   if (!user) {
        return (
           <div className="flex flex-col min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
               <TopBar />
               <div className="flex-grow p-4 text-center text-red-600 dark:text-red-300">{error || 'User data not available. Please log in.'}</div>
           </div>
       );
   }


  return (
    <div className="flex flex-col min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      {/* Top Bar with Back Button */}
      {/* Render TopBar only when auth is not loading */}
      { !authLoading && <TopBar />}

      <div className="flex-grow p-4 pb-4">

        {error && <div className="text-red-500 mb-4">{error}</div>}
        {success && <div className="text-green-500 mb-4">{success}</div>}


        <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-6 p-6">
           <form onSubmit={handleSave}>
                <div className="mb-4">
                    <label htmlFor="firstName" className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">First Name:</label>
                    <input
                       type="text"
                       id="firstName"
                       value={firstName}
                       onChange={(e) => setFirstName(e.target.value)}
                       className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
                       required
                    />
                </div>
                 <div className="mb-4">
                    <label htmlFor="lastName" className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">Last Name:</label>
                    <input
                       type="text"
                       id="lastName"
                       value={lastName}
                       onChange={(e) => setLastName(e.target.value)}
                       className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
                       required
                    />
                </div>
                 <div className="mb-4">
                    <label htmlFor="phoneNumber" className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">Phone Number:</label>
                    <input
                       type="text" // Use 'tel' or 'text' depending on desired input type
                       id="phoneNumber"
                       value={phoneNumber}
                       onChange={(e) => setPhoneNumber(e.target.value)}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
                       required
                    />
                </div>

                 <div className="flex items-center justify-between">
                    <button
                       type="submit"
                        disabled={saving}
                       className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
                   >
                       {saving ? <FaSpinner className="animate-spin inline mr-2" /> : ''} Save Changes
                   </button>
                    <button
                       type="button"
                       onClick={() => navigate(-1)}
                       className="inline-block align-baseline font-bold text-sm text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                       disabled={saving}
                    >
                       Cancel
                   </button>
               </div>
           </form>
        </div>

      </div>
       {/* No bottom nav on edit pages */}
       {/* <BottomNavigationBar /> */}
    </div>
  );
};

export default ProfileEditPage;
