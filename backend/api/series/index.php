<?php

/**
 * API endpoint: /api/series
 * Get paginated list of TV series
 */

// Include required files
require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../includes/TMDBService.php';

// Set response content type
header('Content-Type: application/json');

try {
    // Get pagination parameters
    $page = isset($_GET['page']) ? intval($_GET['page']) : 1;
    $perPage = isset($_GET['perPage']) ? intval($_GET['perPage']) : 24;

    // Get series list
    $tmdbService = new TMDBService();
    $data = $tmdbService->getPopularSeries($page, $perPage);

    // Return results (format is already correct from service)
    echo json_encode($data);
} catch (Exception $e) {
    sendErrorResponse($e->getMessage());
}