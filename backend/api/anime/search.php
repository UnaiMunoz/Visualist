<?php

/**
 * API endpoint: /api/anime/search
 * Search for anime
 */

// Include required files
require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../includes/TMDBAnimeService.php';

// Set response content type
header('Content-Type: application/json');

try {
    // Get search parameters
    $searchTerm = isset($_GET['searchTerm']) ? $_GET['searchTerm'] : '';
    $page = isset($_GET['page']) ? intval($_GET['page']) : 1;
    $perPage = isset($_GET['perPage']) ? intval($_GET['perPage']) : 24;

    // Validate search term
    if (empty($searchTerm)) {
        sendErrorResponse('Search term is required', 400);
    }

    // Search for anime
    $animeService = new TMDBAnimeService();
    $data = $animeService->searchAnime($searchTerm, $page, $perPage);

    // Return results
    echo json_encode($data);
} catch (Exception $e) {
    sendErrorResponse($e->getMessage());
}
