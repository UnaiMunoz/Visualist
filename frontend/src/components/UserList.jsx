// frontend/src/components/UserList.jsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getUserList } from "../services/listServices";

const UserList = ({ listType, contentType = "movie" }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true); // New state
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
      setIsInitialLoad(true); // Set initial load flag
      try {
        const result = await getUserList(listType, contentType, page, 8);
        console.log(`=== Debug: ${contentType} ${listType} list ===`);
        console.log("Full result:", result);
        console.log("Items array:", result.items);
        if (result.items && result.items.length > 0) {
          console.log("First item structure:", result.items[0]);
          console.log("First item title:", result.items[0].title);
        }

        // Only update state if we have valid data or empty array
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
        setIsInitialLoad(false); // Clear initial load flag
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
    // For movies and series (both use TMDB structure)
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
        // For series
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

  // Helper function to get the appropriate year
  const getYear = (item) => {
    try {
      if (contentType === "movie") {
        if (item.release_date) {
          const year = new Date(item.release_date).getFullYear();
          return isNaN(year) ? "N/A" : String(year);
        }
        return "N/A";
      } else {
        // For series
        if (item.first_air_date) {
          const year = new Date(item.first_air_date).getFullYear();
          return isNaN(year) ? "N/A" : String(year);
        }
        return "N/A";
      }
    } catch (error) {
      console.error("Error getting year:", error, item);
      return "N/A";
    }
  };

  // Helper function to get the appropriate score
  const getScore = (item) => {
    try {
      // For movies and series (both use TMDB structure)
      const score = item.vote_average;
      return score ? String(Math.round(score * 10)) + "%" : "N/A";
    } catch (error) {
      console.error("Error getting score:", error, item);
      return "N/A";
    }
  };

  // Helper function to format time watched (for movies)
  const formatTimeWatched = (minutes) => {
    if (!minutes || minutes === 0) return null;

    if (minutes < 60) {
      return `${minutes}m watched`;
    }

    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (remainingMinutes === 0) {
      return `${hours}h watched`;
    }

    return `${hours}h ${remainingMinutes}m watched`;
  };

  // Helper function to format progress (for series)
  const formatProgress = (episodes) => {
    if (!episodes || episodes === 0) return null;
    return `${episodes} episodes watched`;
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
                const year = getYear(item);
                const score = getScore(item);

                // Get progress/time info for watching items
                const progressInfo =
                  listType === "watching"
                    ? contentType === "movie"
                      ? formatTimeWatched(item.time_watched)
                      : formatProgress(item.progress)
                    : null;

                // Don't render if we don't have basic data
                if (
                  title === "Unknown Title" &&
                  year === "N/A" &&
                  score === "N/A"
                ) {
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
                        <span className="media-card-info">{year}</span>
                        <span className="media-card-score">{score}</span>
                      </div>
                      {progressInfo && (
                        <div className="media-grid-progress">
                          <span className="progress-info">{progressInfo}</span>
                        </div>
                      )}
                      {item.score && item.score > 0 && (
                        <div className="media-grid-user-score">
                          <span className="user-score">
                            Your score: {item.score}/10
                          </span>
                        </div>
                      )}
                    </div>
                  </Link>
                );
              })
              .filter(Boolean)}{" "}
            {/* Filter out null values */}
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
