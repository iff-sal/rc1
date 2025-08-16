import React, { useEffect, useState } from 'react';
import TopBar from '../../components/TopBar';
import BottomNavigationBar from '../../components/BottomNavigationBar';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../api/axios';
import { format } from 'date-fns';
import { Link, useNavigate } from 'react-router-dom';
import { FaCommentDots } from 'react-icons/fa'; // Import icon for chat bubble

interface Appointment {
    id: string;
    service: { // Assuming service relation is loaded
        name: string;
    };
    appointment_date_time: string;
    status: string;
}

const HomePage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);
  const [loadingAppointments, setLoadingAppointments] = useState(true);
  const [appointmentsError, setAppointmentsError] = useState<string | null>(null);


   useEffect(() => {
    const fetchUpcomingAppointments = async () => {
      if (user && user.role === 'citizen') {
        setLoadingAppointments(true);
        try {
          // Fetch appointments with 'pending' or 'confirmed' status
          const response = await api.get('/api/citizens/me/appointments', {
             params: {
                 status: 'pending,confirmed' // Backend should handle multiple statuses
             }
          });
          setUpcomingAppointments(response.data);
          setLoadingAppointments(false);
        } catch (err) {
          console.error('Error fetching upcoming appointments:', err);
          setAppointmentsError('Failed to load upcoming appointments.');
          setLoadingAppointments(false);
        }
      }
    };

    fetchUpcomingAppointments();
  }, [user]); // Rerun when user changes (e.g., after login)


  // Example Quick Actions - Link to Service Booking Page (replace with actual Service IDs from db_dump.sql)
  const quickActions = [
    { name: 'Driving License Renewal', serviceId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' }, // Department of Motor Traffic -> Driving License Renewal
    { name: 'New Passport Application', serviceId: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' }, // Department of Immigration & Emigration -> New Passport Application
     { name: 'View All Services', path: '/services' }, // Link to the Services browse page
     { name: 'View My Appointments', path: '/citizens/me/appointments' }, // Link to view all citizen appointments (create this page later)
     { name: 'View My Documents', path: '/documents' }, // Link to the new Documents page
  ];

  // Function to handle quick action clicks
  const handleQuickActionClick = (action: { serviceId?: string, path?: string }) => {
      if (action.serviceId) {
         navigate(`/services/${action.serviceId}`);
      } else if (action.path) {
         navigate(action.path);
      }
  };


  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <TopBar />
      <div className="flex-grow p-4 pb-20"> {/* Add padding-bottom */}
        <h1 className="text-2xl font-bold mb-4 text-gray-800">
          Welcome back, {user?.first_name || user?.email}!
        </h1>

        {/* Upcoming Appointments Section */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-3 text-gray-800">Upcoming Appointments</h2>
           {loadingAppointments && <div className="text-gray-600">Loading appointments...</div>}
           {appointmentsError && <div className="text-red-500">{appointmentsError}</div>}
           {!loadingAppointments && upcomingAppointments.length === 0 && !appointmentsError && (
             <div className="text-gray-600">You have no upcoming appointments.</div>
           )}
           {!loadingAppointments && upcomingAppointments.length > 0 && (
              <div className="space-y-3">
                  {upcomingAppointments.map(appointment => (
                      <div key={appointment.id} className="bg-white p-4 rounded-lg shadow border border-blue-200">
                          <h3 className="text-lg font-semibold text-gray-800">{appointment.service?.name || 'Service'}</h3>
                          <p className="text-sm text-gray-600 mb-1">
                             {format(new Date(appointment.appointment_date_time), 'PPP')} at {format(new Date(appointment.appointment_date_time), 'p')}
                          </p>
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded
                              ${appointment.status === 'confirmed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`
                          }>
                              {appointment.status}
                          </span>
                           {/* Add link to view appointment details (optional for now) */}
                           {/* <Link to={`/appointments/${appointment.id}`} className="text-blue-500 text-sm ml-2">View Details</Link> */}
                      </div>
                  ))}
              </div>
           )}
        </div>


        {/* Important Updates Section (Placeholder) */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-3 text-gray-800">Important Updates</h2>
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-gray-700">Stay tuned for important announcements regarding government services.</p>
             {/* Add dynamic updates here later */}
          </div>
        </div>

        {/* Community News Section (Placeholder) */}
         <div className="mb-6">
          <h2 className="text-xl font-semibold mb-3 text-gray-800">Community News</h2>
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-gray-700">Placeholder for community news and events.</p>
             {/* Add dynamic news here later */}
          </div>
        </div>


        {/* Quick Actions Section */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-3 text-gray-800">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-4">
             {quickActions.map(action => (
                 <button
                    key={action.path || action.serviceId} // Use path or serviceId as key
                    onClick={() => handleQuickActionClick(action)}
                    className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow duration-200 text-blue-600 font-medium text-sm text-left"
                 >
                     {action.name}
                 </button>
             ))}
          </div>
        </div>

         {/* Floating AI Chat Bubble */}
         <button
            onClick={() => navigate('/ai-assistant')}
            className="fixed bottom-24 right-6 bg-blue-500 text-white p-4 rounded-full shadow-lg hover:bg-blue-600 transition-colors duration-200 focus:outline-none z-50" // Position and style the bubble
            aria-label="Open AI Assistant Chat"
         >
             <FaCommentDots className="text-2xl" />
         </button>


      </div>
      <BottomNavigationBar />
    </div>
  );
};

export default HomePage;
