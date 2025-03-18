import { useState, useEffect } from "react";
import { fetchAllAnime, searchAnime } from "../services/anilistApi";

const Anime = () => {
  const [anime, setAnime] = useState([]);
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

  const fetchData = async (page = 1) => {
    setLoading(true);
    try {
      const data = await fetchAllAnime(page, 24);
      setAnime(data.anime);
      setPageInfo(data.pageInfo);
    } catch (error) {
      console.error("Error fetching anime:", error);
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
      const data = await searchAnime(term, page, 24);
      setAnime(data.anime);

      // Si estamos en la última página, ajustamos el total para que refleje solo los resultados cargados
      if (page === data.pageInfo.lastPage) {
        setPageInfo({
          ...data.pageInfo,
          total: (page - 1) * data.pageInfo.perPage + data.anime.length,
        });
      } else {
        setPageInfo(data.pageInfo);
      }
    } catch (error) {
      console.error("Error searching anime:", error);
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
        <div class="wrapper">
          <div class="circle"></div>
          <div class="circle"></div>
          <div class="circle"></div>
          <div class="shadow"></div>
          <div class="shadow"></div>
          <div class="shadow"></div>
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
        ) : (
          anime.map((item) => (
            <div key={item.id} className="media-grid-card">
              <img
                src={item.coverImage.large}
                alt={item.title.english || item.title.romaji}
                className="media-grid-img"
              />
              <div className="media-grid-body">
                <h3 className="media-grid-title">
                  {item.title.english || item.title.romaji}
                </h3>
                <div className="media-grid-footer">
                  <span className="media-card-info">{item.episodes} eps</span>
                  <span className="media-card-score">{item.averageScore}%</span>
                </div>
                <div className="genre-tags">
                  {item.genres.slice(0, 3).map((genre) => (
                    <span key={genre} className="genre-tag">
                      {genre}
                    </span>
                  ))}
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
          Page {pageInfo.currentPage} of {pageInfo.lastPage}
        </span>

        <button
          onClick={() => handlePageChange(pageInfo.currentPage + 1)}
          disabled={pageInfo.currentPage === pageInfo.lastPage}
          className="navbar-btn"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Anime;
