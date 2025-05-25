<?php

/**
 * API endpoint: /api/series/detail
 * Get TV series details by ID
 */

// Include required files
require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../includes/TMDBService.php';

// Set response content type
header('Content-Type: application/json');

try {
    // Get ID parameter
    $id = isset($_GET['id']) ? intval($_GET['id']) : 0;

    // Validate ID
    if (empty($id)) {
        sendErrorResponse('Series ID is required', 400);
    }

    // Get series details
    $tmdbService = new TMDBService();
    $data = $tmdbService->getSeriesDetails($id);

    // Return results
    echo json_encode($data);
} catch (Exception $e) {
    sendErrorResponse($e->getMessage());
}
