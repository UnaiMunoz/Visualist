<?php
// Configuration file with updated settings for TMDB

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

// TMDB API configuration details
define('TMDB_IMAGE_BASE_URL', 'https://image.tmdb.org/t/p/');
define('TMDB_POSTER_SIZE', 'w500');
define('TMDB_BACKDROP_SIZE', 'original');
define('TMDB_PROFILE_SIZE', 'w185');

// Genre mapping for unified display across content types
define('GENRE_MAP', [
    // TMDB Movie & TV genres
    28 => 'Action',
    12 => 'Adventure',
    16 => 'Animation',
    35 => 'Comedy',
    80 => 'Crime',
    99 => 'Documentary',
    18 => 'Drama',
    10751 => 'Family',
    14 => 'Fantasy',
    36 => 'History',
    27 => 'Horror',
    10402 => 'Music',
    9648 => 'Mystery',
    10749 => 'Romance',
    878 => 'Science Fiction',
    10770 => 'TV Movie',
    53 => 'Thriller',
    10752 => 'War',
    37 => 'Western',

    // TV specific genres
    10759 => 'Action & Adventure',
    10762 => 'Kids',
    10763 => 'News',
    10764 => 'Reality',
    10765 => 'Sci-Fi & Fantasy',
    10766 => 'Soap',
    10767 => 'Talk',
    10768 => 'War & Politics',

    // Added Anime as a custom genre
    9999 => 'Anime'
]);

// Helper function to detect if a show is likely anime
function isAnime($show)
{
    // Check for Animation genre (ID: 16)
    $hasAnimationGenre = false;
    foreach ($show['genres'] ?? [] as $genre) {
        if ($genre['id'] == 16) {
            $hasAnimationGenre = true;
            break;
        }
    }

    // Check if it's from Japan
    $isJapanese = in_array('JP', $show['origin_country'] ?? []);

    // If origin country is empty, check original language
    if (empty($show['origin_country']) && isset($show['original_language'])) {
        $isJapanese = $show['original_language'] === 'ja';
    }

    // Consider it anime if it has animation genre and is Japanese
    return $hasAnimationGenre && $isJapanese;
}
