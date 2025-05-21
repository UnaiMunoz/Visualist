<?php
// backend/api/lists/add.php
// This endpoint adds an anime to a user's list (watched, to_watch, or favorites)

// Include required files
require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../includes/ListManager.php';

// Set response content type
header('Content-Type: application/json');

// Start session for authentication
session_start();

// Check if user is logged in
if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode([
        'success' => false,
        'message' => 'You must be logged in to perform this action'
    ]);
    exit;
}

// Get the request body
$data = json_decode(file_get_contents("php://input"), true);

// Validate required fields
if (!isset($data['contentId']) || !isset($data['contentType']) || !isset($data['listType'])) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Missing required parameters (contentId, contentType, listType)'
    ]);
    exit;
}

// Get user ID from session
$userId = $_SESSION['user_id'];
$contentId = intval($data['contentId']);
$contentType = $data['contentType']; // Should be 'anime', 'movie', or 'series'
$listType = $data['listType']; // Should be 'watched', 'to_watch', or 'favorites'

// Create ListManager instance
$listManager = new ListManager();

try {
    // Add the content to the list
    $result = $listManager->addToList($userId, $contentId, $contentType, $listType);

    echo json_encode([
        'success' => true,
        'message' => 'Added to ' . ucfirst($listType) . ' list successfully',
        'data' => $result
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
