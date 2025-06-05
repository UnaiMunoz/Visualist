// frontend/src/services/moviesServices.js
const API_URL = "https://visualist-production.up.railway.app/api"; // Using proxy setup in vite.config.js

export const fetchTopMovies = async () => {
  try {
    const cachedData = localStorage.getItem("topMovies");
    const cachedTime = localStorage.getItem("topMoviesTimestamp");
    const CACHE_TIME = 10 * 60 * 1000; // 10 minutes in milliseconds

    // Check if data is in cache and hasn't expired
    if (cachedData && cachedTime) {
      const now = Date.now();
      if (now - parseInt(cachedTime) < CACHE_TIME) {
        console.log("Using cached data for top movies");
        return JSON.parse(cachedData);
      } else {
        console.log("Cache expired for top movies, making new API call");
      }
    }

    // Make API call if no cache or cache has expired
    console.log("Making API call to: " + API_URL + "/movies/top");
    const response = await fetch(`${API_URL}/movies/top.php`);

    console.log("Response status:", response.status);

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Parsed movies data:", data);

    // Save data and timestamp in localStorage
    localStorage.setItem("topMovies", JSON.stringify(data));
    localStorage.setItem("topMoviesTimestamp", Date.now().toString());

    return data;
  } catch (error) {
    console.error("Error fetching movies:", error);
    return [];
  }
};

export const fetchAllMovies = async (page = 1, perPage = 24) => {
  try {
    const url = `${API_URL}/movies/index.php?page=${page}&perPage=${perPage}`;
    console.log("Making API call to:", url);

    const response = await fetch(url);
    console.log("Response status:", response.status);

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Parsed movies list data:", data);

    // Format response to match the expected structure
    const formattedData = {
      movies: data.results || [],
      pageInfo: {
        total: data.total_results || 0,
        currentPage: data.page || page,
        lastPage: data.total_pages || 1,
        hasNextPage: (data.page || page) < (data.total_pages || 1),
        perPage: perPage,
      },
    };

    return formattedData;
  } catch (error) {
    console.error("Error fetching all movies:", error);
    return {
      movies: [],
      pageInfo: {
        total: 0,
        currentPage: page,
        lastPage: 1,
        hasNextPage: false,
        perPage: perPage,
      },
    };
  }
};

export const searchMovies = async (searchTerm, page = 1, perPage = 24) => {
  try {
    const url = `${API_URL}/movies/search.php?query=${encodeURIComponent(
      searchTerm
    )}&page=${page}&perPage=${perPage}`;

    console.log("Making API call to:", url);
    const response = await fetch(url);
    console.log("Response status:", response.status);

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Parsed movie search data:", data);

    // Format response to match the expected structure if needed
    const formattedData = {
      movies: data.results || [],
      pageInfo: {
        total: data.total_results || 0,
        currentPage: page,
        lastPage: data.total_pages || 1,
        hasNextPage: page < (data.total_pages || 1),
        perPage: perPage,
      },
    };

    return formattedData;
  } catch (error) {
    console.error("Error searching movies:", error);
    return {
      movies: [],
      pageInfo: {
        total: 0,
        currentPage: page,
        lastPage: 1,
        hasNextPage: false,
        perPage: perPage,
      },
    };
  }
};

// NEW: Get movie details by ID
export const getMovieDetails = async (id) => {
  try {
    // Check for cached data first
    const cachedMovie = localStorage.getItem(`movie_${id}`);
    const cachedTime = localStorage.getItem(`movie_${id}_timestamp`);
    const CACHE_TIME = 30 * 60 * 1000; // 30 minutes in milliseconds

    // If cached data exists and isn't expired
    if (cachedMovie && cachedTime) {
      const now = Date.now();
      if (now - parseInt(cachedTime) < CACHE_TIME) {
        console.log(`Using cached data for movie ID ${id}`);
        return JSON.parse(cachedMovie);
      }
    }

    // Fetch from API
    const url = `${API_URL}/movies/detail.php?id=${id}`;
    console.log("Making API call to:", url);

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Parsed movie detail data:", data);

    // Save data to cache
    localStorage.setItem(`movie_${id}`, JSON.stringify(data));
    localStorage.setItem(`movie_${id}_timestamp`, Date.now().toString());

    return data;
  } catch (error) {
    console.error(`Error getting movie details for ID ${id}:`, error);
    throw error;
  }
};
