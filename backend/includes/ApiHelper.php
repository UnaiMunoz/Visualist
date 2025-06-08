<?php

/**
 * Helper class for API operations
 */
class ApiHelper
{
    /**
     * Make a GET request to a REST API
     * 
     * @param string $url The API URL
     * @return array The API response
     */
    public static function restRequest($url)
    {
        $ch = curl_init($url);

        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

        $response = curl_exec($ch);

        if (curl_errno($ch)) {
            throw new Exception('cURL Error: ' . curl_error($ch));
        }

        curl_close($ch);

        return json_decode($response, true);
    }

}
