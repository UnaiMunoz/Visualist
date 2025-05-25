import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getMovieDetails } from "../services/moviesServices";
import MovieStatusButton from "../components/MovieStatusButton";

const MovieDetail = () => {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [expandedDescription, setExpandedDescription] = useState(false);

  useEffect(() => {
    const fetchMovieData = async () => {
      setLoading(true);
      try {
        // Validate ID before making the API call
        if (!id || isNaN(parseInt(id))) {
          throw new Error("Invalid movie ID");
        }

        const data = await getMovieDetails(id);
        if (!data) {
          throw new Error("No data received from API");
        }
        setMovie(data);
      } catch (err) {
        console.error("Error fetching movie details:", err);
        setError(
          err.message || "Failed to load movie details. Please try again later."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchMovieData();
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
  }, [id]);

  const renderStatusBadge = (status) => {
    let badgeClass = "status-badge";

    switch (status) {
      case "Released":
        badgeClass += " status-finished";
        break;
      case "Post Production":
        badgeClass += " status-releasing";
        break;
      case "In Production":
        badgeClass += " status-releasing";
        break;
      case "Planned":
        badgeClass += " status-not-released";
        break;
      case "Canceled":
        badgeClass += " status-cancelled";
        break;
      default:
        badgeClass += " status-unknown";
    }

    return <span className={badgeClass}>{status || "Unknown"}</span>;
  };

  // Format duration in minutes to hours and minutes
  const formatDuration = (minutes) => {
    if (!minutes) return "Unknown";

    if (minutes < 60) {
      return `${minutes} min`;
    }

    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (remainingMinutes === 0) {
      return `${hours} hr`;
    }

    return `${hours} hr ${remainingMinutes} min`;
  };

  // Format budget and revenue
  const formatCurrency = (amount) => {
    if (!amount || amount === 0) return "N/A";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
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

  if (error) {
    return (
      <div className="container error-container">
        <div className="error-icon">⚠️</div>
        <h2 className="error-title">Oops! Something went wrong</h2>
        <p className="error-message">{error}</p>
        <Link to="/movies" className="navbar-btn back-button">
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
            <path d="M19 12H5"></path>
            <path d="M12 19l-7-7 7-7"></path>
          </svg>
          Back to Movies List
        </Link>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="container error-container">
        <div className="error-icon">🔍</div>
        <h2 className="error-title">Movie Not Found</h2>
        <p className="error-message">
          The movie you're looking for doesn't exist or has been removed.
        </p>
        <Link to="/movies" className="navbar-btn back-button">
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
            <path d="M19 12H5"></path>
            <path d="M12 19l-7-7 7-7"></path>
          </svg>
          Back to Movies List
        </Link>
      </div>
    );
  }

  const title = movie.title || "Unknown Title";

  return (
    <div className="anime-detail-page">
      {/* Banner Image Background */}
      {movie.backdrop_path ? (
        <div
          className="anime-banner"
          style={{
            backgroundImage: `url(https://image.tmdb.org/t/p/original${movie.backdrop_path})`,
          }}
        >
          <div className="banner-overlay"></div>
        </div>
      ) : movie.poster_path ? (
        <div
          className="anime-banner"
          style={{
            backgroundImage: `url(https://image.tmdb.org/t/p/w500${movie.poster_path})`,
            backgroundPosition: "center 20%",
            filter: "blur(3px)",
          }}
        >
          <div className="banner-overlay"></div>
        </div>
      ) : (
        <div className="anime-banner default-banner">
          <div className="banner-overlay"></div>
        </div>
      )}

      <div className="container anime-detail-container">
        <div className="anime-detail-header">
          <Link to="/movies" className="navbar-btn back-button">
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
              <path d="M19 12H5"></path>
              <path d="M12 19l-7-7 7-7"></path>
            </svg>
            Back
          </Link>
          <h1 className="anime-detail-title">{title}</h1>
        </div>

        <div className="anime-detail-content">
          <div className="anime-detail-sidebar">
            <div className="anime-detail-poster">
              <img
                src={
                  movie.poster_path
                    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                    : "https://via.placeholder.com/500x750?text=No+Image"
                }
                alt={title}
                className="anime-detail-image"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src =
                    "https://via.placeholder.com/500x750?text=No+Image";
                }}
              />

              <div className="anime-rating">
                <div className="rating-circle">
                  <span className="rating-score">
                    {movie.vote_average
                      ? Math.round(movie.vote_average * 10)
                      : "N/A"}
                    %
                  </span>
                </div>
              </div>
            </div>

            {/* Movie Status Button */}
            <MovieStatusButton
              contentId={parseInt(id)}
              contentType="movie"
              movieTitle={title}
            />

            <div className="anime-stats">
              <div className="anime-stat-item">
                <span className="stat-label">
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
                  Status:
                </span>
                <span className="stat-value">
                  {renderStatusBadge(movie.status)}
                </span>
              </div>

              <div className="anime-stat-item">
                <span className="stat-label">
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
                    <rect
                      x="3"
                      y="4"
                      width="18"
                      height="18"
                      rx="2"
                      ry="2"
                    ></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                  </svg>
                  Release Date:
                </span>
                <span className="stat-value">
                  {movie.release_date
                    ? new Date(movie.release_date).toLocaleDateString()
                    : "Unknown"}
                </span>
              </div>

              <div className="anime-stat-item">
                <span className="stat-label">
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
                  Duration:
                </span>
                <span className="stat-value">
                  {formatDuration(movie.runtime)}
                </span>
              </div>

              {movie.genres && movie.genres.length > 0 && (
                <div className="anime-stat-item anime-stat-genres">
                  <span className="stat-label">
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
                      <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
                      <polyline points="2 17 12 22 22 17"></polyline>
                      <polyline points="2 12 12 17 22 12"></polyline>
                    </svg>
                    Genres:
                  </span>
                  <div className="anime-genres">
                    {movie.genres.map((genre, index) => (
                      <span key={index} className="genre-tag">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
                          <line x1="7" y1="7" x2="7.01" y2="7"></line>
                        </svg>
                        {genre.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="anime-detail-main">
            <div className="anime-tabs">
              <button
                className={`tab-button ${
                  activeTab === "overview" ? "active" : ""
                }`}
                onClick={() => setActiveTab("overview")}
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
                  <line x1="12" y1="16" x2="12" y2="12"></line>
                  <line x1="12" y1="8" x2="12.01" y2="8"></line>
                </svg>
                Overview
              </button>

              <button
                className={`tab-button ${activeTab === "cast" ? "active" : ""}`}
                onClick={() => setActiveTab("cast")}
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
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                Cast & Crew
              </button>
            </div>

            <div className="anime-tab-content">
              {activeTab === "overview" && (
                <div className="tab-pane">
                  {/* Description */}
                  {movie.overview && (
                    <div className="anime-description">
                      <h3 className="section-title">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                          <polyline points="14 2 14 8 20 8"></polyline>
                          <line x1="16" y1="13" x2="8" y2="13"></line>
                          <line x1="16" y1="17" x2="8" y2="17"></line>
                          <polyline points="10 9 9 9 8 9"></polyline>
                        </svg>
                        Synopsis
                      </h3>
                      <div
                        className={`description-content ${
                          expandedDescription ? "expanded" : "collapsed"
                        }`}
                      >
                        {movie.overview || "No description available."}
                      </div>
                      {movie.overview && movie.overview.length > 300 && (
                        <button
                          onClick={() =>
                            setExpandedDescription(!expandedDescription)
                          }
                          className="expand-btn"
                        >
                          {expandedDescription ? "Show Less" : "Read More"}
                        </button>
                      )}
                    </div>
                  )}

                  {/* Basic information */}
                  <h3 className="section-title">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="12" y1="16" x2="12" y2="12"></line>
                      <line x1="12" y1="8" x2="12.01" y2="8"></line>
                    </svg>
                    Details
                  </h3>

                  <div className="anime-info-grid">
                    {movie.runtime && (
                      <div className="anime-info-card">
                        <div className="anime-info-title">Duration</div>
                        <div className="anime-info-value">
                          {formatDuration(movie.runtime)}
                        </div>
                      </div>
                    )}

                    {movie.budget && movie.budget > 0 && (
                      <div className="anime-info-card">
                        <div className="anime-info-title">Budget</div>
                        <div className="anime-info-value">
                          {formatCurrency(movie.budget)}
                        </div>
                      </div>
                    )}

                    {movie.revenue && movie.revenue > 0 && (
                      <div className="anime-info-card">
                        <div className="anime-info-title">Revenue</div>
                        <div className="anime-info-value">
                          {formatCurrency(movie.revenue)}
                        </div>
                      </div>
                    )}

                    {movie.original_language && (
                      <div className="anime-info-card">
                        <div className="anime-info-title">
                          Original Language
                        </div>
                        <div className="anime-info-value">
                          {movie.original_language.toUpperCase()}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Statistics */}
                  <h3 className="section-title">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                    </svg>
                    Statistics
                  </h3>

                  <div className="anime-stats-grid">
                    <div className="stat-card">
                      <div className="stat-card-value">
                        {movie.vote_average
                          ? Math.round(movie.vote_average * 10)
                          : "-"}
                        %
                      </div>
                      <div className="stat-card-label">User Score</div>
                    </div>

                    <div className="stat-card">
                      <div className="stat-card-value">
                        {movie.popularity?.toFixed(0) || "-"}
                      </div>
                      <div className="stat-card-label">Popularity</div>
                    </div>

                    <div className="stat-card">
                      <div className="stat-card-value">
                        {movie.vote_count?.toLocaleString() || "-"}
                      </div>
                      <div className="stat-card-label">Vote Count</div>
                    </div>
                  </div>

                  {/* Production Companies */}
                  {movie.production_companies &&
                    movie.production_companies.length > 0 && (
                      <>
                        <h3 className="section-title">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                            <polyline points="9 22 9 12 15 12 15 22"></polyline>
                          </svg>
                          Production Companies
                        </h3>
                        <div className="studios-list">
                          {movie.production_companies.map((company, index) => (
                            <span key={index} className="studio-item">
                              {company.name}
                            </span>
                          ))}
                        </div>
                      </>
                    )}
                </div>
              )}

              {activeTab === "cast" && (
                <div className="tab-pane">
                  <h3 className="section-title">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                    Cast & Crew
                  </h3>
                  {movie.credits &&
                  movie.credits.cast &&
                  movie.credits.cast.length > 0 ? (
                    <div className="characters-grid">
                      {movie.credits.cast.slice(0, 12).map((person) => (
                        <div key={person.id} className="character-card">
                          <div className="character-image-container">
                            <img
                              src={
                                person.profile_path
                                  ? `https://image.tmdb.org/t/p/w185${person.profile_path}`
                                  : "https://via.placeholder.com/185x278?text=No+Image"
                              }
                              alt={person.name || "Cast Member"}
                              className="character-image"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src =
                                  "https://via.placeholder.com/185x278?text=No+Image";
                              }}
                            />
                            <div className="character-role">Cast</div>
                          </div>
                          <div className="character-info">
                            <div className="character-name">
                              {person.name || "Unknown"}
                            </div>
                            {person.character && (
                              <div className="character-native-name">
                                as {person.character}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="no-characters">
                      No cast information available for this movie.
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieDetail;
