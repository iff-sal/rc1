import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import TopBar from '../../components/TopBar';
import BottomNavigationBar from '../../components/BottomNavigationBar';
import api from '../../api/axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css'; // Import datepicker styles
import { format } from 'date-fns';
import { useAuth } from '../../contexts/AuthContext';

interface Service {
  id: string;
  name: string;
  description: string;
  duration_minutes: number;
  department_id: string;
}

const ServiceBookingPage: React.FC = () => {
  const { serviceId } = useParams<{ serviceId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth(); // Get citizen ID from auth context
  const [service, setService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bookingLoading, setBookingLoading] = useState(false);


  useEffect(() => {
    const fetchServiceDetails = async () => {
      try {
        const response = await api.get(`/api/services/${serviceId}`);
        setService(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching service details:', err);
        setError('Failed to load service details.');
        setLoading(false);
      }
    };

    if (serviceId) {
      fetchServiceDetails();
    } else {
        setError('Service ID is missing.');
        setLoading(false);
    }
  }, [serviceId]);

  useEffect(() => {
    const fetchAvailableSlots = async () => {
      if (selectedDate && serviceId) {
        setAvailableSlots([]); // Clear previous slots
        setSelectedSlot(null); // Clear selected slot
        try {
          // Format date to YYYY-MM-DD for the backend query
          const formattedDate = format(selectedDate, 'yyyy-MM-dd');
          const response = await api.get(`/api/services/${serviceId}/available-slots`, {
            params: { date: formattedDate },
          });
          setAvailableSlots(response.data);
        } catch (err) {
          console.error('Error fetching available slots:', err);
          // TODO: Handle specific error (e.g., no slots available)
           setAvailableSlots([]); // Clear slots on error
        }
      }
    };
    fetchAvailableSlots();
  }, [selectedDate, serviceId]);


  const handleBooking = async () => {
    if (!selectedDate || !selectedSlot || !serviceId || !user) {
      setError('Please select a date and time slot.');
      return;
    }

    setBookingLoading(true);
    setError(null); // Clear previous errors

    try {
       // Combine selected date and time slot into a Date object
      const [hours, minutes] = selectedSlot.split(':').map(Number);
      const appointmentDateTime = new Date(selectedDate);
      appointmentDateTime.setHours(hours, minutes, 0, 0); // Set time components

      const payload = {
        serviceId: serviceId,
        appointmentDateTime: appointmentDateTime.toISOString(), // Send as ISO string
      };

      const response = await api.post('/api/appointments', payload);

      // Navigate to confirmation page with details
      navigate('/appointments/confirm', {
        state: {
          confirmationReference: response.data.confirmation_reference,
          qrCodeBase64: response.data.qr_code_base64,
          serviceName: service?.name,
          appointmentDateTime: response.data.appointment_date_time,
        },
      });

    } catch (err: any) {
      console.error('Error booking appointment:', err);
       // Check for specific backend error messages
      const errorMessage = err.response?.data?.message || 'Failed to book appointment. Please try again.';
      setError(errorMessage);
    } finally {
      setBookingLoading(false);
    }
  };


  if (loading) {
    return (
        <div className="flex flex-col min-h-screen bg-gray-100">
           <TopBar />
           <div className="flex-grow p-4 text-center text-gray-600">Loading service details...</div>
           <BottomNavigationBar />
        </div>
    );
  }

  if (error && !service) { // Only show fatal error if service didn't load
      return (
         <div className="flex flex-col min-h-screen bg-gray-100">
           <TopBar />
           <div className="flex-grow p-4 text-center text-red-500">{error}</div>
           <BottomNavigationBar />
        </div>
      );
  }


  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <TopBar />
      <div className="flex-grow p-4 pb-20"> {/* Add padding-bottom */}
        <h1 className="text-2xl font-bold mb-4 text-gray-800">{service?.name}</h1>
        <p className="text-gray-700 mb-4">{service?.description}</p>

        {error && <div className="text-red-500 mb-4">{error}</div>} {/* Display booking/slot errors */}

        {/* Date Selection */}
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2 text-gray-800">Select a Date</h3>
           {/* Custom input to fit mobile-first design */}
           <DatePicker
               selected={selectedDate}
               onChange={(date: Date | null) => setSelectedDate(date)}
               dateFormat="yyyy/MM/dd"
               placeholderText="Click to select a date"
               className="w-full px-3 py-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
               minDate={new Date()} // Prevent booking in the past
           />
        </div>

        {/* Available Slots */}
        {selectedDate && (
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-2 text-gray-800">Available Time Slots ({format(selectedDate, 'PPP')})</h3>
            {availableSlots.length > 0 ? (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {availableSlots.map(slot => (
                  <button
                    key={slot}
                    className={`px-3 py-2 rounded-lg text-sm font-medium
                      ${selectedSlot === slot ? 'bg-primary text-white' : 'bg-white text-gray-700 border border-gray-300'}
                      hover:bg-primary hover:text-white transition-colors duration-150`
                    }
                    onClick={() => setSelectedSlot(slot)}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-gray-600">No available slots for this date. Please try another day.</div>
            )}
          </div>
        )}

        {/* Book Button */}
        <button
          onClick={handleBooking}
          disabled={!selectedDate || !selectedSlot || bookingLoading}
          className={`w-full py-3 rounded-lg text-white font-semibold text-lg
            ${!selectedDate || !selectedSlot || bookingLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600'}
            transition-colors duration-200`
          }
        >
          {bookingLoading ? 'Booking...' : 'Book Appointment'}
        </button>

      </div>
      <BottomNavigationBar />
    </div>
  );
};

export default ServiceBookingPage;
