<?php
/**
 * User Model
 */
class User {
    private $db;

    public function __construct($db) {
        $this->db = $db;
    }

    /**
     * Create new user
     */
    public function create($email, $password, $name) {
        $hashedPassword = password_hash($password, PASSWORD_DEFAULT);

        $sql = "INSERT INTO users (email, password, name) VALUES (?, ?, ?)";
        $this->db->execute($sql, [$email, $hashedPassword, $name]);

        return $this->db->lastInsertId();
    }

    /**
     * Find user by email
     */
    public function findByEmail($email) {
        $sql = "SELECT * FROM users WHERE email = ?";
        return $this->db->fetchOne($sql, [$email]);
    }

    /**
     * Find user by ID
     */
    public function findById($id) {
        $sql = "SELECT id, email, name, created_at FROM users WHERE id = ?";
        return $this->db->fetchOne($sql, [$id]);
    }

    /**
     * Verify password
     */
    public function verifyPassword($password, $hash) {
        return password_verify($password, $hash);
    }

    /**
     * Check if email exists
     */
    public function emailExists($email) {
        $user = $this->findByEmail($email);
        return $user !== false;
    }

    /**
     * Create password reset token
     */
    public function createPasswordResetToken($email) {
        $token = bin2hex(random_bytes(32));
        $expiresAt = date('Y-m-d H:i:s', time() + 3600); // 1 hour

        // Delete old tokens for this email
        $this->db->execute("DELETE FROM password_resets WHERE email = ?", [$email]);

        // Insert new token
        $sql = "INSERT INTO password_resets (email, token, expires_at) VALUES (?, ?, ?)";
        $this->db->execute($sql, [$email, $token, $expiresAt]);

        return $token;
    }

    /**
     * Verify password reset token
     */
    public function verifyResetToken($token) {
        $sql = "SELECT * FROM password_resets WHERE token = ? AND expires_at > NOW()";
        return $this->db->fetchOne($sql, [$token]);
    }

    /**
     * Reset password
     */
    public function resetPassword($email, $newPassword) {
        $hashedPassword = password_hash($newPassword, PASSWORD_DEFAULT);
        $sql = "UPDATE users SET password = ? WHERE email = ?";
        $this->db->execute($sql, [$hashedPassword, $email]);

        // Delete used token
        $this->db->execute("DELETE FROM password_resets WHERE email = ?", [$email]);

        return true;
    }
}
