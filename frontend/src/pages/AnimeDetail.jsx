import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getAnimeDetails } from "../services/animeServices";

const AnimeDetail = () => {
  const { id } = useParams();
  const [anime, setAnime] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    const fetchAnimeData = async () => {
      setLoading(true);
      try {
        const data = await getAnimeDetails(id);
        setAnime(data);
      } catch (err) {
        console.error("Error fetching anime details:", err);
        setError("Failed to load anime details. Please try again later.");
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

    return <span className={badgeClass}>{status}</span>;
  };

  const formatDate = (season, year) => {
    if (!season && !year) return "Unknown";

    let result = "";
    if (season) {
      // Capitalize first letter
      result = season.charAt(0) + season.slice(1).toLowerCase();
    }

    if (year) {
      if (result) result += " ";
      result += year;
    }

    return result;
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
        <h2 className="error-message">{error}</h2>
        <Link to="/anime" className="navbar-btn back-button">
          Back to Anime List
        </Link>
      </div>
    );
  }

  if (!anime) {
    return (
      <div className="container error-container">
        <h2 className="error-message">Anime not found</h2>
        <Link to="/anime" className="navbar-btn back-button">
          Back to Anime List
        </Link>
      </div>
    );
  }

  const title = anime.title.english || anime.title.romaji || anime.title.native;

  return (
    <div className="anime-detail-page">
      {/* Banner Image Background */}
      {anime.bannerImage && (
        <div
          className="anime-banner"
          style={{ backgroundImage: `url(${anime.bannerImage})` }}
        >
          <div className="banner-overlay"></div>
        </div>
      )}

      <div className="container anime-detail-container">
        <div className="anime-detail-header">
          <Link to="/anime" className="navbar-btn back-button">
            ← Back
          </Link>
          <h1 className="anime-detail-title">{title}</h1>
        </div>

        <div className="anime-detail-content">
          <div className="anime-detail-sidebar">
            <div className="anime-detail-poster">
              <img
                src={anime.coverImage.large}
                alt={title}
                className="anime-detail-image"
              />

              <div className="anime-rating">
                <div className="rating-circle">
                  <span className="rating-score">{anime.averageScore}%</span>
                </div>
              </div>
            </div>

            <div className="anime-stats">
              <div className="anime-stat-item">
                <span className="stat-label">Status:</span>
                <span className="stat-value">
                  {renderStatusBadge(anime.status || "UNKNOWN")}
                </span>
              </div>

              <div className="anime-stat-item">
                <span className="stat-label">Episodes:</span>
                <span className="stat-value">
                  {anime.episodes || "Unknown"}
                </span>
              </div>

              {(anime.season || anime.seasonYear) && (
                <div className="anime-stat-item">
                  <span className="stat-label">Released:</span>
                  <span className="stat-value">
                    {formatDate(anime.season, anime.seasonYear)}
                  </span>
                </div>
              )}

              {anime.genres && anime.genres.length > 0 && (
                <div className="anime-stat-item anime-stat-genres">
                  <span className="stat-label">Genres:</span>
                  <div className="anime-genres">
                    {anime.genres.map((genre) => (
                      <span key={genre} className="genre-tag">
                        {genre}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {anime.studios && anime.studios.length > 0 && (
                <div className="anime-stat-item">
                  <span className="stat-label">Studios:</span>
                  <div className="studios-list">
                    {anime.studios.map((studio) => (
                      <span key={studio.id} className="studio-item">
                        {studio.name}
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
                Overview
              </button>

              <button
                className={`tab-button ${
                  activeTab === "characters" ? "active" : ""
                }`}
                onClick={() => setActiveTab("characters")}
              >
                Characters
              </button>
            </div>

            <div className="anime-tab-content">
              {activeTab === "overview" && (
                <div className="tab-pane">
                  {anime.description && (
                    <div className="anime-description">
                      <h3 className="section-title">Description</h3>
                      <div
                        className="description-content"
                        dangerouslySetInnerHTML={{ __html: anime.description }}
                      ></div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "characters" && (
                <div className="tab-pane">
                  <h3 className="section-title">Main Characters</h3>
                  {anime.characters && anime.characters.length > 0 ? (
                    <div className="characters-grid">
                      {anime.characters.map((character) => (
                        <div key={character.id} className="character-card">
                          <div className="character-image-container">
                            <img
                              src={character.image.medium}
                              alt={character.name.full}
                              className="character-image"
                            />
                          </div>
                          <div className="character-info">
                            <div className="character-name">
                              {character.name.full}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="no-characters">
                      No character information available.
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
