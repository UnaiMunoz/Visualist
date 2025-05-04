<?php

/**
 * API endpoint: /api/series/search
 * Search for TV series
 */

// Include required files
require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../includes/TMDBService.php';

// Set response content type
header('Content-Type: application/json');

try {
    // Get search parameters
    $query = isset($_GET['query']) ? $_GET['query'] : '';
    $page = isset($_GET['page']) ? intval($_GET['page']) : 1;
    $perPage = isset($_GET['perPage']) ? intval($_GET['perPage']) : 24;

    // Validate search term
    if (empty($query)) {
        sendErrorResponse('Search query is required', 400);
    }

    // Search for series
    $tmdbService = new TMDBService();
    $data = $tmdbService->searchSeries($query, $page, $perPage);

    // Return results
    echo json_encode($data);
} catch (Exception $e) {
    sendErrorResponse($e->getMessage());
}