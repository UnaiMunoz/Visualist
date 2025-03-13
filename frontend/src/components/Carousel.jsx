import { useRef } from "react";
import CarouselItem from "./CarouselItem";

const Carousel = ({ title, items, type }) => {
  const carouselRef = useRef(null);

  const scroll = (direction) => {
    if (carouselRef.current) {
      const { current } = carouselRef;
      const scrollAmount = direction === "left" ? -200 : 200;
      current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  if (!items || items.length === 0) {
    return (
      <div className="loading">
        <div className="loading-text">Loading...</div>
      </div>
    );
  }

  return (
    <div className="carousel-section">
      <div className="carousel-header">
        <h2 className="carousel-title">{title}</h2>
        <div className="carousel-controls">
          <button onClick={() => scroll("left")} className="carousel-control">
            ←
          </button>
          <button onClick={() => scroll("right")} className="carousel-control">
            →
          </button>
        </div>
      </div>
      <div ref={carouselRef} className="carousel-container">
        {items.map((item) => (
          <CarouselItem key={item.id} item={item} type={type} />
        ))}
      </div>
    </div>
  );
};

export default Carousel;
