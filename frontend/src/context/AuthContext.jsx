import { createContext, useState, useEffect, useContext } from "react";
import { checkSession, logout } from "../services/authServices";

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
  }, []);

  // Function to handle login
  const handleLogin = (user) => {
    setCurrentUser(user);
    setIsLoggedIn(true);
  };

  // Function to handle logout
  const handleLogout = async () => {
    try {
      await logout();
      setCurrentUser(null);
      setIsLoggedIn(false);
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
