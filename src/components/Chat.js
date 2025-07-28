import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaPaperPlane, FaSpinner, FaComments, FaUser } from 'react-icons/fa';
import api from '../api';

export default function Chat() {
  const { jobId } = useParams();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadMessages();
    const interval = setInterval(loadMessages, 5000); // poll every 5 sec
    return () => clearInterval(interval);
  }, [jobId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadMessages = async () => {
    try {
      console.log('Loading messages for job ID:', jobId);
      
      // Try different possible endpoints
      let response;
      try {
        response = await api.get(`chats/?job_id=${jobId}`);
      } catch (err) {
        if (err.response?.status === 404) {
          try {
            response = await api.get(`chat/?job_id=${jobId}`);
          } catch (err2) {
            if (err2.response?.status === 404) {
              try {
                response = await api.get(`messages/?job=${jobId}`);
              } catch (err3) {
                if (err3.response?.status === 404) {
                  response = await api.get(`jobs/${jobId}/messages/`);
                } else {
                  throw err3;
                }
              }
            } else {
              throw err2;
            }
          }
        } else {
          throw err;
        }
      }
      
      console.log('Messages loaded:', response.data);
      const messagesData = Array.isArray(response.data) ? response.data : [];
      setMessages(messagesData);
      setLoading(false);
    } catch (err) {
      console.error('Failed to load messages:', err);
      let errorMessage = 'Failed to load messages. Please try again.';
      if (err.response?.data?.detail) {
        errorMessage = err.response.data.detail;
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      setError(errorMessage);
      setMessages([]);
      setLoading(false);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    setSending(true);
    setError('');
    
    try {
      const messageData = { job: jobId, text: text.trim() };
      console.log('Sending message:', messageData);
      
      // Try different possible endpoints
      let response;
      try {
        response = await api.post('chats/', messageData);
      } catch (err) {
        if (err.response?.status === 404) {
          try {
            response = await api.post('chat/', messageData);
          } catch (err2) {
            if (err2.response?.status === 404) {
              response = await api.post('messages/', messageData);
            } else {
              throw err2;
            }
          }
        } else {
          throw err;
        }
      }
      
      console.log('Message sent successfully:', response.data);
      setText('');
      loadMessages();
    } catch (err) {
      console.error('Failed to send message:', err);
      let errorMessage = 'Failed to send message. Please try again.';
      if (err.response?.data?.detail) {
        errorMessage = err.response.data.detail;
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.message) {
        errorMessage = err.message;
      }
      setError(errorMessage);
    } finally {
      setSending(false);
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin h-8 w-8 text-green-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading chat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/jobs')}
              className="text-gray-600 hover:text-gray-800 transition-colors duration-200"
            >
              <FaArrowLeft className="h-5 w-5" />
            </button>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                <FaComments className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">Job Chat</h1>
                <p className="text-sm text-gray-600">Job #{jobId}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Container */}
      <div className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 flex flex-col h-[calc(100vh-200px)]">
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            {messages.length === 0 ? (
              <div className="text-center py-12">
                <FaComments className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-800 mb-2">No Messages Yet</h3>
                <p className="text-gray-600">Start the conversation by sending a message below.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    {/* Avatar */}
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                      <FaUser className="h-4 w-4 text-gray-600" />
                    </div>
                    
                    {/* Message Bubble */}
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-sm font-medium text-gray-800">
                          {message.sender_username}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatTime(message.timestamp)}
                        </span>
                      </div>
                      <div className="bg-gray-100 rounded-2xl rounded-tl-md px-4 py-3 max-w-xs lg:max-w-md">
                        <p className="text-gray-800">{message.text}</p>
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Message Input */}
          <div className="border-t border-gray-200 p-4">
            <form onSubmit={sendMessage} className="flex space-x-3">
              <div className="flex-1">
                <input
                  type="text"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Type your message..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors duration-200"
                  disabled={sending}
                />
              </div>
              <button
                type="submit"
                disabled={sending || !text.trim()}
                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-3 rounded-lg transition-colors duration-200 flex items-center space-x-2"
              >
                {sending ? (
                  <FaSpinner className="animate-spin h-4 w-4" />
                ) : (
                  <FaPaperPlane className="h-4 w-4" />
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
