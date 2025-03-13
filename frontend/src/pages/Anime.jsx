import { useState, useEffect } from "react";
import { fetchTopAnime } from "../services/anilistApi";

const Anime = () => {
  const [anime, setAnime] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchTopAnime();
        setAnime(data);
      } catch (error) {
        console.error("Error fetching anime:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="loading">
        <div className="loading-text">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container">
      <h1 className="page-title">Anime</h1>
      <div className="media-grid">
        {anime.map((item) => (
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
        ))}
      </div>
    </div>
  );
};

export default Anime;
