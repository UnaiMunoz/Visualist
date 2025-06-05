const API_URL = "https://visualist-production.up.railway.app/api"; // Using proxy setup in vite.config.js

// Get user profile data
export const getUserProfile = async () => {
  try {
    const response = await fetch(`${API_URL}/auth/session.php`, {
      method: "GET",
      credentials: "include", // Important for cookies
    });

    const data = await response.json();

    if (data.logged_in) {
      return {
        success: true,
        user: data.user,
      };
    } else {
      return {
        success: false,
        message: "Not logged in",
      };
    }
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return {
      success: false,
      message: "Error fetching profile data",
    };
  }
};

// Make the API call to update user profile
export const updateUserProfile = async (profileData) => {
  try {
    console.log("Sending profile data to server:", profileData); // Debug log

    const response = await fetch(`${API_URL}/auth/update-profile.php`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(profileData),
      credentials: "include", // Important for cookies
    });

    const responseData = await response.json();
    console.log("Server response:", responseData); // Debug log

    return responseData;
  } catch (error) {
    console.error("Error updating profile:", error);
    return {
      success: false,
      message: "Network error. Please try again later.",
    };
  }
};

// Get current user from storage
export const getCurrentUser = () => {
  const localUser = localStorage.getItem("user");
  const sessionUser = sessionStorage.getItem("user");
  const user = localUser || sessionUser;
  return user ? JSON.parse(user) : null;
};

// Simplified update profile function
export const updateProfile = async (profileData) => {
  // Prepare backend data format - map 'bio' to 'short_bio'
  const backendProfileData = {
    ...profileData,
    short_bio: profileData.bio, // This is the field expected by backend
  };

  // Call the API
  const response = await updateUserProfile(backendProfileData);

  // If successful, update local storage and trigger auth event
  if (response.success && response.user) {
    console.log(
      "Profile update successful, updating storage with:",
      response.user
    ); // Debug

    // Helper function to update storage
    const updateStorage = (storage) => {
      const userStr = storage.getItem("user");
      if (userStr) {
        try {
          const userData = JSON.parse(userStr);
          const updatedUser = {
            ...userData,
            name: response.user.name,
            short_bio: response.user.short_bio,
          };
          storage.setItem("user", JSON.stringify(updatedUser));
          console.log("Updated storage with:", updatedUser); // Debug
        } catch (e) {
          console.error("Error updating storage:", e);
        }
      }
    };

    // Update both storage locations
    if (localStorage.getItem("user")) {
      updateStorage(localStorage);
    }
    if (sessionStorage.getItem("user")) {
      updateStorage(sessionStorage);
    }

    // Trigger the auth state change event to update context
    window.dispatchEvent(new CustomEvent("auth_state_change"));
  }

  return response;
};
