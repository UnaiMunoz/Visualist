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
     * Get movie details by ID
     * 
     * @param int $id TMDb movie ID
     * @return array Movie details including cast and crew
     */
    public function getMovieDetails($id)
    {
        try {
            // Fetch movie details with credits
            $url = TMDB_API_URL . '/movie/' . $id . '?api_key=' . TMDB_API_KEY . '&append_to_response=credits&language=en-US';
            $response = ApiHelper::restRequest($url);

            if (!isset($response['id'])) {
                throw new Exception('Invalid TMDb API response');
            }

            return $response;
        } catch (Exception $e) {
            throw new Exception('Error fetching movie details: ' . $e->getMessage());
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

    /**
     * Get TV series details by ID
     * 
     * @param int $id TMDb series ID
     * @return array Series details including cast and crew from ALL seasons
     */
    public function getSeriesDetails($id)
    {
        try {
            // First, fetch series details with basic info
            $url = TMDB_API_URL . '/tv/' . $id . '?api_key=' . TMDB_API_KEY . '&language=en-US';
            $response = ApiHelper::restRequest($url);

            if (!isset($response['id'])) {
                throw new Exception('Invalid TMDb API response');
            }

            // Now fetch the AGGREGATE credits (all seasons) separately
            $creditsUrl = TMDB_API_URL . '/tv/' . $id . '/aggregate_credits?api_key=' . TMDB_API_KEY . '&language=en-US';
            $creditsResponse = ApiHelper::restRequest($creditsUrl);

            // Process and normalize the credits data
            if (isset($creditsResponse['cast']) || isset($creditsResponse['crew'])) {
                $normalizedCast = [];
                $normalizedCrew = [];

                // Process cast - handle the roles structure in aggregate_credits
                if (isset($creditsResponse['cast']) && is_array($creditsResponse['cast'])) {
                    foreach ($creditsResponse['cast'] as $castMember) {
                        $normalizedMember = [
                            'adult' => $castMember['adult'] ?? false,
                            'gender' => $castMember['gender'] ?? null,
                            'id' => $castMember['id'] ?? 0,
                            'known_for_department' => $castMember['known_for_department'] ?? 'Acting',
                            'name' => $castMember['name'] ?? 'Unknown',
                            'original_name' => $castMember['original_name'] ?? $castMember['name'] ?? 'Unknown',
                            'popularity' => $castMember['popularity'] ?? 0,
                            'profile_path' => $castMember['profile_path'] ?? null,
                            'cast_id' => $castMember['id'] ?? 0,
                            'credit_id' => $castMember['credit_id'] ?? '',
                            'order' => $castMember['order'] ?? 999
                        ];

                        // Handle character field - aggregate_credits uses 'roles' array
                        if (isset($castMember['roles']) && is_array($castMember['roles']) && !empty($castMember['roles'])) {
                            // Get the first character from roles array
                            $firstRole = $castMember['roles'][0];
                            $normalizedMember['character'] = $firstRole['character'] ?? 'Unknown Role';
                        } elseif (isset($castMember['character'])) {
                            // Fallback to direct character field if available
                            $normalizedMember['character'] = $castMember['character'];
                        } else {
                            $normalizedMember['character'] = 'Unknown Role';
                        }

                        $normalizedCast[] = $normalizedMember;
                    }
                }

                // Process crew - handle the jobs structure in aggregate_credits
                if (isset($creditsResponse['crew']) && is_array($creditsResponse['crew'])) {
                    foreach ($creditsResponse['crew'] as $crewMember) {
                        $normalizedMember = [
                            'adult' => $crewMember['adult'] ?? false,
                            'gender' => $crewMember['gender'] ?? null,
                            'id' => $crewMember['id'] ?? 0,
                            'known_for_department' => $crewMember['known_for_department'] ?? 'Production',
                            'name' => $crewMember['name'] ?? 'Unknown',
                            'original_name' => $crewMember['original_name'] ?? $crewMember['name'] ?? 'Unknown',
                            'popularity' => $crewMember['popularity'] ?? 0,
                            'profile_path' => $crewMember['profile_path'] ?? null,
                            'credit_id' => $crewMember['credit_id'] ?? ''
                        ];

                        // Handle job field - aggregate_credits uses 'jobs' array
                        if (isset($crewMember['jobs']) && is_array($crewMember['jobs']) && !empty($crewMember['jobs'])) {
                            // Get the first job from jobs array
                            $firstJob = $crewMember['jobs'][0];
                            $normalizedMember['job'] = $firstJob['job'] ?? 'Unknown Job';
                            $normalizedMember['department'] = $firstJob['department'] ?? 'Unknown Department';
                        } elseif (isset($crewMember['job'])) {
                            // Fallback to direct job field if available
                            $normalizedMember['job'] = $crewMember['job'];
                            $normalizedMember['department'] = $crewMember['department'] ?? 'Unknown Department';
                        } else {
                            $normalizedMember['job'] = 'Unknown Job';
                            $normalizedMember['department'] = 'Unknown Department';
                        }

                        $normalizedCrew[] = $normalizedMember;
                    }
                }

                $response['credits'] = [
                    'cast' => $normalizedCast,
                    'crew' => $normalizedCrew
                ];

                // Log the number of cast members found for debugging
                error_log("Series ID {$id}: Found " . count($normalizedCast) . " cast members using aggregate_credits");
            } else {
                // Fallback to regular credits if aggregate_credits fails
                $fallbackUrl = TMDB_API_URL . '/tv/' . $id . '/credits?api_key=' . TMDB_API_KEY . '&language=en-US';
                $fallbackCredits = ApiHelper::restRequest($fallbackUrl);

                $response['credits'] = [
                    'cast' => $fallbackCredits['cast'] ?? [],
                    'crew' => $fallbackCredits['crew'] ?? []
                ];

                error_log("Series ID {$id}: Fallback to regular credits - Found " . count($fallbackCredits['cast'] ?? []) . " cast members");
            }

            return $response;
        } catch (Exception $e) {
            throw new Exception('Error fetching series details: ' . $e->getMessage());
        }
    }
}
