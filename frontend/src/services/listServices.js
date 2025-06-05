const API_URL = "https://visualist-production.up.railway.app/api";

/**
 * Add content to a user's list (watched, to_watch, favorites)
 */
export const addToList = async (contentId, contentType, listType) => {
  try {
    const response = await fetch(`${API_URL}/lists/add.php`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contentId,
        contentType,
        listType,
      }),
      credentials: "include",
    });

    // Verificar si la respuesta es exitosa
    if (!response.ok) {
      if (response.status === 401) {
        // Session expired, redirect to login
        window.location.href = "/login";
        throw new Error("Session expired. Please login again.");
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.message || "Failed to add to list");
    }

    return data;
  } catch (error) {
    console.error(`Error adding to ${listType} list:`, error);
    throw error; // Re-throw para que el componente pueda manejarlo
  }
};

/**
 * Remove content from a user's list
 */
export const removeFromList = async (contentId, contentType, listType) => {
  try {
    const response = await fetch(`${API_URL}/lists/remove.php`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contentId,
        contentType,
        listType,
      }),
      credentials: "include",
    });

    if (!response.ok) {
      if (response.status === 401) {
        window.location.href = "/login";
        throw new Error("Session expired. Please login again.");
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.message || "Failed to remove from list");
    }

    return data;
  } catch (error) {
    console.error(`Error removing from ${listType} list:`, error);
    throw error;
  }
};

/**
 * Check if content is in user's lists
 */
export const checkListStatus = async (contentId, contentType) => {
  try {
    const response = await fetch(
      `${API_URL}/lists/check.php?contentId=${contentId}&contentType=${contentType}`,
      {
        method: "GET",
        credentials: "include",
      }
    );

    if (!response.ok) {
      if (response.status === 401) {
        // For check status, don't redirect - just return empty status
        return {
          watched: false,
          to_watch: false,
          favorites: false,
        };
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

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
 */
export const getUserList = async (
  listType,
  contentType = "movie",
  page = 1,
  perPage = 24
) => {
  try {
    const response = await fetch(
      `${API_URL}/lists/get.php?listType=${listType}&contentType=${contentType}&page=${page}&perPage=${perPage}`,
      {
        method: "GET",
        credentials: "include",
      }
    );

    if (!response.ok) {
      if (response.status === 401) {
        window.location.href = "/login";
        throw new Error("Session expired. Please login again.");
      }
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
    throw error;
  }
};

/**
 * Update additional content data (score, progress, notes)
 */
export const updateContentData = async (contentId, contentType, data) => {
  try {
    const response = await fetch(`${API_URL}/lists/update-data.php`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contentId,
        contentType,
        ...data,
      }),
      credentials: "include",
    });

    if (!response.ok) {
      if (response.status === 401) {
        window.location.href = "/login";
        throw new Error("Session expired. Please login again.");
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data_response = await response.json();

    if (!data_response.success) {
      throw new Error(data_response.message || "Failed to update content data");
    }

    return data_response;
  } catch (error) {
    console.error("Error updating content data:", error);
    throw error;
  }
};

/**
 * Get additional content data (score, progress, notes)
 */
export const getContentData = async (contentId, contentType) => {
  try {
    const response = await fetch(
      `${API_URL}/lists/get-data.php?contentId=${contentId}&contentType=${contentType}`,
      {
        method: "GET",
        credentials: "include",
      }
    );

    if (!response.ok) {
      if (response.status === 401) {
        // For get data, don't redirect - just return empty data
        return {
          score: 0,
          progress: 0,
          notes: "",
        };
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

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
