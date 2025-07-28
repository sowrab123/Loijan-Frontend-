// components/PostJob.js
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaTruck, FaMapMarkerAlt, FaClock, FaSpinner, FaCheckCircle, FaExclamationCircle, FaArrowLeft } from 'react-icons/fa';
import api from '../api';

export default function PostJob() {
  const [form, setForm] = useState({
    goods_name: '',
    pickup_location: '',
    drop_location: '',
    delivery_time: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Basic validation
    if (!form.goods_name || !form.pickup_location || !form.drop_location || !form.delivery_time) {
      setError('All fields are required');
      setLoading(false);
      return;
    }

    // Validate delivery time is in the future
    const deliveryDate = new Date(form.delivery_time);
    const now = new Date();
    if (deliveryDate <= now) {
      setError('Delivery time must be in the future');
      setLoading(false);
      return;
    }

    try {
      console.log('Submitting job data:', form);
      
      // Format the data properly
      const jobData = {
        ...form,
        delivery_time: new Date(form.delivery_time).toISOString()
      };
      
      console.log('Formatted job data:', jobData);
      
      const response = await api.post('jobs/', jobData);
      
      console.log('Job posted successfully:', response.data);
      setSuccess(true);
      setTimeout(() => {
        navigate('/jobs');
      }, 1500);
    } catch (err) {
      console.error('Post Job Error:', err);
      console.error('Error response:', err.response);
      console.error('Error data:', err.response?.data);
      
      let errorMessage = 'Failed to post job. Please try again.';
      
      if (err.response?.data) {
        if (err.response.data.message) {
          errorMessage = err.response.data.message;
        } else if (err.response.data.detail) {
          errorMessage = err.response.data.detail;
        } else if (err.response.data.error) {
          errorMessage = err.response.data.error;
        } else if (err.response.data.goods_name) {
          errorMessage = `Goods name: ${err.response.data.goods_name[0]}`;
        } else if (err.response.data.pickup_location) {
          errorMessage = `Pickup location: ${err.response.data.pickup_location[0]}`;
        } else if (err.response.data.drop_location) {
          errorMessage = `Drop location: ${err.response.data.drop_location[0]}`;
        } else if (err.response.data.delivery_time) {
          errorMessage = `Delivery time: ${err.response.data.delivery_time[0]}`;
        } else if (typeof err.response.data === 'string') {
          errorMessage = err.response.data;
        } else if (err.response.data.non_field_errors) {
          errorMessage = err.response.data.non_field_errors[0];
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setForm({ ...form, [field]: value });
    if (error) setError(''); // Clear error when user starts typing
  };

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
              <h1 className="text-3xl font-bold text-gray-800">Post New Job</h1>
              <p className="text-gray-600 mt-1">Create a new delivery job for travelers</p>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Success Message */}
            {success && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center space-x-3">
                <FaCheckCircle className="text-green-500 flex-shrink-0" />
                <span className="text-green-700 text-sm">Job posted successfully! Redirecting to dashboard...</span>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3">
                <FaExclamationCircle className="text-red-500 flex-shrink-0" />
                <span className="text-red-700 text-sm">{error}</span>
              </div>
            )}

            {/* Goods Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Goods Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaTruck className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={form.goods_name}
                  onChange={(e) => handleInputChange('goods_name', e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors duration-200"
                  placeholder="e.g., Electronics, Furniture, Documents"
                  required
                />
              </div>
            </div>

            {/* Pickup Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pickup Location
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaMapMarkerAlt className="h-5 w-5 text-red-500" />
                </div>
                <input
                  type="text"
                  value={form.pickup_location}
                  onChange={(e) => handleInputChange('pickup_location', e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors duration-200"
                  placeholder="e.g., 123 Main St, City, State"
                  required
                />
              </div>
            </div>

            {/* Drop Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Delivery Location
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaMapMarkerAlt className="h-5 w-5 text-green-500" />
                </div>
                <input
                  type="text"
                  value={form.drop_location}
                  onChange={(e) => handleInputChange('drop_location', e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors duration-200"
                  placeholder="e.g., 456 Oak Ave, City, State"
                  required
                />
              </div>
            </div>

            {/* Delivery Time */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Delivery Time
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaClock className="h-5 w-5 text-blue-500" />
                </div>
                <input
                  type="datetime-local"
                  value={form.delivery_time}
                  onChange={(e) => handleInputChange('delivery_time', e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors duration-200"
                  required
                />
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Select the preferred delivery date and time
              </p>
            </div>

            {/* Submit Button */}
            <div className="pt-6">
              <button
                type="submit"
                disabled={loading || success}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <>
                    <FaSpinner className="animate-spin h-5 w-5" />
                    <span>Posting Job...</span>
                  </>
                ) : (
                  <>
                    <FaTruck className="h-5 w-5" />
                    <span>Post Job</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
