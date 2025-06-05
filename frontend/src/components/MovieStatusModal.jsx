// frontend/src/components/MovieStatusModal.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  checkListStatus,
  addToList,
  removeFromList,
  getContentData,
  updateContentData,
} from "../services/listServices";

const MovieStatusModal = ({
  isOpen,
  onClose,
  contentId,
  contentType,
  movieTitle,
}) => {
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();

  const [status, setStatus] = useState({
    watched: false,
    to_watch: false,
    favorites: false,
  });

  const [score, setScore] = useState(0);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Fetch initial status when modal opens
  useEffect(() => {
    if (isOpen && isLoggedIn && contentId) {
      fetchStatus();
      fetchContentData();
    }
  }, [isOpen, isLoggedIn, contentId]);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      const listStatus = await checkListStatus(contentId, contentType);
      setStatus(listStatus);
    } catch (error) {
      console.error("Error fetching status:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchContentData = async () => {
    try {
      const contentData = await getContentData(contentId, contentType);
      setScore(contentData.score || 0);
      setNotes(contentData.notes || "");
    } catch (error) {
      console.error("Error fetching content data:", error);
    }
  };

  const handleStatusChange = (statusType) => {
    if (statusType === "watched" || statusType === "to_watch") {
      // Mutual exclusivity for watched and to_watch
      setStatus((prev) => ({
        ...prev,
        watched: statusType === "watched" ? !prev.watched : false,
        to_watch: statusType === "to_watch" ? !prev.to_watch : false,
      }));
    }
  };

  const handleSave = async () => {
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }

    setSaving(true);
    try {
      // Helper function to safely add/remove from lists
      const safeListOperation = async (operation, listType) => {
        try {
          return await operation(contentId, contentType, listType);
        } catch (error) {
          console.warn(`Failed to ${operation.name} ${listType}:`, error);
          // Don't throw, just log the warning
          return null;
        }
      };

      // Handle watched status
      if (status.watched) {
        await safeListOperation(addToList, "watched");
        // Only try to remove from to_watch if we know it's there
        if (status.to_watch) {
          await safeListOperation(removeFromList, "to_watch");
        }
      } else {
        await safeListOperation(removeFromList, "watched");
      }

      // Handle to_watch status
      if (status.to_watch) {
        await safeListOperation(addToList, "to_watch");
        // Only try to remove from watched if we know it's there
        if (status.watched) {
          await safeListOperation(removeFromList, "watched");
        }
      } else {
        await safeListOperation(removeFromList, "to_watch");
      }

      // Update additional data (score, notes)
      if (status.watched || status.to_watch) {
        try {
          await updateContentData(contentId, contentType, {
            score: score,
            notes: notes,
          });
        } catch (error) {
          console.warn("Failed to update content data:", error);
        }
      }

      // Close modal after successful save
      onClose();
    } catch (error) {
      console.error("Error saving status:", error);
      // Optionally show error message to user
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    onClose();
    // Reset form state
    setScore(0);
    setNotes("");
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div
        className="modal-content compact-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2 className="modal-title">Update Status</h2>
          <button className="modal-close-btn" onClick={handleClose}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div className="modal-body compact-body">
          {loading ? (
            <div className="modal-loading">
              <div className="loading-spinner"></div>
              <p>Loading status...</p>
            </div>
          ) : (
            <>
              <div className="media-info">
                <h3 className="media-title">{movieTitle}</h3>
              </div>

              <div className="compact-grid">
                {/* Left Column - Status */}
                <div className="status-column">
                  <h4 className="section-title">Watch Status</h4>
                  <div className="status-options compact-options">
                    <label className="status-option compact-option">
                      <input
                        type="radio"
                        name="watchStatus"
                        checked={status.watched}
                        onChange={() => handleStatusChange("watched")}
                      />
                      <span className="status-label">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                          <polyline points="22 4 12 14.01 9 11.01"></polyline>
                        </svg>
                        Watched
                      </span>
                    </label>

                    <label className="status-option compact-option">
                      <input
                        type="radio"
                        name="watchStatus"
                        checked={status.to_watch}
                        onChange={() => handleStatusChange("to_watch")}
                      />
                      <span className="status-label">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <circle cx="12" cy="12" r="10"></circle>
                          <polyline points="12 6 12 12 16 14"></polyline>
                        </svg>
                        Want to Watch
                      </span>
                    </label>

                    <label className="status-option compact-option">
                      <input
                        type="radio"
                        name="watchStatus"
                        checked={!status.watched && !status.to_watch}
                        onChange={() => {
                          setStatus((prev) => ({
                            ...prev,
                            watched: false,
                            to_watch: false,
                          }));
                        }}
                      />
                      <span className="status-label">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <circle cx="12" cy="12" r="10"></circle>
                          <line
                            x1="4.93"
                            y1="4.93"
                            x2="19.07"
                            y2="19.07"
                          ></line>
                        </svg>
                        Not in List
                      </span>
                    </label>
                  </div>
                </div>

                {/* Right Column - Score */}
                <div className="data-column">
                  <div className="score-section compact-section">
                    <h4 className="section-title">Score</h4>
                    <div className="score-input-container">
                      <input
                        type="range"
                        min="0"
                        max="10"
                        step="0.5"
                        value={score}
                        onChange={(e) => setScore(parseFloat(e.target.value))}
                        className="score-slider"
                      />
                      <div className="score-display">
                        {score === 0 ? "Not Rated" : `${score}/10`}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes Section - Full Width */}
              <div className="notes-section compact-section">
                <h4 className="section-title">Notes</h4>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="notes-textarea compact-textarea"
                  placeholder="Add your personal notes..."
                  rows="2"
                />
              </div>
            </>
          )}
        </div>

        <div className="modal-footer">
          <button
            className="modal-btn modal-btn-secondary"
            onClick={handleClose}
            disabled={saving}
          >
            Cancel
          </button>
          <button
            className="modal-btn modal-btn-primary"
            onClick={handleSave}
            disabled={saving || loading}
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MovieStatusModal;
