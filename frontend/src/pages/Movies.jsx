import { useState, useEffect } from "react";
import { fetchAllMovies, searchMovies } from "../services/moviesServices";

const Movies = () => {
  const [movies, setMovies] = useState([]);
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
        `Fetching movies page ${page} with ${itemsPerPage} items per page`
      );
      const data = await fetchAllMovies(page, itemsPerPage);
      console.log("Response data:", data);

      if (!data || !data.movies) {
        console.error("Invalid data structure received:", data);
        setMovies([]);
        setPageInfo({
          currentPage: page,
          lastPage: 1,
          hasNextPage: false,
          total: 0,
          perPage: itemsPerPage,
        });
      } else {
        setMovies(data.movies);
        setPageInfo(data.pageInfo);
      }
    } catch (error) {
      console.error("Error fetching movies:", error);
      setMovies([]);
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
      const data = await searchMovies(term, page, itemsPerPage);
      setMovies(data.movies);

      // If we're on the last page, adjust the total to reflect only the loaded results
      if (page === data.pageInfo.lastPage) {
        setPageInfo({
          ...data.pageInfo,
          total: (page - 1) * data.pageInfo.perPage + data.movies.length,
        });
      } else {
        setPageInfo(data.pageInfo);
      }
    } catch (error) {
      console.error("Error searching movies:", error);
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
        <h1 className="page-title">Movies</h1>

        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            placeholder="Search movies..."
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
        {movies.length === 0 && isSearching ? (
          <div className="no-results">
            No results found for "{searchTerm}". Try a different search term.
          </div>
        ) : movies.length === 0 ? (
          <div className="no-results">
            No movie data available. Please try again later.
          </div>
        ) : (
          movies.map((movie) => (
            <div key={movie.id} className="media-grid-card">
              <img
                src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                alt={movie.title}
                className="media-grid-img"
              />
              <div className="media-grid-body">
                <h3 className="media-grid-title">{movie.title}</h3>
                <div className="media-grid-footer">
                  <span className="media-card-info">
                    {new Date(movie.release_date).getFullYear()}
                  </span>
                  <span className="media-card-score">
                    {Math.round(movie.vote_average * 10)}%
                  </span>
                </div>
              </div>
            </div>
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

export default Movies;
