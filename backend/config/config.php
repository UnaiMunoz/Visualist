<?php
// Configuration file with proper environment variables handling

// Define a function to get environment variables with fallbacks (renamed to avoid conflicts)
function getEnvVar($key, $default = null)
{
    // Check in $_ENV first (from .env file)
    if (isset($_ENV[$key])) {
        return $_ENV[$key];
    }

    // Then check in getenv() (from server environment)
    $value = getenv($key);
    if ($value !== false) {
        return $value;
    }

    // Return default if not found
    return $default;
}

// Load environment variables from .env file if it exists
if (file_exists(__DIR__ . '/../.env')) {
    $env_lines = file(__DIR__ . '/../.env', FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($env_lines as $line) {
        // Skip comments
        if (strpos($line, '#') === 0) continue;

        // Check for valid lines with = sign
        if (strpos($line, '=') !== false) {
            list($name, $value) = explode('=', $line, 2);
            $name = trim($name);
            $value = trim($value);

            // Remove quotes if present
            if (preg_match('/^([\'"])(.*)\1$/', $value, $matches)) {
                $value = $matches[2];
            }

            $_ENV[$name] = $value;
            putenv(sprintf("%s=%s", $name, $value));
        }
    }
}

// API Keys with meaningful fallbacks for development
define('TMDB_API_KEY', getEnvVar('TMDB_API_KEY', ''));

// API URLs - these rarely change so hardcoding is acceptable
define('TMDB_API_URL', 'https://api.themoviedb.org/3');

// Database Configuration
define('DB_HOST', getEnvVar('DB_HOST'));
define('DB_NAME', getEnvVar('DB_NAME'));
define('DB_USER', getEnvVar('DB_USER'));
define('DB_PASS', getEnvVar('DB_PASS'));

// Session Configuration with secure defaults
define('SESSION_LIFETIME', (int)getEnvVar('SESSION_LIFETIME', 604800)); // 7 days in seconds
define('SESSION_SECRET', getEnvVar('SESSION_SECRET', bin2hex(random_bytes(32)))); // Generate a random default in dev

// Frontend URL for CORS - critical for security
$frontendUrl = getEnvVar('FRONTEND_URL', 'https://visualist.netlify.app');

// Debug mode
define('DEBUG', getEnvVar('DEBUG', 'false') === 'true');

// Application settings
define('APP_ENV', getEnvVar('APP_ENV', 'production')); // Cambiar a production
define('APP_URL', getEnvVar('APP_URL', 'https://visualist-production.up.railway.app'));

// Set error reporting based on environment
if (APP_ENV === 'production') {
    error_reporting(0);
    ini_set('display_errors', 0);
} else {
    error_reporting(E_ALL);
    ini_set('display_errors', DEBUG ? 1 : 0);
}

// CORS Configuration - ARREGLADO
$allowedOrigins = [
    'https://visualist.netlify.app',
    'http://localhost:5173',
    'http://localhost:3000',
];

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

if (in_array($origin, $allowedOrigins)) {
    header("Access-Control-Allow-Origin: $origin");
} else {
    // Fallback para producción
    header('Access-Control-Allow-Origin: https://visualist.netlify.app');
}

header('Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Access-Control-Allow-Credentials: true');
header('Content-Type: application/json; charset=utf-8');

// Handle preflight OPTIONS requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Session configuration for cross-domain
ini_set('session.cookie_samesite', 'None');
ini_set('session.cookie_secure', '1'); // HTTPS only
ini_set('session.cookie_httponly', '1');
ini_set('session.use_strict_mode', '1');

if (empty(TMDB_API_KEY)) {
    error_log("WARNING: TMDB_API_KEY no está configurada");
    if (APP_ENV === 'production') {
        sendErrorResponse('API key not configured', 500);
    }
}

// Helper function for error responses
function sendErrorResponse($message, $statusCode = 500)
{
    http_response_code($statusCode);
    echo json_encode(['error' => $message, 'success' => false]);
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
]);

// Check for required configuration
if (empty(TMDB_API_KEY) && APP_ENV === 'production') {
    sendErrorResponse('TMDB API key is not configured', 500);
}
