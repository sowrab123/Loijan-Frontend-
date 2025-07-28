import { Link, useNavigate } from 'react-router-dom';
import { FaHome, FaPlus, FaSignOutAlt, FaUser, FaUserCircle } from 'react-icons/fa';
import { useUser } from '../contexts/UserContext';

export default function Navbar({ token, setToken }) {
  const navigate = useNavigate();
  const { user, logout, isSender } = useUser();

  const handleLogout = () => {
    logout();
    setToken('');
    navigate('/');
  };

  if (!token) return null;

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link to="/jobs" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">L</span>
              </div>
              <span className="text-xl font-bold text-gray-800">Loijan</span>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              to="/jobs" 
              className="flex items-center space-x-2 text-gray-700 hover:text-green-600 transition-colors duration-200"
            >
              <FaHome className="w-4 h-4" />
              <span>Dashboard</span>
            </Link>
            
            {/* Show Post Job only for senders */}
            {isSender && (
              <Link 
                to="/post-job" 
                className="flex items-center space-x-2 text-gray-700 hover:text-green-600 transition-colors duration-200"
              >
                <FaPlus className="w-4 h-4" />
                <span>Post Job</span>
              </Link>
            )}
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            <Link
              to="/profile"
              className="flex items-center space-x-2 text-gray-600 hover:text-green-600 transition-colors duration-200"
            >
              <FaUserCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Profile</span>
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors duration-200"
            >
              <FaSignOutAlt className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
} 