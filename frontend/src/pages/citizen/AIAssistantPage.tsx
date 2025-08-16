import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaPaperPlane, FaSpinner } from 'react-icons/fa'; // Import necessary icons
import api from '../../api/axios'; // Assuming axios instance is set up
// Removed the backend DTO import as interfaces are redefined below
// Removed unused icons: FaMicrophone, FaPaperclip


// Redefine DTO if not directly accessible from backend src
interface FrontendAiChatResponseDto {
  responseText: string;
  suggestedActionType?: string;
  suggestedActionValue?: string;
  suggestedActionDetails?: any; // Match backend structure
}

interface Message {
  text: string;
  sender: 'user' | 'ai';
  suggestedAction?: {
    type?: string;
    value?: string;
    details?: any;
  };
}

const AIAssistantPage: React.FC = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null); // Ref for auto-scrolling

  // Auto-scroll to the latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (input.trim() === '') return;

    const userMessage: Message = { text: input, sender: 'user' };
    setMessages([...messages, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await api.post<FrontendAiChatResponseDto>('/ai-chat', { prompt: input }); // Adjust endpoint if needed
      const aiResponse: Message = {
        text: response.data.responseText,
        sender: 'ai',
        suggestedAction: response.data.suggestedActionType ? {
          type: response.data.suggestedActionType,
          value: response.data.suggestedActionValue,
          details: response.data.suggestedActionDetails,
        } : undefined,
      };
      setMessages(prevMessages => [...prevMessages, aiResponse]);
    } catch (error) {
      console.error('Error sending message to AI:', error);
      const errorMessage: Message = { text: 'Sorry, I could not process your request at this time.', sender: 'ai' };
      setMessages(prevMessages => [...prevMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

    const handleSuggestedAction = (actionType?: string, actionValue?: string, actionDetails?: any) => {
      // Implement logic based on the suggested action type
      console.log('Suggested Action:', actionType, actionValue, actionDetails);
      if (actionType === 'navigate' && actionValue) {
        navigate(actionValue);
      }
      // Add other action types here (e.g., 'book_appointment', 'upload_document')
      // You might want to open a modal or navigate to a specific page with details
       if (actionType === 'suggest_service_booking' && actionDetails?.serviceId) {
            // Example: Navigate to a service booking page with pre-filled service ID
            navigate(`/citizen/services/${actionDetails.serviceId}/book`);
        }
        // Example: Handle a complex action like "upload document" which might need a modal or specific flow
        if (actionType === 'request_document_upload' && actionDetails?.documentType) {
            // This might trigger a modal or navigate to the document upload page
             alert(`Suggested action: Upload document of type "${actionDetails.documentType}". Implementation needed.`);
             // navigate('/citizen/documents'); // Or navigate to a specific upload component
        }
    };


  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { // Send on Enter, allow new line with Shift + Enter
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Top Bar with Back Button */}
      <div className="bg-primary text-white p-4 flex items-center shadow-md">
        <button onClick={() => navigate(-1)} className="flex items-center text-white mr-4">
          <FaArrowLeft className="mr-2" /> Back
        </button>
        <h1 className="text-xl font-bold">AI Assistant</h1>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-100">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`p-3 rounded-lg max-w-xs ${
                message.sender === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-300 text-gray-800'
              }`}
            >
              <p>{message.text}</p>
               {message.suggestedAction && (
                   <div className="mt-2 text-sm text-blue-800 cursor-pointer hover:underline"
                        onClick={() => handleSuggestedAction(message.suggestedAction?.type, message.suggestedAction?.value, message.suggestedAction?.details)}>
                       Suggested Action: Click to {message.suggestedAction.type}...
                   </div>
               )}
            </div>
          </div>
        ))}
         {isLoading && (
             <div className="flex justify-start">
                 <div className="p-3 rounded-lg max-w-xs bg-gray-300 text-gray-800">
                    {/* Using the imported FaSpinner */}
                    <FaSpinner className="animate-spin inline mr-2" /> Thinking...
                 </div>
             </div>
         )}
        <div ref={messagesEndRef} /> {/* Invisible element to scroll to */}
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t flex items-center">
        {/* File Attachment Icon - Currently unused */}
        {/* <button className="mr-2 text-gray-500 hover:text-gray-700">
            <FaPaperclip className="text-xl" />
        </button> */}

        <input
          type="text"
          className="flex-1 border rounded-full py-2 px-4 mr-2 focus:outline-none focus:ring-primary focus:border-primary"
          placeholder="Type a message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={isLoading} // Disable input while loading
        />
        <button
          onClick={handleSendMessage}
          className="bg-primary text-white rounded-full p-3 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isLoading || input.trim() === ''} // Disable button while loading or input is empty
        >
          <FaPaperPlane className="text-xl" />
        </button>
        {/* Microphone Icon - Currently unused */}
        {/* <button className="ml-2 text-gray-500 hover:text-gray-700" disabled={isLoading}>
            <FaMicrophone className="text-xl" />
        </button> */}
      </div>
    </div>
  );
};

export default AIAssistantPage;
