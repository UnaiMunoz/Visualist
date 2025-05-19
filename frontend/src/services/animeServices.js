// frontend/src/services/animeServices.js - Updated for TMDB
const API_URL = "/api"; // Using the proxy

export const fetchTopAnime = async () => {
  try {
    const cachedData = localStorage.getItem("topAnime");
    const cachedTime = localStorage.getItem("topAnimeTimestamp");
    const CACHE_TIME = 10 * 60 * 1000; // 10 minutes in milliseconds

    // Check if data is in cache and hasn't expired
    if (cachedData && cachedTime) {
      const now = Date.now();
      if (now - parseInt(cachedTime) < CACHE_TIME) {
        console.log("Using cached data for top anime");
        return JSON.parse(cachedData);
      } else {
        console.log("Cache expired for top anime, making new API call");
      }
    }

    // Make API call if no cache or cache has expired
    console.log("Making API call to: " + API_URL + "/anime/top");
    const response = await fetch(`${API_URL}/anime/top`);

    console.log("Response status:", response.status);

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Parsed anime data:", data);

    // Save data and timestamp in localStorage
    localStorage.setItem("topAnime", JSON.stringify(data));
    localStorage.setItem("topAnimeTimestamp", Date.now().toString());

    return data;
  } catch (error) {
    console.error("Error fetching anime:", error);
    return [];
  }
};

export const fetchAllAnime = async (page = 1, perPage = 24) => {
  try {
    const url = `${API_URL}/anime?page=${page}&perPage=${perPage}`;
    console.log("Making API call to:", url);

    const response = await fetch(url);
    console.log("Response status:", response.status);

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Parsed anime list data:", data);

    // Ensure proper structure before returning
    if (!data.anime || !data.pageInfo) {
      throw new Error("Invalid data structure received from API");
    }

    return data;
  } catch (error) {
    console.error("Error fetching all anime:", error);
    return {
      anime: [],
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

export const searchAnime = async (searchTerm, page = 1, perPage = 24) => {
  try {
    const url = `${API_URL}/anime/search?searchTerm=${encodeURIComponent(
      searchTerm
    )}&page=${page}&perPage=${perPage}`;

    console.log("Making API call to:", url);
    const response = await fetch(url);
    console.log("Response status:", response.status);

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Parsed anime search data:", data);

    // Ensure proper structure before returning
    if (!data.anime || !data.pageInfo) {
      throw new Error("Invalid data structure received from API");
    }

    return data;
  } catch (error) {
    console.error("Error searching anime:", error);
    return {
      anime: [],
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

export const getAnimeDetails = async (id) => {
  try {
    // Check for cached data first
    const cachedAnime = localStorage.getItem(`anime_${id}`);
    const cachedTime = localStorage.getItem(`anime_${id}_timestamp`);
    const CACHE_TIME = 30 * 60 * 1000; // 30 minutes in milliseconds

    // If cached data exists and isn't expired
    if (cachedAnime && cachedTime) {
      const now = Date.now();
      if (now - parseInt(cachedTime) < CACHE_TIME) {
        console.log(`Using cached data for anime ID ${id}`);
        return JSON.parse(cachedAnime);
      }
    }

    // Fetch from API
    const url = `${API_URL}/anime/detail?id=${id}`;
    console.log("Making API call to:", url);

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Parsed anime detail data:", data);

    // Save data to cache
    localStorage.setItem(`anime_${id}`, JSON.stringify(data));
    localStorage.setItem(`anime_${id}_timestamp`, Date.now().toString());

    return data;
  } catch (error) {
    console.error(`Error getting anime details for ID ${id}:`, error);
    throw error;
  }
};
