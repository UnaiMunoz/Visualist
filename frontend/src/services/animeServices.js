// frontend/src/services/animeServices.js
const API_URL = "http://localhost/visualist/backend/api";
const CACHE_TIME = 10 * 60 * 1000; // 10 minutes in milliseconds

export const fetchTopAnime = async () => {
  try {
    const cachedData = localStorage.getItem("topAnime");
    const cachedTime = localStorage.getItem("topAnimeTimestamp");

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
    console.log("Response headers:", Object.fromEntries([...response.headers]));

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const responseText = await response.text();
    console.log("Raw response text:", responseText);

    let animeData;
    try {
      animeData = JSON.parse(responseText);
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      console.error("Response wasn't valid JSON:", responseText);
      throw new Error("Failed to parse response as JSON");
    }

    console.log("Parsed anime data:", animeData);

    // Save data and timestamp in localStorage
    localStorage.setItem("topAnime", JSON.stringify(animeData));
    localStorage.setItem("topAnimeTimestamp", Date.now().toString());

    return animeData;
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

    const responseText = await response.text();
    console.log(
      "Raw response text (first 100 chars):",
      responseText.substring(0, 100)
    );

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      console.error("Response wasn't valid JSON:", responseText);
      throw new Error("Failed to parse response as JSON");
    }

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

    const responseText = await response.text();
    console.log(
      "Raw response text (first 100 chars):",
      responseText.substring(0, 100)
    );

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      console.error("Response wasn't valid JSON:", responseText);
      throw new Error("Failed to parse response as JSON");
    }

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
      totalResults: 0,
    };
  }
};
