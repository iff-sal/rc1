import React, { useEffect, useState } from 'react';
import TopBar from '../../components/TopBar';
import BottomNavigationBar from '../../components/BottomNavigationBar';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../api/axios';
import { format, isPast } from 'date-fns'; // Import isPast
import { Link, useNavigate } from 'react-router-dom';
import { FaCommentDots } from 'react-icons/fa';
import FeedbackFormModal from '../../components/FeedbackFormModal'; // Import FeedbackFormModal

interface Appointment {
    id: string;
    service: {
        name: string;
    };
    appointment_date_time: string;
    status: string;
    // Assuming feedback status or count is NOT directly on the appointment entity
    // If it was, we would fetch it here to conditionally show the feedback prompt more accurately
}

const HomePage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);
  const [loadingAppointments, setLoadingAppointments] = useState(true);
  const [appointmentsError, setAppointmentsError] = useState<string | null>(null);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [selectedAppointmentForFeedback, setSelectedAppointmentForFeedback] = useState<string | null>(null); // Store appointment ID for feedback


  const fetchUpcomingAppointments = async () => {
    if (user && user.role === 'citizen') {
      setLoadingAppointments(true);
      try {
        // Fetch appointments with 'pending', 'confirmed', 'completed', 'cancelled_by_citizen', 'cancelled_by_officer', 'rescheduled' status
        // We need 'completed' to show feedback prompt
        const response = await api.get('/api/citizens/me/appointments', {
           params: {
               status: 'pending,confirmed,completed,cancelled_by_citizen,cancelled_by_officer,rescheduled' // Fetch all relevant statuses
           }
        });

        // Filter for display: Upcoming (Pending, Confirmed, Rescheduled) vs Past (Completed, Cancelled)
         const now = new Date();
         const upcoming = response.data.filter((app: Appointment) => !isPast(new Date(app.appointment_date_time)) && (app.status === 'pending' || app.status === 'confirmed' || app.status === 'rescheduled'));
         const past = response.data.filter((app: Appointment) => isPast(new Date(app.appointment_date_time)) || app.status === 'completed' || app.status.startsWith('cancelled'));

         // For this task, we only display upcoming in the "Upcoming Appointments" section
         setUpcomingAppointments(upcoming);

         // TODO: Potentially store 'past' appointments separately if a dedicated history section is built

        setLoadingAppointments(false);
      } catch (err) {
        console.error('Error fetching appointments:', err);
        setAppointmentsError('Failed to load appointments.');
        setLoadingAppointments(false);
      }
    }
  };


   useEffect(() => {
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

   // Function to open feedback modal
   const handleLeaveFeedbackClick = (appointmentId: string) => {
       setSelectedAppointmentForFeedback(appointmentId);
       setIsFeedbackModalOpen(true);
   };

    // Function called after feedback is submitted
    const handleFeedbackSubmitted = () => {
        // Refresh appointments list to potentially update UI if feedback status was tracked
        // Note: Since feedback submission doesn't change appointment status, this might
        // not visually change the appointment card unless we add a 'hasFeedback' flag
        // to the Appointment entity or fetch feedback status separately.
        // For hackathon simplicity, we just refetch the list.
        fetchUpcomingAppointments();
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
                              ${appointment.status === 'confirmed' ? 'bg-green-100 text-green-800' : appointment.status === 'pending' || appointment.status === 'rescheduled' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-200 text-gray-800'}` // Added reschedule status color
                          }>
                              {appointment.status.replace(/_/g, ' ')} {/* Basic formatting */}
                          </span>
                           {/* Add link to view appointment details (optional for now) */}
                           {/* <Link to={`/appointments/${appointment.id}`} className="text-blue-500 text-sm ml-2">View Details</Link> */}

                            {/* Leave Feedback Prompt - Simplified: show for completed status */}
                            {/* In a real app, you'd check if feedback *actually* exists for this appointment */}
                           {appointment.status === 'completed' && (
                                <button
                                    onClick={() => handleLeaveFeedbackClick(appointment.id)}
                                    className="mt-2 px-3 py-1 bg-primary text-white text-sm rounded hover:bg-orange-600 transition-colors duration-150"
                                >
                                    Leave Feedback
                                </button>
                           )}
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
            className="fixed bottom-24 right-6 bg-blue-500 text-white p-4 rounded-full shadow-lg hover:bg-blue-600 transition-colors duration-200 focus:outline-none z-50"
            aria-label="Open AI Assistant Chat"
         >
             <FaCommentDots className="text-2xl" />
         </button>

        {/* Feedback Modal */}
        <FeedbackFormModal
            isOpen={isFeedbackModalOpen}
            onClose={() => setIsFeedbackModalOpen(false)}
            appointmentId={selectedAppointmentForFeedback || undefined} // Pass selected appointment ID
            onFeedbackSubmitted={handleFeedbackSubmitted} // Pass callback to refresh list
        />


      </div>
      <BottomNavigationBar />
    </div>
  );
};

export default HomePage;