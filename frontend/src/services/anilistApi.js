export const fetchTopAnime = async () => {
    try {
      const query = `
        query {
          Page(page: 1, perPage: 10) {
            media(type: ANIME, sort: SCORE_DESC) {
              id
              title {
                english
                romaji
              }
              coverImage {
                large
              }
              averageScore
              genres
              episodes
            }
          }
        }
      `;
  
      const response = await fetch('https://graphql.anilist.co', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ query })
      });
  
      const data = await response.json();
      return data.data.Page.media;
    } catch (error) {
      console.error("Error fetching anime:", error);
      return [];
    }
  };