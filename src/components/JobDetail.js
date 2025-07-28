import { useParams, Link, useNavigate } from 'react-router-dom';  
import { useEffect, useState } from 'react';
import { FaMapMarkerAlt, FaClock, FaDollarSign, FaComments, FaSpinner, FaExclamationCircle, FaCheckCircle, FaArrowLeft, FaUser } from 'react-icons/fa';
import { useUser } from '../contexts/UserContext';
import api from '../api';

export default function JobDetail() {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [bids, setBids] = useState([]);
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [bidLoading, setBidLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [userBid, setUserBid] = useState(null);
  const navigate = useNavigate();
  const { user, isSender, isTraveler } = useUser();

  useEffect(() => {
    loadJob();
    loadBids();
  }, [id]);

  const loadJob = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('Loading job details for ID:', id);
      
      // Try different possible endpoints
      let response;
      try {
        response = await api.get(`jobs/${id}/`);
      } catch (err) {
        if (err.response?.status === 404) {
          response = await api.get(`job/${id}/`);
        } else {
          throw err;
        }
      }
      
      console.log('Job details loaded:', response.data);
      setJob(response.data);
    } catch (err) {
      console.error('Failed to load job details:', err);
      let errorMessage = 'Failed to load job details. Please try again.';
      if (err.response?.data?.detail) {
        errorMessage = err.response.data.detail;
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const loadBids = async () => {
    try {
      console.log('Loading bids for job ID:', id);
      
      // Try different possible endpoints
      let response;
      try {
        response = await api.get(`bids/?job=${id}`);
      } catch (err) {
        if (err.response?.status === 404) {
          try {
            response = await api.get(`bid/?job=${id}`);
          } catch (err2) {
            if (err2.response?.status === 404) {
              response = await api.get(`jobs/${id}/bids/`);
            } else {
              throw err2;
            }
          }
        } else {
          throw err;
        }
      }
      
      console.log('Bids loaded:', response.data);
      const bidsData = Array.isArray(response.data) ? response.data : [];
      setBids(bidsData);
      
      // Check if current user has already bid
      const currentUserBid = bidsData.find(bid => 
        bid.traveler_username === user?.username || 
        bid.traveler === user?.id ||
        bid.traveler_id === user?.id
      );
      setUserBid(currentUserBid);
    } catch (err) {
      console.error('Failed to load bids:', err);
      setBids([]);
    }
  };

  const submitBid = async (e) => {
    e.preventDefault();
    setBidLoading(true);
    setError('');
    setSuccess('');

    if (!amount || !message) {
      setError('Please fill in both amount and message.');
      setBidLoading(false);
      return;
    }

    if (parseFloat(amount) <= 0) {
      setError('Bid amount must be greater than 0.');
      setBidLoading(false);
      return;
    }
    try {
      const bidData = { 
        job: id, 
        amount: parseFloat(amount), 
        message 
      };
      
      console.log('Submitting bid:', bidData);
      
      // Try different possible endpoints
      let response;
      try {
        response = await api.post('bids/', bidData);
      } catch (err) {
        if (err.response?.status === 404) {
          response = await api.post('bid/', bidData);
        } else {
          throw err;
        }
      }
      
      console.log('Bid submitted successfully:', response.data);
      setSuccess('Bid placed successfully! You can now chat with the sender.');
      setAmount('');
      setMessage('');
      loadBids(); // Reload bids to update userBid
    } catch (err) {
      console.error('Failed to place bid:', err);
      let errorMessage = 'Failed to place bid. Please try again.';
      if (err.response?.data?.detail) {
        errorMessage = err.response.data.detail;
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.response?.data?.amount) {
        errorMessage = `Amount: ${err.response.data.amount[0]}`;
      } else if (err.response?.data?.message) {
        errorMessage = `Message: ${err.response.data.message[0]}`;
      } else if (err.message) {
        errorMessage = err.message;
      }
      setError(errorMessage);
    } finally {
      setBidLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin h-8 w-8 text-green-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading job details...</p>
        </div>
      </div>
    );
  }

  if (error && !job) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaExclamationCircle className="h-8 w-8 text-red-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Error Loading Job</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadJob}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!job) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/jobs')}
              className="text-gray-600 hover:text-gray-800 transition-colors duration-200"
            >
              <FaArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">{job.goods_name}</h1>
              <p className="text-gray-600 mt-1">
                {isSender ? 'Job Details & Bids' : 'Job Details & Bidding'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Job Details */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Job Information</h2>
              
              <div className="space-y-6">
                {/* Goods Name */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Goods</h3>
                  <p className="text-gray-600">{job.goods_name}</p>
                </div>

                {/* Pickup Location */}
                <div className="flex items-start space-x-3">
                  <FaMapMarkerAlt className="h-5 w-5 text-red-500 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-1">Pickup Location</h3>
                    <p className="text-gray-600">{job.pickup_location}</p>
                  </div>
                </div>

                {/* Delivery Location */}
                <div className="flex items-start space-x-3">
                  <FaMapMarkerAlt className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-1">Delivery Location</h3>
                    <p className="text-gray-600">{job.drop_location}</p>
                  </div>
                </div>

                {/* Delivery Time */}
                <div className="flex items-start space-x-3">
                  <FaClock className="h-5 w-5 text-blue-500 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-1">Delivery Time</h3>
                    <p className="text-gray-600">{formatDate(job.delivery_time)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bid Form or Chat */}
          <div className="space-y-6">
            {/* For Travelers: Show bid form if not bid yet, or chat if already bid */}
            {isTraveler && (
              <>
                {!userBid ? (
                  <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">Place Your Bid</h2>
                    
                    <form onSubmit={submitBid} className="space-y-6">
                      {/* Success Message */}
                      {success && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center space-x-3">
                          <FaCheckCircle className="text-green-500 flex-shrink-0" />
                          <span className="text-green-700 text-sm">{success}</span>
                        </div>
                      )}

                      {/* Error Message */}
                      {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3">
                          <FaExclamationCircle className="text-red-500 flex-shrink-0" />
                          <span className="text-red-700 text-sm">{error}</span>
                        </div>
                      )}

                      {/* Bid Amount */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Your Bid Amount ($)
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FaDollarSign className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors duration-200"
                            placeholder="Enter your bid amount"
                            required
                          />
                        </div>
                      </div>

                      {/* Bid Message */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Message to Sender
                        </label>
                        <textarea
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          rows="4"
                          className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors duration-200"
                          placeholder="Tell the sender about your experience, vehicle, or any special considerations..."
                          required
                        />
                      </div>

                      {/* Submit Button */}
                      <button
                        type="submit"
                        disabled={bidLoading}
                        className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
                      >
                        {bidLoading ? (
                          <>
                            <FaSpinner className="animate-spin h-5 w-5" />
                            <span>Placing Bid...</span>
                          </>
                        ) : (
                          <>
                            <FaDollarSign className="h-5 w-5" />
                            <span>Place Bid</span>
                          </>
                        )}
                      </button>
                    </form>
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
                    <div className="text-center">
                      <FaComments className="h-8 w-8 text-green-500 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">Bid Placed Successfully!</h3>
                      <p className="text-gray-600 mb-4">You can now chat with the sender about delivery details.</p>
                      <Link
                        to={`/chat/${job.id}`}
                        className="inline-flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
                      >
                        <FaComments className="h-4 w-4" />
                        <span>Open Chat</span>
                      </Link>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* For Senders: Show bids list */}
            {isSender && (
              <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Bids Received</h2>
                
                {bids.length === 0 ? (
                  <div className="text-center py-8">
                    <FaUser className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">No Bids Yet</h3>
                    <p className="text-gray-600">Travelers will be able to bid on your job once they see it.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {bids.map((bid, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <FaUser className="h-4 w-4 text-gray-500" />
                            <span className="font-medium text-gray-800">{bid.traveler_username}</span>
                          </div>
                          <span className="text-lg font-bold text-green-600">${bid.amount}</span>
                        </div>
                        <p className="text-gray-600 text-sm mb-3">{bid.message}</p>
                        <div className="flex items-center space-x-2">
                          <Link
                            to={`/chat/${job.id}`}
                            className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
                          >
                            <FaComments className="h-3 w-3" />
                            <span>Chat</span>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
