<?php
// Include configuration
require_once __DIR__ . '/config/config.php';

// Habilitar depuración
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Parse the request URI
$requestUri = $_SERVER['REQUEST_URI'];
$basePath = '/visualist/backend/api'; // Cambia esto para que coincida con tu ruta base

// Debugging
// echo json_encode(['requestUri' => $requestUri, 'basePath' => $basePath]); exit;

// Check if the request is for the API
if (strpos($requestUri, $basePath) === 0) {
    // Remove the base path from the request URI
    $path = substr($requestUri, strlen($basePath));
    $path = trim($path, '/');

    // Split the path into segments
    $segments = explode('/', $path);

    // Extract the resource type (anime, movies, series)
    $resourceType = isset($segments[0]) ? $segments[0] : '';

    // Extract the action (top, search, etc.)
    $action = isset($segments[1]) ? $segments[1] : '';

    // Rest of your code...
} else {
    // Debug output
    echo json_encode([
        'error' => 'Invalid API request',
        'requestUri' => $requestUri,
        'basePath' => $basePath,
        'position' => strpos($requestUri, $basePath)
    ]);
    exit;
}
