<?php
// Habilitar depuración
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Configurar cabeceras CORS
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Respuesta JSON simple
echo json_encode([
    'status' => 'success',
    'message' => 'Backend funcionando correctamente',
    'time' => date('Y-m-d H:i:s')
]);