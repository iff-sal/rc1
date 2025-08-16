import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaPaperPlane, FaMicrophone, FaPaperclip } from 'react-icons/fa'; // Import icons
import api from '../../api/axios'; // Assuming axios instance is set up
import { AiChatResponseDto } from '../../../backend/src/ai-chat/dto/ai-chat.dto'; // Assuming DTOs are accessible or redefine

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
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false); // State for API loading
  const messagesEndRef = useRef<HTMLDivElement>(null); // Ref for auto-scrolling

  // Scroll to the bottom of messages on update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);


  const handleSend = async () => {
    if (inputMessage.trim() === '' || loading) {
      return; // Don't send empty messages or while loading
    }

    const userMessage: Message = { text: inputMessage, sender: 'user' };
    setMessages(prevMessages => [...prevMessages, userMessage]); // Add user message instantly
    setInputMessage(''); // Clear input
    setLoading(true); // Start loading

    try {
      const response = await api.post('/api/ai-chat', { query: inputMessage });
      const aiResponseData: FrontendAiChatResponseDto = response.data;

      const aiMessage: Message = {
        text: aiResponseData.responseText,
        sender: 'ai',
        suggestedAction: aiResponseData.suggestedActionType ? {
            type: aiResponseData.suggestedActionType,
            value: aiResponseData.suggestedActionValue,
            details: aiResponseData.suggestedActionDetails
        } : undefined
      };
      setMessages(prevMessages => [...prevMessages, aiMessage]); // Add AI response

    } catch (error) {
      console.error('Error sending message to AI:', error);
      // Add an error message to the chat
      const errorMessage: Message = { text: 'Sorry, I could not get a response from the AI. Please try again later.', sender: 'ai' };
      setMessages(prevMessages => [...prevMessages, errorMessage]);
    } finally {
      setLoading(false); // End loading
    }
  };

   const handleSuggestedActionClick = (action: Message['suggestedAction']) => {
        if (!action || !action.type || !action.value) {
            console.warn('Attempted to click a suggested action with incomplete data:', action);
            return;
        }

        // Implement navigation based on action type
        if (action.type === 'NAVIGATE_TO_SERVICE' && action.value) {
            console.log(`Navigating to service: ${action.value}`);
             navigate(`/services/${action.value}`); // Navigate to service booking page
        }
        // Add other action types as needed (e.g., OPEN_DOCUMENT, SHOW_FAQ)
        else {
            console.warn(`Unknown suggested action type: ${action.type}`);
             // Optional: Display a message to the user that the action isn't supported
        }
   };


  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault(); // Prevent default form submission
      handleSend();
    }
  };


  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Top Bar with Back Button */}
      <div className="bg-white shadow-md p-4 flex items-center">
        <button onClick={() => navigate(-1)} className="mr-4 text-gray-700 hover:text-gray-900">
          <FaArrowLeft className="text-xl" />
        </button>
        <h1 className="text-xl font-semibold text-gray-800">AI Assistant</h1>
      </div>

      {/* Chat Messages Area */}
      <div className="flex-grow overflow-y-auto p-4 space-y-4 pb-16"> {/* Added pb-16 for input overlap */}
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] p-3 rounded-lg ${
                message.sender === 'user'
                  ? 'bg-blue-500 text-white rounded-br-none'
                  : 'bg-gray-300 text-gray-800 rounded-bl-none'
              }`}
            >
              <p>{message.text}</p>
               {/* Render suggested action button */}
               {message.sender === 'ai' && message.suggestedAction?.type && message.suggestedAction.value && (
                  <button
                      onClick={() => handleSuggestedActionClick(message.suggestedAction)}
                      className="mt-2 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors duration-150"
                  >
                      {message.suggestedAction.details?.name ? `Book ${message.suggestedAction.details.name}` : 'Suggested Action'} {/* Use service name if available */}
                  </button>
               )}
            </div>
          </div>
        ))}
        {/* Auto-scroll anchor */}
        <div ref={messagesEndRef} />
         {loading && (
             <div className="flex justify-start">
                <div className="max-w-[80%] p-3 rounded-lg bg-gray-300 text-gray-800 rounded-bl-none">
                   <FaSpinner className="animate-spin inline mr-2" /> Thinking...
                </div>
             </div>
         )}
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t flex items-center fixed bottom-0 w-full"> {/* Fixed position */}
         {/* Placeholders for mic and attachment (optional) */}
         {/* <button className="mr-2 text-gray-500"><FaMicrophone className="text-xl" /></button> */}
         {/* <button className="mr-2 text-gray-500"><FaPaperclip className="text-xl" /></button> */}

        <input
          type="text"
          placeholder="Type your message..."
          className="flex-grow px-4 py-2 rounded-full bg-gray-200 focus:outline-none focus:ring-2 focus:ring-primary"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={loading} // Disable input while loading
        />
        <button
          onClick={handleSend}
          className={`ml-4 px-4 py-2 bg-blue-500 text-white rounded-full flex items-center justify-center ${inputMessage.trim() === '' || loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-600'}`}
          disabled={inputMessage.trim() === '' || loading} // Disable button
        >
          <FaPaperPlane className="text-xl" />
        </button>
      </div>
    </div>
  );
};

export default AIAssistantPage;
