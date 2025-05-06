<?php
// Configuration file

// API Keys
define('TMDB_API_KEY', 'tmdb_api_key_here');

// API URLs
define('ANILIST_API_URL', 'https://graphql.anilist.co');
define('TMDB_API_URL', 'https://api.themoviedb.org/3');

// Database Configuration
define('DB_HOST', 'localhost');
define('DB_NAME', 'Visualist');
define('DB_USER', 'root'); // Change to your database username
define('DB_PASS', '');     // Change to your database password

// Session Configuration
define('SESSION_LIFETIME', 604800); // 7 days in seconds

// Headers
header('Content-Type: application/json');

// CORS headers - Allow specific frontend origin
header('Access-Control-Allow-Origin: http://localhost:5173'); // Your frontend specific origin
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Access-Control-Allow-Credentials: true'); // Important for cookies/sessions

// Handle OPTIONS requests for CORS preflight
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    header("HTTP/1.1 200 OK");
    exit;
}

// Helper function for error responses
function sendErrorResponse($message, $statusCode = 500)
{
    http_response_code($statusCode);
    echo json_encode(['error' => $message]);
    exit;
}

// Helper function for success responses
function sendSuccessResponse($data, $statusCode = 200)
{
    http_response_code($statusCode);
    echo json_encode(['success' => true, 'data' => $data]);
    exit;
}
