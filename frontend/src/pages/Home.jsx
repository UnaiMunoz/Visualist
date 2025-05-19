import { useState, useEffect } from "react";
import Hero from "../components/Hero";
import Carousel from "../components/Carousel";
import { fetchTopAnime } from "../services/animeServices";
import { fetchTopMovies } from "../services/moviesServices";
import { fetchTopSeries } from "../services/seriesServices";

const Home = () => {
  const [anime, setAnime] = useState([]);
  const [movies, setMovies] = useState([]);
  const [series, setSeries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [animeData, moviesData, seriesData] = await Promise.all([
          fetchTopAnime(),
          fetchTopMovies(),
          fetchTopSeries(),
        ]);

        // Additional check to validate anime data structure
        if (!Array.isArray(animeData)) {
          console.error("Invalid anime data structure:", animeData);
          setAnime([]);
        } else {
          setAnime(animeData);
        }

        // Validate movie and series data
        if (!Array.isArray(moviesData)) {
          console.error("Invalid movies data structure:", moviesData);
          setMovies([]);
        } else {
          setMovies(moviesData);
        }

        if (!Array.isArray(seriesData)) {
          console.error("Invalid series data structure:", seriesData);
          setSeries([]);
        } else {
          setSeries(seriesData);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to load content. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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
    <div>
      <Hero />
      {error && (
        <div
          className="error-message"
          style={{
            padding: "1rem",
            margin: "1rem 0",
            textAlign: "center",
            color: "#fff",
            backgroundColor: "#e74c3c",
            borderRadius: "4px",
          }}
        >
          {error}
        </div>
      )}
      <div className="container">
        <Carousel title="Top Rated Anime" items={anime} type="anime" />
        <Carousel title="Top Rated Movies" items={movies} type="movie" />
        <Carousel title="Top Rated TV Series" items={series} type="series" />
      </div>
    </div>
  );
};

export default Home;
