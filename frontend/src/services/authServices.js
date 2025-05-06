const API_URL = "/api";

// Register user
export const register = async (userData) => {
  try {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
      credentials: "include", // Important for cookies
    });

    return await response.json();
  } catch (error) {
    console.error("Registration error:", error);
    return {
      success: false,
      message: "Network error. Please try again later.",
    };
  }
};

// Login user
export const login = async (credentials) => {
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
      credentials: "include", // Important for cookies
    });

    const data = await response.json();

    if (data.success) {
      // Store user data in localStorage for client-side persistence
      localStorage.setItem("user", JSON.stringify(data.user));
    }

    return data;
  } catch (error) {
    console.error("Login error:", error);
    return {
      success: false,
      message: "Network error. Please try again later.",
    };
  }
};

// Logout user
export const logout = async () => {
  try {
    const response = await fetch(`${API_URL}/auth/logout`, {
      method: "POST",
      credentials: "include", // Important for cookies
    });

    // Clear local storage data
    localStorage.removeItem("user");

    return await response.json();
  } catch (error) {
    console.error("Logout error:", error);
    // Still clear local storage even if API call fails
    localStorage.removeItem("user");
    return { success: true, message: "Logged out locally" };
  }
};

// Check if user is logged in
export const checkSession = async () => {
  // First check localStorage (client-side session)
  const localUser = localStorage.getItem("user");

  if (localUser) {
    try {
      // Verify the session with the server
      const response = await fetch(`${API_URL}/auth/session`, {
        method: "GET",
        credentials: "include", // Important for cookies
      });

      const data = await response.json();

      if (data.logged_in) {
        return { isLoggedIn: true, user: data.user };
      } else {
        // Server says session is invalid, clear local storage
        localStorage.removeItem("user");
        return { isLoggedIn: false };
      }
    } catch (error) {
      // Network error, assume user is still logged in locally
      console.error("Session check error:", error);
      return { isLoggedIn: true, user: JSON.parse(localUser) };
    }
  }

  return { isLoggedIn: false };
};

// Get current user
export const getCurrentUser = () => {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
};
