import { Link } from "react-router-dom";

const CarouselItem = ({ item, type }) => {
  const title =
    type === "anime"
      ? item.title.english || item.title.romaji
      : item.title || item.name;

  const image =
    type === "anime"
      ? item.coverImage.large
      : `https://image.tmdb.org/t/p/w300${item.poster_path}`;

  const score =
    type === "anime" ? item.averageScore : Math.round(item.vote_average * 10);

  // Add a link wrapper if it's an anime item
  if (type === "anime") {
    return (
      <Link to={`/anime/${item.id}`} className="media-card">
        <img src={image} alt={title} className="media-card-img" />
        <div className="media-card-body">
          <div className="media-card-title">{title}</div>
          <div className="media-card-footer">
            <span className="media-card-info">{item.episodes} eps</span>
            <span className="media-card-score">{score}%</span>
          </div>
        </div>
      </Link>
    );
  }

  // Default rendering for non-anime items
  return (
    <div className="media-card">
      <img src={image} alt={title} className="media-card-img" />
      <div className="media-card-body">
        <div className="media-card-title">{title}</div>
        <div className="media-card-footer">
          <span className="media-card-info">
            {type === "anime"
              ? `${item.episodes} eps`
              : new Date(
                  item.release_date || item.first_air_date
                ).getFullYear()}
          </span>
          <span className="media-card-score">{score}%</span>
        </div>
      </div>
    </div>
  );
};

export default CarouselItem;
