import { useState } from 'react';
import { FaSpinner, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';
import api from '../api';

export default function ApiTest() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState({});

  const testEndpoints = async () => {
    setLoading(true);
    setResults({});

    const endpoints = [
      { name: 'Auth Login', url: 'auth/login/', method: 'POST', data: {
        username: 'testuser',
        password: 'testpass'
      }},
      { name: 'Auth Register', url: 'auth/register/', method: 'POST', data: {
        username: 'testuser2',
        email: 'test@example.com',
        password: 'testpass',
        role: 'sender'
      }},
      { name: 'Auth Profile', url: 'auth/profile/', method: 'GET' },
      { name: 'Jobs List', url: 'jobs/', method: 'GET' },
      { name: 'Post Job', url: 'jobs/', method: 'POST', data: {
        goods_name: 'Test Package',
        pickup_location: 'Test Pickup',
        drop_location: 'Test Drop',
        delivery_time: '2024-12-31T10:00:00Z'
      }},
      { name: 'Accounts Token', url: 'accounts/token/', method: 'POST', data: {
        username: 'testuser',
        password: 'testpass'
      }},
      { name: 'Accounts Register', url: 'accounts/register/', method: 'POST', data: {
        username: 'testuser3',
        email: 'test2@example.com',
        password: 'testpass',
        role: 'sender'
      }},
      { name: 'Accounts Profile', url: 'accounts/profile/', method: 'GET' },
      { name: 'Bids List', url: 'bids/', method: 'GET' },
      { name: 'Chat Messages', url: 'chats/', method: 'GET' },
      { name: 'Simple Token', url: 'token/', method: 'POST', data: {
        username: 'testuser',
        password: 'testpass'
      }},
      { name: 'Simple Register', url: 'register/', method: 'POST', data: {
        username: 'testuser4',
        email: 'test3@example.com',
        password: 'testpass',
        role: 'sender'
      }},
      { name: 'Simple Profile', url: 'profile/', method: 'GET' },
      { name: 'User Endpoint', url: 'user/', method: 'GET' }
    ];

    const newResults = {};

    for (const endpoint of endpoints) {
      try {
        let response;
        if (endpoint.method === 'GET') {
          response = await api.get(endpoint.url);
        } else if (endpoint.method === 'POST') {
          response = await api.post(endpoint.url, endpoint.data);
        }
        
        newResults[endpoint.name] = {
          success: true,
          status: response.status,
          data: typeof response.data === 'object' ? JSON.stringify(response.data, null, 2) : response.data
        };
      } catch (error) {
        newResults[endpoint.name] = {
          success: false,
          status: error.response?.status,
          error: typeof error.response?.data === 'object' 
            ? JSON.stringify(error.response.data, null, 2) 
            : error.response?.data || error.message
        };
      }
    }

    setResults(newResults);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">API Connection Test</h1>
          
          <button
            onClick={testEndpoints}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2 mb-8"
          >
            {loading ? (
              <>
                <FaSpinner className="animate-spin h-5 w-5" />
                <span>Testing...</span>
              </>
            ) : (
              <span>Test All Endpoints</span>
            )}
          </button>

          <div className="space-y-4">
            {Object.entries(results).map(([name, result]) => (
              <div key={name} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-800">{name}</h3>
                  {result.success ? (
                    <FaCheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <FaExclamationCircle className="h-5 w-5 text-red-500" />
                  )}
                </div>
                
                <div className="text-sm">
                  <p className="text-gray-600">Status: {result.status || 'N/A'}</p>
                  
                  {result.success ? (
                    <div className="mt-2">
                      <p className="text-green-600 font-medium">✓ Success</p>
                      <pre className="mt-2 bg-gray-100 p-2 rounded text-xs overflow-auto">
                        {JSON.stringify(result.data, null, 2)}
                      </pre>
                    </div>
                  ) : (
                    <div className="mt-2">
                      <p className="text-red-600 font-medium">✗ Failed</p>
                      <pre className="mt-2 bg-red-50 p-2 rounded text-xs overflow-auto">
                        {JSON.stringify(result.error, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 