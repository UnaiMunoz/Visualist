const API_KEY = 'TMDB_API_KEY';

export const fetchTopSeries = async () => {
    try {
      const response = await fetch(
        `https://api.themoviedb.org/3/tv/top_rated?api_key=${API_KEY}&language=en-US&page=1`
      );
      const data = await response.json();
      return data.results.slice(0, 10);
    } catch (error) {
      console.error("Error fetching series:", error);
      return [];
    }
  };