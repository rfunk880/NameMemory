<?php
/**
 * NameMemory API Router
 * Main entry point for all API requests
 */

// Enable error reporting for development (disable in production)
error_reporting(E_ALL);
ini_set('display_errors', 0); // Don't display errors to users
ini_set('log_errors', 1);

// CORS headers
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Check if config file exists
if (!file_exists(__DIR__ . '/config/database.php')) {
    http_response_code(500);
    echo json_encode(['error' => 'Database configuration not found. Copy database.example.php to database.php']);
    exit;
}

// Load configuration
require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/config/Database.php';

// Load utilities
require_once __DIR__ . '/utils/JWT.php';
require_once __DIR__ . '/utils/ImageOptimizer.php';
require_once __DIR__ . '/utils/EmailSender.php';

// Load middleware
require_once __DIR__ . '/middleware/auth.php';

// Load models
require_once __DIR__ . '/models/User.php';
require_once __DIR__ . '/models/Group.php';
require_once __DIR__ . '/models/Person.php';

// Load controllers
require_once __DIR__ . '/controllers/AuthController.php';
require_once __DIR__ . '/controllers/GroupController.php';
require_once __DIR__ . '/controllers/PersonController.php';
require_once __DIR__ . '/controllers/ShareController.php';

// Initialize database
$database = new Database();

// Initialize controllers
$authController = new AuthController($database);
$groupController = new GroupController($database);
$personController = new PersonController($database);
$shareController = new ShareController($database);

// Get request method and path
$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// Remove /api prefix if present
$path = preg_replace('#^/api#', '', $path);
$path = rtrim($path, '/');

// Route handling
try {
    // Health check endpoint (no auth required)
    if ($path === '/health' && $method === 'GET') {
        echo json_encode(['status' => 'ok', 'timestamp' => date('c')]);
        exit;
    }

    // Authentication routes
    if ($path === '/auth/register' && $method === 'POST') {
        $authController->register();
    } elseif ($path === '/auth/login' && $method === 'POST') {
        $authController->login();
    } elseif ($path === '/auth/me' && $method === 'GET') {
        $authController->me();
    } elseif ($path === '/auth/forgot-password' && $method === 'POST') {
        $authController->forgotPassword();
    } elseif ($path === '/auth/reset-password' && $method === 'POST') {
        $authController->resetPassword();
    }

    // Group routes
    elseif ($path === '/groups' && $method === 'GET') {
        $groupController->index();
    } elseif ($path === '/groups' && $method === 'POST') {
        $groupController->create();
    } elseif (preg_match('#^/groups/(\d+)$#', $path, $matches) && $method === 'GET') {
        $groupController->show($matches[1]);
    } elseif (preg_match('#^/groups/(\d+)$#', $path, $matches) && $method === 'PUT') {
        $groupController->update($matches[1]);
    } elseif (preg_match('#^/groups/(\d+)$#', $path, $matches) && $method === 'DELETE') {
        $groupController->delete($matches[1]);
    }

    // People routes
    elseif (preg_match('#^/groups/(\d+)/people$#', $path, $matches) && $method === 'GET') {
        $personController->index($matches[1]);
    } elseif (preg_match('#^/groups/(\d+)/people$#', $path, $matches) && $method === 'POST') {
        $personController->create($matches[1]);
    } elseif (preg_match('#^/people/(\d+)$#', $path, $matches) && $method === 'GET') {
        $personController->show($matches[1]);
    } elseif (preg_match('#^/people/(\d+)$#', $path, $matches) && $method === 'POST') {
        // POST for update to support multipart/form-data
        $personController->update($matches[1]);
    } elseif (preg_match('#^/people/(\d+)$#', $path, $matches) && $method === 'PUT') {
        $personController->update($matches[1]);
    } elseif (preg_match('#^/people/(\d+)$#', $path, $matches) && $method === 'DELETE') {
        $personController->delete($matches[1]);
    }

    // Share routes
    elseif (preg_match('#^/groups/(\d+)/shares$#', $path, $matches) && $method === 'GET') {
        $shareController->index($matches[1]);
    } elseif (preg_match('#^/groups/(\d+)/share$#', $path, $matches) && $method === 'POST') {
        $shareController->share($matches[1]);
    } elseif (preg_match('#^/groups/(\d+)/share/(\d+)$#', $path, $matches) && $method === 'DELETE') {
        $shareController->unshare($matches[1], $matches[2]);
    }

    // 404 Not Found
    else {
        http_response_code(404);
        echo json_encode(['error' => 'Endpoint not found']);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Internal server error', 'message' => $e->getMessage()]);
}
