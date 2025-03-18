import { useState, useEffect } from "react";
import { fetchTopMovies } from "../services/tmdbApi";

const Movies = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchTopMovies();
        setMovies(data);
      } catch (error) {
        console.error("Error fetching movies:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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
      <h1 className="page-title">Movies</h1>
      <div className="media-grid">
        {movies.map((movie) => (
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
              <p className="media-overview">{movie.overview}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Movies;
