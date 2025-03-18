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

    const response = await fetch("https://graphql.anilist.co", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ query }),
    });

    const data = await response.json();
    return data.data.Page.media;
  } catch (error) {
    console.error("Error fetching anime:", error);
    return [];
  }
};

export const fetchAllAnime = async (page = 1, perPage = 24) => {
  try {
    const query = `
        query ($page: Int, $perPage: Int) {
          Page(page: $page, perPage: $perPage) {
            pageInfo {
              total
              currentPage
              lastPage
              hasNextPage
              perPage
            }
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

    const variables = {
      page: page,
      perPage: perPage,
    };

    const response = await fetch("https://graphql.anilist.co", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        query,
        variables,
      }),
    });

    const data = await response.json();

    // Filtrar los animes que contienen el género 'hentai'
    const filteredAnimes = data.data.Page.media.filter(anime => !anime.genres.includes('Hentai'));

    return {
      anime: filteredAnimes,
      pageInfo: data.data.Page.pageInfo,
    };
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
    const query = `
      query ($search: String, $page: Int, $perPage: Int) {
        Page(page: $page, perPage: $perPage) {
          pageInfo {
            total
            currentPage
            lastPage
            hasNextPage
            perPage
          }
          media(type: ANIME, search: $search, sort: SCORE_DESC) {
            id
            title {
              english
              romaji
              native
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

    const variables = {
      search: searchTerm,
      page: page,
      perPage: perPage,
    };

    const response = await fetch("https://graphql.anilist.co", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        query,
        variables,
      }),
    });

    const data = await response.json();

    // Filtrar los animes que contienen el género 'hentai'
    const filteredAnimes = data.data.Page.media.filter(anime => !anime.genres.includes('Hentai'));

    return {
      anime: filteredAnimes,
      pageInfo: data.data.Page.pageInfo,
      totalResults: data.data.Page.pageInfo.total,  // Incluye el total de resultados
    };
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
      totalResults: 0, // En caso de error, el total es 0
    };
  }
};

