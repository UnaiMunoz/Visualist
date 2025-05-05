import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getAnimeDetails } from "../services/animeServices";

const AnimeDetail = () => {
  const { id } = useParams();
  const [anime, setAnime] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Rename this function to avoid conflict with the imported one
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
  }, [id]);

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
    <div className="container anime-detail-container">
      <div className="anime-detail-header">
        <Link to="/anime" className="navbar-btn back-button">
          ← Back
        </Link>
        <h1 className="anime-detail-title">{title}</h1>
      </div>

      <div className="anime-detail-content">
        <div className="anime-detail-poster">
          <img
            src={anime.coverImage.large}
            alt={title}
            className="anime-detail-image"
          />
          <div className="anime-stats">
            <div className="anime-stat-item">
              <span className="stat-label">Score:</span>
              <span className="stat-value">{anime.averageScore}%</span>
            </div>
            <div className="anime-stat-item">
              <span className="stat-label">Episodes:</span>
              <span className="stat-value">{anime.episodes || "N/A"}</span>
            </div>
            <div className="anime-stat-item">
              <span className="stat-label">Status:</span>
              <span className="stat-value">{anime.status || "N/A"}</span>
            </div>
            {anime.season && (
              <div className="anime-stat-item">
                <span className="stat-label">Season:</span>
                <span className="stat-value">
                  {anime.season} {anime.seasonYear}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="anime-detail-info">
          {anime.genres && anime.genres.length > 0 && (
            <div className="anime-genres">
              {anime.genres.map((genre) => (
                <span key={genre} className="genre-tag">
                  {genre}
                </span>
              ))}
            </div>
          )}

          {anime.description && (
            <div className="anime-description">
              <h3 className="section-title">Description</h3>
              <p dangerouslySetInnerHTML={{ __html: anime.description }}></p>
            </div>
          )}

          {anime.characters && anime.characters.length > 0 && (
            <div className="anime-characters">
              <h3 className="section-title">Main Characters</h3>
              <div className="characters-grid">
                {anime.characters.slice(0, 6).map((character) => (
                  <div key={character.id} className="character-card">
                    <img
                      src={character.image.medium}
                      alt={character.name.full}
                      className="character-image"
                    />
                    <div className="character-name">{character.name.full}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {anime.studios && anime.studios.length > 0 && (
            <div className="anime-studios">
              <h3 className="section-title">Studios</h3>
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
    </div>
  );
};

export default AnimeDetail;
