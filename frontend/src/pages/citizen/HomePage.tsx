import React, { useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import TopBar from '../../components/TopBar';
import BottomNavigationBar from '../../components/BottomNavigationBar';

const HomePage: React.FC = () => {
  const auth = useContext(AuthContext);

  if (!auth || !auth.user) {
    // Handle loading state or redirect if user is not available
    return <div>Loading user data...</div>;
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <TopBar />
      <main className="flex-grow container mx-auto p-4 pb-20"> {/* pb-20 to avoid content hidden by fixed bottom nav */}
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          Welcome back, {auth.user.first_name || auth.user.email}!
        </h1>

        {/* Upcoming Appointments Placeholder */}
        <section className="bg-white rounded-lg shadow p-4 mb-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-3">Upcoming Appointments</h2>
          {/* Placeholder Content */}
          <p className="text-gray-600">Loading appointments...</p>
          {/* Example static card placeholder */}
          {/*
          <div className="border border-gray-200 rounded-lg p-3 mt-2">
            <p className="text-sm font-medium">Appointment: Driving License Renewal</p>
            <p className="text-xs text-gray-500">Date: 2023-10-27, Time: 10:00 AM</p>
            <p className="text-xs text-gray-500">Department: Motor Traffic</p>
          </div>
          */}
        </section>

        {/* Important Updates Placeholder */}
        <section className="bg-white rounded-lg shadow p-4 mb-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-3">Important Updates</h2>
          {/* Placeholder Content */}
          <ul className="list-disc list-inside text-gray-600">
            <li>Update 1: New service available at Immigration Department.</li>
            <li>Update 2: Office closed on public holiday.</li>
          </ul>
        </section>

        {/* Community News Placeholder */}
        <section className="bg-white rounded-lg shadow p-4 mb-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-3">Community News</h2>
          {/* Placeholder Content */}
          <p className="text-gray-600">Stay tuned for community announcements.</p>
        </section>

        {/* Quick Actions Placeholder */}
        <section className="bg-white rounded-lg shadow p-4 mb-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-3">Quick Actions</h2>
          {/* Placeholder Content */}
          <div className="flex flex-wrap gap-3">
            <button className="bg-blue-500 text-white px-4 py-2 rounded-md text-sm">Book Appointment</button>
            <button className="bg-green-500 text-white px-4 py-2 rounded-md text-sm">View Documents</button>
            {/* Add more quick action buttons as needed */}
          </div>
        </section>

      </main>
      <BottomNavigationBar />
    </div>
  );
};

export default HomePage;