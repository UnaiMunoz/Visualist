<?php
// Include configuration first - handles all CORS headers
require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../includes/ListManager.php';
require_once __DIR__ . '/../../includes/Database.php';

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

// Validate list type - ACTUALIZADO para incluir 'watching'
$validListTypes = ['watched', 'watching', 'to_watch', 'favorites'];
if (!in_array($data['listType'], $validListTypes)) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Invalid list type. Must be one of: ' . implode(', ', $validListTypes)
    ]);
    exit;
}

// Validate content type
$validContentTypes = ['movie', 'series'];
if (!in_array($data['contentType'], $validContentTypes)) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Invalid content type. Must be one of: ' . implode(', ', $validContentTypes)
    ]);
    exit;
}

// Get user ID from session
$userId = $_SESSION['user_id'];
$contentId = intval($data['contentId']);
$contentType = $data['contentType']; // Should be 'movie', or 'series'
$listType = $data['listType']; // Should be 'watched', 'watching', 'to_watch', or 'favorites'

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
