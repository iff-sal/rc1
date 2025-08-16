import React from 'react';
import { FaBell, FaGlobe, FaUserCircle } from 'react-icons/fa'; // Import icons
import { useAuth } from '../contexts/AuthContext'; // Assuming useAuth hook is in contexts/AuthContext
import { UserRole } from '../../backend/src/common/enums'; // Assuming enums are accessible or redefine

// Redefine UserRole if not directly accessible
enum FrontendUserRole {
    Citizen = 'citizen',
    GovernmentOfficer = 'government_officer',
    Admin = 'admin',
}


const TopBar: React.FC = () => {
    const { user } = useAuth(); // Get user details from auth context

    // Function to get user's initial or placeholder image
    const getUserAvatar = () => {
        if (user?.first_name) {
            return user.first_name.charAt(0).toUpperCase();
        }
        if (user?.email) {
             return user.email.charAt(0).toUpperCase();
        }
        return <FaUserCircle />; // Default icon if no user or name
    };

    return (
        <div className="w-full bg-white shadow-md p-4 flex items-center justify-between">
            {/* Left side: Logo/App Name (Optional - add if needed) */}
            {/* <div className="text-xl font-bold text-gray-800">OneGovSL</div> */}

            {/* Centered: Maybe page title or just space */}
            <div className="flex-grow"></div>

            {/* Right side: Icons */}
            <div className="flex items-center space-x-4">
                 {/* Notification Bell Icon */}
                <div className="relative text-gray-700">
                    <FaBell className="text-xl cursor-pointer" />
                    {/* Simple static badge (or dynamic later) */}
                    <span className="absolute top-[-5px] right-[-5px] block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
                    {/* Optional: Tooltip or count could be added here */}
                </div>

                {/* Language/Globe Icon (Placeholder) */}
                 <div className="relative text-gray-700">
                     <FaGlobe className="text-xl cursor-pointer" />
                     {/* Optional: Dropdown for language selection */}
                 </div>


                {/* User Profile/Avatar Icon */}
                 <div className="relative">
                     <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-semibold text-sm cursor-pointer">
                         {getUserAvatar()}
                     </div>
                     {/* Optional: Dropdown for profile settings, logout etc. */}
                 </div>

            </div>
        </div>
    );
};

export default TopBar;
