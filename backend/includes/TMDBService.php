<?php
require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/ApiHelper.php';

/**
 * Service class for TMDb API operations
 */
class TMDBService
{
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
     * Get top rated TV series 
     * 
     * @param int $limit Number of results to return
     * @return array Top rated TV series
     */
    public function getTopSeries($limit = 10)
    {
        try {
            $url = TMDB_API_URL . '/tv/top_rated?api_key=' . TMDB_API_KEY . '&language=en-US&page=1';
            $response = ApiHelper::restRequest($url);

            if (!isset($response['results'])) {
                throw new Exception('Invalid TMDb API response');
            }

            return array_slice($response['results'], 0, $limit);
        } catch (Exception $e) {
            throw new Exception('Error fetching top series: ' . $e->getMessage());
        }
    }

    /**
     * Get top-rated TV series with pagination 
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
            $numberOfTmdbPages = ceil($perPage / $tmdbItemsPerPage);

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

                // We don't filter here anymore
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
            throw new Exception('Error fetching top-rated series: ' . $e->getMessage());
        }
    }

    /**
     * Search for TV series (including animes)
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
            $numberOfTmdbPages = ceil($perPage / $tmdbItemsPerPage);

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

                // No more filtering here
                $allResults = array_merge($allResults, $response['results']);

                $tmdbTotalPages = max($tmdbTotalPages, $response['total_pages']);
                // Use total results directly without adjustment
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
            throw new Exception('Error searching series: ' . $e->getMessage());
        }
    }
}
