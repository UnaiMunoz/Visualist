// frontend/src/services/seriesServices.js
const API_URL = 'http://localhost/visualist/backend/api';

export const fetchTopSeries = async () => {
  try {
    const response = await fetch(`${API_URL}/series/top`);

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching series:", error);
    return [];
  }
};
