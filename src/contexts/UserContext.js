import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api';

const UserContext = createContext();

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      loadUserProfile();
    } else {
      setLoading(false);
    }
  }, []);

  const loadUserProfile = async () => {
    try {
      console.log('Loading user profile...');
      
      // Try different possible endpoints
      let response;
      try {
        response = await api.get('auth/profile/');
      } catch (err) {
        if (err.response?.status === 404) {
          try {
            response = await api.get('accounts/profile/');
          } catch (err2) {
            if (err2.response?.status === 404) {
              try {
                response = await api.get('profile/');
              } catch (err3) {
                if (err3.response?.status === 404) {
                  response = await api.get('user/');
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
      
      console.log('User profile loaded:', response.data);
      setUser(response.data);
    } catch (error) {
      console.error('Failed to load user profile:', error);
      // If profile load fails, clear token and redirect to login
      localStorage.removeItem('token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (token) => {
    console.log('Logging in with token...');
    localStorage.setItem('token', token);
    setLoading(true);
    try {
      // Try different possible endpoints
      let response;
      try {
        response = await api.get('auth/profile/');
      } catch (err) {
        if (err.response?.status === 404) {
          try {
            response = await api.get('accounts/profile/');
          } catch (err2) {
            if (err2.response?.status === 404) {
              try {
                response = await api.get('profile/');
              } catch (err3) {
                if (err3.response?.status === 404) {
                  response = await api.get('user/');
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
      
      console.log('Login successful, user data:', response.data);
      setUser(response.data);
    } catch (error) {
      console.error('Failed to load user profile after login:', error);
      localStorage.removeItem('token');
      setUser(null);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    console.log('Logging out...');
    localStorage.removeItem('token');
    setUser(null);
  };

  const updateProfile = async (profileData) => {
    try {
      // Try different possible endpoints
      let response;
      try {
        response = await api.put('auth/profile/', profileData);
      } catch (err) {
        if (err.response?.status === 404) {
          try {
            response = await api.put('accounts/profile/', profileData);
          } catch (err2) {
            if (err2.response?.status === 404) {
              response = await api.put('profile/', profileData);
            } else {
              throw err2;
            }
          }
        } else {
          throw err;
        }
      }
      
      setUser(response.data);
      return { success: true };
    } catch (error) {
      console.error('Failed to update profile:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || error.response?.data?.detail || 'Failed to update profile' 
      };
    }
  };

  const value = {
    user,
    loading,
    login,
    logout,
    updateProfile,
    isSender: user?.role === 'sender',
    isTraveler: user?.role === 'traveller',
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}; 