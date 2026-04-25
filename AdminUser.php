<?php
// ============================================================
//  models/AdminUser.php
// ============================================================

require_once __DIR__ . '/Database.php';

class AdminUser {
    private PDO $db;

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }

    public function create(string $username, string $password, string $role = 'staff'): int {
        $hashed = md5($password); // MD5 kept per schema; use password_hash() for new projects
        $stmt = $this->db->prepare(
            "INSERT INTO Admin (username, password, role) VALUES (:username, :password, :role)"
        );
        $stmt->execute([':username' => $username, ':password' => $hashed, ':role' => $role]);
        return (int)$this->db->lastInsertId();
    }

    public function getAll(): array {
        return $this->db->query(
            "SELECT admin_id, username, role, created_at FROM Admin ORDER BY created_at DESC"
        )->fetchAll();
    }

    public function getById(int $id): ?array {
        $stmt = $this->db->prepare(
            "SELECT admin_id, username, role, created_at FROM Admin WHERE admin_id = :id"
        );
        $stmt->execute([':id' => $id]);
        $row = $stmt->fetch();
        return $row ?: null;
    }

    public function getByUsername(string $username): ?array {
        $stmt = $this->db->prepare("SELECT * FROM Admin WHERE username = :username");
        $stmt->execute([':username' => $username]);
        $row = $stmt->fetch();
        return $row ?: null;
    }

    public function updateRole(int $id, string $role): bool {
        $stmt = $this->db->prepare("UPDATE Admin SET role = :role WHERE admin_id = :id");
        return $stmt->execute([':role' => $role, ':id' => $id]);
    }

    public function updatePassword(int $id, string $new_password): bool {
        $stmt = $this->db->prepare("UPDATE Admin SET password = :password WHERE admin_id = :id");
        return $stmt->execute([':password' => md5($new_password), ':id' => $id]);
    }

    public function delete(int $id): bool {
        $stmt = $this->db->prepare("DELETE FROM Admin WHERE admin_id = :id");
        return $stmt->execute([':id' => $id]);
    }

    public function verifyCredentials(string $username, string $password): ?array {
        $admin = $this->getByUsername($username);
        if (!$admin) return null;
        if ($admin['password'] !== md5($password)) return null;
        unset($admin['password']);
        return $admin;
    }
}
