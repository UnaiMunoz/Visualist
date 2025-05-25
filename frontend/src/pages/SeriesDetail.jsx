import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getSeriesDetails } from "../services/seriesServices";
import SeriesStatusButton from "../components/SeriesStatusButton";

const SeriesDetail = () => {
  const { id } = useParams();
  const [series, setSeries] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [expandedDescription, setExpandedDescription] = useState(false);

  useEffect(() => {
    const fetchSeriesData = async () => {
      setLoading(true);
      try {
        // Validate ID before making the API call
        if (!id || isNaN(parseInt(id))) {
          throw new Error("Invalid series ID");
        }

        const data = await getSeriesDetails(id);
        if (!data) {
          throw new Error("No data received from API");
        }
        setSeries(data);
      } catch (err) {
        console.error("Error fetching series details:", err);
        setError(
          err.message ||
            "Failed to load series details. Please try again later."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchSeriesData();
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
  }, [id]);

  const renderStatusBadge = (status) => {
    let badgeClass = "status-badge";

    switch (status) {
      case "Ended":
        badgeClass += " status-finished";
        break;
      case "Returning Series":
        badgeClass += " status-releasing";
        break;
      case "In Production":
        badgeClass += " status-releasing";
        break;
      case "Planned":
        badgeClass += " status-not-released";
        break;
      case "Canceled":
      case "Cancelled":
        badgeClass += " status-cancelled";
        break;
      default:
        badgeClass += " status-unknown";
    }

    return <span className={badgeClass}>{status || "Unknown"}</span>;
  };

  // Format duration in minutes to hours and minutes
  const formatDuration = (minutes) => {
    if (!minutes || minutes.length === 0) return "Unknown";

    // If it's an array, take the first value
    const duration = Array.isArray(minutes) ? minutes[0] : minutes;

    if (duration < 60) {
      return `${duration} min`;
    }

    const hours = Math.floor(duration / 60);
    const remainingMinutes = duration % 60;

    if (remainingMinutes === 0) {
      return `${hours} hr`;
    }

    return `${hours} hr ${remainingMinutes} min`;
  };

  // Format creator information
  const formatCreators = (creators) => {
    if (!creators || creators.length === 0) return "Unknown";
    return creators.map((creator) => creator.name).join(", ");
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
        <Link to="/series" className="navbar-btn back-button">
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
          Back to Series List
        </Link>
      </div>
    );
  }

  if (!series) {
    return (
      <div className="container error-container">
        <div className="error-icon">🔍</div>
        <h2 className="error-title">Series Not Found</h2>
        <p className="error-message">
          The series you're looking for doesn't exist or has been removed.
        </p>
        <Link to="/series" className="navbar-btn back-button">
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
          Back to Series List
        </Link>
      </div>
    );
  }

  const title = series.name || series.original_name || "Unknown Title";

  return (
    <div className="anime-detail-page">
      {/* Banner Image Background */}
      {series.backdrop_path ? (
        <div
          className="anime-banner"
          style={{
            backgroundImage: `url(https://image.tmdb.org/t/p/original${series.backdrop_path})`,
          }}
        >
          <div className="banner-overlay"></div>
        </div>
      ) : series.poster_path ? (
        <div
          className="anime-banner"
          style={{
            backgroundImage: `url(https://image.tmdb.org/t/p/w500${series.poster_path})`,
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
          <Link to="/series" className="navbar-btn back-button">
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
                  series.poster_path
                    ? `https://image.tmdb.org/t/p/w500${series.poster_path}`
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
                    {series.vote_average
                      ? Math.round(series.vote_average * 10)
                      : "N/A"}
                    %
                  </span>
                </div>
              </div>
            </div>

            {/* Series Status Button */}
            <SeriesStatusButton
              contentId={parseInt(id)}
              contentType="series"
              seriesTitle={title}
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
                  {renderStatusBadge(series.status)}
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
                  First Air Date:
                </span>
                <span className="stat-value">
                  {series.first_air_date
                    ? new Date(series.first_air_date).toLocaleDateString()
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
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                  </svg>
                  Seasons:
                </span>
                <span className="stat-value">
                  {series.number_of_seasons || "Unknown"}
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
                  Episodes:
                </span>
                <span className="stat-value">
                  {series.number_of_episodes || "Unknown"}
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
                  Episode Runtime:
                </span>
                <span className="stat-value">
                  {formatDuration(series.episode_run_time)}
                </span>
              </div>

              {series.genres && series.genres.length > 0 && (
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
                    {series.genres.map((genre, index) => (
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

              <button
                className={`tab-button ${
                  activeTab === "seasons" ? "active" : ""
                }`}
                onClick={() => setActiveTab("seasons")}
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
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
                Seasons
              </button>
            </div>

            <div className="anime-tab-content">
              {activeTab === "overview" && (
                <div className="tab-pane">
                  {/* Description */}
                  {series.overview && (
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
                        {series.overview || "No description available."}
                      </div>
                      {series.overview && series.overview.length > 300 && (
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
                    {series.number_of_seasons && (
                      <div className="anime-info-card">
                        <div className="anime-info-title">Seasons</div>
                        <div className="anime-info-value">
                          {series.number_of_seasons}
                        </div>
                      </div>
                    )}

                    {series.number_of_episodes && (
                      <div className="anime-info-card">
                        <div className="anime-info-title">Total Episodes</div>
                        <div className="anime-info-value">
                          {series.number_of_episodes}
                        </div>
                      </div>
                    )}

                    {series.episode_run_time && (
                      <div className="anime-info-card">
                        <div className="anime-info-title">Episode Runtime</div>
                        <div className="anime-info-value">
                          {formatDuration(series.episode_run_time)}
                        </div>
                      </div>
                    )}

                    {series.original_language && (
                      <div className="anime-info-card">
                        <div className="anime-info-title">
                          Original Language
                        </div>
                        <div className="anime-info-value">
                          {series.original_language.toUpperCase()}
                        </div>
                      </div>
                    )}

                    {series.created_by && series.created_by.length > 0 && (
                      <div className="anime-info-card">
                        <div className="anime-info-title">Created By</div>
                        <div className="anime-info-value">
                          {formatCreators(series.created_by)}
                        </div>
                      </div>
                    )}

                    {series.networks && series.networks.length > 0 && (
                      <div className="anime-info-card">
                        <div className="anime-info-title">Network</div>
                        <div className="anime-info-value">
                          {series.networks[0].name}
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
                        {series.vote_average
                          ? Math.round(series.vote_average * 10)
                          : "-"}
                        %
                      </div>
                      <div className="stat-card-label">User Score</div>
                    </div>

                    <div className="stat-card">
                      <div className="stat-card-value">
                        {series.popularity?.toFixed(0) || "-"}
                      </div>
                      <div className="stat-card-label">Popularity</div>
                    </div>

                    <div className="stat-card">
                      <div className="stat-card-value">
                        {series.vote_count?.toLocaleString() || "-"}
                      </div>
                      <div className="stat-card-label">Vote Count</div>
                    </div>
                  </div>

                  {/* Production Companies */}
                  {series.production_companies &&
                    series.production_companies.length > 0 && (
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
                          {series.production_companies.map((company, index) => (
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
                  {series.credits &&
                  series.credits.cast &&
                  series.credits.cast.length > 0 ? (
                    <div className="characters-grid">
                      {series.credits.cast.slice(0, 12).map((person) => (
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
                      No cast information available for this series.
                    </p>
                  )}
                </div>
              )}

              {activeTab === "seasons" && (
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
                    Seasons
                  </h3>
                  {series.seasons && series.seasons.length > 0 ? (
                    <div className="characters-grid">
                      {series.seasons
                        .filter((season) => season.season_number > 0) // Filter out specials (season 0)
                        .map((season) => (
                          <div key={season.id} className="character-card">
                            <div className="character-image-container">
                              <img
                                src={
                                  season.poster_path
                                    ? `https://image.tmdb.org/t/p/w300${season.poster_path}`
                                    : series.poster_path
                                    ? `https://image.tmdb.org/t/p/w300${series.poster_path}`
                                    : "https://via.placeholder.com/300x450?text=No+Image"
                                }
                                alt={
                                  season.name ||
                                  `Season ${season.season_number}`
                                }
                                className="character-image"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src =
                                    "https://via.placeholder.com/300x450?text=No+Image";
                                }}
                              />
                              <div className="character-role">
                                {season.episode_count} Episodes
                              </div>
                            </div>
                            <div className="character-info">
                              <div className="character-name">
                                {season.name ||
                                  `Season ${season.season_number}`}
                              </div>
                              {season.air_date && (
                                <div className="character-native-name">
                                  {new Date(season.air_date).getFullYear()}
                                </div>
                              )}
                              {season.overview && (
                                <div className="character-details">
                                  <div className="season-overview">
                                    {season.overview.length > 100
                                      ? `${season.overview.substring(
                                          0,
                                          100
                                        )}...`
                                      : season.overview}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <p className="no-characters">
                      No season information available for this series.
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

export default SeriesDetail;
