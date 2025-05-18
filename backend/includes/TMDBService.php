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
     * @param int $page Page number requested by client
     * @param int $perPage Items per page requested (ideally 24 for UI grid)
     * @return array Paginated movies data
     */
    public function getPopularMovies($page = 1, $perPage = 24)
    {
        try {
            // Calculate how many TMDb pages we need (each has 20 results)
            $tmdbItemsPerPage = 20; // TMDb API fixed page size
            $numberOfTmdbPages = ceil($perPage / $tmdbItemsPerPage);

            // Calculate the starting TMDb page number based on our custom pagination
            $startTmdbPage = (($page - 1) * $perPage) / $tmdbItemsPerPage + 1;

            $allResults = [];
            $tmdbTotalPages = 0;
            $tmdbTotalResults = 0;

            // Fetch required pages from TMDb
            for ($i = 0; $i < $numberOfTmdbPages; $i++) {
                $tmdbPage = floor($startTmdbPage) + $i;
                $url = TMDB_API_URL . '/movie/top_rated?api_key=' . TMDB_API_KEY . '&language=en-US&page=' . $tmdbPage;
                $response = ApiHelper::restRequest($url);

                if (!isset($response['results'])) {
                    continue; // Skip if invalid response
                }

                $allResults = array_merge($allResults, $response['results']);
                $tmdbTotalPages = max($tmdbTotalPages, $response['total_pages']);
                $tmdbTotalResults = $response['total_results'];
            }

            // Calculate the offset within our aggregated results
            $offset = (($page - 1) * $perPage) % $tmdbItemsPerPage;

            // Get just the items needed for the current page
            $paginatedResults = array_slice($allResults, $offset, $perPage);

            // Calculate proper pagination info for our custom page size
            $totalPages = ceil($tmdbTotalResults / $perPage);

            return [
                'results' => $paginatedResults,
                'page' => $page,
                'total_pages' => $totalPages,
                'total_results' => $tmdbTotalResults
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
     * @param int $perPage Items per page (e.g., 24)
     * @return array Search results with pagination info
     */
    public function searchMovies($query, $page = 1, $perPage = 24)
    {
        try {
            // Calculate how many TMDb pages we need (each has 20 results)
            $tmdbItemsPerPage = 20; // TMDb API fixed page size
            $numberOfTmdbPages = ceil($perPage / $tmdbItemsPerPage);

            // Calculate the starting TMDb page number based on our custom pagination
            $startTmdbPage = (($page - 1) * $perPage) / $tmdbItemsPerPage + 1;

            $allResults = [];
            $tmdbTotalPages = 0;
            $tmdbTotalResults = 0;

            // Fetch required pages from TMDb
            for ($i = 0; $i < $numberOfTmdbPages; $i++) {
                $tmdbPage = floor($startTmdbPage) + $i;
                $url = TMDB_API_URL . '/search/movie?api_key=' . TMDB_API_KEY . '&language=en-US&query=' . urlencode($query) . '&page=' . $tmdbPage;
                $response = ApiHelper::restRequest($url);

                if (!isset($response['results'])) {
                    continue; // Skip if invalid response
                }

                $allResults = array_merge($allResults, $response['results']);
                $tmdbTotalPages = max($tmdbTotalPages, $response['total_pages']);
                $tmdbTotalResults = $response['total_results'];
            }

            // Calculate the offset within our aggregated results
            $offset = (($page - 1) * $perPage) % $tmdbItemsPerPage;

            // Get just the items needed for the current page
            $paginatedResults = array_slice($allResults, $offset, $perPage);

            // Calculate proper pagination info for our custom page size
            $totalPages = ceil($tmdbTotalResults / $perPage);

            return [
                'results' => $paginatedResults,
                'page' => $page,
                'total_pages' => $totalPages,
                'total_results' => $tmdbTotalResults
            ];
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
     * @param int $perPage Items per page (e.g., 24)
     * @return array Paginated TV series data
     */
    public function getPopularSeries($page = 1, $perPage = 24)
    {
        try {
            // Calculate how many TMDb pages we need (each has 20 results)
            $tmdbItemsPerPage = 20; // TMDb API fixed page size
            $numberOfTmdbPages = ceil($perPage / $tmdbItemsPerPage) + 1; // Add one extra page to account for filtering

            // Calculate the starting TMDb page number based on our custom pagination
            $startTmdbPage = (($page - 1) * $perPage) / $tmdbItemsPerPage + 1;

            $allResults = [];
            $tmdbTotalPages = 0;
            $tmdbTotalResults = 0;

            // Fetch required pages from TMDb
            for ($i = 0; $i < $numberOfTmdbPages; $i++) {
                $tmdbPage = floor($startTmdbPage) + $i;
                $url = TMDB_API_URL . '/tv/top_rated?api_key=' . TMDB_API_KEY . '&language=en-US&page=' . $tmdbPage;
                $response = ApiHelper::restRequest($url);

                if (!isset($response['results'])) {
                    continue; // Skip if invalid response
                }

                // Filter animes from this page's results
                $filteredPageResults = $this->filterAnimes($response['results']);
                $allResults = array_merge($allResults, $filteredPageResults);

                $tmdbTotalPages = max($tmdbTotalPages, $response['total_pages']);
                // Estimate total results based on ratio of filtered items
                $filterRatio = count($filteredPageResults) / count($response['results']);
                $tmdbTotalResults = round($response['total_results'] * $filterRatio);
            }

            // Calculate the offset within our aggregated results
            $offset = (($page - 1) * $perPage) % $tmdbItemsPerPage;

            // Get just the items needed for the current page
            $paginatedResults = array_slice($allResults, $offset, $perPage);

            // Calculate proper pagination info for our custom page size
            $totalPages = ceil($tmdbTotalResults / $perPage);

            return [
                'results' => $paginatedResults,
                'page' => $page,
                'total_pages' => $totalPages,
                'total_results' => $tmdbTotalResults
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
     * @param int $perPage Items per page (e.g., 24)
     * @return array Search results with pagination info
     */
    public function searchSeries($query, $page = 1, $perPage = 24)
    {
        try {
            // Calculate how many TMDb pages we need (each has 20 results)
            $tmdbItemsPerPage = 20; // TMDb API fixed page size
            $numberOfTmdbPages = ceil($perPage / $tmdbItemsPerPage) + 1; // Add one extra page to account for filtering

            // Calculate the starting TMDb page number based on our custom pagination
            $startTmdbPage = (($page - 1) * $perPage) / $tmdbItemsPerPage + 1;

            $allResults = [];
            $tmdbTotalPages = 0;
            $tmdbTotalResults = 0;

            // Fetch required pages from TMDb
            for ($i = 0; $i < $numberOfTmdbPages; $i++) {
                $tmdbPage = floor($startTmdbPage) + $i;
                $url = TMDB_API_URL . '/search/tv?api_key=' . TMDB_API_KEY . '&language=en-US&query=' . urlencode($query) . '&page=' . $tmdbPage;
                $response = ApiHelper::restRequest($url);

                if (!isset($response['results'])) {
                    continue; // Skip if invalid response
                }

                // Filter animes from this page's results
                $filteredPageResults = $this->filterAnimes($response['results']);
                $allResults = array_merge($allResults, $filteredPageResults);

                $tmdbTotalPages = max($tmdbTotalPages, $response['total_pages']);
                // Estimate total results based on ratio of filtered items
                $filterRatio = count($filteredPageResults) / max(1, count($response['results']));
                $estimatedTotal = round($response['total_results'] * $filterRatio);
                $tmdbTotalResults = max($tmdbTotalResults, $estimatedTotal);
            }

            // Calculate the offset within our aggregated results
            $offset = (($page - 1) * $perPage) % $tmdbItemsPerPage;

            // Get just the items needed for the current page
            $paginatedResults = array_slice($allResults, $offset, $perPage);

            // Calculate proper pagination info for our custom page size
            $totalPages = ceil($tmdbTotalResults / $perPage);

            return [
                'results' => $paginatedResults,
                'page' => $page,
                'total_pages' => $totalPages,
                'total_results' => $tmdbTotalResults
            ];
        } catch (Exception $e) {
            throw new Exception('Error searching series: ' . $e->getMessage());
        }
    }
}
