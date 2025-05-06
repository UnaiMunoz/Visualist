<?php
// Include configuration
require_once __DIR__ . '/config/config.php';

// Enable debugging
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Parse the request URI
$requestUri = $_SERVER['REQUEST_URI'];
$basePath = '/visualist/backend/api'; // Adjust this to match your base path

// Check if the request is for the API
if (strpos($requestUri, $basePath) === 0) {
    // Remove the base path from the request URI
    $path = substr($requestUri, strlen($basePath));
    $path = trim($path, '/');

    // Split the path into segments
    $segments = explode('/', $path);

    // Extract the resource type (anime, movies, series, auth)
    $resourceType = isset($segments[0]) ? $segments[0] : '';

    // Extract the action (top, search, register, login, etc.)
    $action = isset($segments[1]) ? $segments[1] : '';

    // Construct the file path based on the resource type and action
    $filePath = '';

    if (!empty($resourceType)) {
        if (!empty($action)) {
            // Example: /api/anime/top -> /api/anime/top.php
            // Example: /api/auth/login -> /api/auth/login.php
            $filePath = __DIR__ . "/api/{$resourceType}/{$action}.php";
        } else {
            // Example: /api/anime -> /api/anime/index.php
            $filePath = __DIR__ . "/api/{$resourceType}/index.php";
        }
    }

    // Check if the file exists and include it
    if (!empty($filePath) && file_exists($filePath)) {
        include_once $filePath;
    } else {
        http_response_code(404);
        echo json_encode([
            'error' => 'Endpoint not found',
            'path' => $path,
            'filePath' => $filePath
        ]);
    }
} else {
    // Invalid API request
    http_response_code(400);
    echo json_encode([
        'error' => 'Invalid API request',
        'requestUri' => $requestUri,
        'basePath' => $basePath,
        'position' => strpos($requestUri, $basePath)
    ]);
}
