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

// Función corregida para obtener detalles de anime por ID
export const getAnimeDetails = async (id) => {
  try {
    // Primero, verificamos si tenemos datos en caché
    const cachedAnime = localStorage.getItem(`anime_${id}`);
    const cachedTime = localStorage.getItem(`anime_${id}_timestamp`);
    const CACHE_TIME = 30 * 60 * 1000; // 30 minutos en milisegundos

    // Verificamos si los datos están en caché y no han expirado
    if (cachedAnime && cachedTime) {
      const now = Date.now();
      if (now - parseInt(cachedTime) < CACHE_TIME) {
        console.log(`Usando datos en caché para el anime ID ${id}`);
        return JSON.parse(cachedAnime);
      }
    }

    // Siempre intentamos obtener los datos del backend primero
    console.log(`Obteniendo detalles del anime ID ${id} del backend`);
    try {
      const url = `${API_URL}/anime/detail?id=${id}`;
      console.log("Making API call to:", url);

      const response = await fetch(url);

      // Solo procedemos si la respuesta es correcta
      if (response.ok) {
        const data = await response.json();
        console.log("Parsed anime detail data:", data);

        // Guardamos los datos en caché
        localStorage.setItem(`anime_${id}`, JSON.stringify(data));
        localStorage.setItem(`anime_${id}_timestamp`, Date.now().toString());

        return data;
      } else {
        console.log(
          `Error al obtener datos del anime ID ${id} del backend: ${response.status}`
        );
        // Si hay un error, continuamos con las estrategias alternativas
      }
    } catch (error) {
      console.error(
        `Error en la petición al backend para el anime ID ${id}:`,
        error
      );
      // Si hay un error, continuamos con las estrategias alternativas
    }

    // Intentamos buscar en los datos almacenados localmente
    // Primero en el top de animes
    console.log("Buscando en datos locales...");
    const topAnimeCached = localStorage.getItem("topAnime");
    if (topAnimeCached) {
      const topAnimeList = JSON.parse(topAnimeCached);
      const foundAnime = topAnimeList.find(
        (anime) => anime.id === parseInt(id)
      );
      if (foundAnime) {
        console.log(`Encontrado anime con ID ${id} en caché de top animes`);

        // Importante: estos datos pueden estar incompletos, así que intentamos obtener más datos
        // haciendo otra petición de búsqueda
        try {
          const searchResult = await searchAnime(
            foundAnime.title.english || foundAnime.title.romaji
          );
          if (
            searchResult &&
            searchResult.anime &&
            searchResult.anime.length > 0
          ) {
            // Buscamos una coincidencia exacta por ID
            const exactMatch = searchResult.anime.find(
              (anime) => anime.id === parseInt(id)
            );
            if (exactMatch) {
              console.log(
                `Encontrado anime con ID ${id} en resultados de búsqueda`
              );

              // Guardamos en caché y devolvemos
              localStorage.setItem(`anime_${id}`, JSON.stringify(exactMatch));
              localStorage.setItem(
                `anime_${id}_timestamp`,
                Date.now().toString()
              );

              return exactMatch;
            }
          }
        } catch (searchError) {
          console.error("Error al buscar anime por título:", searchError);
        }

        // Si no encontramos más datos, devolvemos lo que tenemos
        return foundAnime;
      }
    }

    // Último recurso: intentamos buscar en la lista general de animes
    try {
      console.log("Intentando obtener datos generales de animes...");
      const allAnimeResponse = await fetchAllAnime();
      if (allAnimeResponse && allAnimeResponse.anime) {
        const foundAnime = allAnimeResponse.anime.find(
          (anime) => anime.id === parseInt(id)
        );
        if (foundAnime) {
          console.log(`Encontrado anime con ID ${id} en lista general`);
          return foundAnime;
        }
      }
    } catch (error) {
      console.error("Error al buscar en lista general de animes:", error);
    }

    // Si llegamos aquí, no pudimos encontrar el anime en ninguna fuente
    throw new Error(
      `No se pudo encontrar información para el anime con ID ${id}`
    );
  } catch (error) {
    console.error(`Error obteniendo detalles del anime para ID ${id}:`, error);
    throw error;
  }
};
