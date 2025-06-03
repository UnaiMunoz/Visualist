import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { updateProfile } from "../services/userServices";
import { getUserList } from "../services/listServices";
import UserList from "../components/UserList";

const Profile = () => {
  const { currentUser, isLoggedIn, loading, logout } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    bio: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Estado separado para mostrar la biografía, independiente del estado de currentUser
  const [bioDisplay, setBioDisplay] = useState("");

  const [errors, setErrors] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [contentType, setContentType] = useState("movie");

  // State for stats
  const [stats, setStats] = useState({
    watchedCount: 0,
    toWatchCount: 0,
    favoritesCount: 0,
    loadingStats: true,
  });

  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !isLoggedIn) {
      navigate("/login");
    }
  }, [isLoggedIn, loading, navigate]);

  // Set form data and bioDisplay from user info whenever currentUser changes
  useEffect(() => {
    if (currentUser) {
      console.log("Current user data in Profile component:", currentUser); // Debug log

      setFormData((prevData) => ({
        ...prevData,
        name: currentUser.name || "",
        email: currentUser.email || "",
        bio: currentUser.short_bio || "",
      }));

      // Actualiza el estado de visualización de la biografía
      setBioDisplay(currentUser.short_bio || "");
    }
  }, [currentUser]);

  // Fetch stats when component mounts or user changes
  useEffect(() => {
    const fetchStats = async () => {
      if (!currentUser) return;

      try {
        setStats((prev) => ({ ...prev, loadingStats: true }));

        // Fetch counts for content types
        const contentTypes = ["movie", "series"];
        let totalWatched = 0;
        let totalToWatch = 0;
        let totalFavorites = 0;

        for (const type of contentTypes) {
          const [watched, toWatch, favorites] = await Promise.all([
            getUserList("watched", type, 1, 1),
            getUserList("to_watch", type, 1, 1),
            getUserList("favorites", type, 1, 1),
          ]);

          totalWatched += watched.pageInfo.total || 0;
          totalToWatch += toWatch.pageInfo.total || 0;
          totalFavorites += favorites.pageInfo.total || 0;
        }

        setStats({
          watchedCount: totalWatched,
          toWatchCount: totalToWatch,
          favoritesCount: totalFavorites,
          loadingStats: false,
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
        setStats({
          watchedCount: 0,
          toWatchCount: 0,
          favoritesCount: 0,
          loadingStats: false,
        });
      }
    };

    fetchStats();
  }, [currentUser]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const validateForm = () => {
    const newErrors = {};

    // Validate name
    if (isEditing && !formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    // Password validation if attempting to change password
    if (formData.newPassword) {
      if (!formData.currentPassword) {
        newErrors.currentPassword =
          "Current password is required to set a new password";
      }

      if (formData.newPassword.length < 6) {
        newErrors.newPassword = "Password must be at least 6 characters";
      }

      if (formData.newPassword !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    // Prepare data for API
    const profileData = {
      name: formData.name,
      bio: formData.bio,
    };

    // Add password data if changing password
    if (formData.newPassword) {
      profileData.currentPassword = formData.currentPassword;
      profileData.newPassword = formData.newPassword;
    }

    try {
      const response = await updateProfile(profileData);

      if (response.success) {
        console.log("Profile updated successfully, server response:", response); // Debug log

        // Actualiza inmediatamente el estado local para mostrar la biografía
        setBioDisplay(formData.bio);

        // También actualiza manualmente el objeto currentUser local para anticipar
        // la actualización del contexto
        if (currentUser) {
          currentUser.short_bio = formData.bio;
        }

        setUpdateSuccess(true);
        setIsEditing(false);

        // Reset password fields
        setFormData((prevData) => ({
          ...prevData,
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        }));

        // Hide success message after 3 seconds
        setTimeout(() => {
          setUpdateSuccess(false);
        }, 3000);
      } else {
        setErrors({ form: response.message || "Failed to update profile" });
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      setErrors({ form: "Failed to update profile. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="wrapper">
          <div className="circle"></div>
          <div className="circle"></div>
          <div className="circle"></div>
          <div className="shadow"></div>
          <div className="shadow"></div>
          <div className="shadow"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1>User Profile</h1>
        <div className="profile-header-actions">
          {activeTab === "profile" && !isEditing ? (
            <button
              className="edit-profile-btn"
              onClick={() => setIsEditing(true)}
            >
              Edit Profile
            </button>
          ) : activeTab === "profile" && isEditing ? (
            <button
              className="cancel-edit-btn"
              onClick={() => {
                setIsEditing(false);
                setErrors({});
                // Reset form to current user data
                if (currentUser) {
                  setFormData({
                    ...formData,
                    name: currentUser.name || "",
                    email: currentUser.email || "",
                    bio: currentUser.short_bio || "",
                    currentPassword: "",
                    newPassword: "",
                    confirmPassword: "",
                  });
                }
              }}
            >
              Cancel
            </button>
          ) : null}

          {/* Logout button - always visible */}
          <button className="logout-btn" onClick={handleLogout} title="Logout">
            Logout
          </button>
        </div>
      </div>

      {updateSuccess && (
        <div className="success-message">Profile updated successfully!</div>
      )}

      {errors.form && <div className="error-message">{errors.form}</div>}

      {/* Profile Tabs */}
      <div className="profile-tabs">
        <button
          className={`profile-tab ${activeTab === "profile" ? "active" : ""}`}
          onClick={() => setActiveTab("profile")}
        >
          Profile
        </button>
        <button
          className={`profile-tab ${activeTab === "watched" ? "active" : ""}`}
          onClick={() => setActiveTab("watched")}
        >
          Watched
        </button>
        <button
          className={`profile-tab ${activeTab === "to_watch" ? "active" : ""}`}
          onClick={() => setActiveTab("to_watch")}
        >
          To Watch
        </button>
        <button
          className={`profile-tab ${activeTab === "favorites" ? "active" : ""}`}
          onClick={() => setActiveTab("favorites")}
        >
          Favorites
        </button>
      </div>

      {activeTab === "profile" ? (
        <div className="profile-content">
          <form onSubmit={handleSubmit} className="profile-form">
            <div className="form-group">
              <label htmlFor="name">Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                disabled={!isEditing}
                className={`form-input ${isEditing ? "editable" : ""} ${
                  errors.name ? "input-error" : ""
                }`}
              />
              {errors.name && <span className="error-text">{errors.name}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                disabled={true} // Email cannot be changed
                className="form-input"
              />
              {errors.email && (
                <span className="error-text">{errors.email}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="bio">Bio</label>
              <textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                disabled={!isEditing}
                className={`form-input bio-textarea ${
                  isEditing ? "editable" : ""
                }`}
                rows="4"
                placeholder={
                  isEditing
                    ? "Tell us a bit about yourself..."
                    : "No bio added yet."
                }
              />
            </div>

            {isEditing && (
              <div className="password-section">
                <h3>Change Password</h3>
                <p className="password-note">
                  Leave blank to keep current password
                </p>

                <div className="form-group">
                  <label htmlFor="currentPassword">Current Password</label>
                  <input
                    type="password"
                    id="currentPassword"
                    name="currentPassword"
                    value={formData.currentPassword}
                    onChange={handleInputChange}
                    className={`form-input ${
                      errors.currentPassword ? "input-error" : ""
                    }`}
                  />
                  {errors.currentPassword && (
                    <span className="error-text">{errors.currentPassword}</span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="newPassword">New Password</label>
                  <input
                    type="password"
                    id="newPassword"
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleInputChange}
                    className={`form-input ${
                      errors.newPassword ? "input-error" : ""
                    }`}
                  />
                  {errors.newPassword && (
                    <span className="error-text">{errors.newPassword}</span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="confirmPassword">Confirm New Password</label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className={`form-input ${
                      errors.confirmPassword ? "input-error" : ""
                    }`}
                  />
                  {errors.confirmPassword && (
                    <span className="error-text">{errors.confirmPassword}</span>
                  )}
                </div>
              </div>
            )}

            {isEditing && (
              <div className="form-actions">
                <button
                  type="submit"
                  className="save-profile-btn"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </button>
              </div>
            )}
          </form>

          <div className="profile-stats">
            <div className="stats-card">
              <h3>Your Stats</h3>
              <div className="stat-item">
                <span className="stat-label">Watched Items</span>
                <span className="stat-value">
                  {stats.loadingStats ? "..." : stats.watchedCount}
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Watchlist Items</span>
                <span className="stat-value">
                  {stats.loadingStats ? "..." : stats.toWatchCount}
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Favorites</span>
                <span className="stat-value">
                  {stats.loadingStats ? "..." : stats.favoritesCount}
                </span>
              </div>
            </div>

            {/* Usamos el estado local bioDisplay para mostrar la biografía */}
            <div className="stats-card">
              <h3>About Me</h3>
              <div className="about-me-content">
                {bioDisplay ? (
                  <p>{bioDisplay}</p>
                ) : (
                  <p className="no-bio">No bio added yet.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Content type selector for lists*/}
          <div className="content-type-selector">
            <button
              className={`content-type-btn ${
                contentType === "movie" ? "active" : ""
              }`}
              onClick={() => setContentType("movie")}
            >
              Movies
            </button>
            <button
              className={`content-type-btn ${
                contentType === "series" ? "active" : ""
              }`}
              onClick={() => setContentType("series")}
            >
              Series
            </button>
          </div>

          {/* Show user list based on active tab and content type */}
          <UserList listType={activeTab} contentType={contentType} />
        </>
      )}
    </div>
  );
};

export default Profile;
