<?php
// Include configuration
require_once __DIR__ . '/config/config.php';

// Enable debugging for development
if (APP_ENV !== 'production') {
    ini_set('display_errors', 1);
    ini_set('display_startup_errors', 1);
    error_reporting(E_ALL);
}

// Parse the request URI
$requestUri = $_SERVER['REQUEST_URI'];
$basePath = '/api'; // Adjust this to your correct base path

// Check if the request is for the API
if (strpos($requestUri, $basePath) === 0) {
    // Remove the base path from the request URI
    $path = substr($requestUri, strlen($basePath));

    // Remove query parameters if they exist
    $queryPos = strpos($path, '?');
    if ($queryPos !== false) {
        $path = substr($path, 0, $queryPos);
    }

    $path = trim($path, '/');

    // Split the path into segments
    $segments = explode('/', $path);

    // Extract the resource type (movies, series, auth, lists)
    $resourceType = isset($segments[0]) ? $segments[0] : '';

    // Extract the action (top, search, register, login, etc.)
    $action = isset($segments[1]) ? $segments[1] : '';

    // Construct the file path based on the resource type and action
    $filePath = '';

    if (!empty($resourceType)) {
        if (!empty($action)) {
            // Handle files with hyphens in their names
            // Convert hyphens to underscores for file lookup, but keep original for directory structure
            $actionFile = $action;
            
            // Special handling for common hyphenated endpoints
            $hyphenatedEndpoints = [
                'get-data' => 'get-data.php',
                'update-data' => 'update-data.php',
                'update-profile' => 'update-profile.php'
            ];
            
            if (isset($hyphenatedEndpoints[$action])) {
                $actionFile = $hyphenatedEndpoints[$action];
            } else {
                $actionFile = $action . '.php';
            }
            
            // Example: /api/lists/get-data -> /api/lists/get-data.php
            $filePath = __DIR__ . "/api/{$resourceType}/{$actionFile}";
        } else {
            // Example: /api/series -> /api/series/index.php
            $filePath = __DIR__ . "/api/{$resourceType}/index.php";
        }
    }

    // Debug logging for development
    if (APP_ENV !== 'production') {
        error_log("API Route Debug:");
        error_log("Original URI: " . $requestUri);
        error_log("Path: " . $path);
        error_log("Resource Type: " . $resourceType);
        error_log("Action: " . $action);
        error_log("File Path: " . $filePath);
        error_log("File Exists: " . (file_exists($filePath) ? 'YES' : 'NO'));
    }

    // Check if the file exists and include it
    if (!empty($filePath) && file_exists($filePath)) {
        include_once $filePath;
    } else {
        http_response_code(404);
        echo json_encode([
            'error' => 'Endpoint not found',
            'path' => $path,
            'resource' => $resourceType,
            'action' => $action,
            'attempted_file' => $filePath ?? 'none',
            'debug' => APP_ENV !== 'production' ? [
                'segments' => $segments,
                'file_exists' => file_exists($filePath ?? ''),
                'available_files' => $resourceType ? glob(__DIR__ . "/api/{$resourceType}/*.php") : []
            ] : null
        ]);
    }
} else {
    // Invalid API request
    http_response_code(400);
    echo json_encode([
        'error' => 'Invalid API request',
        'message' => 'Request must start with /api',
        'requestUri' => $requestUri,
        'basePath' => $basePath
    ]);
}