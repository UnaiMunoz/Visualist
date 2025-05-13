<?php
require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/ApiHelper.php';

/**
 * Service class for TMDb API operations
 */
class TMDBService
{
    /**
     * Lista de géneros que se consideran típicos de animes
     * 16 = Animación
     */
    private $animeGenreIds = [16];

    /**
     * Lista de países de origen típicos de animes
     */
    private $animeCountries = ['JP'];

    /**
     * Palabras clave que suelen estar asociadas con animes
     */
    private $animeKeywords = ['anime', 'manga', 'otaku'];

    /**
     * Verifica si una serie es probablemente un anime basado en sus metadatos
     * 
     * @param array $series Los datos de la serie a verificar
     * @return boolean True si es probablemente un anime, False en caso contrario
     */
    private function isLikelyAnime($series)
    {
        // Verificar si es una animación japonesa
        if (isset($series['genre_ids']) && in_array(16, $series['genre_ids'])) {
            // Verificar país de origen
            if (isset($series['origin_country']) && in_array('JP', $series['origin_country'])) {
                return true;
            }

            // Verificar idioma original
            if (isset($series['original_language']) && $series['original_language'] === 'ja') {
                return true;
            }
        }

        // Verificar palabras clave en el título
        if (isset($series['name'])) {
            $title = strtolower($series['name']);
            foreach ($this->animeKeywords as $keyword) {
                if (strpos($title, $keyword) !== false) {
                    return true;
                }
            }
        }

        return false;
    }

    /**
     * Filtra animes de una lista de series
     * 
     * @param array $seriesList Lista de series
     * @return array Lista filtrada sin animes
     */
    private function filterAnimes($seriesList)
    {
        return array_filter($seriesList, function ($series) {
            return !$this->isLikelyAnime($series);
        });
    }

    /**
     * Get top rated movies
     * 
     * @param int $limit Number of results to return
     * @return array Top rated movies
     */
    public function getTopMovies($limit = 10)
    {
        try {
            $url = TMDB_API_URL . '/movie/top_rated?api_key=' . TMDB_API_KEY . '&language=en-US&page=1';
            $response = ApiHelper::restRequest($url);

            if (!isset($response['results'])) {
                throw new Exception('Invalid TMDb API response');
            }

            return array_slice($response['results'], 0, $limit);
        } catch (Exception $e) {
            throw new Exception('Error fetching top movies: ' . $e->getMessage());
        }
    }

    /**
     * Get top-rated movies with pagination
     * 
     * @param int $page Page number
     * @param int $perPage Items per page (TMDb API only supports 20 per page)
     * @return array Paginated movies data
     */
    public function getPopularMovies($page = 1, $perPage = 24)
    {
        try {
            // Use top_rated endpoint instead of popular to match sort by rating requirement
            $url = TMDB_API_URL . '/movie/top_rated?api_key=' . TMDB_API_KEY . '&language=en-US&page=' . $page;
            $response = ApiHelper::restRequest($url);

            if (!isset($response['results'])) {
                throw new Exception('Invalid TMDb API response');
            }

            // TMDb API returns 20 items per page by default
            // To get 24 items, we need to fetch from two pages if needed
            $results = $response['results'];

            // If we need more items to reach perPage and there are more pages
            if (count($results) < $perPage && $response['page'] < $response['total_pages']) {
                // Fetch next page
                $nextPage = $page + 1;
                $nextUrl = TMDB_API_URL . '/movie/top_rated?api_key=' . TMDB_API_KEY . '&language=en-US&page=' . $nextPage;
                $nextResponse = ApiHelper::restRequest($nextUrl);

                if (isset($nextResponse['results'])) {
                    // Add items from next page until we reach perPage
                    $needed = $perPage - count($results);
                    $results = array_merge($results, array_slice($nextResponse['results'], 0, $needed));
                }
            }

            return [
                'results' => $results,
                'page' => $response['page'],
                'total_pages' => $response['total_pages'],
                'total_results' => $response['total_results']
            ];
        } catch (Exception $e) {
            throw new Exception('Error fetching top-rated movies: ' . $e->getMessage());
        }
    }

    /**
     * Search for movies
     * 
     * @param string $query Search query
     * @param int $page Page number
     * @param int $perPage Items per page (not used as TMDb has fixed page size)
     * @return array Search results with pagination info
     */
    public function searchMovies($query, $page = 1, $perPage = 20)
    {
        try {
            $url = TMDB_API_URL . '/search/movie?api_key=' . TMDB_API_KEY . '&language=en-US&query=' . urlencode($query) . '&page=' . $page;
            $response = ApiHelper::restRequest($url);

            if (!isset($response['results'])) {
                throw new Exception('Invalid TMDb API response');
            }

            return $response;
        } catch (Exception $e) {
            throw new Exception('Error searching movies: ' . $e->getMessage());
        }
    }

    /**
     * Get top rated TV series (excluding animes)
     * 
     * @param int $limit Number of results to return
     * @return array Top rated TV series
     */
    public function getTopSeries($limit = 10)
    {
        try {
            // Fetch more items to compensate for filtering animes
            $fetchLimit = $limit * 2; // Fetch doble para asegurar tener suficientes después de filtrar

            $url = TMDB_API_URL . '/tv/top_rated?api_key=' . TMDB_API_KEY . '&language=en-US&page=1';
            $response = ApiHelper::restRequest($url);

            if (!isset($response['results'])) {
                throw new Exception('Invalid TMDb API response');
            }

            // Filtrar animes
            $filteredResults = $this->filterAnimes($response['results']);

            // Si no hay suficientes resultados después de filtrar, intentar con otra página
            if (count($filteredResults) < $limit && isset($response['total_pages']) && $response['total_pages'] > 1) {
                $page2Url = TMDB_API_URL . '/tv/top_rated?api_key=' . TMDB_API_KEY . '&language=en-US&page=2';
                $page2Response = ApiHelper::restRequest($page2Url);

                if (isset($page2Response['results'])) {
                    $page2Filtered = $this->filterAnimes($page2Response['results']);
                    $filteredResults = array_merge($filteredResults, $page2Filtered);
                }
            }

            return array_slice($filteredResults, 0, $limit);
        } catch (Exception $e) {
            throw new Exception('Error fetching top series: ' . $e->getMessage());
        }
    }

    /**
     * Get top-rated TV series with pagination (excluding animes)
     * 
     * @param int $page Page number
     * @param int $perPage Items per page (TMDb API only supports 20 per page)
     * @return array Paginated TV series data
     */
    public function getPopularSeries($page = 1, $perPage = 24)
    {
        try {
            // Use top_rated endpoint instead of popular to match sort by rating requirement
            $url = TMDB_API_URL . '/tv/top_rated?api_key=' . TMDB_API_KEY . '&language=en-US&page=' . $page;
            $response = ApiHelper::restRequest($url);

            if (!isset($response['results'])) {
                throw new Exception('Invalid TMDb API response');
            }

            // Filtrar animes de los resultados
            $filteredResults = $this->filterAnimes($response['results']);

            // Si no tenemos suficientes resultados después de filtrar, cargar más páginas
            $currentResultCount = count($filteredResults);
            $additionalPage = $page + 1;

            while ($currentResultCount < $perPage && $additionalPage <= $response['total_pages']) {
                $nextUrl = TMDB_API_URL . '/tv/top_rated?api_key=' . TMDB_API_KEY . '&language=en-US&page=' . $additionalPage;
                $nextResponse = ApiHelper::restRequest($nextUrl);

                if (isset($nextResponse['results'])) {
                    $additionalResults = $this->filterAnimes($nextResponse['results']);
                    $filteredResults = array_merge($filteredResults, $additionalResults);
                    $currentResultCount = count($filteredResults);
                }

                $additionalPage++;

                // Evitar demasiadas llamadas a la API
                if ($additionalPage > $page + 3) {
                    break;
                }
            }

            // Limitar al número de resultados por página solicitados
            $limitedResults = array_slice($filteredResults, 0, $perPage);

            // Ajustar total_results para reflejar el filtrado
            $estimatedTotal = $response['total_results'] / 2; // Estimación aproximada después del filtrado

            return [
                'results' => $limitedResults,
                'page' => $response['page'],
                'total_pages' => $response['total_pages'],
                'total_results' => $estimatedTotal
            ];
        } catch (Exception $e) {
            throw new Exception('Error fetching top-rated series: ' . $e->getMessage());
        }
    }

    /**
     * Search for TV series (excluding animes)
     * 
     * @param string $query Search query
     * @param int $page Page number
     * @param int $perPage Items per page (not used as TMDb has fixed page size)
     * @return array Search results with pagination info
     */
    public function searchSeries($query, $page = 1, $perPage = 20)
    {
        try {
            $url = TMDB_API_URL . '/search/tv?api_key=' . TMDB_API_KEY . '&language=en-US&query=' . urlencode($query) . '&page=' . $page;
            $response = ApiHelper::restRequest($url);

            if (!isset($response['results'])) {
                throw new Exception('Invalid TMDb API response');
            }

            // Filtrar animes de los resultados
            $filteredResults = $this->filterAnimes($response['results']);

            // Ajustar el total de resultados en base al filtrado (estimación)
            $filterRatio = count($filteredResults) / count($response['results']);
            $estimatedTotal = round($response['total_results'] * $filterRatio);

            $response['results'] = $filteredResults;
            $response['total_results'] = $estimatedTotal;

            return $response;
        } catch (Exception $e) {
            throw new Exception('Error searching series: ' . $e->getMessage());
        }
    }
}
