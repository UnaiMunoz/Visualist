<?php
// Configuration file

// API Keys
define('TMDB_API_KEY', 'your_tmdb_api_key_here');

// API URLs
define('ANILIST_API_URL', 'https://graphql.anilist.co');
define('TMDB_API_URL', 'https://api.themoviedb.org/3');

// Headers
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:5173'); // Ajusta al puerto correcto
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Helper function for error responses
function sendErrorResponse($message, $statusCode = 500)
{
    http_response_code($statusCode);
    echo json_encode(['error' => $message]);
    exit;
}
