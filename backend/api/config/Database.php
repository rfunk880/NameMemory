<?php
/**
 * Database Connection Class
 */
define('DB_HOST', 'localhost');
define('DB_NAME', 'dbwor04cxcwgbg');
define('DB_USER', 'uidbfd2lnuuau');
define('DB_PASS', 'zyqdf9v3muxt');
define('DB_CHARSET', 'utf8mb4');

// JWT Secret Key - Generate a random string for production
define('JWT_SECRET', 'xL&VfH%8ZJZ0pMVy');
define('JWT_EXPIRY', 86400 * 7); // 7 days in seconds

// Email Configuration
define('SMTP_HOST', 'c1111634.sgvps.net');
define('SMTP_PORT', 465);
define('SMTP_USER', 'app@e-salesllc.com');
define('SMTP_PASS', '^gig3m@;yoS3');
define('SMTP_FROM', 'app@e-salesllc.com');
define('SMTP_FROM_NAME', 'NameMemory App');

// Application URL
define('APP_URL', 'https://memory.e-salesllc.com');
define('API_URL', 'https://memory.e-salesllc.com/api');

// Upload settings
define('UPLOAD_MAX_SIZE', 10 * 1024 * 1024); // 10MB
define('UPLOAD_DIR', __DIR__ . '/../../uploads/');
define('PHOTO_MAX_WIDTH', 800);
define('PHOTO_QUALITY', 75);
define('THUMBNAIL_SIZE', 150);
class Database {
    private $connection;

    public function __construct() {
        try {
            $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET;
            $options = [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
            ];

            $this->connection = new PDO($dsn, DB_USER, DB_PASS, $options);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Database connection failed']);
            exit;
        }
    }

    public function getConnection() {
        return $this->connection;
    }

    public function query($sql, $params = []) {
        $stmt = $this->connection->prepare($sql);
        $stmt->execute($params);
        return $stmt;
    }

    public function fetchAll($sql, $params = []) {
        $stmt = $this->query($sql, $params);
        return $stmt->fetchAll();
    }

    public function fetchOne($sql, $params = []) {
        $stmt = $this->query($sql, $params);
        return $stmt->fetch();
    }

    public function execute($sql, $params = []) {
        $stmt = $this->query($sql, $params);
        return $stmt->rowCount();
    }

    public function lastInsertId() {
        return $this->connection->lastInsertId();
    }
}
