import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import { FaStar } from 'react-icons/fa'; // Import star icon
import api from '../api/axios'; // Assuming axios instance
import { CreateFeedbackDto } from '../../backend/src/feedback/dto/feedback.dto'; // Assuming DTO is accessible or redefine

// Redefine DTO if not accessible
interface FrontendCreateFeedbackDto {
  appointmentId?: string;
  rating: number;
  comments?: string;
}

interface FeedbackFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointmentId?: string; // Optional appointment ID if linked to one
  onFeedbackSubmitted: () => void; // Callback to refresh data on parent
}

// Set app element for react-modal (important for accessibility)
// Ensure this is set in your main app entry point (e.g., index.tsx or main.tsx)
// Modal.setAppElement('#root'); // Or wherever your app mounts


const FeedbackFormModal: React.FC<FeedbackFormModalProps> = ({ isOpen, onClose, appointmentId, onFeedbackSubmitted }) => {
  const [rating, setRating] = useState(0);
  const [comments, setComments] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Reset form state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setRating(0);
      setComments('');
      setError(null);
      setSuccess(null);
    }
  }, [isOpen]);


  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (rating === 0) {
      setError('Please provide a rating.');
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccess(null);

    const feedbackData: FrontendCreateFeedbackDto = {
      rating,
      comments: comments.trim() === '' ? undefined : comments.trim(), // Send comments only if not empty
    };

    if (appointmentId) {
      feedbackData.appointmentId = appointmentId;
    }

    try {
      await api.post('/api/feedback', feedbackData);
      setSuccess('Feedback submitted successfully!');
       // Optionally keep modal open briefly to show success, then close
       setTimeout(() => {
          onClose(); // Close the modal
          onFeedbackSubmitted(); // Notify parent component to refresh data
       }, 1000); // Close after 1 second
    } catch (err: any) {
      console.error('Error submitting feedback:', err);
      const errorMessage = err.response?.data?.message || 'Failed to submit feedback. Please try again.';
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };


  const customModalStyles = {
    content: {
      top: '50%',
      left: '50%',
      right: 'auto',
      bottom: 'auto',
      marginRight: '-50%',
      transform: 'translate(-50%, -50%)',
      backgroundColor: '#fff',
      padding: '20px',
      borderRadius: '8px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      outline: 'none',
      maxWidth: '400px',
      width: '90%',
    },
    overlay: {
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      zIndex: 1000,
    },
  };


  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      contentLabel="Leave Feedback Modal"
      style={customModalStyles} // Apply inline styles or use CSS classes
    >
      <div className="p-4"> {/* Added padding */}
        <h2 className="text-xl font-bold mb-4 text-gray-800">Leave Feedback</h2>

        {error && <div className="text-red-500 text-sm mb-4">{error}</div>}
        {success && <div className="text-green-500 text-sm mb-4">{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">Rating:</label>
            <div className="flex items-center">
              {[1, 2, 3, 4, 5].map((starValue) => (
                <FaStar
                  key={starValue}
                  className={`cursor-pointer text-2xl ${
                    starValue <= rating ? 'text-primary' : 'text-gray-300'
                  }`}
                  onClick={() => setRating(starValue)}
                />
              ))}
            </div>
          </div>

          <div className="mb-4">
            <label htmlFor="comments" className="block text-gray-700 text-sm font-bold mb-2">Comments (Optional):</label>
            <textarea
              id="comments"
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              rows={3}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            ></textarea>
          </div>

          <div className="flex items-center justify-between">
            <button
              type="submit"
              disabled={submitting || rating === 0}
              className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${submitting || rating === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {submitting ? 'Submitting...' : 'Submit Feedback'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="inline-block align-baseline font-bold text-sm text-gray-500 hover:text-gray-800"
              disabled={submitting}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default FeedbackFormModal;
