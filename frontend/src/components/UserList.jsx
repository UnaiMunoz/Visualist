// frontend/src/components/UserList.jsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getUserList } from "../services/listServices";

const UserList = ({ listType, contentType = "movie" }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [pageInfo, setPageInfo] = useState({
    currentPage: 1,
    lastPage: 1,
    hasNextPage: false,
    total: 0,
    perPage: 8,
  });

  // Reset state when listType or contentType changes
  useEffect(() => {
    const fetchList = async (page) => {
      setLoading(true);
      setIsInitialLoad(true);
      try {
        const result = await getUserList(listType, contentType, page, 8);
        console.log(`=== Debug: ${contentType} ${listType} list ===`);
        console.log("Full result:", result);
        console.log("Items array:", result.items);
        if (result.items && result.items.length > 0) {
          console.log("First item structure:", result.items[0]);
          console.log("First item title:", result.items[0].title);
        }

        if (result.items !== undefined) {
          setItems(result.items);
          setPageInfo(result.pageInfo);
          setError(null);
        }
      } catch (error) {
        console.error(`Error fetching ${listType} list:`, error);
        setError("Failed to load list. Please try again later.");
        setItems([]);
      } finally {
        setLoading(false);
        setIsInitialLoad(false);
      }
    };

    // Reset all state when dependencies change
    setItems([]);
    setLoading(true);
    setError(null);
    setIsInitialLoad(true);
    setPageInfo({
      currentPage: 1,
      lastPage: 1,
      hasNextPage: false,
      total: 0,
      perPage: 8,
    });

    // Fetch new data
    fetchList(1);
  }, [listType, contentType]);

  // Separate fetchList function for pagination
  const fetchListForPage = async (page) => {
    setLoading(true);
    try {
      const result = await getUserList(listType, contentType, page, 8);
      console.log(`=== Debug Pagination: ${contentType} ${listType} list ===`);
      console.log("Pagination result:", result);
      setItems(result.items);
      setPageInfo(result.pageInfo);
      setError(null);
    } catch (error) {
      console.error(`Error fetching ${listType} list:`, error);
      setError("Failed to load list. Please try again later.");
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    window.scrollTo(0, 0);
    fetchListForPage(newPage);
  };

  // Format the list type for display
  const formatListType = () => {
    switch (listType) {
      case "watched":
        return "Watched";
      case "watching":
        return "Watching";
      case "to_watch":
        return "To Watch";
      case "favorites":
        return "Favorites";
      default:
        return listType.charAt(0).toUpperCase() + listType.slice(1);
    }
  };

  // Render title with the appropriate content type
  const renderTitle = () => {
    const formattedType =
      contentType.charAt(0).toUpperCase() + contentType.slice(1);
    return `${formattedType} ${formatListType()}`;
  };

  // Helper function to get the appropriate image URL
  const getImageUrl = (item) => {
    return item.poster_path
      ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
      : "https://via.placeholder.com/225x338?text=No+Image";
  };

  // Helper function to get the appropriate title
  const getTitle = (item) => {
    try {
      if (!item) return "Unknown Title";

      if (contentType === "movie") {
        return typeof item.title === "string" && item.title.trim()
          ? item.title.trim()
          : "Unknown Title";
      } else {
        const title = item.name || item.title;
        return typeof title === "string" && title.trim()
          ? title.trim()
          : "Unknown Title";
      }
    } catch (error) {
      console.error("Error getting title:", error, item);
      return "Unknown Title";
    }
  };

  // Helper function to format time in minutes to hours and minutes
  const formatTime = (minutes) => {
    if (!minutes || minutes <= 0) return "0 min";

    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (remainingMinutes === 0) {
      return `${hours}h`;
    }
    return `${hours}h ${remainingMinutes}m`;
  };

  // Helper function to get episodes progress for content - MEJORADO
  const getEpisodesProgress = (item) => {
    try {
      if (contentType === "movie") {
        // Para películas en watching, mostrar tiempo visto si está disponible
        if (
          listType === "watching" &&
          item.time_watched &&
          item.time_watched > 0
        ) {
          return formatTime(item.time_watched);
        }
        // Para películas watched o sin tiempo, mostrar 1/1 o 0/1
        const isCompleted =
          listType === "watched" || (item.progress && item.progress > 0);
        return isCompleted ? "1/1" : "0/1";
      } else {
        // Para series, mostrar progreso de episodios
        const watchedEpisodes = item.progress || 0;
        const totalEpisodes = item.number_of_episodes || "?";
        return `${watchedEpisodes}/${totalEpisodes}`;
      }
    } catch (error) {
      console.error("Error getting episodes progress:", error, item);
      return contentType === "movie" ? "0/1" : "0/?";
    }
  };

  // Helper function to get user score
  const getUserScore = (item) => {
    try {
      // Use the user's personal score if available
      if (item.score && item.score > 0) {
        return {
          score: `${item.score}/10`,
          isRated: true,
        };
      }
      // If no user score, show "Not Rated"
      return {
        score: "Not Rated",
        isRated: false,
      };
    } catch (error) {
      console.error("Error getting user score:", error, item);
      return {
        score: "Not Rated",
        isRated: false,
      };
    }
  };

  // Show loading spinner while data is being fetched or during initial load
  if (loading || isInitialLoad) {
    return (
      <div className="user-list-container">
        <h2 className="list-title">{renderTitle()}</h2>
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
      </div>
    );
  }

  return (
    <div className="user-list-container">
      <h2 className="list-title">{renderTitle()}</h2>

      {error && <div className="error-message list-error">{error}</div>}

      {!loading && !isInitialLoad && items.length === 0 ? (
        <div className="empty-list">
          <p>No items in your {formatListType().toLowerCase()} list yet.</p>
          <Link
            to={`/${contentType === "movie" ? "movies" : contentType}`}
            className="navbar-btn"
          >
            Browse {contentType === "movie" ? "movies" : contentType}
          </Link>
        </div>
      ) : !loading && !isInitialLoad && items.length > 0 ? (
        <>
          <div className="media-grid">
            {items
              .map((item) => {
                // Validate item before rendering
                if (!item || !item.id) {
                  console.warn("Invalid item found:", item);
                  return null;
                }

                const imageUrl = getImageUrl(item);
                const title = getTitle(item);
                const episodesProgress = getEpisodesProgress(item);
                const userScoreData = getUserScore(item);

                // Don't render if we don't have basic data
                if (title === "Unknown Title") {
                  console.warn("Item with insufficient data:", item);
                  return null;
                }

                return (
                  <Link
                    key={item.id}
                    to={`/${contentType === "movie" ? "movies" : contentType}/${
                      item.id
                    }`}
                    className="media-grid-card"
                    data-content-type={contentType}
                  >
                    <img
                      src={imageUrl}
                      alt={title}
                      className="media-grid-img"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src =
                          "https://via.placeholder.com/225x338?text=No+Image";
                      }}
                    />
                    <div className="media-grid-body">
                      <h3 className="media-grid-title">{title}</h3>
                      <div className="media-grid-footer">
                        {/* Show episodes progress or time watched */}
                        <span
                          className={`media-card-info episodes-progress ${
                            contentType === "movie" &&
                            listType === "watching" &&
                            item.time_watched
                              ? "time-watched"
                              : ""
                          }`}
                          title={
                            contentType === "movie"
                              ? listType === "watching" && item.time_watched
                                ? "Time watched"
                                : "Movie completion"
                              : "Episodes watched"
                          }
                        >
                          {episodesProgress}
                        </span>
                        {/* Show user score */}
                        <span
                          className={`media-card-score user-score-display ${
                            !userScoreData.isRated ? "not-rated" : ""
                          }`}
                          data-not-rated={!userScoreData.isRated}
                        >
                          {userScoreData.score}
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })
              .filter(Boolean)}
          </div>

          {pageInfo.lastPage > 1 && (
            <div className="pagination">
              <button
                onClick={() => handlePageChange(pageInfo.currentPage - 1)}
                disabled={pageInfo.currentPage === 1}
                className="navbar-btn"
              >
                Previous
              </button>

              <span className="page-info">
                Page {pageInfo.currentPage} of {pageInfo.lastPage}
              </span>

              <button
                onClick={() => handlePageChange(pageInfo.currentPage + 1)}
                disabled={!pageInfo.hasNextPage}
                className="navbar-btn"
              >
                Next
              </button>
            </div>
          )}
        </>
      ) : null}
    </div>
  );
};

export default UserList;
