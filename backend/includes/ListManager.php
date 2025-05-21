<?php
// backend/includes/ListManager.php

require_once __DIR__ . '/Database.php';

class ListManager
{
    private $conn;
    private $apiUrl;

    public function __construct()
    {
        $database = new Database();
        $this->conn = $database->connect();

        // Define the API URL from the config
        $this->apiUrl = defined('TMDB_API_URL') ? TMDB_API_URL : 'https://api.themoviedb.org/3';
    }

    /**
     * Add content to a user's list (watched, to_watch, favorites)
     */
    public function addToList($userId, $contentId, $contentType, $listType)
    {
        // First ensure the content reference exists in our database
        $referenceId = $this->ensureContentReference($contentId, $contentType);

        // Now add to the appropriate list based on list type
        switch ($listType) {
            case 'favorites':
                return $this->addToFavorites($userId, $referenceId);
            case 'watched':
            case 'to_watch':
                return $this->addToUserContentStatus($userId, $referenceId, $listType);
            default:
                throw new Exception("Invalid list type: $listType");
        }
    }

    /**
     * Remove content from a user's list
     */
    public function removeFromList($userId, $contentId, $contentType, $listType)
    {
        // Get the reference ID for this content
        $referenceId = $this->getContentReferenceId($contentId, $contentType);

        if (!$referenceId) {
            throw new Exception("Content reference not found");
        }

        // Remove from the appropriate list based on list type
        switch ($listType) {
            case 'favorites':
                return $this->removeFromFavorites($userId, $referenceId);
            case 'watched':
            case 'to_watch':
                return $this->removeFromUserContentStatus($userId, $referenceId, $listType);
            default:
                throw new Exception("Invalid list type: $listType");
        }
    }

    /**
     * Check if content is in a user's lists
     */
    public function checkListStatus($userId, $contentId, $contentType)
    {
        $referenceId = $this->getContentReferenceId($contentId, $contentType);

        if (!$referenceId) {
            // Content not in our database yet, so it's not in any list
            return [
                'watched' => false,
                'to_watch' => false,
                'favorites' => false
            ];
        }

        // Check status in each list
        $status = [
            'watched' => false,
            'to_watch' => false,
            'favorites' => false
        ];

        // Check User_Content_Status table for watched and to_watch
        $query = "SELECT status FROM User_Content_Status 
                  WHERE user_id = :user_id AND reference_id = :reference_id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':user_id', $userId);
        $stmt->bindParam(':reference_id', $referenceId);
        $stmt->execute();

        if ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            if ($row['status'] === 'completed') {
                $status['watched'] = true;
            } else if ($row['status'] === 'plan_to_watch') {
                $status['to_watch'] = true;
            }
        }

        // Check Favorites table
        $query = "SELECT 1 FROM Favorites 
                  WHERE user_id = :user_id AND reference_id = :reference_id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':user_id', $userId);
        $stmt->bindParam(':reference_id', $referenceId);
        $stmt->execute();

        if ($stmt->fetch(PDO::FETCH_ASSOC)) {
            $status['favorites'] = true;
        }

        return $status;
    }

    /**
     * Get a user's content list
     */
    public function getUserList($userId, $listType, $contentType, $page = 1, $perPage = 24)
    {
        // Calculate offset for pagination
        $offset = ($page - 1) * $perPage;

        // Initialize return data structure
        $result = [
            'items' => [],
            'pageInfo' => [
                'total' => 0,
                'currentPage' => $page,
                'lastPage' => 1,
                'hasNextPage' => false,
                'perPage' => $perPage
            ]
        ];

        // Different queries based on list type
        if ($listType === 'favorites') {
            // Get favorites count
            $countQuery = "SELECT COUNT(*) as total FROM Favorites f
                          JOIN Content_References cr ON f.reference_id = cr.reference_id
                          WHERE f.user_id = :user_id AND cr.type = :content_type";
            $countStmt = $this->conn->prepare($countQuery);
            $countStmt->bindParam(':user_id', $userId);
            $countStmt->bindParam(':content_type', $contentType);
            $countStmt->execute();
            $totalRow = $countStmt->fetch(PDO::FETCH_ASSOC);
            $total = $totalRow['total'];

            // Get favorites list
            $query = "SELECT cr.tmdb_id, cr.title, cr.year, cr.reference_id 
                     FROM Favorites f
                     JOIN Content_References cr ON f.reference_id = cr.reference_id
                     WHERE f.user_id = :user_id AND cr.type = :content_type
                     ORDER BY f.added_at DESC
                     LIMIT :offset, :limit";
        } else {
            // Map list type to status in User_Content_Status
            $status = ($listType === 'watched') ? 'completed' : 'plan_to_watch';

            // Get count for this status
            $countQuery = "SELECT COUNT(*) as total FROM User_Content_Status ucs
                          JOIN Content_References cr ON ucs.reference_id = cr.reference_id
                          WHERE ucs.user_id = :user_id AND ucs.status = :status AND cr.type = :content_type";
            $countStmt = $this->conn->prepare($countQuery);
            $countStmt->bindParam(':user_id', $userId);
            $countStmt->bindParam(':status', $status);
            $countStmt->bindParam(':content_type', $contentType);
            $countStmt->execute();
            $totalRow = $countStmt->fetch(PDO::FETCH_ASSOC);
            $total = $totalRow['total'];

            // Get list
            $query = "SELECT cr.tmdb_id, cr.title, cr.year, cr.reference_id,
                            ucs.score, ucs.progress, ucs.notes
                     FROM User_Content_Status ucs
                     JOIN Content_References cr ON ucs.reference_id = cr.reference_id
                     WHERE ucs.user_id = :user_id AND ucs.status = :status AND cr.type = :content_type
                     ORDER BY ucs.updated_at DESC
                     LIMIT :offset, :limit";
        }

        // Update pagination info
        $result['pageInfo']['total'] = $total;
        $result['pageInfo']['lastPage'] = max(1, ceil($total / $perPage));
        $result['pageInfo']['hasNextPage'] = $page < $result['pageInfo']['lastPage'];

        // Execute the query to get items
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':user_id', $userId);

        if ($listType !== 'favorites') {
            $stmt->bindParam(':status', $status);
        }

        $stmt->bindParam(':content_type', $contentType);
        $stmt->bindParam(':offset', $offset, PDO::PARAM_INT);
        $stmt->bindParam(':limit', $perPage, PDO::PARAM_INT);
        $stmt->execute();

        // Fetch items
        $dbItems = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Process each item to add additional details using appropriate API
        foreach ($dbItems as $item) {
            $contentDetails = $this->getContentDetails($item['tmdb_id'], $contentType);
            if ($contentDetails) {
                // Merge the database data with the API data
                $result['items'][] = array_merge($contentDetails, [
                    'reference_id' => $item['reference_id'],
                    'score' => $item['score'] ?? null,
                    'progress' => $item['progress'] ?? null,
                    'notes' => $item['notes'] ?? null
                ]);
            }
        }

        return $result;
    }

    /**
     * Add to favorites list
     */
    private function addToFavorites($userId, $referenceId)
    {
        // Check if already in favorites
        $checkQuery = "SELECT 1 FROM Favorites 
                      WHERE user_id = :user_id AND reference_id = :reference_id";
        $checkStmt = $this->conn->prepare($checkQuery);
        $checkStmt->bindParam(':user_id', $userId);
        $checkStmt->bindParam(':reference_id', $referenceId);
        $checkStmt->execute();

        if ($checkStmt->fetch(PDO::FETCH_ASSOC)) {
            // Already in favorites, nothing to do
            return ['reference_id' => $referenceId, 'already_added' => true];
        }

        // Add to favorites
        $query = "INSERT INTO Favorites (user_id, reference_id) 
                 VALUES (:user_id, :reference_id)";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':user_id', $userId);
        $stmt->bindParam(':reference_id', $referenceId);

        if ($stmt->execute()) {
            return ['reference_id' => $referenceId, 'added' => true];
        } else {
            throw new Exception("Failed to add to favorites");
        }
    }

    /**
     * Remove from favorites
     */
    private function removeFromFavorites($userId, $referenceId)
    {
        $query = "DELETE FROM Favorites 
                 WHERE user_id = :user_id AND reference_id = :reference_id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':user_id', $userId);
        $stmt->bindParam(':reference_id', $referenceId);

        if ($stmt->execute()) {
            return ['reference_id' => $referenceId, 'removed' => true];
        } else {
            throw new Exception("Failed to remove from favorites");
        }
    }

    /**
     * Add to user content status (watched or to_watch lists)
     */
    private function addToUserContentStatus($userId, $referenceId, $listType)
    {
        // Map list type to status
        $status = ($listType === 'watched') ? 'completed' : 'plan_to_watch';

        // Check if already has a status
        $checkQuery = "SELECT status FROM User_Content_Status 
                      WHERE user_id = :user_id AND reference_id = :reference_id";
        $checkStmt = $this->conn->prepare($checkQuery);
        $checkStmt->bindParam(':user_id', $userId);
        $checkStmt->bindParam(':reference_id', $referenceId);
        $checkStmt->execute();

        if ($row = $checkStmt->fetch(PDO::FETCH_ASSOC)) {
            // Update existing status
            $query = "UPDATE User_Content_Status 
                     SET status = :status, updated_at = CURRENT_TIMESTAMP
                     WHERE user_id = :user_id AND reference_id = :reference_id";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':status', $status);
            $stmt->bindParam(':user_id', $userId);
            $stmt->bindParam(':reference_id', $referenceId);

            if ($stmt->execute()) {
                return [
                    'reference_id' => $referenceId,
                    'updated' => true,
                    'previous_status' => $row['status'],
                    'new_status' => $status
                ];
            } else {
                throw new Exception("Failed to update status");
            }
        } else {
            // Insert new status
            $query = "INSERT INTO User_Content_Status (user_id, reference_id, status) 
                     VALUES (:user_id, :reference_id, :status)";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':user_id', $userId);
            $stmt->bindParam(':reference_id', $referenceId);
            $stmt->bindParam(':status', $status);

            if ($stmt->execute()) {
                return ['reference_id' => $referenceId, 'added' => true, 'status' => $status];
            } else {
                throw new Exception("Failed to add status");
            }
        }
    }

    /**
     * Remove from user content status
     */
    private function removeFromUserContentStatus($userId, $referenceId, $listType)
    {
        // Map list type to status for checking
        $status = ($listType === 'watched') ? 'completed' : 'plan_to_watch';

        // Check if current status matches what we're trying to remove
        $checkQuery = "SELECT status FROM User_Content_Status 
                      WHERE user_id = :user_id AND reference_id = :reference_id";
        $checkStmt = $this->conn->prepare($checkQuery);
        $checkStmt->bindParam(':user_id', $userId);
        $checkStmt->bindParam(':reference_id', $referenceId);
        $checkStmt->execute();

        if ($row = $checkStmt->fetch(PDO::FETCH_ASSOC)) {
            if ($row['status'] === $status) {
                // Status matches, delete the record
                $query = "DELETE FROM User_Content_Status 
                         WHERE user_id = :user_id AND reference_id = :reference_id";
                $stmt = $this->conn->prepare($query);
                $stmt->bindParam(':user_id', $userId);
                $stmt->bindParam(':reference_id', $referenceId);

                if ($stmt->execute()) {
                    return ['reference_id' => $referenceId, 'removed' => true];
                } else {
                    throw new Exception("Failed to remove status");
                }
            } else {
                // Status doesn't match, nothing to do
                return [
                    'reference_id' => $referenceId,
                    'removed' => false,
                    'message' => 'Content is not in the specified list'
                ];
            }
        } else {
            // No status record found, nothing to do
            return [
                'reference_id' => $referenceId,
                'removed' => false,
                'message' => 'Content is not in any list'
            ];
        }
    }

    /**
     * Ensure content reference exists in our database and return the reference_id
     */
    private function ensureContentReference($contentId, $contentType)
    {
        // First check if reference already exists
        $referenceId = $this->getContentReferenceId($contentId, $contentType);

        if ($referenceId) {
            return $referenceId;
        }

        // If not, create the reference
        // Get content details from appropriate API
        $contentDetails = $this->getContentDetails($contentId, $contentType);

        if (!$contentDetails) {
            throw new Exception("Failed to fetch content details from API");
        }

        // Extract title and release year
        $title = $contentType === 'anime'
            ? ($contentDetails['title']['english'] ?? $contentDetails['title']['romaji'] ?? 'Unknown Anime')
            : ($contentDetails['title'] ?? $contentDetails['name'] ?? 'Unknown Title');

        $year = null;
        if ($contentType === 'anime' && isset($contentDetails['startDate']) && isset($contentDetails['startDate']['year'])) {
            $year = $contentDetails['startDate']['year'];
        } else if (isset($contentDetails['release_date'])) {
            $year = substr($contentDetails['release_date'], 0, 4);
        } else if (isset($contentDetails['first_air_date'])) {
            $year = substr($contentDetails['first_air_date'], 0, 4);
        }

        // Insert into Content_References
        $query = "INSERT INTO Content_References (type, tmdb_id, title, year) 
                 VALUES (:type, :tmdb_id, :title, :year)";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':type', $contentType);
        $stmt->bindParam(':tmdb_id', $contentId);
        $stmt->bindParam(':title', $title);
        $stmt->bindParam(':year', $year);

        if ($stmt->execute()) {
            return $this->conn->lastInsertId();
        } else {
            throw new Exception("Failed to create content reference");
        }
    }

    /**
     * Get reference_id for a content item
     */
    private function getContentReferenceId($contentId, $contentType)
    {
        $query = "SELECT reference_id FROM Content_References 
                 WHERE tmdb_id = :tmdb_id AND type = :type";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':tmdb_id', $contentId);
        $stmt->bindParam(':type', $contentType);
        $stmt->execute();

        if ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            return $row['reference_id'];
        }

        return null;
    }

    /**
     * Get content details from appropriate API
     */
    private function getContentDetails($contentId, $contentType)
    {
        // Based on content type, use the appropriate service
        switch ($contentType) {
            case 'anime':
                return $this->getAnimeDetails($contentId);
            case 'movie':
                return $this->getMovieDetails($contentId);
            case 'series':
                return $this->getSeriesDetails($contentId);
            default:
                throw new Exception("Invalid content type: $contentType");
        }
    }

    /**
     * Get anime details from TMDB API (through our backend)
     */
    private function getAnimeDetails($animeId)
    {
        // Use our own backend API endpoint for anime details
        $baseUrl = APP_URL ?? 'http://localhost'; // Fallback to localhost if APP_URL not defined
        $url = $baseUrl . "/Visualist/backend/api/anime/detail?id=$animeId";

        // Use file_get_contents with error suppression
        $response = @file_get_contents($url);

        if ($response === false) {
            return null;
        }

        return json_decode($response, true);
    }

    /**
     * Get movie details from TMDB API (through our backend)
     */
    private function getMovieDetails($movieId)
    {
        // This would use our backend movie detail API (which we'll need to add later)
        // For now, just call TMDB API directly with our API key
        if (defined('TMDB_API_KEY') && !empty(TMDB_API_KEY)) {
            $url = $this->apiUrl . "/movie/$movieId?api_key=" . TMDB_API_KEY;
            $response = @file_get_contents($url);

            if ($response !== false) {
                return json_decode($response, true);
            }
        }

        // Fallback to basic info if API request fails
        return [
            'id' => $movieId,
            'title' => 'Movie #' . $movieId,
            'type' => 'movie'
        ];
    }

    /**
     * Get series details from TMDB API (through our backend)
     */
    private function getSeriesDetails($seriesId)
    {
        // This would use our backend series detail API (which we'll need to add later)
        // For now, just call TMDB API directly with our API key
        if (defined('TMDB_API_KEY') && !empty(TMDB_API_KEY)) {
            $url = $this->apiUrl . "/tv/$seriesId?api_key=" . TMDB_API_KEY;
            $response = @file_get_contents($url);

            if ($response !== false) {
                return json_decode($response, true);
            }
        }

        // Fallback to basic info if API request fails
        return [
            'id' => $seriesId,
            'name' => 'Series #' . $seriesId,
            'type' => 'series'
        ];
    }
}
