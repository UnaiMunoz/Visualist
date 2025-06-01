<?php
// backend/api/lists/get-data.php
// This endpoint gets additional data (score, progress, notes) for content

// Set content type to JSON first
header('Content-Type: application/json');

// Error handling
try {
    // Include required files
    require_once __DIR__ . '/../../config/config.php';
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
    // Return error as JSON instead of showing PHP error
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Server error: ' . $e->getMessage()
    ]);
}
