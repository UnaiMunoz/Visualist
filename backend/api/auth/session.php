<?php
// Start session
session_start();

// Headers
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Access-Control-Allow-Headers, Content-Type, Access-Control-Allow-Methods, Authorization, X-Requested-With');
header('Access-Control-Allow-Credentials: true');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Include user model to get additional user data
require_once __DIR__ . '/../../includes/User.php';

// Check if user is logged in and session is valid
if (
    isset($_SESSION['user_id']) &&
    (!isset($_SESSION['expires']) || time() < $_SESSION['expires'])
) {
    // Session is valid
    // Extend session if more than halfway through its lifetime and "remember me" was checked
    if (isset($_SESSION['expires'])) {
        $timeLeft = $_SESSION['expires'] - time();
        $original_lifetime = defined('SESSION_LIFETIME'); // Use the constant or fallback

        if ($timeLeft < ($original_lifetime / 2)) {
            // Extend the session
            $_SESSION['expires'] = time() + $original_lifetime;
        }
    }

    // Update last activity timestamp
    $_SESSION['last_activity'] = time();

    // Obtener información adicional del usuario desde la base de datos
    $user = new User();
    $user->user_id = $_SESSION['user_id'];
    $user->getUserById(); // Obtener datos completos del usuario

    // Return user info including short_bio
    http_response_code(200);
    echo json_encode([
        'logged_in' => true,
        'user' => [
            'id' => $_SESSION['user_id'],
            'name' => $_SESSION['user_name'],
            'email' => $_SESSION['user_email'],
            'short_bio' => $user->short_bio,
            "created_at" => $user->created_at 
        ]
    ]);
} else {
    // Session is invalid or expired
    // Destroy any existing session
    if (isset($_SESSION['user_id'])) {
        // Session is expired, clean it up
        session_unset();
        session_destroy();
    }

    // Return not logged in status
    http_response_code(200);
    echo json_encode([
        'logged_in' => false,
        'message' => 'Session expired or not logged in'
    ]);
}
