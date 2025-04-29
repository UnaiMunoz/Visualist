// frontend/src/services/moviesServices.js
const API_URL = 'http://localhost/visualist/backend/api';

export const fetchTopMovies = async () => {
  try {
    const response = await fetch(`${API_URL}/movies/top`);

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching movies:", error);
    return [];
  }
};
