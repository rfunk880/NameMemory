<?php
/**
 * Authentication Middleware
 * Validates JWT token and sets current user
 */

function authenticate() {
    $headers = getallheaders();
    $authHeader = isset($headers['Authorization']) ? $headers['Authorization'] : null;

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
