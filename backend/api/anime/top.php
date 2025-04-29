<?php

/**
 * API endpoint: /api/anime/top
 * Get top rated anime
 */

// Include required files
require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../includes/AnimeService.php';

// Set response content type
header('Content-Type: application/json');

try {
    // Get limit parameter (default: 10)
    $limit = isset($_GET['limit']) ? intval($_GET['limit']) : 10;

    // Get top anime
    $animeService = new AnimeService();
    $data = $animeService->getTopAnime($limit);

    // Return results
    echo json_encode($data);
} catch (Exception $e) {
    sendErrorResponse($e->getMessage());
}
