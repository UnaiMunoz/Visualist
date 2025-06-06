<?php
// backend/api/lists/update-data.php
// This endpoint updates additional data (score, progress, time_watched, notes) for content

// Include configuration first - handles all CORS headers
require_once __DIR__ . '/../../config/config.php';

// Set response content type
header('Content-Type: application/json');

// Error handling
try {
    // Include required files
    require_once __DIR__ . '/../../includes/Database.php';
    require_once __DIR__ . '/../../includes/ListManager.php';

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

    // Prepare additional data - including time_watched
    $additionalData = [
        'score' => isset($data['score']) ? (float)$data['score'] : null,
        'progress' => isset($data['progress']) ? (int)$data['progress'] : null,
        'time_watched' => isset($data['time_watched']) ? (int)$data['time_watched'] : null,
        'notes' => isset($data['notes']) ? $data['notes'] : null
    ];

    // Create ListManager instance
    $listManager = new ListManager();

    // Update the additional data
    $result = $listManager->updateContentData($userId, $contentId, $contentType, $additionalData);

    echo json_encode([
        'success' => true,
        'message' => 'Content data updated successfully',
        'data' => $result
    ]);
} catch (Exception $e) {
    // Log the error for debugging
    error_log("Error in update-data.php: " . $e->getMessage());
    error_log("Stack trace: " . $e->getTraceAsString());

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
