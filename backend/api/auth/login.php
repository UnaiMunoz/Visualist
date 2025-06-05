<?php
// Headers - ponlos al principio
header('Access-Control-Allow-Origin: https://visualist.netlify.app');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Content-Type: application/json');

// Manejar preflight OPTIONS (petición previa del navegador)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Check if remember me is set in the request data
$data = json_decode(file_get_contents("php://input"));
$remember = isset($data->remember) && $data->remember === true;

// Set session cookie params BEFORE session_start
if ($remember) {
    $oneWeek = 7 * 24 * 60 * 60; // 7 días en segundos
    session_set_cookie_params($oneWeek);
} else {
    session_set_cookie_params(0);
}

session_start();
// Include user model
require_once __DIR__ . '/../../includes/User.php';

// Instantiate user object
$user = new User();

// Get posted data
$data = json_decode(file_get_contents("php://input"));

// Check if data is not empty
if (!empty($data->email) && !empty($data->password)) {
    // Set user properties
    $user->email = $data->email;
    $user->password = $data->password;

    // Attempt to login
    if ($user->login()) {
        // Login successful
        $_SESSION['user_id'] = $user->user_id;
        $_SESSION['user_name'] = $user->name;
        $_SESSION['user_email'] = $user->email;

        // Regenerate session ID for security
        session_regenerate_id();

        // Store session expiration timestamp
        if ($remember) {
            $_SESSION['expires'] = time() + $oneWeek;
        }

        // Return success response
        http_response_code(200);
        echo json_encode([
            "success" => true,
            "message" => "Login successful",
            "user" => [
                "id" => $user->user_id,
                "name" => $user->name,
                "email" => $user->email,
                "short_bio" => $user->short_bio,
                "created_at" => $user->created_at
            ]
        ]);
    } else {
        http_response_code(401);
        echo json_encode(["success" => false, "message" => "Invalid email or password"]);
    }
} else {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Unable to login. Email or password missing."]);
}
