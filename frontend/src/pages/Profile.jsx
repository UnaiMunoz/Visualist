import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { updateProfile } from "../services/userServices";

const Profile = () => {
  const { currentUser, isLoggedIn, loading } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    bio: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !isLoggedIn) {
      navigate("/login");
    }
  }, [isLoggedIn, loading, navigate]);

  // Set form data from user info
  useEffect(() => {
    if (currentUser) {
      setFormData((prevData) => ({
        ...prevData,
        name: currentUser.name || "",
        email: currentUser.email || "",
        bio: currentUser.short_bio || "",
      }));
    }
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
        setUpdateSuccess(true);
        setIsEditing(false);

        // Reset password fields
        setFormData({
          ...formData,
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });

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
        {!isEditing ? (
          <button
            className="edit-profile-btn"
            onClick={() => setIsEditing(true)}
          >
            Edit Profile
          </button>
        ) : (
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
        )}
      </div>

      {updateSuccess && (
        <div className="success-message">Profile updated successfully!</div>
      )}

      {errors.form && <div className="error-message">{errors.form}</div>}

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
            {errors.email && <span className="error-text">{errors.email}</span>}
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
              <span className="stat-label">Member Since</span>
              <span className="stat-value">
                {currentUser?.created_at
                  ? new Date(currentUser.created_at).toLocaleDateString()
                  : "N/A"}
              </span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Reviews Written</span>
              <span className="stat-value">0</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Watchlist Items</span>
              <span className="stat-value">0</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Watched Items</span>
              <span className="stat-value">0</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
