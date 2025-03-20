import { useState, useEffect } from 'react';
import Hero from '../components/Hero';
import Carousel from '../components/Carousel';
import { fetchTopAnime } from '../services/animeServices';
import { fetchTopMovies } from '../services/moviesServices';
import { fetchTopSeries } from '../services/seriesServices';

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
      <div className="container">
        <Carousel title="Top Rated Anime" items={anime} type="anime" />
        <Carousel title="Top Rated Movies" items={movies} type="movie" />
        <Carousel title="Top Rated TV Series" items={series} type="series" />
      </div>
    </div>
  );
};

export default Home;