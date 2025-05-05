<?php
require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/ApiHelper.php';

/**
 * Service class for Anime API operations
 */
class AnimeService
{
  /**
   * Get top rated anime
   * 
   * @param int $limit Number of results to return
   * @return array Top rated anime
   */
  public function getTopAnime($limit = 10)
  {
    $query = <<<GRAPHQL
        query {
          Page(page: 1, perPage: $limit) {
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
        GRAPHQL;

    try {
      $data = [
        'query' => $query
      ];

      $response = ApiHelper::graphqlRequest(ANILIST_API_URL, $data);

      if (isset($response['errors'])) {
        throw new Exception($response['errors'][0]['message']);
      }

      $animeList = $response['data']['Page']['media'];
      return ApiHelper::filterHentaiContent($animeList);
    } catch (Exception $e) {
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
    $query = <<<GRAPHQL
        query (\$page: Int, \$perPage: Int) {
          Page(page: \$page, perPage: \$perPage) {
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
        GRAPHQL;

    try {
      $data = [
        'query' => $query,
        'variables' => [
          'page' => (int) $page,
          'perPage' => (int) $perPage
        ]
      ];

      $response = ApiHelper::graphqlRequest(ANILIST_API_URL, $data);

      if (isset($response['errors'])) {
        throw new Exception($response['errors'][0]['message']);
      }

      $pageInfo = $response['data']['Page']['pageInfo'];
      $animeList = $response['data']['Page']['media'];
      $filteredAnime = ApiHelper::filterHentaiContent($animeList);

      return [
        'anime' => array_values($filteredAnime), // Reset array keys
        'pageInfo' => $pageInfo
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
    $query = <<<GRAPHQL
        query (\$search: String, \$page: Int, \$perPage: Int) {
          Page(page: \$page, perPage: \$perPage) {
            pageInfo {
              total
              currentPage
              lastPage
              hasNextPage
              perPage
            }
            media(type: ANIME, search: \$search, sort: SCORE_DESC) {
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
        GRAPHQL;

    try {
      $data = [
        'query' => $query,
        'variables' => [
          'search' => $searchTerm,
          'page' => (int) $page,
          'perPage' => (int) $perPage
        ]
      ];

      $response = ApiHelper::graphqlRequest(ANILIST_API_URL, $data);

      if (isset($response['errors'])) {
        throw new Exception($response['errors'][0]['message']);
      }

      $pageInfo = $response['data']['Page']['pageInfo'];
      $animeList = $response['data']['Page']['media'];
      $filteredAnime = ApiHelper::filterHentaiContent($animeList);

      return [
        'anime' => array_values($filteredAnime), // Reset array keys
        'pageInfo' => $pageInfo
      ];
    } catch (Exception $e) {
      throw new Exception('Error searching anime: ' . $e->getMessage());
    }
  }

  /**
   * Get anime details by ID
   * 
   * @param int $id Anime ID
   * @return array Anime details
   */
  public function getAnimeDetails($id)
  {
    $query = <<<GRAPHQL
        query (\$id: Int) {
          Media(id: \$id, type: ANIME) {
            id
            title {
              english
              romaji
              native
            }
            coverImage {
              large
            }
            bannerImage
            description
            episodes
            status
            season
            seasonYear
            averageScore
            genres
            studios {
              nodes {
                id
                name
              }
            }
            characters(sort: ROLE, perPage: 6) {
              nodes {
                id
                name {
                  full
                }
                image {
                  medium
                }
              }
            }
          }
        }
        GRAPHQL;

    try {
      $data = [
        'query' => $query,
        'variables' => [
          'id' => (int) $id
        ]
      ];

      $response = ApiHelper::graphqlRequest(ANILIST_API_URL, $data);

      if (isset($response['errors'])) {
        throw new Exception($response['errors'][0]['message']);
      }

      $anime = $response['data']['Media'];

      // Reformat the structure for consistency with our frontend
      $formattedAnime = [
        'id' => $anime['id'],
        'title' => $anime['title'],
        'coverImage' => $anime['coverImage'],
        'bannerImage' => $anime['bannerImage'],
        'description' => $anime['description'],
        'episodes' => $anime['episodes'],
        'status' => $anime['status'],
        'season' => $anime['season'],
        'seasonYear' => $anime['seasonYear'],
        'averageScore' => $anime['averageScore'],
        'genres' => $anime['genres'],
        'studios' => $anime['studios']['nodes'],
        'characters' => $anime['characters']['nodes']
      ];

      return $formattedAnime;
    } catch (Exception $e) {
      throw new Exception('Error fetching anime details: ' . $e->getMessage());
    }
  }
}
