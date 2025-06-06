import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Hero = () => {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleExploreClick = () => {
    navigate("/login");
  };

  const getRandomContent = async () => {
    setIsLoading(true);

    try {
      // Decidir aleatoriamente entre película o serie
      const contentTypes = ["movie", "series"];
      const randomType =
        contentTypes[Math.floor(Math.random() * contentTypes.length)];

      // Generar una página aleatoria (1-10 para tener variedad)
      const randomPage = Math.floor(Math.random() * 10) + 1;

      // Hacer la llamada a la API correspondiente
      const API_URL = "https://visualist-production.up.railway.app/api";
      const endpoint = randomType === "movie" ? "movies" : "series";

      const response = await fetch(
        `${API_URL}/${endpoint}/index.php?page=${randomPage}&perPage=20`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch content");
      }

      const data = await response.json();

      if (data.results && data.results.length > 0) {
        // Seleccionar un item aleatorio de los resultados
        const randomIndex = Math.floor(Math.random() * data.results.length);
        const randomContent = data.results[randomIndex];

        // Navegar al contenido aleatorio
        navigate(`/${endpoint}/${randomContent.id}`);
      } else {
        // Fallback: navegar a la página de películas
        navigate("/movies");
      }
    } catch (error) {
      console.error("Error fetching random content:", error);
      // Fallback: navegar a la página de películas
      navigate("/movies");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="hero">
      <div className="hero-bg"></div>
      <div className="hero-content">
        <h1 className="hero-title">Welcome to Visualist</h1>
        <p className="hero-subtitle">
          {isLoggedIn
            ? "Ready to discover something new?"
            : "Discover and track your favorite anime, movies and series"}
        </p>

        {isLoggedIn ? (
          <button
            className={`hero-btn hero-btn-surprise ${
              isLoading ? "loading" : ""
            }`}
            onClick={getRandomContent}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="spinner-icon"
                >
                  <path d="M21 12a9 9 0 11-6.219-8.56" />
                </svg>
                Finding something...
              </>
            ) : (
              <>
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M5 12h14" />
                  <path d="M12 5l7 7-7 7" />
                </svg>
                Surprise Me!
              </>
            )}
          </button>
        ) : (
          <button className="hero-btn" onClick={handleExploreClick}>
            Start Tracking
          </button>
        )}
      </div>
    </div>
  );
};

export default Hero;
