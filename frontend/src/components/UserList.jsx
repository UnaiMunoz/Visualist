// frontend/src/components/UserList.jsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getUserList } from "../services/listServices";

const UserList = ({ listType, contentType = "anime" }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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
      try {
        const result = await getUserList(listType, contentType, page, 8);
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

    // Reset all state when dependencies change
    setItems([]);
    setLoading(true);
    setError(null);
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

  // Show loading spinner while data is being fetched
  if (loading) {
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

      {items.length === 0 ? (
        <div className="empty-list">
          <p>No items in your {formatListType().toLowerCase()} list yet.</p>
          <Link to={`/${contentType}`} className="navbar-btn">
            Browse {contentType}
          </Link>
        </div>
      ) : (
        <>
          <div className="media-grid">
            {items.map((item) => (
              <Link
                key={item.id}
                to={`/${contentType}/${item.id}`}
                className="media-grid-card"
              >
                {contentType === "anime" ? (
                  <img
                    src={
                      item.coverImage?.large ||
                      "https://via.placeholder.com/225x338?text=No+Image"
                    }
                    alt={item.title.english || item.title.romaji}
                    className="media-grid-img"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src =
                        "https://via.placeholder.com/225x338?text=No+Image";
                    }}
                  />
                ) : (
                  <img
                    src={
                      item.poster_path
                        ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
                        : "https://via.placeholder.com/225x338?text=No+Image"
                    }
                    alt={item.title || item.name}
                    className="media-grid-img"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src =
                        "https://via.placeholder.com/225x338?text=No+Image";
                    }}
                  />
                )}
                <div className="media-grid-body">
                  <h3 className="media-grid-title">
                    {contentType === "anime"
                      ? item.title.english || item.title.romaji
                      : item.title || item.name}
                  </h3>
                  <div className="media-grid-footer">
                    <span className="media-card-info">
                      {contentType === "anime"
                        ? item.startDate && item.startDate.year
                          ? item.startDate.year
                          : "N/A"
                        : item.release_date
                        ? new Date(item.release_date).getFullYear()
                        : "N/A"}
                    </span>
                    <span className="media-card-score">
                      {contentType === "anime"
                        ? (item.averageScore || "N/A") + "%"
                        : Math.round((item.vote_average || 0) * 10) + "%"}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
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
      )}
    </div>
  );
};

export default UserList;
