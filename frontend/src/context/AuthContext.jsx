import { createContext, useState, useEffect, useContext } from "react";
import { checkSession, logout, getCurrentUser } from "../services/authServices";

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
      console.log("Auth change event received"); // Debug log

      // Get user from storage first for immediate update
      const cachedUser = getCurrentUser();

      if (cachedUser) {
        console.log("User found in cache:", cachedUser); // Debug log
        setCurrentUser(cachedUser);
        setIsLoggedIn(true);
      } else {
        console.log("No user in cache, verifying session"); // Debug log
        verifySession(); // Full session verification as backup
      }
    };

    window.addEventListener(AUTH_STATE_CHANGE_EVENT, handleAuthChange);

    return () => {
      window.removeEventListener(AUTH_STATE_CHANGE_EVENT, handleAuthChange);
    };
  }, []);

  // Function to handle login
  const handleLogin = (user) => {
    // Ensure we have all expected fields, even if they're null
    const normalizedUser = {
      ...user,
      short_bio: user.short_bio || null, // Ensure field exists
    };

    setCurrentUser(normalizedUser);
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

  // Function to update user data after profile changes
  const updateUserData = (updatedUser) => {
    // Merge with existing user data
    const newUserData = {
      ...currentUser,
      ...updatedUser,
    };

    setCurrentUser(newUserData);
    broadcastAuthChange();
  };

  // Context value
  const value = {
    currentUser,
    isLoggedIn,
    loading,
    login: handleLogin,
    logout: handleLogout,
    updateUserData, // Added new function
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
