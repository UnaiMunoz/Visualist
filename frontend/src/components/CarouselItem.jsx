import { Link } from "react-router-dom";

const CarouselItem = ({ item, type }) => {
  // Safely extract title from different formats
  const title = item.title || item.name || "Unknown Title";

  // Safely extract image URLs
  const image = item.poster_path
    ? `https://image.tmdb.org/t/p/w300${item.poster_path}`
    : "https://via.placeholder.com/225x338?text=No+Image";

  // Calculate and format the score appropriately
  const score = Math.round((item.vote_average || 0) * 10);

  // Handle image loading errors
  const handleImageError = (e) => {
    e.target.onerror = null; // Prevent infinite loops
    e.target.src = "https://via.placeholder.com/225x338?text=No+Image";
  };

  // Extract info text based on content type
  const infoText =
    item.release_date || item.first_air_date
      ? new Date(item.release_date || item.first_air_date).getFullYear()
      : "N/A";

  // Determine the link path based on content type
  const linkPath =
    type === "movie"
      ? `/movies/${item.id}`
      : type === "series"
      ? `/series/${item.id}`
      : "#"; // fallback

  // Add a link wrapper for all content types
  if (type === "movie" || type === "series") {
    return (
      <Link to={linkPath} className="media-card">
        <img
          src={image}
          alt={title}
          className="media-card-img"
          onError={handleImageError}
        />
        <div className="media-card-body">
          <div className="media-card-title">{title}</div>
          <div className="media-card-footer">
            <span className="media-card-info">{infoText}</span>
            <span className="media-card-score">{score}%</span>
          </div>
        </div>
      </Link>
    );
  }

  // Default rendering (shouldn't be reached now)
  return (
    <div className="media-card">
      <img
        src={image}
        alt={title}
        className="media-card-img"
        onError={handleImageError}
      />
      <div className="media-card-body">
        <div className="media-card-title">{title}</div>
        <div className="media-card-footer">
          <span className="media-card-info">{infoText}</span>
          <span className="media-card-score">{score}%</span>
        </div>
      </div>
    </div>
  );
};

export default CarouselItem;