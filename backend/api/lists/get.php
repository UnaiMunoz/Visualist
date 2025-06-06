<?php
// backend/api/lists/get.php
// This endpoint retrieves a user's content list by type

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
        'message' => 'You must be logged in to view your lists'
    ]);
    exit;
}

// Get list type from query parameters
$listType = isset($_GET['listType']) ? $_GET['listType'] : 'watched';
$contentType = isset($_GET['contentType']) ? $_GET['contentType'] : 'movie';
$page = isset($_GET['page']) ? intval($_GET['page']) : 1;
$perPage = isset($_GET['perPage']) ? intval($_GET['perPage']) : 24;

// Validate list type - ACTUALIZADO para incluir 'watching'
$validListTypes = ['watched', 'watching', 'to_watch', 'favorites'];
if (!in_array($listType, $validListTypes)) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Invalid list type. Must be one of: ' . implode(', ', $validListTypes)
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

try {
    // Get the content list
    $result = $listManager->getUserList($userId, $listType, $contentType, $page, $perPage);

    echo json_encode([
        'success' => true,
        'items' => $result['items'],
        'pageInfo' => $result['pageInfo']
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
