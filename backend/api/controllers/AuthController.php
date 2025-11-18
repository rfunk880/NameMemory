<?php
/**
 * Authentication Controller
 */
class AuthController {
    private $db;
    private $userModel;

    public function __construct($db) {
        $this->db = $db;
        $this->userModel = new User($db);
    }

    /**
     * Register new user
     * POST /api/auth/register
     */
    public function register() {
        $data = json_decode(file_get_contents('php://input'), true);

        // Validate input
        if (!isset($data['email']) || !isset($data['password']) || !isset($data['name'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Email, password, and name are required']);
            return;
        }

        // Validate email format
        if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid email format']);
            return;
        }

        // Check if email already exists
        if ($this->userModel->emailExists($data['email'])) {
            http_response_code(409);
            echo json_encode(['error' => 'Email already registered']);
            return;
        }

        // Validate password strength
        if (strlen($data['password']) < 6) {
            http_response_code(400);
            echo json_encode(['error' => 'Password must be at least 6 characters']);
            return;
        }

        // Create user
        try {
            $userId = $this->userModel->create($data['email'], $data['password'], $data['name']);

            // Generate JWT token
            $token = JWT::encode([
                'user_id' => $userId,
                'email' => $data['email']
            ]);

            http_response_code(201);
            echo json_encode([
                'message' => 'User registered successfully',
                'token' => $token,
                'user' => [
                    'id' => $userId,
                    'email' => $data['email'],
                    'name' => $data['name']
                ]
            ]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Registration failed']);
        }
    }

    /**
     * Login user
     * POST /api/auth/login
     */
    public function login() {
        $data = json_decode(file_get_contents('php://input'), true);

        // Validate input
        if (!isset($data['email']) || !isset($data['password'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Email and password are required']);
            return;
        }

        // Find user
        $user = $this->userModel->findByEmail($data['email']);

        if (!$user || !$this->userModel->verifyPassword($data['password'], $user['password'])) {
            http_response_code(401);
            echo json_encode(['error' => 'Invalid email or password']);
            return;
        }

        // Generate JWT token
        $token = JWT::encode([
            'user_id' => $user['id'],
            'email' => $user['email']
        ]);

        echo json_encode([
            'message' => 'Login successful',
            'token' => $token,
            'user' => [
                'id' => $user['id'],
                'email' => $user['email'],
                'name' => $user['name']
            ]
        ]);
    }

    /**
     * Get current user
     * GET /api/auth/me
     */
    public function me() {
        authenticate();
        $currentUser = getCurrentUser();

        $user = $this->userModel->findById($currentUser['user_id']);

        if (!$user) {
            http_response_code(404);
            echo json_encode(['error' => 'User not found']);
            return;
        }

        echo json_encode(['user' => $user]);
    }

    /**
     * Request password reset
     * POST /api/auth/forgot-password
     */
    public function forgotPassword() {
        $data = json_decode(file_get_contents('php://input'), true);

        if (!isset($data['email'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Email is required']);
            return;
        }

        // Check if user exists
        if (!$this->userModel->emailExists($data['email'])) {
            // Don't reveal if email exists or not for security
            echo json_encode(['message' => 'If the email exists, a reset link has been sent']);
            return;
        }

        // Create reset token
        $token = $this->userModel->createPasswordResetToken($data['email']);

        // Send email
        EmailSender::sendPasswordReset($data['email'], $token);

        echo json_encode(['message' => 'If the email exists, a reset link has been sent']);
    }

    /**
     * Reset password
     * POST /api/auth/reset-password
     */
    public function resetPassword() {
        $data = json_decode(file_get_contents('php://input'), true);

        if (!isset($data['token']) || !isset($data['password'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Token and new password are required']);
            return;
        }

        // Validate password
        if (strlen($data['password']) < 6) {
            http_response_code(400);
            echo json_encode(['error' => 'Password must be at least 6 characters']);
            return;
        }

        // Verify token
        $resetData = $this->userModel->verifyResetToken($data['token']);

        if (!$resetData) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid or expired token']);
            return;
        }

        // Reset password
        $this->userModel->resetPassword($resetData['email'], $data['password']);

        echo json_encode(['message' => 'Password reset successful']);
    }
}
