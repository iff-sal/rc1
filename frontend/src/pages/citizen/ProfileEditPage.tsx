import React, { useState, useEffect } from 'react';
import TopBar from '../../components/TopBar';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaSpinner } from 'react-icons/fa'; // Import icons
import { useAuth } from '../../contexts/AuthContext'; // Assuming AuthContext has user data and fetchUser method
import api from '../../api/axios'; // Assuming axios instance
import { UpdateUserDto } from '../../../backend/src/users/dto/user.dto'; // Assuming DTO is accessible or redefine


// Redefine DTO if not accessible
interface FrontendUpdateUserDto {
    first_name?: string;
    last_name?: string;
    phone_number?: string;
}


const ProfileEditPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, fetchUser } = useAuth(); // Get user data and a method to refresh it
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Load user data into form fields on mount
  useEffect(() => {
    if (user) {
        setFirstName(user.first_name || '');
        setLastName(user.last_name || '');
        setPhoneNumber(user.phone_number || '');
        setLoading(false);
    } else {
        // If user is null, maybe redirect to login or show an error
        setLoading(false);
        setError('User data not available.');
    }
  }, [user]);


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
      // Refresh user data in AuthContext
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


   if (loading) {
       return (
           <div className="flex flex-col min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
               <TopBar />
               <div className="flex-grow p-4 text-center text-gray-600 dark:text-gray-300">Loading profile data...</div>
           </div>
       );
   }

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      {/* Top Bar with Back Button */}
      <div className="bg-white dark:bg-gray-800 shadow-md p-4 flex items-center">
        <button onClick={() => navigate(-1)} className="mr-4 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
          <FaArrowLeft className="text-xl" />
        </button>
        <h1 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Edit Profile</h1>
      </div>

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
