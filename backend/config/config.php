<?php
// Configuration file

// Load environment variables from .env file
if (file_exists(__DIR__ . '/../.env')) {
    $env_lines = file(__DIR__ . '/../.env', FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($env_lines as $line) {
        if (strpos($line, '#') === 0) continue; // Skip comments
        list($name, $value) = explode('=', $line, 2);
        $_ENV[trim($name)] = trim($value);
        putenv(sprintf("%s=%s", trim($name), trim($value)));
    }
}

// API Keys
define('TMDB_API_KEY', getenv('TMDB_API_KEY') ?: 'fb424b3e81ac48e070f8fa508b829271');

// API URLs
define('ANILIST_API_URL', 'https://graphql.anilist.co');
define('TMDB_API_URL', 'https://api.themoviedb.org/3');

// Database Configuration
define('DB_HOST', getenv('DB_HOST') ?: 'localhost');
define('DB_NAME', getenv('DB_NAME') ?: 'Visualist');
define('DB_USER', getenv('DB_USER') ?: 'root');
define('DB_PASS', getenv('DB_PASS') ?: '');

// Session Configuration
define('SESSION_LIFETIME', getenv('SESSION_LIFETIME') ?: 604800); // 7 days in seconds
define('SESSION_SECRET', getenv('SESSION_SECRET') ?: 'your_default_session_secret');

// Frontend URL for CORS
$frontendUrl = getenv('FRONTEND_URL') ?: 'http://localhost:5173';

// Headers
header('Content-Type: application/json');

// CORS headers - Allow specific frontend origin
header('Access-Control-Allow-Origin: ' . $frontendUrl);
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Access-Control-Allow-Credentials: true');

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
