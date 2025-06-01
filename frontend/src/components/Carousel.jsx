import { useRef } from "react";
import CarouselItem from "./CarouselItem";

const Carousel = ({ title, items, type }) => {
  const carouselRef = useRef(null);

  const scroll = (direction) => {
    if (carouselRef.current) {
      const { current } = carouselRef;
      const scrollAmount = direction === "left" ? -300 : 300; // Increased for better scrolling
      current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  // Check if items is valid and not empty
  if (!items || !Array.isArray(items) || items.length === 0) {
    return (
      <div className="carousel-section">
        <div className="carousel-header">
          <h2 className="carousel-title">{title}</h2>
        </div>
        <div
          className="carousel-container"
          style={{ justifyContent: "center", padding: "20px" }}
        >
          <p>No items to display at the moment.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="carousel-section">
      <div className="carousel-header">
        <h2 className="carousel-title">{title}</h2>
        <div className="carousel-controls">
          <button
            onClick={() => scroll("left")}
            className="carousel-control"
            aria-label="Scroll left"
          >
            ←
          </button>
          <button
            onClick={() => scroll("right")}
            className="carousel-control"
            aria-label="Scroll right"
          >
            →
          </button>
        </div>
      </div>
      <div ref={carouselRef} className="carousel-container">
        {items.map((item, index) => (
          <CarouselItem 
            key={item.id} 
            item={item} 
            type={type} 
            index={index} 
          />
        ))}
      </div>
    </div>
  );
};

export default Carousel;