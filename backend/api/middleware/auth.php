<?php
/**
 * Authentication Middleware
 * Validates JWT token and sets current user
 */

function authenticate() {
    // Try multiple methods to get the Authorization header (for different server configs)
    $authHeader = null;

    // Method 1: getallheaders() - works on Apache with mod_php
    if (function_exists('getallheaders')) {
        $headers = getallheaders();
        $authHeader = isset($headers['Authorization']) ? $headers['Authorization'] : null;

        // Try lowercase version (some servers normalize headers)
        if (!$authHeader && isset($headers['authorization'])) {
            $authHeader = $headers['authorization'];
        }
    }

    // Method 2: $_SERVER['HTTP_AUTHORIZATION'] - works on most servers
    if (!$authHeader && isset($_SERVER['HTTP_AUTHORIZATION'])) {
        $authHeader = $_SERVER['HTTP_AUTHORIZATION'];
    }

    // Method 3: apache_request_headers() - another Apache method
    if (!$authHeader && function_exists('apache_request_headers')) {
        $headers = apache_request_headers();
        $authHeader = isset($headers['Authorization']) ? $headers['Authorization'] : null;
        if (!$authHeader && isset($headers['authorization'])) {
            $authHeader = $headers['authorization'];
        }
    }

    // Method 4: Check for PHP_AUTH_DIGEST or REDIRECT_HTTP_AUTHORIZATION
    if (!$authHeader && isset($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {
        $authHeader = $_SERVER['REDIRECT_HTTP_AUTHORIZATION'];
    }

    if (!$authHeader || !preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
        http_response_code(401);
        echo json_encode(['error' => 'No token provided']);
        exit;
    }

    $token = $matches[1];
    $payload = JWT::decode($token);

    if (!$payload) {
        http_response_code(401);
        echo json_encode(['error' => 'Invalid or expired token']);
        exit;
    }

    // Set current user in global scope
    $GLOBALS['currentUser'] = $payload;
    return $payload;
}

function getCurrentUser() {
    return isset($GLOBALS['currentUser']) ? $GLOBALS['currentUser'] : null;
}
