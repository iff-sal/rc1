import React from 'react';
import TopBar from '../../components/TopBar';
import { useAuth } from '../../contexts/AuthContext';

const OfficerDashboardPage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <TopBar />
      <main className="flex-grow p-4">
        <h1 className="text-2xl font-bold mb-4">
          Welcome Officer, {user?.first_name || 'Dashboard'}!
        </h1>
        {/* Placeholder for officer-specific content */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">Officer Actions & Information</h2>
          <p>Placeholder for officer tasks, appointment lists, document review queues, etc.</p>
          {/* Add officer-specific UI elements here in later tasks */}
        </div>
      </main>
      {/* Officer dashboard typically doesn't have a bottom navigation bar */}
    </div>
  );
};

export default OfficerDashboardPage;