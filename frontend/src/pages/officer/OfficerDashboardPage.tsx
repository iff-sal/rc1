import React, { useState, useEffect } from 'react';
import TopBar from '../../components/TopBar';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../api/axios';
import { format } from 'date-fns';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useNavigate } from 'react-router-dom';
import { AppointmentStatus, UserRole } from '../../../backend/src/common/enums'; // Assuming enums are accessible or redefine
import { FaChartBar } from 'react-icons/fa'; // Import icon for analytics link

// Redefine enums if not directly accessible from backend src
enum FrontendAppointmentStatus {
    Pending = 'pending',
    Confirmed = 'confirmed',
    CancelledByCitizen = 'cancelled_by_citizen',
    CancelledByOfficer = 'cancelled_by_officer',
    Completed = 'completed',
    Rescheduled = 'rescheduled',
}


interface Appointment {
    id: string;
    citizen: { // Assuming citizen relation is loaded and includes name/email
        first_name?: string;
        last_name?: string;
        email: string;
    };
    service: { // Assuming service relation is loaded
        name: string;
    };
    department: { // Assuming department relation is loaded
      name: string;
    };
    appointment_date_time: string;
    status: FrontendAppointmentStatus;
    confirmation_reference: string;
}

const OfficerDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date()); // Default to today
  const [selectedStatus, setSelectedStatus] = useState<string>('pending,confirmed,rescheduled'); // Default to pending/confirmed/rescheduled

  const fetchAppointments = async (date?: Date | null, status?: string) => {
    if (!user || user.role !== UserRole.GovernmentOfficer) return;

    setLoading(true);
    setError(null);

    try {
      const params: any = {};
      if (date) {
        params.date = format(date, 'yyyy-MM-dd');
      }
      if (status) {
          params.status = status;
      } else {
           // Default status filter for today/future appointments if no status is selected
           if (date) { // If a specific date is selected, show all statuses for that day
                // No default status filter needed
           } else { // If no date selected (showing future), default to upcoming statuses
                params.status = 'pending,confirmed,rescheduled';
           }
      }


      const response = await api.get('/api/officers/me/appointments', { params });
      setAppointments(response.data);
    } catch (err) {
      console.error('Error fetching officer appointments:', err);
      setError('Failed to load appointments.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch when component mounts or user changes
     if (user && user.role === UserRole.GovernmentOfficer) {
       fetchAppointments(selectedDate, selectedStatus);
     }
  }, [user]); // Fetch when user changes

  useEffect(() => {
       // Fetch appointments when selectedDate or selectedStatus changes
       if (user && user.role === UserRole.GovernmentOfficer) {
         fetchAppointments(selectedDate, selectedStatus);
       }
   }, [selectedDate, selectedStatus]); // Fetch when filters change


   const handleStatusChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
       setSelectedStatus(event.target.value);
   };

   const handleDateChange = (date: Date | null) => {
       setSelectedDate(date);
   };

   const getStatusColor = (status: FrontendAppointmentStatus): string => {
       switch (status) {
           case FrontendAppointmentStatus.Confirmed: return 'bg-green-100 text-green-800';
           case FrontendAppointmentStatus.CancelledByCitizen:
           case FrontendAppointmentStatus.CancelledByOfficer: return 'bg-red-100 text-red-800';
           case FrontendAppointmentStatus.Completed: return 'bg-blue-100 text-blue-800';
           case FrontendAppointmentStatus.Rescheduled: return 'bg-yellow-100 text-yellow-800';
           default: return 'bg-gray-200 text-gray-800'; // Pending or other
       }
   };


  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <TopBar />
      <div className="flex-grow p-4 pb-4"> {/* Officer dashboard doesn't need bottom nav padding */}
        <h1 className="text-2xl font-bold mb-4 text-gray-800">
          Welcome, Officer {user?.first_name || user?.email}!
        </h1>

        {error && <div className="text-red-500 mb-4">{error}</div>}

        {/* Analytics Link */}
         <div className="mb-6">
            <button
               onClick={() => navigate('/officer/analytics')}
                className="px-6 py-3 bg-primary text-white rounded-lg font-semibold text-lg hover:bg-orange-600 transition-colors duration-200 flex items-center"
            >
                 <FaChartBar className="mr-2" /> View Analytics
            </button>
         </div>


        {/* Filter Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
                <label htmlFor="appointmentDate" className="block text-gray-700 text-sm font-bold mb-2">Filter by Date:</label>
                 <DatePicker
                   selected={selectedDate}
                   onChange={handleDateChange}
                   dateFormat="yyyy/MM/dd"
                   placeholderText="Select a date"
                   isClearable
                   className="w-full px-3 py-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
               />
            </div>
             <div className="flex-1">
                <label htmlFor="appointmentStatus" className="block text-gray-700 text-sm font-bold mb-2">Filter by Status:</label>
                <select
                   id="appointmentStatus"
                   value={selectedStatus}
                   onChange={handleStatusChange}
                   className="w-full px-3 py-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
               >
                   <option value="">All Statuses</option>
                   <option value="pending,confirmed,rescheduled">Upcoming (Pending/Confirmed/Rescheduled)</option> {/* Updated default */}
                   <option value="pending">Pending</option>
                   <option value="confirmed">Confirmed</option>
                   <option value="completed">Completed</option>
                   <option value="cancelled_by_citizen,cancelled_by_officer">Cancelled</option>
                   <option value="rescheduled">Rescheduled</option>
               </select>
            </div>
        </div>


        {/* Appointment List/Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
           <div className="p-4 bg-gray-50 border-b">
               <h2 className="text-xl font-semibold text-gray-800">Appointments</h2>
           </div>
            {loading ? (
                <div className="p-4 text-center text-gray-600">Loading appointments...</div>
            ) : appointments.length === 0 ? (
                <div className="p-4 text-center text-gray-600">No appointments found for the selected criteria.</div>
            ) : (
                <div className="overflow-x-auto"> {/* Make table scrollable on small screens */}
                   <table className="min-w-full divide-y divide-gray-200">
                       <thead className="bg-gray-50">
                           <tr>
                               <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                   Citizen
                               </th>
                               <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                   Service
                               </th>
                               <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                   Date & Time
                               </th>
                               <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                   Status
                               </th>
                               <th scope="col" className="relative px-6 py-3">
                                   <span className="sr-only">View</span>
                               </th>
                           </tr>
                       </thead>
                       <tbody className="bg-white divide-y divide-gray-200">
                           {appointments.map((appointment) => (
                               <tr key={appointment.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => navigate(`/officer/appointments/${appointment.id}`)}>
                                   <td className="px-6 py-4 whitespace-nowrap">
                                       <div className="text-sm font-medium text-gray-900">{appointment.citizen?.first_name} {appointment.citizen?.last_name}</div>
                                        <div className="text-sm text-gray-500">{appointment.citizen?.email}</div>
                                   </td>
                                   <td className="px-6 py-4 whitespace-nowrap">
                                       <div className="text-sm text-gray-900">{appointment.service?.name}</div>
                                   </td>
                                   <td className="px-6 py-4 whitespace-nowrap">
                                       <div className="text-sm text-gray-900">{format(new Date(appointment.appointment_date_time), 'PPP')}</div>
                                       <div className="text-sm text-gray-500">{format(new Date(appointment.appointment_date_time), 'p')}</div>
                                   </td>
                                   <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(appointment.status)}`}>
                                            {appointment.status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} {/* Basic formatting */}
                                        </span>
                                   </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                       <button onClick={(e) => {e.stopPropagation(); navigate(`/officer/appointments/${appointment.id}`);}} className="text-blue-600 hover:text-blue-900">View</button>
                                   </td>
                               </tr>
                           ))}
                       </tbody>
                   </table>
               </div>
            )}
        </div>


      </div>
      {/* Officer dashboard does not typically have a bottom nav */}
      {/* <BottomNavigationBar /> */}
    </div>
  );
};

export default OfficerDashboardPage;
