// App.js
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { UserProvider } from './contexts/UserContext';
import Navbar from './components/Navbar';
import Login from './components/Login';
import Register from './components/Register';
import JobsList from './components/JobsList';
import JobDetail from './components/JobDetail';
import PostJob from './components/PostJob';
import Chat from './components/Chat';
import Profile from './components/Profile';
import ApiTest from './components/ApiTest';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || '');

  useEffect(() => {
    // Sync token state with localStorage
    const handleStorageChange = () => {
      const newToken = localStorage.getItem('token') || '';
      setToken(newToken);
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);
  return (
    <UserProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-gray-50">
          <Navbar token={token} setToken={setToken} />
          <Routes>
            <Route path="/" element={<Login setToken={setToken} />} />
            <Route path="/register" element={<Register />} />
            <Route path="/jobs" element={<JobsList />} />
            <Route path="/jobs/:id" element={<JobDetail />} />
            <Route path="/post-job" element={<PostJob />} />
            <Route path="/chat/:jobId" element={<Chat />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/api-test" element={<ApiTest />} />
          </Routes>
        </div>
      </BrowserRouter>
    </UserProvider>
  );
}

export default App;
