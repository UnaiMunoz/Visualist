import { Link } from "react-router-dom";

const CarouselItem = ({ item, type }) => {
  // Safely extract title from different formats
  const title =
    type === "anime"
      ? item.title?.english ||
        item.title?.romaji ||
        item.title?.native ||
        "Unknown Title"
      : item.title || item.name || "Unknown Title";

  // Safely extract image URLs
  const image =
    type === "anime"
      ? item.coverImage?.large ||
        "https://via.placeholder.com/225x338?text=No+Image"
      : item.poster_path
      ? `https://image.tmdb.org/t/p/w300${item.poster_path}`
      : "https://via.placeholder.com/225x338?text=No+Image";

  // Calculate and format the score appropriately
  const score =
    type === "anime"
      ? item.averageScore || 0
      : Math.round((item.vote_average || 0) * 10);

  // Handle image loading errors
  const handleImageError = (e) => {
    e.target.onerror = null; // Prevent infinite loops
    e.target.src = "https://via.placeholder.com/225x338?text=No+Image";
  };

  // Extract info text based on content type
  const infoText =
    type === "anime"
      ? item.startDate && item.startDate.year
        ? `${item.startDate.year}`
        : "N/A"
      : item.release_date || item.first_air_date
      ? new Date(item.release_date || item.first_air_date).getFullYear()
      : "N/A";

  // Add a link wrapper if it's an anime item
  if (type === "anime") {
    return (
      <Link to={`/anime/${item.id}`} className="media-card">
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
          {/* Genre tags removed as requested */}
        </div>
      </Link>
    );
  }

  // Default rendering for non-anime items
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
