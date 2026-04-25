<?php
// ============================================================
//  models/RoomFeature.php
// ============================================================

require_once __DIR__ . '/Database.php';

class RoomFeature {
    private PDO $db;

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }

    public function create(int $room_id, string $feature_name): int {
        $stmt = $this->db->prepare(
            "INSERT INTO RoomFeatures (room_id, feature_name) VALUES (:room_id, :feature_name)"
        );
        $stmt->execute([':room_id' => $room_id, ':feature_name' => $feature_name]);
        return (int)$this->db->lastInsertId();
    }

    public function getAll(): array {
        $sql = "SELECT rf.*, r.room_number
                FROM RoomFeatures rf
                JOIN Rooms r ON rf.room_id = r.room_id
                ORDER BY rf.room_id, rf.feature_name";
        return $this->db->query($sql)->fetchAll();
    }

    public function getById(int $id): ?array {
        $stmt = $this->db->prepare(
            "SELECT rf.*, r.room_number FROM RoomFeatures rf
             JOIN Rooms r ON rf.room_id = r.room_id
             WHERE rf.feature_id = :id"
        );
        $stmt->execute([':id' => $id]);
        $row = $stmt->fetch();
        return $row ?: null;
    }

    public function getByRoom(int $room_id): array {
        $stmt = $this->db->prepare(
            "SELECT * FROM RoomFeatures WHERE room_id = :room_id ORDER BY feature_name"
        );
        $stmt->execute([':room_id' => $room_id]);
        return $stmt->fetchAll();
    }

    public function update(int $id, string $feature_name): bool {
        $stmt = $this->db->prepare(
            "UPDATE RoomFeatures SET feature_name = :feature_name WHERE feature_id = :id"
        );
        return $stmt->execute([':feature_name' => $feature_name, ':id' => $id]);
    }

    public function delete(int $id): bool {
        $stmt = $this->db->prepare("DELETE FROM RoomFeatures WHERE feature_id = :id");
        return $stmt->execute([':id' => $id]);
    }
}
