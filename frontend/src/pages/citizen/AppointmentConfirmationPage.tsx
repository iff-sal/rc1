import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import TopBar from '../../components/TopBar';
import BottomNavigationBar from '../../components/BottomNavigationBar';
import { format } from 'date-fns';
import { FaCheckCircle } from 'react-icons/fa';

const AppointmentConfirmationPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { confirmationReference, qrCodeBase64, serviceName, appointmentDateTime } = location.state || {};

  // Redirect if state is missing (e.g., page refresh)
  if (!confirmationReference || !qrCodeBase64) {
    // TODO: Handle this case better, maybe fetch appointment by ID from backend if available
    navigate('/citizen/dashboard', { replace: true });
    return null; // Prevent rendering if redirecting
  }

  const formattedDateTime = new Date(appointmentDateTime);

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <TopBar />
      <div className="flex-grow p-4 pb-20 flex flex-col items-center justify-center text-center"> {/* Center content */}
        <FaCheckCircle className="text-green-500 text-6xl mb-4" />
        <h1 className="text-2xl font-bold mb-4 text-gray-800">Appointment Confirmed!</h1>
        <p className="text-gray-700 mb-2">Your appointment for:</p>
        <p className="text-lg font-semibold text-gray-800 mb-4">{serviceName}</p>
        <p className="text-gray-700 mb-2">On:</p>
        <p className="text-lg font-semibold text-gray-800 mb-4">
            {format(formattedDateTime, 'PPP')} at {format(formattedDateTime, 'p')}
        </p>
        <p className="text-gray-700 mb-2">Your Confirmation Reference:</p>
        <p className="text-xl font-bold text-primary mb-4">{confirmationReference}</p>

        {qrCodeBase64 && (
          <div className="bg-white p-4 rounded-lg shadow-md mb-6">
            <p className="text-gray-700 mb-2">Scan QR Code:</p>
             {/* Use the base64 string as the image source */}
            <img src={qrCodeBase64} alt="Appointment QR Code" className="mx-auto" />
          </div>
        )}

        <button
          onClick={() => navigate('/citizen/dashboard')}
          className="w-full sm:w-auto px-6 py-3 bg-blue-500 text-white rounded-lg font-semibold text-lg hover:bg-blue-600 transition-colors duration-200 mb-3"
        >
          Go to Home
        </button>
         <button
          onClick={() => navigate('/citizens/me/appointments')}
          className="w-full sm:w-auto px-6 py-3 bg-gray-500 text-white rounded-lg font-semibold text-lg hover:bg-gray-600 transition-colors duration-200"
        >
          View My Appointments
        </button>

      </div>
      <BottomNavigationBar />
    </div>
  );
};

export default AppointmentConfirmationPage;
