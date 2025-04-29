<?php

/**
 * API endpoint: /api/series/top
 * Get top rated TV series
 */

// Include required files
require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../includes/TMDBService.php';

// Set response content type
header('Content-Type: application/json');

try {
    // Get limit parameter (default: 10)
    $limit = isset($_GET['limit']) ? intval($_GET['limit']) : 10;

    // Get top series
    $tmdbService = new TMDBService();
    $data = $tmdbService->getTopSeries($limit);

    // Return results
    echo json_encode($data);
} catch (Exception $e) {
    sendErrorResponse($e->getMessage());
}
