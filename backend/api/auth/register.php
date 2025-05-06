<?php
// Headers
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Access-Control-Allow-Headers, Content-Type, Access-Control-Allow-Methods, Authorization, X-Requested-With');
header('Access-Control-Allow-Credentials: true');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Include database connection
require_once '../../includes/Database.php';
require_once '../../includes/User.php';

// Check if the request method is POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405); // Method Not Allowed
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

// Get raw posted data
$data = json_decode(file_get_contents('php://input'));

// Validate input data
if (!isset($data->name) || !isset($data->email) || !isset($data->password)) {
    http_response_code(400); // Bad Request
    echo json_encode(['success' => false, 'message' => 'Missing required fields']);
    exit;
}

// Sanitize input
$name = htmlspecialchars(strip_tags($data->name));
$email = filter_var($data->email, FILTER_SANITIZE_EMAIL);
$password = $data->password; // Will be hashed later

// Validate email
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid email format']);
    exit;
}

// Validate password length
if (strlen($password) < 6) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Password must be at least 6 characters']);
    exit;
}

// Create user instance
$user = new User();
$user->name = $name;
$user->email = $email;
$user->password = $password;

// Try to register the user
if ($user->register()) {
    http_response_code(201); // Created
    echo json_encode([
        'success' => true,
        'message' => 'User registered successfully'
    ]);
} else {
    http_response_code(400); // Bad Request
    echo json_encode([
        'success' => false,
        'message' => 'Email already exists or registration failed'
    ]);
}
