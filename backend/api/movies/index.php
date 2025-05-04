<?php

/**
 * API endpoint: /api/movies
 * Get paginated list of movies
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

    // Get movies list
    $tmdbService = new TMDBService();
    $data = $tmdbService->getPopularMovies($page, $perPage);

    // Return results (format is already correct from service)
    echo json_encode($data);
} catch (Exception $e) {
    sendErrorResponse($e->getMessage());
}