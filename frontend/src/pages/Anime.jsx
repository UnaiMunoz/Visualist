import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { fetchAllAnime, searchAnime } from "../services/animeServices";

const Anime = () => {
  const [anime, setAnime] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pageInfo, setPageInfo] = useState({
    currentPage: 1,
    lastPage: 1,
    hasNextPage: false,
    total: 0,
    perPage: 24,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const itemsPerPage = 24;

  const fetchData = async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      console.log(
        `Fetching anime page ${page} with ${itemsPerPage} items per page`
      );
      const data = await fetchAllAnime(page, itemsPerPage);
      console.log("Response data:", data);

      if (!data || !data.anime) {
        console.error("Invalid data structure received:", data);
        setError("Failed to load anime data. Please try again later.");
        setAnime([]);
        setPageInfo({
          currentPage: page,
          lastPage: 1,
          hasNextPage: false,
          total: 0,
          perPage: itemsPerPage,
        });
      } else {
        setAnime(data.anime);
        setPageInfo(data.pageInfo);
      }
    } catch (error) {
      console.error("Error fetching anime:", error);
      setError("Failed to load anime data. Please try again later.");
      setAnime([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []); // Fetch data on component mount

  const handlePageChange = (newPage) => {
    window.scrollTo(0, 0);
    if (isSearching) {
      handleSearchWithPage(searchTerm, newPage);
    } else {
      fetchData(newPage);
    }
  };

  const handleSearchWithPage = async (term, page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const data = await searchAnime(term, page, itemsPerPage);
      setAnime(data.anime);
      setPageInfo(data.pageInfo);
    } catch (error) {
      console.error("Error searching anime:", error);
      setError("Error searching for anime. Please try again.");
      setAnime([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();

    if (!searchTerm.trim()) {
      setIsSearching(false);
      fetchData();
      return;
    }

    setIsSearching(true);
    handleSearchWithPage(searchTerm);
  };

  const clearSearch = () => {
    setSearchTerm("");
    setIsSearching(false);
    fetchData();
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
    <div className="container">
      <div className="search-container">
        <h1 className="page-title">Anime</h1>

        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            placeholder="Search anime..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <button type="submit" className="navbar-btn search-button">
            Search
          </button>

          {isSearching && (
            <button
              type="button"
              onClick={clearSearch}
              className="navbar-btn clear-button"
            >
              Clear
            </button>
          )}
        </form>
      </div>

      {error && (
        <div
          className="error-message"
          style={{
            padding: "1rem",
            margin: "1rem 0",
            textAlign: "center",
            color: "#fff",
            backgroundColor: "#e74c3c",
            borderRadius: "4px",
          }}
        >
          {error}
        </div>
      )}

      {isSearching && (
        <div className="search-results-info">
          <p>
            Search results for: <strong>{searchTerm}</strong> ({pageInfo.total}{" "}
            results)
          </p>
        </div>
      )}

      <div className="media-grid">
        {anime.length === 0 && isSearching ? (
          <div className="no-results">
            No results found for "{searchTerm}". Try a different search term.
          </div>
        ) : anime.length === 0 ? (
          <div className="no-results">
            No anime data available. Please try again later.
          </div>
        ) : (
          anime.map((item) => (
            <Link
              key={item.id}
              to={`/anime/${item.id}`}
              className="media-grid-card"
            >
              {item.coverImage && item.coverImage.large ? (
                <img
                  src={item.coverImage.large}
                  alt={item.title.english || item.title.romaji}
                  className="media-grid-img"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src =
                      "https://via.placeholder.com/225x338?text=No+Image";
                  }}
                />
              ) : (
                <div className="no-poster">
                  <span>No Image Available</span>
                </div>
              )}
              <div className="media-grid-body">
                <h3 className="media-grid-title">
                  {item.title.english || item.title.romaji}
                </h3>
                <div className="media-grid-footer">
                  <span className="media-card-info">
                    {item.episodes ? `${item.episodes} eps` : "Unknown eps"}
                  </span>
                  <span className="media-card-score">{item.averageScore}%</span>
                </div>
                {item.genres && item.genres.length > 0 && (
                  <div className="genre-tags">
                    {item.genres.slice(0, 2).map((genre, idx) => (
                      <span key={idx} className="genre-tag">
                        {genre}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </Link>
          ))
        )}
      </div>

      <div className="pagination">
        <button
          onClick={() => handlePageChange(pageInfo.currentPage - 1)}
          disabled={pageInfo.currentPage === 1}
          className="navbar-btn"
        >
          Previous
        </button>

        <span className="page-info">
          Page {pageInfo.currentPage} of {pageInfo.lastPage || 1}
        </span>

        <button
          onClick={() => handlePageChange(pageInfo.currentPage + 1)}
          disabled={!pageInfo.hasNextPage}
          className="navbar-btn"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Anime;
