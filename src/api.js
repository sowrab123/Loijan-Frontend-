import axios from 'axios';
import mockBackend from './components/MockBackend';

const api = axios.create({
  baseURL: 'http://localhost:8000/api/',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Flag to enable/disable mock mode
const USE_MOCK_BACKEND = true; // Set to false when real backend is available
// Attach token automatically
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    // Set current user in mock backend
    if (USE_MOCK_BACKEND) {
      mockBackend.setCurrentUserFromToken(token);
    }
  }
  return config;
});

// Handle response errors
api.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', error.response || error);
    
    // If using mock backend and real API fails, try mock
    if (USE_MOCK_BACKEND && error.code === 'ERR_NETWORK') {
      return handleMockRequest(error.config);
    }
    
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      if (window.location.pathname !== '/' && window.location.pathname !== '/register') {
        window.location.href = '/';
      }
    }
    return Promise.reject(error);
  }
);

// Mock request handler
const handleMockRequest = async (config) => {
  console.log('Using mock backend for:', config.method.toUpperCase(), config.url);
  
  try {
    const url = config.url.replace(config.baseURL, '');
    const method = config.method.toUpperCase();
    const data = config.data ? JSON.parse(config.data) : null;
    
    let result;
    
    // Auth endpoints
    if (url.includes('auth/login') || url.includes('accounts/token') || url.includes('token')) {
      if (method === 'POST') {
        result = mockBackend.login(data.username, data.password);
      }
    } else if (url.includes('auth/register') || url.includes('accounts/register') || url.includes('register')) {
      if (method === 'POST') {
        result = mockBackend.register(data);
      }
    } else if (url.includes('auth/profile') || url.includes('accounts/profile') || url.includes('profile') || url.includes('user')) {
      if (method === 'GET') {
        result = mockBackend.getProfile();
      } else if (method === 'PUT') {
        result = mockBackend.updateProfile(data);
      }
    }
    // Jobs endpoints
    else if (url.includes('jobs/my-jobs')) {
      if (method === 'GET') {
        const currentUser = mockBackend.getProfile();
        result = mockBackend.getJobs(currentUser.id);
      }
    } else if (url.match(/jobs\/\d+\//)) {
      const jobId = url.match(/jobs\/(\d+)\//)[1];
      if (method === 'GET') {
        result = mockBackend.getJob(jobId);
      }
    } else if (url.includes('jobs') || url.includes('job')) {
      if (method === 'GET') {
        result = mockBackend.getJobs();
      } else if (method === 'POST') {
        result = mockBackend.createJob(data);
      }
    }
    // Bids endpoints
    else if (url.includes('bids') || url.includes('bid')) {
      if (method === 'GET') {
        const jobId = new URLSearchParams(url.split('?')[1] || '').get('job');
        result = mockBackend.getBids(jobId);
      } else if (method === 'POST') {
        result = mockBackend.createBid(data);
      }
    }
    // Messages endpoints
    else if (url.includes('chats') || url.includes('chat') || url.includes('messages')) {
      if (method === 'GET') {
        const jobId = new URLSearchParams(url.split('?')[1] || '').get('job_id') || 
                     new URLSearchParams(url.split('?')[1] || '').get('job');
        result = mockBackend.getMessages(jobId);
      } else if (method === 'POST') {
        result = mockBackend.createMessage(data);
      }
    }
    
    if (result !== undefined) {
      return Promise.resolve({
        data: result,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: config
      });
    } else {
      throw new Error('Mock endpoint not implemented');
    }
  } catch (error) {
    console.error('Mock backend error:', error);
    return Promise.reject({
      response: {
        data: { detail: error.message },
        status: 400,
        statusText: 'Bad Request'
      },
      config: config
    });
  }
};
export default api;
