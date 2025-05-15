<?php
// Start session
session_start();

// Headers
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Access-Control-Allow-Headers, Content-Type, Access-Control-Allow-Methods, Authorization, X-Requested-With');
header('Access-Control-Allow-Credentials: true');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Check if user is logged in and session is valid
if (
    isset($_SESSION['user_id']) &&
    (!isset($_SESSION['expires']) || time() < $_SESSION['expires'])
) {
    // Session is valid
    // Extend session if more than halfway through its lifetime and "remember me" was checked
    if (isset($_SESSION['expires'])) {
        $timeLeft = $_SESSION['expires'] - time();
        $original_lifetime = SESSION_LIFETIME; // Use the constant instead of hardcoded value

        if ($timeLeft < ($original_lifetime / 2)) {
            // Extend the session
            $_SESSION['expires'] = time() + $original_lifetime;
        }
    }

    // Update last activity timestamp
    $_SESSION['last_activity'] = time();

    // Return user info
    http_response_code(200);
    echo json_encode([
        'logged_in' => true,
        'user' => [
            'id' => $_SESSION['user_id'],
            'name' => $_SESSION['user_name'],
            'email' => $_SESSION['user_email']
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
