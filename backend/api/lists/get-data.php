<?php
// backend/api/lists/get-data.php
// This endpoint gets additional data (score, progress, time_watched, notes) for content

// Include configuration first - handles all CORS headers
require_once __DIR__ . '/../../config/config.php';

// Set content type to JSON first
header('Content-Type: application/json');

// Error handling
try {
    // Include required files in the correct order
    require_once __DIR__ . '/../../includes/Database.php';
    require_once __DIR__ . '/../../includes/ListManager.php';

    // Start session for authentication
    session_start();

    // Check if user is logged in
    if (!isset($_SESSION['user_id'])) {
        http_response_code(200);
        echo json_encode([
            'success' => true,
            'data' => [
                'score' => 0,
                'progress' => 0,
                'time_watched' => 0,
                'notes' => ''
            ]
        ]);
        exit;
    }

    // Get content ID from query parameters
    $contentId = isset($_GET['contentId']) ? intval($_GET['contentId']) : 0;
    $contentType = isset($_GET['contentType']) ? $_GET['contentType'] : 'movie';

    if (!$contentId) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'Content ID is required'
        ]);
        exit;
    }

    // Validate content type
    $validContentTypes = ['movie', 'series'];
    if (!in_array($contentType, $validContentTypes)) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'Invalid content type. Must be one of: ' . implode(', ', $validContentTypes)
        ]);
        exit;
    }

    // Get user ID from session
    $userId = $_SESSION['user_id'];

    // Create ListManager instance
    $listManager = new ListManager();

    // Get content data
    $contentData = $listManager->getContentData($userId, $contentId, $contentType);

    echo json_encode([
        'success' => true,
        'data' => $contentData
    ]);
} catch (Exception $e) {
    // Log the error for debugging
    error_log("Error in get-data.php: " . $e->getMessage());
    error_log("Stack trace: " . $e->getTraceAsString());

    // Return error as JSON instead of showing PHP error
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Server error: ' . $e->getMessage(),
        'debug' => APP_ENV !== 'production' ? [
            'file' => $e->getFile(),
            'line' => $e->getLine(),
            'trace' => $e->getTraceAsString()
        ] : null
    ]);
}
