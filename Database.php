<?php
class Database {
    private static ?Database $instance = null;
    private PDO $conn;

    private function __construct() {
        $host   = getenv('DB_HOST')   ?: 'localhost';
        $dbname = getenv('DB_NAME')   ?: 'hotel_management';
        $user   = getenv('DB_USER')   ?: 'root';
        $pass   = getenv('DB_PASS')   ?: '';

        // Fallback: read from .env file if present
        if (file_exists(__DIR__ . '/.env')) {
            $lines = file(__DIR__ . '/.env');
            foreach ($lines as $line) {
                $line = trim($line);
                if (strpos($line, 'DB_HOST=') === 0) $host   = trim(substr($line, 8));
                if (strpos($line, 'DB_NAME=') === 0) $dbname = trim(substr($line, 8));
                if (strpos($line, 'DB_USER=') === 0) $user   = trim(substr($line, 8));
                if (strpos($line, 'DB_PASS=') === 0) $pass   = trim(substr($line, 8));
            }
        }

        $this->conn = new PDO(
            "mysql:host={$host};dbname={$dbname};charset=utf8mb4",
            $user, $pass,
            [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES   => false,
            ]
        );
    }

    public static function getInstance(): Database {
        if (self::$instance === null) self::$instance = new self();
        return self::$instance;
    }

    public function getConnection(): PDO { return $this->conn; }
}
?>
