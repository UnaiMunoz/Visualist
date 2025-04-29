<?php

/**
 * API endpoint: /api/anime
 * Get paginated list of anime
 */

// Include required files
require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../includes/AnimeService.php';

// Set response content type
header('Content-Type: application/json');

try {
    // Get pagination parameters
    $page = isset($_GET['page']) ? intval($_GET['page']) : 1;
    $perPage = isset($_GET['perPage']) ? intval($_GET['perPage']) : 24;

    // Get anime list
    $animeService = new AnimeService();
    $data = $animeService->getAnimeList($page, $perPage);

    // Return results
    echo json_encode($data);
} catch (Exception $e) {
    sendErrorResponse($e->getMessage());
}
