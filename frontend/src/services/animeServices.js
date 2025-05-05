// frontend/src/services/animeServices.js
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

// Enhanced getAnimeDetails function for animeServices.js

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

    // Try to get data from backend first
    console.log(`Fetching details for anime ID ${id} from backend`);
    try {
      const url = `${API_URL}/anime/detail?id=${id}`;
      console.log("Making API call to:", url);

      const response = await fetch(url);

      if (response.ok) {
        const data = await response.json();
        console.log("Parsed anime detail data:", data);

        // Save data to cache
        localStorage.setItem(`anime_${id}`, JSON.stringify(data));
        localStorage.setItem(`anime_${id}_timestamp`, Date.now().toString());

        // Process the data to ensure all required fields
        return enhanceAnimeData(data);
      } else {
        console.log(
          `Error fetching anime ID ${id} from backend: ${response.status}`
        );
        // Continue with fallback strategies
      }
    } catch (error) {
      console.error(`Error in backend request for anime ID ${id}:`, error);
      // Continue with fallback strategies
    }

    // Search in locally stored data
    console.log("Looking in local cache data...");
    const topAnimeCached = localStorage.getItem("topAnime");
    if (topAnimeCached) {
      const topAnimeList = JSON.parse(topAnimeCached);
      const foundAnime = topAnimeList.find(
        (anime) => anime.id === parseInt(id)
      );
      if (foundAnime) {
        console.log(`Found anime with ID ${id} in top anime cache`);

        // Try to get more data through search
        try {
          const searchResult = await searchAnime(
            foundAnime.title.english || foundAnime.title.romaji
          );
          if (
            searchResult &&
            searchResult.anime &&
            searchResult.anime.length > 0
          ) {
            // Look for exact match by ID
            const exactMatch = searchResult.anime.find(
              (anime) => anime.id === parseInt(id)
            );
            if (exactMatch) {
              console.log(`Found anime with ID ${id} in search results`);

              // Enhanced with additional info
              const enhancedData = enhanceAnimeData(exactMatch);

              // Save to cache and return
              localStorage.setItem(`anime_${id}`, JSON.stringify(enhancedData));
              localStorage.setItem(
                `anime_${id}_timestamp`,
                Date.now().toString()
              );

              return enhancedData;
            }
          }
        } catch (searchError) {
          console.error("Error searching anime by title:", searchError);
        }

        // Return basic data if enhanced data not available
        return enhanceAnimeData(foundAnime);
      }
    }

    // Last resort: check general anime list
    try {
      console.log("Trying to fetch from general anime list...");
      const allAnimeResponse = await fetchAllAnime();
      if (allAnimeResponse && allAnimeResponse.anime) {
        const foundAnime = allAnimeResponse.anime.find(
          (anime) => anime.id === parseInt(id)
        );
        if (foundAnime) {
          console.log(`Found anime with ID ${id} in general list`);
          return enhanceAnimeData(foundAnime);
        }
      }
    } catch (error) {
      console.error("Error searching general anime list:", error);
    }

    // If all fails, throw error
    throw new Error(`Could not find information for anime with ID ${id}`);
  } catch (error) {
    console.error(`Error getting anime details for ID ${id}:`, error);
    throw error;
  }
};

// Helper function to ensure data has all required fields
const enhanceAnimeData = (data) => {
  // Create default structure for fields that might be missing
  const enhanced = {
    ...data,
    title: data.title || { english: null, romaji: null, native: null },
    coverImage: data.coverImage || { large: null },
    bannerImage: data.bannerImage || null,
    description: data.description || null,
    episodes: data.episodes || null,
    status: data.status || null,
    season: data.season || null,
    seasonYear: data.seasonYear || null,
    averageScore: data.averageScore || null,
    meanScore: data.meanScore || null,
    popularity: data.popularity || 0,
    favourites: data.favourites || 0,
    genres: data.genres || [],
    format: data.format || null,
    duration: data.duration || null,
    startDate: data.startDate || { year: null, month: null, day: null },
    endDate: data.endDate || { year: null, month: null, day: null },
    studios: data.studios || { nodes: [] },
    characters: data.characters || [],
  };

  // Ensure nested objects have proper structure
  if (
    typeof enhanced.studios === "object" &&
    !Array.isArray(enhanced.studios)
  ) {
    enhanced.studios = enhanced.studios.nodes || [];
  }

  if (
    typeof enhanced.characters === "object" &&
    !Array.isArray(enhanced.characters)
  ) {
    enhanced.characters = enhanced.characters.nodes || [];
  }

  return enhanced;
};
