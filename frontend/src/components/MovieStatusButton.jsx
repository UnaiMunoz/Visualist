// frontend/src/components/MovieStatusButton.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  checkListStatus,
  addToList,
  removeFromList,
} from "../services/listServices";
import MovieStatusModal from "./MovieStatusModal";

const MovieStatusButton = ({ contentId, contentType, movieTitle }) => {
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [status, setStatus] = useState({
    watched: false,
    to_watch: false,
    favorites: false,
  });
  const [loading, setLoading] = useState(false);
  const [favoritesLoading, setFavoritesLoading] = useState(false);

  // Fetch initial status
  useEffect(() => {
    if (isLoggedIn && contentId) {
      fetchStatus();
    }
  }, [isLoggedIn, contentId]);

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

  const handleButtonClick = () => {
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    // Refresh status after modal closes
    if (isLoggedIn && contentId) {
      fetchStatus();
    }
  };

  const handleFavoritesClick = async () => {
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }

    setFavoritesLoading(true);
    try {
      if (status.favorites) {
        await removeFromList(contentId, contentType, "favorites");
        setStatus((prev) => ({ ...prev, favorites: false }));
      } else {
        await addToList(contentId, contentType, "favorites");
        setStatus((prev) => ({ ...prev, favorites: true }));
      }
    } catch (error) {
      console.error("Error updating favorites:", error);
    } finally {
      setFavoritesLoading(false);
    }
  };

  // Determine button appearance based on status
  const getButtonConfig = () => {
    if (status.watched) {
      return {
        text: "Watched",
        icon: (
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
        ),
        className: "status-watched",
      };
    } else if (status.to_watch) {
      return {
        text: "Want to Watch",
        icon: (
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
        ),
        className: "status-to-watch",
      };
    } else {
      return {
        text: "Add to List",
        icon: (
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
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
        ),
        className: "status-none",
      };
    }
  };

  const buttonConfig = getButtonConfig();

  return (
    <>
      <div className="anime-status-buttons-container">
        <button
          className={`anime-status-btn ${buttonConfig.className} ${
            loading ? "loading" : ""
          }`}
          onClick={handleButtonClick}
          disabled={loading}
        >
          {buttonConfig.icon}
          <span className="status-btn-text">{buttonConfig.text}</span>
        </button>

        <button
          className={`favorites-btn ${status.favorites ? "favorited" : ""} ${
            favoritesLoading ? "loading" : ""
          }`}
          onClick={handleFavoritesClick}
          disabled={favoritesLoading}
          title={
            status.favorites ? "Remove from favorites" : "Add to favorites"
          }
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill={status.favorites ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
          </svg>
        </button>
      </div>

      <MovieStatusModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        contentId={contentId}
        contentType={contentType}
        movieTitle={movieTitle}
      />
    </>
  );
};

export default MovieStatusButton;
