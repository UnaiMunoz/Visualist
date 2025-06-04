// frontend/src/services/seriesServices.js
const API_URL = "https://visualist-production.up.railway.app/api"; // Using proxy setup in vite.config.js

export const fetchTopSeries = async () => {
  try {
    const cachedData = localStorage.getItem("topSeries");
    const cachedTime = localStorage.getItem("topSeriesTimestamp");
    const CACHE_TIME = 10 * 60 * 1000; // 10 minutes in milliseconds

    // Check if data is in cache and hasn't expired
    if (cachedData && cachedTime) {
      const now = Date.now();
      if (now - parseInt(cachedTime) < CACHE_TIME) {
        console.log("Using cached data for top series");
        return JSON.parse(cachedData);
      } else {
        console.log("Cache expired for top series, making new API call");
      }
    }

    // Make API call if no cache or cache has expired
    console.log("Making API call to: " + API_URL + "/series/top.php");
    const response = await fetch(`${API_URL}/series/top.php`);

    console.log("Response status:", response.status);

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Parsed series data:", data);

    // Save data and timestamp in localStorage
    localStorage.setItem("topSeries", JSON.stringify(data));
    localStorage.setItem("topSeriesTimestamp", Date.now().toString());

    return data;
  } catch (error) {
    console.error("Error fetching series:", error);
    return [];
  }
};

export const fetchAllSeries = async (page = 1, perPage = 24) => {
  try {
    const url = `${API_URL}/series?page=${page}&perPage=${perPage}.php`;
    console.log("Making API call to:", url);

    const response = await fetch(url);
    console.log("Response status:", response.status);

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Parsed series list data:", data);

    // Format response to match the expected structure
    const formattedData = {
      series: data.results || [],
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
    console.error("Error fetching all series:", error);
    return {
      series: [],
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

export const searchSeries = async (searchTerm, page = 1, perPage = 24) => {
  try {
    const url = `${API_URL}/series/search?query=${encodeURIComponent(
      searchTerm
    )}&page=${page}&perPage=${perPage}`;

    console.log("Making API call to:", url);
    const response = await fetch(url);
    console.log("Response status:", response.status);

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Parsed series search data:", data);

    // Format response to match the expected structure if needed
    const formattedData = {
      series: data.results || [],
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
    console.error("Error searching series:", error);
    return {
      series: [],
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

// NEW: Get series details by ID
export const getSeriesDetails = async (id) => {
  try {
    // Check for cached data first
    const cachedSeries = localStorage.getItem(`series_${id}`);
    const cachedTime = localStorage.getItem(`series_${id}_timestamp`);
    const CACHE_TIME = 30 * 60 * 1000; // 30 minutes in milliseconds

    // If cached data exists and isn't expired
    if (cachedSeries && cachedTime) {
      const now = Date.now();
      if (now - parseInt(cachedTime) < CACHE_TIME) {
        console.log(`Using cached data for series ID ${id}`);
        return JSON.parse(cachedSeries);
      }
    }

    // Fetch from API
    const url = `${API_URL}/series/detail?id=${id}`;
    console.log("Making API call to:", url);

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Parsed series detail data:", data);

    // Save data to cache
    localStorage.setItem(`series_${id}`, JSON.stringify(data));
    localStorage.setItem(`series_${id}_timestamp`, Date.now().toString());

    return data;
  } catch (error) {
    console.error(`Error getting series details for ID ${id}:`, error);
    throw error;
  }
};
