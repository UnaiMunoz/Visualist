const API_URL = "https://visualist-production.up.railway.app/api"; // Using proxy setup in vite.config.js

// Register user
export const register = async (userData) => {
  try {
    const response = await fetch(`${API_URL}/auth/register.php`, {
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
    const response = await fetch(`${API_URL}/auth/login.php`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
      credentials: "include", // Important for cookies
    });

    const data = await response.json();

    if (data.success) {
      // Only store user in localStorage if "remember me" is checked
      if (credentials.remember) {
        localStorage.setItem("user", JSON.stringify(data.user));
      } else {
        // Use sessionStorage instead for temporary storage (clears when browser closes)
        sessionStorage.setItem("user", JSON.stringify(data.user));
        // Make sure to clear any previously stored values in localStorage
        localStorage.removeItem("user");
      }
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
    const response = await fetch(`${API_URL}/auth/logout.php`, {
      method: "POST",
      credentials: "include", // Important for cookies
    });

    // Clear both storages
    localStorage.removeItem("user");
    sessionStorage.removeItem("user");

    return await response.json();
  } catch (error) {
    console.error("Logout error:", error);
    // Still clear both storages even if API call fails
    localStorage.removeItem("user");
    sessionStorage.removeItem("user");
    return { success: true, message: "Logged out locally" };
  }
};

// Check if user is logged in
export const checkSession = async () => {
  // First check localStorage (persistent session)
  const localUser = localStorage.getItem("user");
  // Then check sessionStorage (temporary session)
  const sessionUser = sessionStorage.getItem("user");

  const storedUser = localUser || sessionUser;

  if (storedUser) {
    try {
      // Verify the session with the server
      const response = await fetch(`${API_URL}/auth/session.php`, {
        method: "GET",
        credentials: "include", // Important for cookies
      });

      const data = await response.json();

      if (data.logged_in) {
        return { isLoggedIn: true, user: data.user };
      } else {
        // Server says session is invalid, clear both storages
        localStorage.removeItem("user");
        sessionStorage.removeItem("user");
        return { isLoggedIn: false };
      }
    } catch (error) {
      // Network error, assume user is still logged in locally
      console.error("Session check error:", error);
      return { isLoggedIn: true, user: JSON.parse(storedUser) };
    }
  }

  return { isLoggedIn: false };
};

// Get current user
export const getCurrentUser = () => {
  const localUser = localStorage.getItem("user");
  const sessionUser = sessionStorage.getItem("user");
  const user = localUser || sessionUser;
  return user ? JSON.parse(user) : null;
};
