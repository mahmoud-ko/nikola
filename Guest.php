<?php
// ============================================================
//  models/Guest.php
// ============================================================

require_once __DIR__ . '/Database.php';

class Guest {
    private PDO $db;

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }

    public function create(string $full_name, string $email, string $phone, string $nationality): int {
        $sql = "INSERT INTO Guests (full_name, email, phone, nationality)
                VALUES (:full_name, :email, :phone, :nationality)";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            ':full_name'   => $full_name,
            ':email'       => $email,
            ':phone'       => $phone,
            ':nationality' => $nationality,
        ]);
        return (int)$this->db->lastInsertId();
    }

    public function getAll(): array {
        return $this->db->query("SELECT * FROM Guests ORDER BY created_at DESC")->fetchAll();
    }

    public function getById(int $id): ?array {
        $stmt = $this->db->prepare("SELECT * FROM Guests WHERE guest_id = :id");
        $stmt->execute([':id' => $id]);
        $row = $stmt->fetch();
        return $row ?: null;
    }

    public function getByEmail(string $email): ?array {
        $stmt = $this->db->prepare("SELECT * FROM Guests WHERE email = :email");
        $stmt->execute([':email' => $email]);
        $row = $stmt->fetch();
        return $row ?: null;
    }

    public function update(int $id, array $fields): bool {
        $allowed = ['full_name', 'email', 'phone', 'nationality'];
        $set = [];
        $params = [':id' => $id];
        foreach ($fields as $key => $val) {
            if (in_array($key, $allowed)) {
                $set[] = "$key = :$key";
                $params[":$key"] = $val;
            }
        }
        if (empty($set)) return false;
        $sql = "UPDATE Guests SET " . implode(', ', $set) . " WHERE guest_id = :id";
        return $this->db->prepare($sql)->execute($params);
    }

    public function delete(int $id): bool {
        $stmt = $this->db->prepare("DELETE FROM Guests WHERE guest_id = :id");
        return $stmt->execute([':id' => $id]);
    }
}
