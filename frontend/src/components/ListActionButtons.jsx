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
      let newStatus = { ...inLists };

      if (inLists[listType]) {
        // Remove from list
        await removeFromList(contentId, contentType, listType);
        newStatus[listType] = false;
      } else {
        // Add to list
        await addToList(contentId, contentType, listType);
        newStatus[listType] = true;

        // Handle mutual exclusivity between watched and to_watch
        // ONLY try to remove if the item is actually in the other list
        if (listType === "watched" && inLists.to_watch) {
          // If adding to watched and item is in to_watch, remove from to_watch
          try {
            await removeFromList(contentId, contentType, "to_watch");
            newStatus.to_watch = false;
          } catch (error) {
            // If removal fails, log but don't break the flow
            console.warn("Failed to remove from to_watch list:", error);
          }
        } else if (listType === "to_watch" && inLists.watched) {
          // If adding to to_watch and item is watched, remove from watched
          try {
            await removeFromList(contentId, contentType, "watched");
            newStatus.watched = false;
          } catch (error) {
            // If removal fails, log but don't break the flow
            console.warn("Failed to remove from watched list:", error);
          }
        }
      }

      // Update the state with the new status
      setInLists(newStatus);
    } catch (error) {
      console.error(`Error updating ${listType} list:`, error);
      // Optionally, show an error message to the user
    } finally {
      setLoading(false);
    }
  };

  // Button configuration to maintain consistent text lengths
  const getButtonConfig = (listType) => {
    const configs = {
      watched: {
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
        activeText: "Watched",
        inactiveText: "Add to Watched",
      },
      to_watch: {
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
        activeText: "In Watch List",
        inactiveText: "Add to Watch List",
      },
      favorites: {
        icon: (
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
        ),
        activeText: "Favorited",
        inactiveText: "Add to Favorites",
      },
    };

    return configs[listType];
  };

  const renderButton = (listType) => {
    const config = getButtonConfig(listType);
    const isActive = inLists[listType];
    const isCurrentlyLoading = loading;

    return (
      <button
        key={listType}
        className={`list-btn ${isActive ? "active" : ""} ${
          isCurrentlyLoading ? "loading" : ""
        }`}
        onClick={() => handleButtonClick(listType)}
        disabled={isCurrentlyLoading}
      >
        {config.icon}
        <span className="list-btn-text">
          {isActive ? config.activeText : config.inactiveText}
        </span>
      </button>
    );
  };

  return (
    <div className="list-action-buttons">
      {renderButton("watched")}
      {renderButton("to_watch")}
      {renderButton("favorites")}
    </div>
  );
};

export default ListActionButtons;
