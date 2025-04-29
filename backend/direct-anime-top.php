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

// Incluir clases y configuración
require_once __DIR__ . '/includes/ApiHelper.php';

// Define la URL de la API y la clave API
define('ANILIST_API_URL', 'https://graphql.anilist.co');

try {
    // Consulta GraphQL
    $query = <<<GRAPHQL
    query {
      Page(page: 1, perPage: 10) {
        media(type: ANIME, sort: SCORE_DESC) {
          id
          title {
            english
            romaji
          }
          coverImage {
            large
          }
          averageScore
          genres
          episodes
        }
      }
    }
    GRAPHQL;
    
    // Realiza la petición
    $data = [
        'query' => $query
    ];
    
    // Realiza la petición a AniList
    $ch = curl_init(ANILIST_API_URL);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        'Accept: application/json'
    ]);
    
    $response = curl_exec($ch);
    
    // Verifica errores de cURL
    if (curl_errno($ch)) {
        throw new Exception('cURL Error: ' . curl_error($ch));
    }
    
    curl_close($ch);
    
    // Decodifica la respuesta
    $jsonResponse = json_decode($response, true);
    
    // Verifica si hay errores en la respuesta
    if (isset($jsonResponse['errors'])) {
        throw new Exception($jsonResponse['errors'][0]['message']);
    }
    
    // Obtiene los datos de anime
    $animeList = $jsonResponse['data']['Page']['media'];
    
    // Filtra contenido para adultos
    $filteredAnime = array_filter($animeList, function($anime) {
        return !in_array('Hentai', $anime['genres']);
    });
    
    // Envía la respuesta
    echo json_encode(array_values($filteredAnime));
    
} catch (Exception $e) {
    // En caso de error, envía un mensaje de error
    echo json_encode(['error' => $e->getMessage()]);
}