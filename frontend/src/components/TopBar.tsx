import React from 'react';
import { IoMdNotificationsOutline } from 'react-icons/io';
import { IoLanguageOutline } from 'react-icons/io5';
import { FaRegUserCircle } from 'react-icons/fa';

const TopBar: React.FC = () => {
  return (
    <header className="w-full bg-white shadow-md p-4 flex justify-between items-center fixed top-0 left-0 right-0 z-10">
      <div className="text-lg font-bold text-gray-800">OneGovSL</div>
      <div className="flex items-center space-x-4">
        <button className="p-2 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300">
          <IoMdNotificationsOutline className="text-2xl text-gray-600" />
        </button>
        <button className="p-2 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300">
          <IoLanguageOutline className="text-2xl text-gray-600" />
        </button>
        <button className="p-2 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300">
          <FaRegUserCircle className="text-2xl text-gray-600" />
        </button>
      </div>
    </header>
  );
};

export default TopBar;