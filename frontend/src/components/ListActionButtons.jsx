// frontend/src/components/ListActionButtons.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  checkListStatus,
  addToList,
  removeFromList,
} from "../services/listServices";

const ListActionButtons = ({ contentId, contentType }) => {
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const [inLists, setInLists] = useState({
    watched: false,
    to_watch: false,
    favorites: false,
  });
  const [loading, setLoading] = useState(false);

  // Fetch initial list status
  useEffect(() => {
    if (isLoggedIn && contentId) {
      fetchListStatus();
    }
  }, [isLoggedIn, contentId]);

  const fetchListStatus = async () => {
    try {
      const status = await checkListStatus(contentId, contentType);
      setInLists(status);
    } catch (error) {
      console.error("Error fetching list status:", error);
    }
  };

  const handleButtonClick = async (listType) => {
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }

    setLoading(true);
    try {
      if (inLists[listType]) {
        // Remove from list
        await removeFromList(contentId, contentType, listType);
        setInLists({ ...inLists, [listType]: false });
      } else {
        // Add to list
        await addToList(contentId, contentType, listType);
        setInLists({ ...inLists, [listType]: true });
      }
    } catch (error) {
      console.error(`Error updating ${listType} list:`, error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="list-action-buttons">
      <button
        className={`list-btn ${inLists.watched ? "active" : ""} ${
          loading ? "loading" : ""
        }`}
        onClick={() => handleButtonClick("watched")}
        disabled={loading}
      >
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
        {inLists.watched ? "Watched" : "Mark as Watched"}
      </button>

      <button
        className={`list-btn ${inLists.to_watch ? "active" : ""} ${
          loading ? "loading" : ""
        }`}
        onClick={() => handleButtonClick("to_watch")}
        disabled={loading}
      >
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
        {inLists.to_watch ? "On Watch List" : "Add to Watch List"}
      </button>

      <button
        className={`list-btn ${inLists.favorites ? "active" : ""} ${
          loading ? "loading" : ""
        }`}
        onClick={() => handleButtonClick("favorites")}
        disabled={loading}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill={inLists.favorites ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
        </svg>
        {inLists.favorites ? "Favorited" : "Add to Favorites"}
      </button>
    </div>
  );
};

export default ListActionButtons;
