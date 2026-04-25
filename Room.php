<?php
// ============================================================
//  models/Room.php
// ============================================================

require_once __DIR__ . '/Database.php';

class Room {
    private PDO $db;

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }

    public function create(int $hotel_id, string $room_number, string $type,
                           float $price_per_night, string $status = 'available'): int {
        $sql = "INSERT INTO Rooms (hotel_id, room_number, type, price_per_night, status)
                VALUES (:hotel_id, :room_number, :type, :price_per_night, :status)";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            ':hotel_id'       => $hotel_id,
            ':room_number'    => $room_number,
            ':type'           => $type,
            ':price_per_night'=> $price_per_night,
            ':status'         => $status,
        ]);
        return (int)$this->db->lastInsertId();
    }

    public function getAll(): array {
        $sql = "SELECT r.*, h.name AS hotel_name
                FROM Rooms r
                JOIN Hotels h ON r.hotel_id = h.hotel_id
                ORDER BY r.created_at DESC";
        return $this->db->query($sql)->fetchAll();
    }

    public function getById(int $id): ?array {
        $sql = "SELECT r.*, h.name AS hotel_name
                FROM Rooms r
                JOIN Hotels h ON r.hotel_id = h.hotel_id
                WHERE r.room_id = :id";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([':id' => $id]);
        $row = $stmt->fetch();
        return $row ?: null;
    }

    public function getAvailable(): array {
        $sql = "SELECT r.*, h.name AS hotel_name
                FROM Rooms r
                JOIN Hotels h ON r.hotel_id = h.hotel_id
                WHERE r.status = 'available'
                ORDER BY r.price_per_night ASC";
        return $this->db->query($sql)->fetchAll();
    }

    public function getByHotel(int $hotel_id): array {
        $stmt = $this->db->prepare(
            "SELECT * FROM Rooms WHERE hotel_id = :hotel_id ORDER BY room_number"
        );
        $stmt->execute([':hotel_id' => $hotel_id]);
        return $stmt->fetchAll();
    }

    public function updateStatus(int $id, string $status): bool {
        $stmt = $this->db->prepare("UPDATE Rooms SET status = :status WHERE room_id = :id");
        return $stmt->execute([':status' => $status, ':id' => $id]);
    }

    public function update(int $id, array $fields): bool {
        $allowed = ['hotel_id', 'room_number', 'type', 'price_per_night', 'status'];
        $set = [];
        $params = [':id' => $id];
        foreach ($fields as $key => $val) {
            if (in_array($key, $allowed)) {
                $set[] = "$key = :$key";
                $params[":$key"] = $val;
            }
        }
        if (empty($set)) return false;
        $sql = "UPDATE Rooms SET " . implode(', ', $set) . " WHERE room_id = :id";
        return $this->db->prepare($sql)->execute($params);
    }

    public function delete(int $id): bool {
        $stmt = $this->db->prepare("DELETE FROM Rooms WHERE room_id = :id");
        return $stmt->execute([':id' => $id]);
    }
}
