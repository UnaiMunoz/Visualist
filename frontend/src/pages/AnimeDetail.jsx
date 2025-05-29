import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getAnimeDetails } from "../services/animeServices";
import AnimeStatusButton from "../components/AnimeStatusButton"; // Cambio aquí

const AnimeDetail = () => {
  const { id } = useParams();
  const [anime, setAnime] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [expandedDescription, setExpandedDescription] = useState(false);

  useEffect(() => {
    const fetchAnimeData = async () => {
      setLoading(true);
      try {
        // Validate ID before making the API call
        if (!id || isNaN(parseInt(id))) {
          throw new Error("Invalid anime ID");
        }

        const data = await getAnimeDetails(id);
        if (!data) {
          throw new Error("No data received from API");
        }
        setAnime(data);
      } catch (err) {
        console.error("Error fetching anime details:", err);
        setError(
          err.message || "Failed to load anime details. Please try again later."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAnimeData();
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
  }, [id]);

  const renderStatusBadge = (status) => {
    let badgeClass = "status-badge";

    switch (status) {
      case "FINISHED":
        badgeClass += " status-finished";
        break;
      case "RELEASING":
        badgeClass += " status-releasing";
        break;
      case "NOT_YET_RELEASED":
        badgeClass += " status-not-released";
        break;
      case "CANCELLED":
        badgeClass += " status-cancelled";
        break;
      case "HIATUS":
        badgeClass += " status-hiatus";
        break;
      default:
        badgeClass += " status-unknown";
    }

    return <span className={badgeClass}>{formatStatus(status)}</span>;
  };

  // Helper to format status text for display
  const formatStatus = (status) => {
    if (!status) return "Unknown";

    // Replace underscores with spaces and capitalize each word
    return status
      .replace(/_/g, " ")
      .split(" ")
      .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
      .join(" ");
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
        <Link to="/anime" className="navbar-btn back-button">
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
          Back to Anime List
        </Link>
      </div>
    );
  }

  if (!anime) {
    return (
      <div className="container error-container">
        <div className="error-icon">🔍</div>
        <h2 className="error-title">Anime Not Found</h2>
        <p className="error-message">
          The anime you're looking for doesn't exist or has been removed.
        </p>
        <Link to="/anime" className="navbar-btn back-button">
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
          Back to Anime List
        </Link>
      </div>
    );
  }

  // Ensure the title object exists and extract the appropriate title
  const title =
    anime.title &&
    (anime.title.english ||
      anime.title.romaji ||
      anime.title.native ||
      "Unknown Title");

  return (
    <div className="anime-detail-page">
      {/* Banner Image Background */}
      {anime.bannerImage ? (
        <div
          className="anime-banner"
          style={{ backgroundImage: `url(${anime.bannerImage})` }}
        >
          <div className="banner-overlay"></div>
        </div>
      ) : anime.coverImage?.large ? (
        <div
          className="anime-banner"
          style={{
            backgroundImage: `url(${anime.coverImage.large})`,
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
          <Link to="/anime" className="navbar-btn back-button">
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
                  anime.coverImage?.large ||
                  "https://via.placeholder.com/500x750?text=No+Image"
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
                    {anime.averageScore || "N/A"}%
                  </span>
                </div>
              </div>
            </div>

            {/* Nuevo botón de estado - Reemplaza ListActionButtons */}
            <AnimeStatusButton
              contentId={parseInt(id)}
              contentType="anime"
              animeTitle={title}
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
                  {renderStatusBadge(anime.status || "UNKNOWN")}
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
                  Format:
                </span>
                <span className="stat-value">
                  {anime.format ? anime.format.replace(/_/g, " ") : "Unknown"}
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
                  Episodes:
                </span>
                <span className="stat-value">
                  {anime.episodes || "Unknown"}
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
                  {formatDuration(anime.duration)}
                </span>
              </div>

              {anime.genres && anime.genres.length > 0 && (
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
                    {anime.genres.map((genre, index) => (
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
                        {genre}
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
                className={`tab-button ${
                  activeTab === "characters" ? "active" : ""
                }`}
                onClick={() => setActiveTab("characters")}
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
                Characters
              </button>
            </div>

            <div className="anime-tab-content">
              {activeTab === "overview" && (
                <div className="tab-pane">
                  {/* Description */}
                  {anime.description && (
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
                        dangerouslySetInnerHTML={{
                          __html:
                            anime.description || "No description available.",
                        }}
                      ></div>
                      {anime.description && anime.description.length > 300 && (
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
                    {anime.episodes && (
                      <div className="anime-info-card">
                        <div className="anime-info-title">Episodes</div>
                        <div className="anime-info-value">{anime.episodes}</div>
                      </div>
                    )}

                    {anime.duration && (
                      <div className="anime-info-card">
                        <div className="anime-info-title">Episode Duration</div>
                        <div className="anime-info-value">
                          {formatDuration(anime.duration)}
                        </div>
                      </div>
                    )}

                    {anime.status && (
                      <div className="anime-info-card">
                        <div className="anime-info-title">Status</div>
                        <div className="anime-info-value">
                          {formatStatus(anime.status)}
                        </div>
                      </div>
                    )}

                    {anime.season && anime.seasonYear && (
                      <div className="anime-info-card">
                        <div className="anime-info-title">Season</div>
                        <div className="anime-info-value">
                          {anime.season.charAt(0) +
                            anime.season.slice(1).toLowerCase()}{" "}
                          {anime.seasonYear}
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
                        {anime.averageScore || "-"}%
                      </div>
                      <div className="stat-card-label">Average Score</div>
                    </div>

                    <div className="stat-card">
                      <div className="stat-card-value">
                        {anime.popularity?.toLocaleString() || "-"}
                      </div>
                      <div className="stat-card-label">Popularity</div>
                    </div>
                  </div>

                  {/* Studios */}
                  {anime.studios &&
                    anime.studios.nodes &&
                    anime.studios.nodes.length > 0 && (
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
                          Studios
                        </h3>
                        <div className="studios-list">
                          {anime.studios.nodes.map((studio, index) => (
                            <span key={index} className="studio-item">
                              {studio.name}
                            </span>
                          ))}
                        </div>
                      </>
                    )}
                </div>
              )}

              {activeTab === "characters" && (
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
                    Voice Actors & Characters
                  </h3>
                  {anime.characters &&
                  anime.characters.nodes &&
                  anime.characters.nodes.length > 0 ? (
                    <div className="characters-grid">
                      {anime.characters.nodes.map((character) => (
                        <div key={character.id} className="character-card">
                          <div className="character-image-container">
                            <img
                              src={
                                character.image?.large ||
                                character.image?.medium ||
                                "https://via.placeholder.com/225x338?text=No+Image"
                              }
                              alt={character.name?.full || "Character"}
                              className="character-image"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src =
                                  "https://via.placeholder.com/225x338?text=No+Image";
                              }}
                            />
                            <div className="character-role">Voice Actor</div>
                          </div>
                          <div className="character-info">
                            <div className="character-name">
                              {character.name?.full || "Unknown"}
                            </div>
                            {/* Aquí añadimos el nombre del personaje interpretado */}
                            {character.character && (
                              <div className="character-native-name">
                                as {character.character}
                              </div>
                            )}
                            {/* Si no existe character pero existe native name, lo mostramos */}
                            {!character.character && character.name?.native && (
                              <div className="character-native-name">
                                {character.name.native}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="no-characters">
                      No character information available for this anime.
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

export default AnimeDetail;
