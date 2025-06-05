<?php
// Start session
session_start();

// Headers
header('Access-Control-Allow-Origin: https://visualist.netlify.app');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Access-Control-Allow-Headers, Content-Type, Access-Control-Allow-Methods, Authorization, X-Requested-With');

// Unset all session variables
$_SESSION = array();

// Destroy the session
session_destroy();

// Return success response
http_response_code(200);
echo json_encode(array("success" => true, "message" => "Logged out successfully"));
