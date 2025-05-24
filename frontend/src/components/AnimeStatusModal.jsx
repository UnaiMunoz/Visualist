// frontend/src/components/AnimeStatusModal.jsx
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

const AnimeStatusModal = ({
  isOpen,
  onClose,
  contentId,
  contentType,
  animeTitle,
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
  const [progress, setProgress] = useState(0);
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
      setProgress(contentData.progress || 0);
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
    } else {
      // Handle favorites
      setStatus((prev) => ({
        ...prev,
        [statusType]: !prev[statusType],
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
      // Handle watched status
      if (status.watched) {
        await addToList(contentId, contentType, "watched");
      } else {
        await removeFromList(contentId, contentType, "watched");
      }

      // Handle to_watch status
      if (status.to_watch) {
        await addToList(contentId, contentType, "to_watch");
      } else {
        await removeFromList(contentId, contentType, "to_watch");
      }

      // Handle favorites
      if (status.favorites) {
        await addToList(contentId, contentType, "favorites");
      } else {
        await removeFromList(contentId, contentType, "favorites");
      }

      // Update additional data (score, progress, notes)
      if (status.watched || status.to_watch) {
        await updateContentData(contentId, contentType, {
          score: score,
          progress: progress,
          notes: notes,
        });
      }

      // Close modal after successful save
      onClose();
    } catch (error) {
      console.error("Error saving status:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    onClose();
    // Reset form state
    setScore(0);
    setNotes("");
    setProgress(0);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
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

        <div className="modal-body">
          {loading ? (
            <div className="modal-loading">
              <div className="loading-spinner"></div>
              <p>Loading status...</p>
            </div>
          ) : (
            <>
              <div className="anime-info">
                <h3 className="anime-title">{animeTitle}</h3>
              </div>

              <div className="status-section">
                <h4 className="section-title">Watch Status</h4>
                <div className="status-options">
                  <label className="status-option">
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

                  <label className="status-option">
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
                      Plan to Watch
                    </span>
                  </label>

                  <label className="status-option">
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
                        <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line>
                      </svg>
                      Not in List
                    </span>
                  </label>
                </div>
              </div>

              <div className="favorites-section">
                <label className="favorites-option">
                  <input
                    type="checkbox"
                    checked={status.favorites}
                    onChange={() => handleStatusChange("favorites")}
                  />
                  <span className="favorites-label">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill={status.favorites ? "currentColor" : "none"}
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                    </svg>
                    Add to Favorites
                  </span>
                </label>
              </div>

              <div className="score-section">
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

              <div className="progress-section">
                <h4 className="section-title">Progress</h4>
                <div className="progress-input-container">
                  <input
                    type="number"
                    min="0"
                    value={progress}
                    onChange={(e) => setProgress(parseInt(e.target.value) || 0)}
                    className="progress-input"
                    placeholder="Episodes watched"
                  />
                  <span className="progress-label">episodes</span>
                </div>
              </div>

              <div className="notes-section">
                <h4 className="section-title">Notes</h4>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="notes-textarea"
                  placeholder="Add your personal notes..."
                  rows="3"
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

export default AnimeStatusModal;
