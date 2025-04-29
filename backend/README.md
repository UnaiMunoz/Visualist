# Visualist PHP Backend API

This is a PHP-based backend API for the Visualist application that securely handles API calls to external services like AniList and TMDb.

## Setup Instructions

### Prerequisites
- PHP 7.4 or higher
- Apache web server with mod_rewrite enabled
- cURL PHP extension

### Installation

1. Place all the files in your web server's directory (e.g., `/var/www/html` or `htdocs`).

2. Open `config/config.php` and replace `your_tmdb_api_key_here` with your actual TMDb API key:
   ```php
   define('TMDB_API_KEY', 'your_tmdb_api_key_here');
   ```

3. Make sure your web server is configured to allow `.htaccess` files and has the `mod_rewrite` module enabled.

4. If you're using a different domain for your frontend, update the CORS settings in `config/config.php`:
   ```php
   header('Access-Control-Allow-Origin: http://your-frontend-domain.com');
   ```

## API Endpoints

### Anime
- `GET /api/anime/top` - Get top-rated anime
  - Query parameters:
    - `limit` (default: 10) - Number of results to return
  
- `GET /api/anime` - Get paginated anime list
  - Query parameters:
    - `page` (default: 1) - Page number
    - `perPage` (default: 24) - Items per page
  
- `GET /api/anime/search` - Search for anime
  - Query parameters:
    - `searchTerm` (required) - Search query
    - `page` (default: 1) - Page number
    - `perPage` (default: 24) - Items per page

### Movies
- `GET /api/movies/top` - Get top-rated movies
  - Query parameters:
    - `limit` (default: 10) - Number of results to return

### TV Series
- `GET /api/series/top` - Get top-rated TV series
  - Query parameters:
    - `limit` (default: 10) - Number of results to return

## Security Features

- API keys are stored securely on the server
- The backend acts as a proxy for external API calls, ensuring that API keys are not exposed to the client
- `.htaccess` rules prevent direct access to sensitive files
- Input validation is performed on all parameters
- CORS is configured to control which domains can access the API

## Updating the Frontend

To use this backend API, update your frontend service files to point to these endpoints instead of making direct API calls.

## Troubleshooting

- If you encounter CORS issues, ensure your frontend URL is correctly set up in the CORS configuration
- For rate limiting issues with the external APIs, consider implementing caching strategies
- Make sure PHP has the cURL extension enabled for making API requests