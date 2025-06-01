<?php

/**
 * Helper class for API operations
 */
class ApiHelper
{
    /**
     * Make a POST request to a GraphQL API
     * 
     * @param string $url The API URL
     * @param array $data The GraphQL query and variables
     * @return array The API response
     */
    public static function graphqlRequest($url, $data)
    {
        $ch = curl_init($url);

        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Content-Type: application/json',
            'Accept: application/json'
        ]);

        $response = curl_exec($ch);

        if (curl_errno($ch)) {
            throw new Exception('cURL Error: ' . curl_error($ch));
        }

        curl_close($ch);

        return json_decode($response, true);
    }

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
