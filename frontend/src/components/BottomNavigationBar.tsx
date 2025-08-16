import React from 'react';
import { NavLink } from 'react-router-dom';
import { HiOutlineHome, HiOutlineFolder, HiOutlineCog } from 'react-icons/hi';
import { BsClipboard2Check } from 'react-icons/bs'; // Example icon for Services

interface NavigationLink {
  to: string;
  icon: React.ElementType;
  label: string;
}

const navLinks: NavigationLink[] = [
  { to: '/citizen/dashboard', icon: HiOutlineHome, label: 'Home' },
  { to: '/citizen/services', icon: BsClipboard2Check, label: 'Services' }, // Update path and icon as needed
  { to: '/citizen/documents', icon: HiOutlineFolder, label: 'Documents' }, // Update path and icon as needed
  { to: '/citizen/settings', icon: HiOutlineCog, label: 'Settings' }, // Update path and icon as needed
];

const BottomNavigationBar: React.FC = () => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white shadow-lg md:hidden z-50">
      <div className="flex justify-around h-16">
        {navLinks.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center px-4 text-gray-600 transition-colors duration-200 ease-in-out ${
                isActive ? 'text-primary' : 'hover:text-primary'
              }`
            }
          >
            <Icon className="w-6 h-6 mb-1" />
            <span className="text-xs">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default BottomNavigationBar;