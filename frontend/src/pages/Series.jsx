import { useState, useEffect } from "react";
import { fetchTopSeries } from "../services/seriesServices";

const Series = () => {
  const [series, setSeries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchTopSeries();
        setSeries(data);
      } catch (error) {
        console.error("Error fetching series:", error);
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
      <h1 className="page-title">TV Series</h1>
      <div className="media-grid">
        {series.map((show) => (
          <div key={show.id} className="media-grid-card">
            <img
              src={`https://image.tmdb.org/t/p/w500${show.poster_path}`}
              alt={show.name}
              className="media-grid-img"
            />
            <div className="media-grid-body">
              <h3 className="media-grid-title">{show.name}</h3>
              <div className="media-grid-footer">
                <span className="media-card-info">
                  {new Date(show.first_air_date).getFullYear()}
                </span>
                <span className="media-card-score">
                  {Math.round(show.vote_average * 10)}%
                </span>
              </div>
              <p className="media-overview">{show.overview}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Series;
