// frontend/src/services/listServices.js
const API_URL = "/api";

/**
 * Add content to a user's list (watched, to_watch, favorites)
 * @param {number} contentId - The TMDB ID of the content
 * @param {string} contentType - The type of content ('movie', 'series')
 * @param {string} listType - The type of list ('watched', 'to_watch', 'favorites')
 * @returns {Promise} - A promise that resolves to the API response
 */
export const addToList = async (contentId, contentType, listType) => {
  try {
    const response = await fetch(`${API_URL}/lists/add`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contentId,
        contentType,
        listType,
      }),
      credentials: "include", // Important for cookies
    });

    return await response.json();
  } catch (error) {
    console.error(`Error adding to ${listType} list:`, error);
    return {
      success: false,
      message: "Network error. Please try again later.",
    };
  }
};

/**
 * Remove content from a user's list
 * @param {number} contentId - The TMDB ID of the content
 * @param {string} contentType - The type of content ('movie', 'series')
 * @param {string} listType - The type of list ('watched', 'to_watch', 'favorites')
 * @returns {Promise} - A promise that resolves to the API response
 */
export const removeFromList = async (contentId, contentType, listType) => {
  try {
    const response = await fetch(`${API_URL}/lists/remove`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contentId,
        contentType,
        listType,
      }),
      credentials: "include", // Important for cookies
    });

    return await response.json();
  } catch (error) {
    console.error(`Error removing from ${listType} list:`, error);
    return {
      success: false,
      message: "Network error. Please try again later.",
    };
  }
};

/**
 * Check if content is in user's lists
 * @param {number} contentId - The TMDB ID of the content
 * @param {string} contentType - The type of content ('movie', 'series')
 * @returns {Promise} - A promise that resolves to the list status
 */
export const checkListStatus = async (contentId, contentType) => {
  try {
    const response = await fetch(
      `${API_URL}/lists/check?contentId=${contentId}&contentType=${contentType}`,
      {
        method: "GET",
        credentials: "include", // Important for cookies
      }
    );

    const data = await response.json();

    return data.success
      ? data.inLists
      : {
          watched: false,
          to_watch: false,
          favorites: false,
        };
  } catch (error) {
    console.error("Error checking list status:", error);
    return {
      watched: false,
      to_watch: false,
      favorites: false,
    };
  }
};

/**
 * Get user's list content
 * @param {string} listType - The type of list ('watched', 'to_watch', 'favorites')
 * @param {string} contentType - The type of content ('movie', 'series')
 * @param {number} page - The page number for pagination
 * @param {number} perPage - Items per page
 * @returns {Promise} - A promise that resolves to the list content
 */
export const getUserList = async (
  listType,
  contentType = "movie",
  page = 1,
  perPage = 24
) => {
  try {
    const response = await fetch(
      `${API_URL}/lists/get?listType=${listType}&contentType=${contentType}&page=${page}&perPage=${perPage}`,
      {
        method: "GET",
        credentials: "include", // Important for cookies
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.message || "Failed to fetch list");
    }

    return {
      items: data.items || [],
      pageInfo: data.pageInfo || {
        total: 0,
        currentPage: page,
        lastPage: 1,
        hasNextPage: false,
        perPage: perPage,
      },
    };
  } catch (error) {
    console.error(`Error fetching ${listType} list:`, error);
    return {
      items: [],
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

/**
 * Update additional content data (score, progress, notes)
 * @param {number} contentId - The TMDB ID of the content
 * @param {string} contentType - The type of content ('movie', 'series')
 * @param {object} data - Object containing score, progress, and notes
 * @returns {Promise} - A promise that resolves to the API response
 */
export const updateContentData = async (contentId, contentType, data) => {
  try {
    const response = await fetch(`${API_URL}/lists/update-data`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contentId,
        contentType,
        ...data,
      }),
      credentials: "include", // Important for cookies
    });

    return await response.json();
  } catch (error) {
    console.error("Error updating content data:", error);
    return {
      success: false,
      message: "Network error. Please try again later.",
    };
  }
};

/**
 * Get additional content data (score, progress, notes)
 * @param {number} contentId - The TMDB ID of the content
 * @param {string} contentType - The type of content ('movie', 'series')
 * @returns {Promise} - A promise that resolves to the content data
 */
export const getContentData = async (contentId, contentType) => {
  try {
    const response = await fetch(
      `${API_URL}/lists/get-data?contentId=${contentId}&contentType=${contentType}`,
      {
        method: "GET",
        credentials: "include", // Important for cookies
      }
    );

    const data = await response.json();

    return data.success
      ? data.data
      : {
          score: 0,
          progress: 0,
          notes: "",
        };
  } catch (error) {
    console.error("Error getting content data:", error);
    return {
      score: 0,
      progress: 0,
      notes: "",
    };
  }
};