<?php
require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../includes/ListManager.php';
require_once __DIR__ . '/../../includes/Database.php';

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
if (!isset($data['contentId']) || !isset($data['contentType'])) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Missing required parameters (contentId, contentType)'
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
$contentType = $data['contentType'];

// Prepare additional data - ACTUALIZADO para incluir time_watched
$additionalData = [
    'score' => isset($data['score']) ? (float)$data['score'] : null,
    'progress' => isset($data['progress']) ? (int)$data['progress'] : null,
    'time_watched' => isset($data['time_watched']) ? (int)$data['time_watched'] : null, // AÑADIDO
    'notes' => isset($data['notes']) ? $data['notes'] : null
];

// Create ListManager instance
$listManager = new ListManager();

try {
    // Update the additional data
    $result = $listManager->updateContentData($userId, $contentId, $contentType, $additionalData);

    echo json_encode([
        'success' => true,
        'message' => 'Content data updated successfully',
        'data' => $result
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
