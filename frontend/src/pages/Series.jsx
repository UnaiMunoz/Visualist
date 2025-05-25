import { useState, useEffect } from "react";
import { Link } from "react-router-dom"; // Agregar importación de Link
import { fetchAllSeries, searchSeries } from "../services/seriesServices";

const Series = () => {
  const [series, setSeries] = useState([]);
  const [loading, setLoading] = useState(true);
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
    try {
      console.log(
        `Fetching series page ${page} with ${itemsPerPage} items per page`
      );
      const data = await fetchAllSeries(page, itemsPerPage);
      console.log("Response data:", data);

      if (!data || !data.series) {
        console.error("Invalid data structure received:", data);
        setSeries([]);
        setPageInfo({
          currentPage: page,
          lastPage: 1,
          hasNextPage: false,
          total: 0,
          perPage: itemsPerPage,
        });
      } else {
        setSeries(data.series);
        setPageInfo(data.pageInfo);
      }
    } catch (error) {
      console.error("Error fetching series:", error);
      setSeries([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

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
    try {
      const data = await searchSeries(term, page, itemsPerPage);
      setSeries(data.series);

      // If we're on the last page, adjust the total to reflect only the loaded results
      if (page === data.pageInfo.lastPage) {
        setPageInfo({
          ...data.pageInfo,
          total: (page - 1) * data.pageInfo.perPage + data.series.length,
        });
      } else {
        setPageInfo(data.pageInfo);
      }
    } catch (error) {
      console.error("Error searching series:", error);
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
        <h1 className="page-title">TV Series</h1>

        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            placeholder="Search series..."
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

      {isSearching && (
        <div className="search-results-info">
          <p>
            Search results for: <strong>{searchTerm}</strong> ({pageInfo.total}{" "}
            results)
          </p>
        </div>
      )}

      <div className="media-grid">
        {series.length === 0 && isSearching ? (
          <div className="no-results">
            No results found for "{searchTerm}". Try a different search term.
          </div>
        ) : series.length === 0 ? (
          <div className="no-results">
            No series data available. Please try again later.
          </div>
        ) : (
          series.map((show) => (
            // Cambiar de div a Link para hacer clickeable
            <Link
              key={show.id}
              to={`/series/${show.id}`}
              className="media-grid-card"
            >
              {show.poster_path ? (
                <img
                  src={`https://image.tmdb.org/t/p/w500${show.poster_path}`}
                  alt={show.name}
                  className="media-grid-img"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src =
                      "https://via.placeholder.com/225x338?text=No+Image";
                  }}
                />
              ) : (
                <div className="no-poster">
                  <span>No Poster Available</span>
                </div>
              )}
              <div className="media-grid-body">
                <h3 className="media-grid-title">{show.name}</h3>
                <div className="media-grid-footer">
                  <span className="media-card-info">
                    {show.first_air_date
                      ? new Date(show.first_air_date).getFullYear()
                      : "N/A"}
                  </span>
                  <span className="media-card-score">
                    {Math.round(show.vote_average * 10)}%
                  </span>
                </div>
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

export default Series;
