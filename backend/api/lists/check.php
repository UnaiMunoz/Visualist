<?php
// backend/api/lists/check.php
// This endpoint checks if an anime is in a user's lists

// Include required files
require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../includes/ListManager.php';

// Set response content type
header('Content-Type: application/json');

// Start session for authentication
session_start();

// Check if user is logged in
if (!isset($_SESSION['user_id'])) {
    http_response_code(200); // Still return 200 but with empty lists
    echo json_encode([
        'success' => true,
        'inLists' => [
            'watched' => false,
            'to_watch' => false,
            'favorites' => false
        ]
    ]);
    exit;
}

// Get content ID from query parameters
$contentId = isset($_GET['contentId']) ? intval($_GET['contentId']) : 0;
$contentType = isset($_GET['contentType']) ? $_GET['contentType'] : 'anime';

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

try {
    // Check if content is in user's lists
    $lists = $listManager->checkListStatus($userId, $contentId, $contentType);

    echo json_encode([
        'success' => true,
        'inLists' => $lists
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
