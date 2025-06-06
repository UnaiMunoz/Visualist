<?php
// backend/api/lists/check.php
// This endpoint checks if content is in a user's lists

// Set content type to JSON first
header('Content-Type: application/json');

// Error handling
try {
    // Include required files
    require_once __DIR__ . '/../../config/config.php';
    require_once __DIR__ . '/../../includes/Database.php'; // Make sure Database.php is included first
    require_once __DIR__ . '/../../includes/ListManager.php';

    // Start session for authentication
    session_start();

    // Check if user is logged in
    if (!isset($_SESSION['user_id'])) {
        http_response_code(200); // Still return 200 but with empty lists
        echo json_encode([
            'success' => true,
            'inLists' => [
                'watched' => false,
                'watching' => false, // AÑADIDO
                'to_watch' => false,
                'favorites' => false
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

    // Check if content is in user's lists
    $lists = $listManager->checkListStatus($userId, $contentId, $contentType);

    echo json_encode([
        'success' => true,
        'inLists' => $lists
    ]);
} catch (Exception $e) {
    // Return error as JSON instead of showing PHP error
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Server error: ' . $e->getMessage()
    ]);
}
