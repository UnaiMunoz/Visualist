import { useState, useEffect } from 'react';
import Hero from '../components/Hero';
import Carousel from '../components/Carousel';
import { fetchTopAnime } from '../services/anilistApi';
import { fetchTopMovies, fetchTopSeries } from '../services/tmdbApi';

const Home = () => {
  const [anime, setAnime] = useState([]);
  const [movies, setMovies] = useState([]);
  const [series, setSeries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [animeData, moviesData, seriesData] = await Promise.all([
          fetchTopAnime(),
          fetchTopMovies(),
          fetchTopSeries()
        ]);

        setAnime(animeData);
        setMovies(moviesData);
        setSeries(seriesData);
      } catch (error) {
        console.error('Error fetching data:', error);
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
    <div>
      <Hero />
      <div className="container">
        <Carousel title="Top Rated Anime" items={anime} type="anime" />
        <Carousel title="Top Rated Movies" items={movies} type="movie" />
        <Carousel title="Top Rated TV Series" items={series} type="series" />
      </div>
    </div>
  );
};

export default Home;