<?php
// Start session
session_start();

// Headers
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Access-Control-Allow-Headers, Content-Type, Access-Control-Allow-Methods, Authorization, X-Requested-With');

// Include database and user model
require_once '../../includes/User.php';

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
        // Set session variables
        $_SESSION['user_id'] = $user->user_id;
        $_SESSION['user_name'] = $user->name;
        $_SESSION['user_email'] = $user->email;

        // Set session to expire in 1 week (7 days)
        $oneWeek = 7 * 24 * 60 * 60; // 7 days in seconds
        session_set_cookie_params($oneWeek);

        // Regenerate session ID for security
        session_regenerate_id();

        // Set session expiry time
        $_SESSION['expires'] = time() + $oneWeek;

        // Return success response with user data
        http_response_code(200);
        echo json_encode(array(
            "success" => true,
            "message" => "Login successful",
            "user" => array(
                "id" => $user->user_id,
                "name" => $user->name,
                "email" => $user->email
            )
        ));
    } else {
        // Login failed
        http_response_code(401);
        echo json_encode(array("success" => false, "message" => "Invalid email or password"));
    }
} else {
    // Missing required data
    http_response_code(400);
    echo json_encode(array("success" => false, "message" => "Unable to login. Email or password missing."));
}
