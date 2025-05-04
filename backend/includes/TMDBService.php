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
            
            // TMDb API returns 20 items per page by default
            // To get 24 items, we need to fetch from two pages if needed
            $results = $response['results'];
            
            // If we need more items to reach perPage and there are more pages
            if (count($results) < $perPage && $response['page'] < $response['total_pages']) {
                // Fetch next page
                $nextPage = $page + 1;
                $nextUrl = TMDB_API_URL . '/tv/top_rated?api_key=' . TMDB_API_KEY . '&language=en-US&page=' . $nextPage;
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
            throw new Exception('Error fetching top-rated series: ' . $e->getMessage());
        }
    }

    /**
     * Search for TV series
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

            return $response;
        } catch (Exception $e) {
            throw new Exception('Error searching series: ' . $e->getMessage());
        }
    }
}