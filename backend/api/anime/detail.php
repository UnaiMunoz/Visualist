<?php

/**
 * API endpoint: /api/anime/detail
 * Get anime details by ID
 */

// Include required files
require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../includes/TMDBAnimeService.php';

// Set response content type
header('Content-Type: application/json');

try {
    // Get ID parameter
    $id = isset($_GET['id']) ? intval($_GET['id']) : 0;

    // Validate ID
    if (empty($id)) {
        sendErrorResponse('Anime ID is required', 400);
    }

    // Get anime details
    $animeService = new TMDBAnimeService();
    $data = $animeService->getAnimeDetails($id);

    // Return results
    echo json_encode($data);
} catch (Exception $e) {
    sendErrorResponse($e->getMessage());
}
