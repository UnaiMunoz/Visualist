// frontend/src/services/userServices.js
const API_URL = "/api";

// Get user profile data
export const getUserProfile = async () => {
  try {
    // For now, use the current user session information
    // In the future, this could be expanded to get additional user data
    const response = await fetch(`${API_URL}/auth/session`, {
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

// Update user profile
export const updateUserProfile = async (profileData) => {
  try {
    const response = await fetch(`${API_URL}/auth/update-profile`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(profileData),
      credentials: "include", // Important for cookies
    });

    return await response.json();
  } catch (error) {
    console.error("Error updating profile:", error);
    return {
      success: false,
      message: "Network error. Please try again later.",
    };
  }
};

// Update user profile with new information and update local storage
export const updateProfile = async (profileData) => {
  const response = await updateUserProfile(profileData);

  if (response.success) {
    // Update local storage with new user data
    const currentUser = localStorage.getItem("user");
    if (currentUser) {
      const userData = JSON.parse(currentUser);
      const updatedUser = {
        ...userData,
        name: profileData.name,
        bio: profileData.bio || userData.bio,
      };
      localStorage.setItem("user", JSON.stringify(updatedUser));
    }

    // Dispatch auth state change event
    window.dispatchEvent(new CustomEvent("auth_state_change"));
  }

  return response;
};
