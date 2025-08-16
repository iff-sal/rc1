import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import TopBar from '../../components/TopBar';
import api from '../../api/axios';
import { format } from 'date-fns';
import { AppointmentStatus, DocumentStatus, DocumentType } from '../../../backend/src/common/enums'; // Assuming enums are accessible or redefine
import { FaFileAlt, FaCheckCircle, FaTimesCircle, FaQuestionCircle, FaSpinner } from 'react-icons/fa';

// Redefine enums if not directly accessible from backend src
enum FrontendAppointmentStatus {
    Pending = 'pending',
    Confirmed = 'confirmed',
    CancelledByCitizen = 'cancelled_by_citizen',
    CancelledByOfficer = 'cancelled_by_officer',
    Completed = 'completed',
    Rescheduled = 'rescheduled',
}

enum FrontendDocumentStatus {
  Uploaded = 'uploaded',
  UnderReview = 'under_review',
  Approved = 'approved',
  Rejected = 'rejected',
}

enum FrontendDocumentType {
  NationalIdentityCard = 'national_identity_card',
  Passport = 'passport',
  DrivingLicense = 'driving_license',
  BirthCertificate = 'birth_certificate',
  ApplicationForm = 'application_form',
  Photograph = 'photograph',
  Other = 'other',
}


interface Appointment {
    id: string;
    citizen: {
        id: string; // Need citizen ID for potential future communication features
        first_name?: string;
        last_name?: string;
        email: string;
        phone_number?: string;
    };
    service: {
        id: string;
        name: string;
    };
    department: {
      id: string;
      name: string;
    };
    appointment_date_time: string;
    confirmation_reference: string;
    qr_code_base64?: string;
    status: FrontendAppointmentStatus;
    officer_notes?: string;
    created_at: string;
    updated_at: string;
}

interface Document {
  id: string;
  document_type: FrontendDocumentType;
  status: FrontendDocumentStatus;
  file_path: string;
  officer_comments?: string;
  uploaded_at: string;
}


const AppointmentDetailPage: React.FC = () => {
  const { appointmentId } = useParams<{ appointmentId: string }>();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loadingAppointment, setLoadingAppointment] = useState(true);
  const [loadingDocuments, setLoadingDocuments] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [appointmentStatus, setAppointmentStatus] = useState<FrontendAppointmentStatus | ''>('');
  const [appointmentOfficerNotes, setAppointmentOfficerNotes] = useState('');
  const [savingAppointmentStatus, setSavingAppointmentStatus] = useState(false);

  // State for document updates (using a map keyed by document ID)
  const [documentUpdates, setDocumentUpdates] = useState<{ [docId: string]: { status: FrontendDocumentStatus | '', officerComments: string } }>({});
  const [savingDocumentStatus, setSavingDocumentStatus] = useState<{ [docId: string]: boolean }>({});


  const fetchAppointmentDetails = async () => {
    if (!appointmentId) return;
    setLoadingAppointment(true);
    setError(null);
    try {
      const response = await api.get(`/api/appointments/${appointmentId}`);
      setAppointment(response.data);
      setAppointmentStatus(response.data.status); // Initialize state with current status
      setAppointmentOfficerNotes(response.data.officer_notes || ''); // Initialize notes
    } catch (err) {
      console.error('Error fetching appointment details:', err);
      setError('Failed to load appointment details.');
    } finally {
      setLoadingAppointment(false);
    }
  };

  const fetchAppointmentDocuments = async () => {
    if (!appointmentId) return;
    setLoadingDocuments(true);
     setError(null); // Clear previous errors that might not be document-related
    try {
      const response = await api.get(`/api/appointments/${appointmentId}/documents`);
      setDocuments(response.data);
       // Initialize document update state
       const initialDocumentUpdates: { [docId: string]: { status: FrontendDocumentStatus | '', officerComments: string } } = {};
       response.data.forEach((doc: Document) => {
            initialDocumentUpdates[doc.id] = {
                 status: doc.status,
                 officerComments: doc.officer_comments || ''
            };
       });
       setDocumentUpdates(initialDocumentUpdates);

    } catch (err) {
      console.error('Error fetching documents:', err);
      setError('Failed to load associated documents.');
    } finally {
      setLoadingDocuments(false);
    }
  };


  useEffect(() => {
    fetchAppointmentDetails();
    fetchAppointmentDocuments();
  }, [appointmentId]); // Refetch if appointmentId changes

   const handleAppointmentStatusChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
       setAppointmentStatus(event.target.value as FrontendAppointmentStatus);
   };

   const handleAppointmentNotesChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
       setAppointmentOfficerNotes(event.target.value);
   };

    const handleSaveAppointmentStatus = async () => {
        if (!appointmentId || !appointmentStatus) return;
        setSavingAppointmentStatus(true);
        setError(null);
        try {
            const payload = {
                 status: appointmentStatus,
                 officerNotes: appointmentOfficerNotes
            };
            await api.patch(`/api/appointments/${appointmentId}/status`, payload);
            // Refresh appointment details after saving
            fetchAppointmentDetails();
             // TODO: Show success message
        } catch (err) {
            console.error('Error updating appointment status:', err);
            setError('Failed to update appointment status.');
        } finally {
            setSavingAppointmentStatus(false);
        }
    };

     const handleDocumentUpdateChange = (docId: string, field: 'status' | 'officerComments', value: string) => {
         setDocumentUpdates(prev => ({
             ...prev,
             [docId]: {
                 ...prev[docId],
                 [field]: field === 'status' ? (value as FrontendDocumentStatus) : value
             }
         }));
     };


     const handleSaveDocumentStatus = async (docId: string) => {
        const updateData = documentUpdates[docId];
        if (!updateData || !updateData.status) {
            setError('Please select a status for the document.');
            return;
        }

        setSavingDocumentStatus(prev => ({ ...prev, [docId]: true }));
        setError(null); // Clear previous errors

        try {
            const payload = {
                status: updateData.status,
                officerComments: updateData.officerComments
            };
            await api.patch(`/api/documents/${docId}/status`, payload);
             // Refresh document list after saving (optional, could just update state)
            fetchAppointmentDocuments();
            // TODO: Show success message for this specific document
        } catch (err) {
            console.error('Error updating document status:', err);
             setError(`Failed to update document status for ${docId}.`);
        } finally {
            setSavingDocumentStatus(prev => ({ ...prev, [docId]: false }));
        }
     };

    const handleViewDocument = (filePath: string) => {
         // Basic implementation: log the file path or open in a new tab if backend serves files
         console.log("Attempting to view document at path:", filePath);
         // For a real app, you would call a backend endpoint like /api/documents/:id/download
         // window.open(`/api/documents/${docId}/download`, '_blank');
         alert("Document viewing not fully implemented. Check console for file path.");
     };

     const getDocumentTypeDisplayName = (type: FrontendDocumentType): string => {
       switch (type) {
         case FrontendDocumentType.NationalIdentityCard: return 'National Identity Card';
         case FrontendDocumentType.DrivingLicense: return 'Driving License';
         case FrontendDocumentType.BirthCertificate: return 'Birth Certificate';
         case FrontendDocumentType.ApplicationForm: return 'Application Form';
         case FrontendDocumentType.Photograph: return 'Photograph';
         case FrontendDocumentType.Passport: return 'Passport';
         case FrontendDocumentType.Other: return 'Other';
       }
     };

    const getStatusColor = (status: FrontendAppointmentStatus | FrontendDocumentStatus): string => {
       switch (status) {
           case FrontendAppointmentStatus.Confirmed:
           case FrontendDocumentStatus.Approved: return 'bg-green-100 text-green-800';
           case FrontendAppointmentStatus.CancelledByCitizen:
           case FrontendAppointmentStatus.CancelledByOfficer:
           case FrontendDocumentStatus.Rejected: return 'bg-red-100 text-red-800';
           case FrontendAppointmentStatus.Completed: return 'bg-blue-100 text-blue-800';
           case FrontendAppointmentStatus.Rescheduled:
           case FrontendDocumentStatus.UnderReview: return 'bg-yellow-100 text-yellow-800';
           default: return 'bg-gray-200 text-gray-800'; // Pending or Uploaded
       }
   };

   if (loadingAppointment) {
       return (
           <div className="flex flex-col min-h-screen bg-gray-100">
               <TopBar />
               <div className="flex-grow p-4 text-center text-gray-600">Loading appointment details...</div>
           </div>
       );
   }

   if (error && !appointment) {
      return (
          <div className="flex flex-col min-h-screen bg-gray-100">
               <TopBar />
               <div className="flex-grow p-4 text-center text-red-500">{error}</div>
           </div>
      );
   }

   if (!appointment) {
       return (
            <div className="flex flex-col min-h-screen bg-gray-100">
               <TopBar />
               <div className="flex-grow p-4 text-center text-gray-600">Appointment not found.</div>
           </div>
       );
   }


  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <TopBar />
      <div className="flex-grow p-4 pb-4"> {/* No bottom nav */}
        <h1 className="text-2xl font-bold mb-4 text-gray-800">Appointment Details</h1>

         {error && <div className="text-red-500 mb-4">{error}</div>}


        {/* Appointment Information */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
           <h2 className="text-xl font-semibold mb-4 text-gray-800">Appointment Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-700 text-sm">
                <div><strong>Citizen:</strong> {appointment.citizen?.first_name} {appointment.citizen?.last_name} ({appointment.citizen?.email})</div>
                <div><strong>Service:</strong> {appointment.service?.name}</div>
                <div><strong>Department:</strong> {appointment.department?.name}</div>
                <div><strong>Date & Time:</strong> {format(new Date(appointment.appointment_date_time), 'PPP')} at {format(new Date(appointment.appointment_date_time), 'p')}</div>
                <div><strong>Confirmation Ref:</strong> <span className="font-mono">{appointment.confirmation_reference}</span></div>
                 <div>
                    <strong>Status:</strong>
                    <span className={`ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(appointment.status)}`}>
                         {appointment.status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                 </div>
                 <div className="col-span-1 sm:col-span-2"><strong>Officer Notes:</strong> {appointment.officer_notes || 'N/A'}</div>
            </div>

             {/* QR Code (Optional display) */}
             {appointment.qr_code_base64 && (
                 <div className="mt-4 text-center">
                     <img src={appointment.qr_code_base64} alt="Confirmation QR Code" className="mx-auto max-w-[150px]" />
                 </div>
             )}
        </div>

         {/* Appointment Status Management */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Manage Appointment Status</h2>
             <div className="mb-4">
                <label htmlFor="appointmentStatusSelect" className="block text-gray-700 text-sm font-bold mb-2">Update Status:</label>
                <select
                   id="appointmentStatusSelect"
                   value={appointmentStatus}
                   onChange={handleAppointmentStatusChange}
                   className="w-full sm:w-auto px-3 py-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
               >
                   <option value={FrontendAppointmentStatus.Pending}>Pending</option>
                   <option value={FrontendAppointmentStatus.Confirmed}>Confirmed</option>
                   <option value={FrontendAppointmentStatus.Completed}>Completed</option>
                   <option value={FrontendAppointmentStatus.CancelledByOfficer}>Cancelled by Officer</option>
                    <option value={FrontendAppointmentStatus.Rescheduled}>Rescheduled</option>
               </select>
            </div>
             <div className="mb-4">
                <label htmlFor="appointmentOfficerNotes" className="block text-gray-700 text-sm font-bold mb-2">Officer Notes:</label>
                 <textarea
                    id="appointmentOfficerNotes"
                    value={appointmentOfficerNotes}
                    onChange={handleAppointmentNotesChange}
                    rows={3}
                    className="w-full px-3 py-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Add notes about the appointment (e.g., outcome, issues)..."
                 />
            </div>
            <button
                onClick={handleSaveAppointmentStatus}
                disabled={!appointmentStatus || savingAppointmentStatus}
                className={`px-6 py-2 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-colors duration-200 ${savingAppointmentStatus ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
                {savingAppointmentStatus ? <FaSpinner className="animate-spin inline mr-2" /> : ''} Save Appointment Status
            </button>
             {/* Implement "Request Corrections" logic here - could be a separate button/modal */}
        </div>


        {/* Document Review Section */}
        <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Documents for Review</h2>
             {loadingDocuments ? (
                 <div className="text-center text-gray-600">Loading documents...</div>
             ) : documents.length === 0 ? (
                 <div className="text-center text-gray-600">No documents associated with this appointment.</div>
             ) : (
                 <div className="space-y-6">
                     {documents.map(document => (
                         <div key={document.id} className="border border-gray-200 p-4 rounded-lg">
                             <div className="flex items-center mb-3">
                                  <FaFileAlt className="text-blue-500 text-2xl mr-3" />
                                  <h3 className="text-lg font-semibold text-gray-800 flex-grow">{getDocumentTypeDisplayName(document.document_type)}</h3>
                                  <span className={`ml-auto px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(document.status)}`}>
                                      {document.status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                  </span>
                             </div>
                              <p className="text-sm text-gray-600 mb-3">Uploaded: {format(new Date(document.uploaded_at), 'PPP p')}</p> {/* Include time */}

                              {/* Document Status and Comments */}
                             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                                 <div>
                                      <label htmlFor={`docStatus-${document.id}`} className="block text-gray-700 text-sm font-bold mb-2">Status:</label>
                                      <select
                                         id={`docStatus-${document.id}`}
                                         value={documentUpdates[document.id]?.status || document.status} // Use state if available, otherwise entity value
                                         onChange={(e) => handleDocumentUpdateChange(document.id, 'status', e.target.value)}
                                         className="w-full px-3 py-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                                     >
                                         <option value={FrontendDocumentStatus.Uploaded}>Uploaded</option>
                                         <option value={FrontendDocumentStatus.UnderReview}>Under Review</option>
                                         <option value={FrontendDocumentStatus.Approved}>Approved</option>
                                         <option value={FrontendDocumentStatus.Rejected}>Rejected</option>
                                     </select>
                                 </div>
                                  <div>
                                     <label htmlFor={`docComments-${document.id}`} className="block text-gray-700 text-sm font-bold mb-2">Comments:</label>
                                      <textarea
                                         id={`docComments-${document.id}`}
                                         value={documentUpdates[document.id]?.officerComments || document.officer_comments || ''} // Use state if available
                                         onChange={(e) => handleDocumentUpdateChange(document.id, 'officerComments', e.target.value)}
                                         rows={2}
                                         className="w-full px-3 py-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                                         placeholder="Add review comments..."
                                      />
                                  </div>
                             </div>
                              <div className="flex justify-between items-center">
                                   <button
                                      onClick={() => handleViewDocument(document.file_path)}
                                      className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg font-semibold hover:bg-gray-400 transition-colors duration-200 text-sm"
                                   >
                                       View Document
                                   </button>
                                    <button
                                      onClick={() => handleSaveDocumentStatus(document.id)}
                                       disabled={savingDocumentStatus[document.id] || !documentUpdates[document.id]?.status}
                                      className={`px-4 py-2 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-colors duration-200 text-sm ${savingDocumentStatus[document.id] ? 'opacity-50 cursor-not-allowed' : ''}`}
                                  >
                                       {savingDocumentStatus[document.id] ? <FaSpinner className="animate-spin inline mr-2" /> : ''} Save Status
                                   </button>
                              </div>

                         </div>
                     ))}
                 </div>
             )}
        </div>


      </div>
      {/* No bottom nav */}
    </div>
  );
};

export default AppointmentDetailPage;
