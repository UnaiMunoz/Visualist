<?php
require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/ApiHelper.php';

/**
 * Service class for handling anime operations using TMDB API
 */
class TMDBAnimeService
{
  /**
   * Get top rated anime
   * 
   * @param int $limit Number of results to return
   * @return array Top rated anime
   */
  public function getTopAnime($limit = 10)
  {
    try {
      if (empty(TMDB_API_KEY)) {
        throw new Exception('TMDB API key not configured');
      }

      $url = TMDB_API_URL . '/discover/tv?api_key=' . TMDB_API_KEY .
        '&with_genres=16&with_original_language=ja' .
        '&sort_by=vote_average.desc&vote_count.gte=200&page=1';

      $response = ApiHelper::restRequest($url);

      if (!isset($response['results']) || empty($response['results'])) {
        throw new Exception('No anime data received from TMDB');
      }

      return $this->formatAnimeResults(array_slice($response['results'], 0, $limit));
    } catch (Exception $e) {
      error_log("Error in getTopAnime: " . $e->getMessage());
      throw new Exception('Error fetching top anime: ' . $e->getMessage());
    }
  }

  /**
   * Get paginated anime list
   * 
   * @param int $page Page number
   * @param int $perPage Items per page
   * @return array Paginated anime data
   */
  public function getAnimeList($page = 1, $perPage = 24)
  {
    try {
      // Calculate how many TMDB pages we need (each has 20 results)
      $tmdbItemsPerPage = 20; // TMDB API fixed page size
      $numberOfTmdbPages = ceil($perPage / $tmdbItemsPerPage);

      // Calculate the starting TMDB page number based on our custom pagination
      $startTmdbPage = (($page - 1) * $perPage) / $tmdbItemsPerPage + 1;

      $allResults = [];
      $tmdbTotalPages = 0;
      $tmdbTotalResults = 0;

      // Fetch required pages from TMDB
      for ($i = 0; $i < $numberOfTmdbPages; $i++) {
        $tmdbPage = floor($startTmdbPage) + $i;
        $url = TMDB_API_URL . '/discover/tv?api_key=' . TMDB_API_KEY .
          '&with_genres=16' .
          '&with_original_language=ja' .
          '&sort_by=vote_average.desc' . // Order by rating in descending order
          '&vote_count.gte=150' . // Minimum vote count for reliability
          '&page=' . $tmdbPage;

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

      // Format the results to match the expected structure
      $animeList = $this->formatAnimeResults($paginatedResults);

      // Calculate proper pagination info for our custom page size
      $totalPages = ceil($tmdbTotalResults / $perPage);

      return [
        'anime' => $animeList,
        'pageInfo' => [
          'total' => $tmdbTotalResults,
          'currentPage' => $page,
          'lastPage' => $totalPages,
          'hasNextPage' => $page < $totalPages,
          'perPage' => $perPage
        ]
      ];
    } catch (Exception $e) {
      throw new Exception('Error fetching anime list: ' . $e->getMessage());
    }
  }

  /**
   * Search for anime
   * 
   * @param string $searchTerm Search query
   * @param int $page Page number
   * @param int $perPage Items per page
   * @return array Search results
   */
  public function searchAnime($searchTerm, $page = 1, $perPage = 24)
  {
    try {
      // Calculate how many TMDB pages we need (each has 20 results)
      $tmdbItemsPerPage = 20; // TMDB API fixed page size
      $numberOfTmdbPages = ceil($perPage / $tmdbItemsPerPage);

      // Calculate the starting TMDB page number based on our custom pagination
      $startTmdbPage = (($page - 1) * $perPage) / $tmdbItemsPerPage + 1;

      $allResults = [];
      $tmdbTotalPages = 0;
      $tmdbTotalResults = 0;

      // Fetch required pages from TMDB
      for ($i = 0; $i < $numberOfTmdbPages; $i++) {
        $tmdbPage = floor($startTmdbPage) + $i;

        // Search TV shows with the search term
        $url = TMDB_API_URL . '/search/tv?api_key=' . TMDB_API_KEY .
          '&query=' . urlencode($searchTerm) .
          '&page=' . $tmdbPage;

        $response = ApiHelper::restRequest($url);

        if (!isset($response['results'])) {
          continue; // Skip if invalid response
        }

        // Filter results to include only anime (animation genre + Japanese origin)
        $filteredResults = $this->filterAnimeResults($response['results']);

        $allResults = array_merge($allResults, $filteredResults);
        $filteredCount = count($filteredResults);

        // Adjust total counts based on our filtering
        $tmdbTotalResults += $filteredCount;

        // If we don't have enough results after filtering, we might need more pages
        if ($filteredCount < $tmdbItemsPerPage && $i == $numberOfTmdbPages - 1 && $response['total_pages'] > $tmdbPage) {
          $numberOfTmdbPages++;
        }
      }

      // Sort results by vote_average in descending order
      usort($allResults, function ($a, $b) {
        return $b['vote_average'] <=> $a['vote_average'];
      });

      // Calculate the offset within our aggregated results
      $offset = (($page - 1) * $perPage) % $tmdbItemsPerPage;

      // Get just the items needed for the current page
      $paginatedResults = array_slice($allResults, 0, $perPage);

      // Format the results to match the expected structure
      $animeList = $this->formatAnimeResults($paginatedResults);

      // Calculate proper pagination info for our custom page size
      $totalPages = max(1, ceil($tmdbTotalResults / $perPage));

      return [
        'anime' => $animeList,
        'pageInfo' => [
          'total' => $tmdbTotalResults,
          'currentPage' => $page,
          'lastPage' => $totalPages,
          'hasNextPage' => $page < $totalPages,
          'perPage' => $perPage
        ]
      ];
    } catch (Exception $e) {
      throw new Exception('Error searching anime: ' . $e->getMessage());
    }
  }

  /**
   * Get anime details by ID
   * 
   * @param int $id TMDB ID
   * @return array Anime details
   */
  public function getAnimeDetails($id)
  {
    try {
      // Fetch TV details
      $url = TMDB_API_URL . '/tv/' . $id . '?api_key=' . TMDB_API_KEY . '&append_to_response=credits,keywords';
      $response = ApiHelper::restRequest($url);

      if (!isset($response['id'])) {
        throw new Exception('Invalid TMDb API response');
      }

      // Check if this is actually an anime
      $isAnime = $this->isAnime($response);

      if (!$isAnime) {
        throw new Exception('The requested content is not an anime');
      }

      // Format the response to match the expected structure for anime details
      $formattedAnime = $this->formatAnimeDetail($response);

      return $formattedAnime;
    } catch (Exception $e) {
      throw new Exception('Error fetching anime details: ' . $e->getMessage());
    }
  }

  /**
   * Filter results to include only anime
   * 
   * @param array $results Array of TV show results from TMDB
   * @return array Filtered results containing only anime
   */
  private function filterAnimeResults($results)
  {
    // This is a simplified filter that assumes Japanese animated TV shows are anime
    // A more sophisticated filter would check genre_ids for animation (16) and origin_country for JP
    return array_filter($results, function ($item) {
      // Check if it has animation genre (16)
      $hasAnimationGenre = in_array(16, $item['genre_ids'] ?? []);

      // Check if it's from Japan
      $isJapanese = in_array('JP', $item['origin_country'] ?? []);

      // If we can't determine, we'll check the original language
      if (empty($item['origin_country']) && isset($item['original_language'])) {
        $isJapanese = $item['original_language'] === 'ja';
      }

      return $hasAnimationGenre && $isJapanese; // Use AND instead of OR for stricter filtering
    });
  }

  /**
   * Check if a TV show is an anime based on its details
   * 
   * @param array $show TV show details
   * @return bool True if it's an anime, false otherwise
   */
  private function isAnime($show)
  {
    // Check for Animation genre (ID: 16)
    $hasAnimationGenre = false;
    foreach ($show['genres'] ?? [] as $genre) {
      if ($genre['id'] == 16) {
        $hasAnimationGenre = true;
        break;
      }
    }

    // Check if it's from Japan
    $isJapanese = in_array('JP', $show['origin_country'] ?? []);

    // If origin country is empty, check original language
    if (empty($show['origin_country']) && isset($show['original_language'])) {
      $isJapanese = $show['original_language'] === 'ja';
    }

    // Additional check for keywords that might indicate anime
    $animeKeywords = ['anime', 'manga', 'japanese animation'];
    $hasAnimeKeyword = false;

    if (isset($show['keywords']) && isset($show['keywords']['results'])) {
      foreach ($show['keywords']['results'] as $keyword) {
        if (in_array(strtolower($keyword['name']), $animeKeywords)) {
          $hasAnimeKeyword = true;
          break;
        }
      }
    }

    // Consider it anime if it has animation genre and is Japanese, or if it has an anime keyword
    return ($hasAnimationGenre && $isJapanese) || $hasAnimeKeyword;
  }

  /**
   * Format TMDB TV show results to match the expected anime format
   * 
   * @param array $results Array of TV show results from TMDB
   * @return array Formatted anime results
   */
  private function formatAnimeResults($results)
  {
    $formattedResults = [];

    foreach ($results as $item) {
      // Skip items without a poster
      if (empty($item['poster_path'])) {
        continue;
      }

      $formattedResults[] = [
        'id' => $item['id'],
        'title' => [
          'english' => $item['name'],
          'romaji' => $item['original_name'],
          'native' => $item['original_name']
        ],
        'coverImage' => [
          'large' => 'https://image.tmdb.org/t/p/w500' . $item['poster_path']
        ],
        'averageScore' => round($item['vote_average'] * 10), // Convert from 0-10 to percentage
        'genres' => $this->getGenreNames($item['genre_ids'] ?? []),
        'episodes' => $item['number_of_episodes'] ?? null,
        'startDate' => $this->formatDateFromString($item['first_air_date'] ?? null),
        'endDate' => $this->formatDateFromString($item['last_air_date'] ?? null),
      ];
    }

    return $formattedResults;
  }

  /**
   * Format a single TMDB TV show to match the expected anime detail format
   * 
   * @param array $show TV show details from TMDB
   * @return array Formatted anime details
   */
  private function formatAnimeDetail($show)
  {
    // Extract character data from credits
    $characters = [];
    if (isset($show['credits']) && isset($show['credits']['cast'])) {
      foreach (array_slice($show['credits']['cast'], 0, 8) as $castMember) {
        $characters[] = [
          'id' => $castMember['id'],
          'name' => [
            'full' => $castMember['name'],
            'native' => $castMember['original_name']
          ],
          'image' => [
            'medium' => $castMember['profile_path'] ? 'https://image.tmdb.org/t/p/w200' . $castMember['profile_path'] : null,
            'large' => $castMember['profile_path'] ? 'https://image.tmdb.org/t/p/w500' . $castMember['profile_path'] : null
          ],
          'character' => $castMember['character'] ?? null // Añadimos el nombre del personaje
        ];
      }
    }

    // Extract studio data from production companies
    $studios = [];
    if (isset($show['production_companies'])) {
      foreach ($show['production_companies'] as $company) {
        $studios[] = [
          'id' => $company['id'],
          'name' => $company['name']
        ];
      }
    }

    // Format genres as strings
    $genreNames = [];
    foreach ($show['genres'] ?? [] as $genre) {
      $genreNames[] = $genre['name'];
    }

    // Get season data
    $seasonYear = null;
    $season = null;
    if (!empty($show['first_air_date'])) {
      $date = new DateTime($show['first_air_date']);
      $seasonYear = (int)$date->format('Y');
      $month = (int)$date->format('n');

      // Determine season based on month
      if ($month >= 3 && $month <= 5) {
        $season = 'SPRING';
      } elseif ($month >= 6 && $month <= 8) {
        $season = 'SUMMER';
      } elseif ($month >= 9 && $month <= 11) {
        $season = 'FALL';
      } else {
        $season = 'WINTER';
      }
    }

    // Format status
    $status = 'FINISHED';
    if ($show['status'] === 'Returning Series') {
      $status = 'RELEASING';
    } elseif ($show['status'] === 'In Production') {
      $status = 'NOT_YET_RELEASED';
    } elseif ($show['status'] === 'Canceled') {
      $status = 'CANCELLED';
    }

    return [
      'id' => $show['id'],
      'title' => [
        'english' => $show['name'],
        'romaji' => $show['original_name'],
        'native' => $show['original_name']
      ],
      'coverImage' => [
        'large' => $show['poster_path'] ? 'https://image.tmdb.org/t/p/w500' . $show['poster_path'] : null
      ],
      'bannerImage' => $show['backdrop_path'] ? 'https://image.tmdb.org/t/p/original' . $show['backdrop_path'] : null,
      'description' => $show['overview'],
      'episodes' => $show['number_of_episodes'] ?? null,
      'status' => $status,
      'season' => $season,
      'seasonYear' => $seasonYear,
      'averageScore' => round($show['vote_average'] * 10), // Convert to percentage
      'genres' => $genreNames,
      'format' => 'TV', // Default format for anime from TMDB
      'duration' => $show['episode_run_time'][0] ?? null, // Episode duration in minutes
      'startDate' => $this->formatDateFromString($show['first_air_date'] ?? null),
      'endDate' => $this->formatDateFromString($show['last_air_date'] ?? null),
      'popularity' => $show['popularity'],
      'meanScore' => round($show['vote_average'] * 10),
      'favourites' => 0, // Not available in TMDB
      'studios' => [
        'nodes' => $studios
      ],
      'characters' => [
        'nodes' => $characters
      ]
    ];
  }

  /**
   * Get genre names from genre IDs
   * 
   * @param array $genreIds Array of TMDB genre IDs
   * @return array Array of genre names
   */
  private function getGenreNames($genreIds)
  {
    // Map of TMDB genre IDs to genre names
    $genreMap = [
      16 => 'Animation',
      10759 => 'Action & Adventure',
      10762 => 'Kids',
      10765 => 'Sci-Fi & Fantasy',
      35 => 'Comedy',
      18 => 'Drama',
      10768 => 'War & Politics',
      9648 => 'Mystery',
      37 => 'Western',
      80 => 'Crime',
      10751 => 'Family',
      10766 => 'Soap',
      10767 => 'Talk',
      99 => 'Documentary',
      10764 => 'Reality',
      27 => 'Horror',
      28 => 'Action',
      12 => 'Adventure',
      14 => 'Fantasy',
      36 => 'History',
      10402 => 'Music',
      10749 => 'Romance',
      878 => 'Science Fiction',
      10770 => 'TV Movie',
      53 => 'Thriller',
      10752 => 'War'
    ];

    $names = [];
    foreach ($genreIds as $id) {
      if (isset($genreMap[$id])) {
        $names[] = $genreMap[$id];
      }
    }

    // Add "Anime" as a genre for easier identification
    if (!in_array('Anime', $names)) {
      $names[] = 'Anime';
    }

    return $names;
  }


  /**
   * Format date from string to structured format
   * 
   * @param string|null $dateString Date string in format YYYY-MM-DD
   * @return array|null Structured date with year, month, day
   */
  private function formatDateFromString($dateString)
  {
    if (empty($dateString)) {
      return null;
    }

    $parts = explode('-', $dateString);
    if (count($parts) !== 3) {
      return null;
    }

    return [
      'year' => (int)$parts[0],
      'month' => (int)$parts[1],
      'day' => (int)$parts[2]
    ];
  }
}
