import React, { useState, useEffect } from 'react';
import TopBar from '../../components/TopBar';
import BottomNavigationBar from '../../components/BottomNavigationBar';
import api from '../../api/axios';
import { useAuth } from '../../contexts/AuthContext';
import { DocumentType, DocumentStatus } from '../../../backend/src/common/enums'; // Assuming enums are accessible or redefine
import { FaFileAlt, FaUpload } from 'react-icons/fa';
import Modal from 'react-modal'; // You might need to install react-modal

// Redefine enums if not directly accessible from backend src
enum FrontendDocumentType {
  NationalIdentityCard = 'national_identity_card',
  Passport = 'passport',
  DrivingLicense = 'driving_license',
  BirthCertificate = 'birth_certificate',
  ApplicationForm = 'application_form',
  Photograph = 'photograph',
  Other = 'other',
}

enum FrontendDocumentStatus {
  Uploaded = 'uploaded',
  UnderReview = 'under_review',
  Approved = 'approved',
  Rejected = 'rejected',
}

interface Document {
  id: string;
  document_type: FrontendDocumentType;
  status: FrontendDocumentStatus;
  file_path: string; // Note: Not used for display, just metadata
  uploaded_at: string;
  officer_comments?: string;
}

// Set app element for react-modal (important for accessibility)
Modal.setAppElement('#root'); // Replace '#root' with your app's root element ID

const DocumentsPage: React.FC = () => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedDocumentType, setSelectedDocumentType] = useState<FrontendDocumentType | ''>('');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);


  const fetchDocuments = async () => {
    if (user) {
      setLoading(true);
      try {
        const response = await api.get('/api/citizens/me/documents');
        setDocuments(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching documents:', err);
        setError('Failed to load documents.');
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [user]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    } else {
        setSelectedFile(null);
    }
  };

  const handleDocumentTypeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedDocumentType(event.target.value as FrontendDocumentType);
  };

  const handleUploadSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedFile || !selectedDocumentType) {
      setUploadError('Please select a file and document type.');
      return;
    }

    setUploading(true);
    setUploadError(null);
    setUploadSuccess(null);

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('documentType', selectedDocumentType);
    // Optionally append appointmentId if linking to an appointment:
    // if (linkedAppointmentId) { formData.append('appointmentId', linkedAppointmentId); }

    try {
      await api.post('/api/documents/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setUploadSuccess('Document uploaded successfully!');
      setIsUploadModalOpen(false); // Close modal on success
      setSelectedFile(null);
      setSelectedDocumentType('');
      fetchDocuments(); // Refresh the document list
    } catch (err: any) {
      console.error('Error uploading document:', err);
       const errorMessage = err.response?.data?.message || 'Failed to upload document. Please try again.';
      setUploadError(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  const getDocumentTypeDisplayName = (type: FrontendDocumentType): string => {
    switch (type) {
      case FrontendDocumentType.NationalIdentityCard: return 'National Identity Card';
      case FrontendDocumentType.DrivingLicense: return 'Driving License';
      case FrontendDocumentType.BirthCertificate: return 'Birth Certificate';
      case FrontendDocumentType.ApplicationForm: return 'Application Form';
      // Add more cases for other enums
      default: return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()); // Basic formatting
    }
  };

   const getDocumentStatusDisplayName = (status: FrontendDocumentStatus): string => {
       switch (status) {
           case FrontendDocumentStatus.UnderReview: return 'Under Review';
           default: return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()); // Basic formatting
       }
   };

   const getStatusColor = (status: FrontendDocumentStatus): string => {
       switch (status) {
           case FrontendDocumentStatus.Approved: return 'bg-green-100 text-green-800';
           case FrontendDocumentStatus.Rejected: return 'bg-red-100 text-red-800';
           case FrontendDocumentStatus.UnderReview: return 'bg-yellow-100 text-yellow-800';
           default: return 'bg-gray-200 text-gray-800';
       }
   };


  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <TopBar />
      <div className="flex-grow p-4 pb-20"> {/* Add padding-bottom */}
        <h1 className="text-2xl font-bold mb-4 text-gray-800">My Documents</h1>

        {error && <div className="text-red-500 mb-4">{error}</div>}
        {uploadSuccess && <div className="text-green-500 mb-4">{uploadSuccess}</div>}
        {uploadError && <div className="text-red-500 mb-4">{uploadError}</div>}


        {/* Document List */}
        <div className="mb-6 space-y-3">
          {loading ? (
            <div className="text-gray-600">Loading documents...</div>
          ) : documents.length === 0 ? (
            <div className="text-gray-600">You have not uploaded any documents yet.</div>
          ) : (
            documents.map(document => (
              <div key={document.id} className="bg-white p-4 rounded-lg shadow flex items-center">
                <FaFileAlt className="text-blue-500 text-2xl mr-4" />
                <div className="flex-grow">
                  <h3 className="text-lg font-semibold text-gray-800">{getDocumentTypeDisplayName(document.document_type)}</h3>
                  <p className="text-sm text-gray-600">Uploaded: {format(new Date(document.uploaded_at), 'PPP')}</p>
                  {document.officer_comments && (
                      <p className="text-sm text-gray-700 mt-1 italic">Comments: {document.officer_comments}</p>
                  )}
                </div>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ml-4 ${getStatusColor(document.status)}`}>
                    {getDocumentStatusDisplayName(document.status)}
                </span>
                {/* Optional: Add view/download button here */}
              </div>
            ))
          )}
        </div>

        {/* Add Document Button */}
        <button
          onClick={() => setIsUploadModalOpen(true)}
          className="w-full py-3 bg-blue-500 text-white rounded-lg font-semibold text-lg hover:bg-blue-600 transition-colors duration-200 flex items-center justify-center"
        >
          <FaUpload className="mr-2" /> Add Document
        </button>

        {/* Upload Modal */}
        <Modal
          isOpen={isUploadModalOpen}
          onRequestClose={() => setIsUploadModalOpen(false)}
          contentLabel="Upload Document Modal"
          className="Modal"
          overlayClassName="Overlay"
        >
          <div className="p-6 bg-white rounded-lg shadow-xl max-w-sm mx-auto mt-20">
            <h2 className="text-xl font-bold mb-4 text-gray-800">Upload New Document</h2>
            <form onSubmit={handleUploadSubmit}>
              <div className="mb-4">
                <label htmlFor="documentType" className="block text-gray-700 text-sm font-bold mb-2">Document Type:</label>
                <select
                  id="documentType"
                  value={selectedDocumentType}
                  onChange={handleDocumentTypeChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                >
                  <option value="">-- Select Type --</option>
                  {Object.values(FrontendDocumentType).map(type => (
                    <option key={type} value={type}>{getDocumentTypeDisplayName(type)}</option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                 <label htmlFor="file" className="block text-gray-700 text-sm font-bold mb-2">Select File:</label>
                <input
                  type="file"
                  id="file"
                  onChange={handleFileChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                />
                 {selectedFile && <p className="text-sm text-gray-600 mt-1">Selected: {selectedFile.name}</p>}
              </div>
              {uploadError && <div className="text-red-500 text-sm mb-4">{uploadError}</div>}
              <div className="flex items-center justify-between">
                <button
                  type="submit"
                  disabled={uploading || !selectedFile || !selectedDocumentType}
                  className={`bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {uploading ? 'Uploading...' : 'Upload'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800"
                  disabled={uploading}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </Modal>

      </div>
      <BottomNavigationBar />
    </div>
  );
};

export default DocumentsPage;

// Basic styles for the modal (can be moved to CSS file)
const customModalStyles = `
.Modal {
  position: absolute;
  top: 40%;
  left: 50%;
  right: auto;
  bottom: auto;
  marginRight: -50%;
  transform: translate(-50%, -50%);
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  outline: none;
}

.Overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  backgroundColor: rgba(0, 0, 0, 0.75);
  z-index: 1000; /* Ensure it's above other content */
}
`;

// Inject modal styles (alternative to importing a CSS file)
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.type = 'text/css';
  styleElement.innerHTML = customModalStyles;
  document.head.appendChild(styleElement);
}
