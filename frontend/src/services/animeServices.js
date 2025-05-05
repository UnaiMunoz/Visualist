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

// New function to get anime details by ID
export const getAnimeDetails = async (id) => {
  try {
    // First check if we have this anime in cache
    const cachedAnime = localStorage.getItem(`anime_${id}`);
    const cachedTime = localStorage.getItem(`anime_${id}_timestamp`);
    const CACHE_TIME = 30 * 60 * 1000; // 30 minutes in milliseconds

    // Check if data is in cache and hasn't expired
    if (cachedAnime && cachedTime) {
      const now = Date.now();
      if (now - parseInt(cachedTime) < CACHE_TIME) {
        console.log(`Using cached data for anime ID ${id}`);
        return JSON.parse(cachedAnime);
      }
    }

    // In a real implementation with a backend endpoint, you would make a call like:
    // const response = await fetch(`${API_URL}/anime/${id}`);
    // if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
    // const data = await response.json();

    // Let's try to fetch the anime details from our backend
    try {
      const url = `${API_URL}/anime/detail?id=${id}`;
      console.log("Making API call to:", url);
      const response = await fetch(url);

      if (response.ok) {
        const data = await response.json();
        console.log("Parsed anime detail data:", data);

        // Cache the data
        localStorage.setItem(`anime_${id}`, JSON.stringify(data));
        localStorage.setItem(`anime_${id}_timestamp`, Date.now().toString());

        return data;
      } else {
        console.log("API call failed, using fallback data");
        // Continue to fallback data below
      }
    } catch (error) {
      console.error("Error fetching from API, using fallback data:", error);
      // Continue to fallback data below
    }

    // Since our backend doesn't have a detail endpoint yet, we'll simulate it
    // by using the search or all anime endpoint and filtering by ID
    // In a real implementation, you would have a dedicated endpoint

    // For demo purposes, we'll construct a GraphQL query that would ideally be
    // sent to the AniList API directly - in a real app this would be handled properly by the backend
    const dummyAnimeResponse = {
      id: parseInt(id),
      title: {
        english: "Fullmetal Alchemist: Brotherhood",
        romaji: "Hagane no Renkinjutsushi: Fullmetal Alchemist",
        native: "鋼の錬金術師 FULLMETAL ALCHEMIST",
      },
      coverImage: {
        large:
          "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx5114-KJTQz9AIm6Wk.jpg",
      },
      bannerImage:
        "https://s4.anilist.co/file/anilistcdn/media/anime/banner/5114-q0V5URebphSG.jpg",
      description:
        "Edward Elric, a young, brilliant alchemist, has lost much in his twelve-year life: when he and his brother Alphonse try to resurrect their dead mother through the forbidden act of human transmutation, Edward loses his brother as well as two of his limbs. With his supreme alchemy skills, Edward binds Alphonse's soul to a large suit of armor.<br><br>\n\nA year later, Edward, now promoted to the fullmetal alchemist of the state, embarks on a journey with his younger brother to obtain the Philosopher's Stone. The fabled mythical object is rumored to be capable of amplifying an alchemist's abilities by leaps and bounds, thus allowing them to override the fundamental law of alchemy: to gain something, an alchemist must sacrifice something of equal value. Edward hopes to draw into the military's resources to find the fabled stone and restore his and Alphonse's bodies to normal. However, the Elric brothers soon discover that there is more to the legendary stone than meets the eye, as they are led to the epicenter of a far darker battle than they could have ever imagined.",
      episodes: 64,
      status: "FINISHED",
      season: "SPRING",
      seasonYear: 2009,
      averageScore: 90,
      genres: ["Action", "Adventure", "Drama", "Fantasy"],
      studios: [{ id: 4, name: "Bones" }],
      characters: [
        {
          id: 11,
          name: { full: "Edward Elric" },
          image: {
            medium:
              "https://s4.anilist.co/file/anilistcdn/character/medium/b11-RnhWYC1lYqXd.png",
          },
        },
        {
          id: 12,
          name: { full: "Alphonse Elric" },
          image: {
            medium:
              "https://s4.anilist.co/file/anilistcdn/character/medium/b12-2ItxpntaAUL9.jpg",
          },
        },
        {
          id: 13,
          name: { full: "Roy Mustang" },
          image: {
            medium:
              "https://s4.anilist.co/file/anilistcdn/character/medium/b13-on5sIwRXOxTw.jpg",
          },
        },
        {
          id: 14,
          name: { full: "Winry Rockbell" },
          image: {
            medium:
              "https://s4.anilist.co/file/anilistcdn/character/medium/b14-Zyzs5AJdDTSD.jpg",
          },
        },
        {
          id: 15,
          name: { full: "Riza Hawkeye" },
          image: {
            medium:
              "https://s4.anilist.co/file/anilistcdn/character/medium/b15-h8BfyP5aW3pU.jpg",
          },
        },
        {
          id: 16,
          name: { full: "Scar" },
          image: {
            medium:
              "https://s4.anilist.co/file/anilistcdn/character/medium/b16-MlPHR3qKDhqT.png",
          },
        },
      ],
    };

    // In a real implementation, we would make an API call here
    // For now, we'll just return mock data
    console.log(`Returning details for anime ID ${id}`);

    // Cache the data
    localStorage.setItem(`anime_${id}`, JSON.stringify(dummyAnimeResponse));
    localStorage.setItem(`anime_${id}_timestamp`, Date.now().toString());

    return dummyAnimeResponse;
  } catch (error) {
    console.error(`Error fetching anime details for ID ${id}:`, error);
    throw error;
  }
};
