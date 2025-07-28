// components/JobsList.js
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaTruck, FaMapMarkerAlt, FaClock, FaEye, FaSpinner, FaInbox } from 'react-icons/fa';
import { useUser } from '../contexts/UserContext';
import api from '../api';

export default function JobsList() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { isSender, user } = useUser();

  useEffect(() => {
    loadJobs();
  }, [isSender]);

  const loadJobs = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('Loading jobs for user:', user);
      
      // Try different possible endpoints
      let response;
      try {
        if (isSender) {
          // Try to get sender's own jobs first
          try {
            response = await api.get('jobs/my-jobs/');
          } catch (err) {
            if (err.response?.status === 404) {
              // Fallback to all jobs and filter client-side
              response = await api.get('jobs/');
              if (user && user.id) {
                response.data = response.data.filter(job => job.sender === user.id || job.sender_id === user.id);
              }
            } else {
              throw err;
            }
          }
        } else {
          // For travelers, get all available jobs
          response = await api.get('jobs/');
        }
      } catch (err) {
        if (err.response?.status === 404) {
          // Try alternative endpoint
          response = await api.get('job/');
        } else {
          throw err;
        }
      }
      
      console.log('Jobs loaded:', response.data);
      setJobs(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error('Error loading jobs:', err);
      
      let errorMessage = 'Failed to load jobs. Please try again.';
      if (err.response?.data?.detail) {
        errorMessage = err.response.data.detail;
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
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
          <p className="text-gray-600">Loading available jobs...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaInbox className="h-8 w-8 text-red-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Error Loading Jobs</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadJobs}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                {isSender ? 'My Posted Jobs' : 'Available Jobs'}
              </h1>
              <p className="text-gray-600 mt-1">
                {isSender 
                  ? 'Manage your delivery jobs and view bids' 
                  : 'Find delivery opportunities that match your route'
                }
              </p>
            </div>
            {/* Show Post New Job button only for senders */}
            {isSender && (
              <Link
                to="/post-job"
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2"
              >
                <FaTruck className="h-4 w-4" />
                <span>Post New Job</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {jobs.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FaInbox className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              {isSender ? 'No Jobs Posted Yet' : 'No Jobs Available'}
            </h3>
            <p className="text-gray-600 mb-6">
              {isSender 
                ? 'Start by posting your first delivery job!' 
                : 'There are currently no delivery jobs posted. Check back later!'
              }
            </p>
            {isSender && (
              <Link
                to="/post-job"
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 inline-flex items-center space-x-2"
              >
                <FaTruck className="h-4 w-4" />
                <span>Post First Job</span>
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map(job => (
              <Link 
                to={`/jobs/${job.id}`} 
                key={job.id} 
                className="group block bg-white rounded-xl shadow-sm hover:shadow-lg border border-gray-200 transition-all duration-200 overflow-hidden"
              >
                <div className="p-6">
                  {/* Job Title */}
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-800 group-hover:text-green-600 transition-colors duration-200">
                      {job.goods_name}
                    </h3>
                    <div className="flex items-center space-x-2 text-green-600">
                      <FaEye className="h-4 w-4" />
                    </div>
                  </div>

                  {/* Location Details */}
                  <div className="space-y-3 mb-4">
                    <div className="flex items-start space-x-3">
                      <FaMapMarkerAlt className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-gray-700">Pickup</p>
                        <p className="text-sm text-gray-600">{job.pickup_location}</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <FaMapMarkerAlt className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-gray-700">Delivery</p>
                        <p className="text-sm text-gray-600">{job.drop_location}</p>
                      </div>
                    </div>
                  </div>

                  {/* Delivery Time */}
                  <div className="flex items-center space-x-3 mb-4">
                    <FaClock className="h-4 w-4 text-blue-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">Delivery Time</p>
                      <p className="text-sm text-gray-600">{formatDate(job.delivery_time)}</p>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="pt-4 border-t border-gray-100">
                    <div className="bg-green-50 group-hover:bg-green-100 rounded-lg p-3 transition-colors duration-200">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-green-700">
                          {isSender ? 'View Bids' : 'View Details'}
                        </span>
                        <FaEye className="h-4 w-4 text-green-600" />
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
