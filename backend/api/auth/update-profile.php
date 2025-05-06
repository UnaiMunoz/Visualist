<?php
// Start session
session_start();

// Headers
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Access-Control-Allow-Headers, Content-Type, Access-Control-Allow-Methods, Authorization, X-Requested-With');
header('Access-Control-Allow-Credentials: true');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Include database connection
require_once __DIR__ . '/../../includes/Database.php';
require_once __DIR__ . '/../../includes/User.php';

// Check if user is logged in
if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

// Check if the request method is POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405); // Method Not Allowed
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

// Get raw posted data
$data = json_decode(file_get_contents('php://input'));

// Validate required data
if (!isset($data->name)) {
    http_response_code(400); // Bad Request
    echo json_encode(['success' => false, 'message' => 'Name is required']);
    exit;
}

// Instantiate User object
$user = new User();
$user->user_id = $_SESSION['user_id'];

// Handle password update if provided
$passwordUpdate = false;
if (isset($data->currentPassword) && isset($data->newPassword) && !empty($data->currentPassword) && !empty($data->newPassword)) {
    // Verify current password
    if (!$user->verifyPassword($data->currentPassword)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Current password is incorrect']);
        exit;
    }

    // Validate new password
    if (strlen($data->newPassword) < 6) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'New password must be at least 6 characters']);
        exit;
    }

    $user->password = $data->newPassword;
    $passwordUpdate = true;
}

// Set user properties
$user->name = htmlspecialchars(strip_tags($data->name));
$user->short_bio = isset($data->bio) ? htmlspecialchars(strip_tags($data->bio)) : null;

// Update profile
if ($user->updateProfile($passwordUpdate)) {
    // Update session data
    $_SESSION['user_name'] = $user->name;

    // Return user data
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'message' => 'Profile updated successfully',
        'user' => [
            'id' => $user->user_id,
            'name' => $user->name,
            'email' => $user->email,
            'short_bio' => $user->short_bio
        ]
    ]);
} else {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Failed to update profile']);
}
