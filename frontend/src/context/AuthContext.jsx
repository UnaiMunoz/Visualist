// In AuthContext.jsx - Let's modify it to include event listeners for cross-component communication

import { createContext, useState, useEffect, useContext } from "react";
import { checkSession, logout } from "../services/authServices";

// Custom event for auth state changes
export const AUTH_STATE_CHANGE_EVENT = "auth_state_change";

// Create the authentication context
const AuthContext = createContext(null);

// Custom hook to use the auth context
export const useAuth = () => {
  return useContext(AuthContext);
};

// Auth Provider component
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  // Function to broadcast auth state changes
  const broadcastAuthChange = () => {
    window.dispatchEvent(new CustomEvent(AUTH_STATE_CHANGE_EVENT));
  };

  // Verify session on component mount
  useEffect(() => {
    const verifySession = async () => {
      try {
        const { isLoggedIn, user } = await checkSession();
        setIsLoggedIn(isLoggedIn);
        setCurrentUser(user);
      } catch (error) {
        console.error("Session verification error:", error);
      } finally {
        setLoading(false);
      }
    };

    verifySession();

    // Listen for auth state changes from other components
    const handleAuthChange = () => {
      verifySession();
    };

    window.addEventListener(AUTH_STATE_CHANGE_EVENT, handleAuthChange);

    return () => {
      window.removeEventListener(AUTH_STATE_CHANGE_EVENT, handleAuthChange);
    };
  }, []);

  // Function to handle login
  const handleLogin = (user) => {
    setCurrentUser(user);
    setIsLoggedIn(true);
    broadcastAuthChange();
  };

  // Function to handle logout
  const handleLogout = async () => {
    try {
      await logout();
      setCurrentUser(null);
      setIsLoggedIn(false);
      broadcastAuthChange();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // Context value
  const value = {
    currentUser,
    isLoggedIn,
    loading,
    login: handleLogin,
    logout: handleLogout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
