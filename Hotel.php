<?php
// ============================================================
//  models/Hotel.php
// ============================================================

require_once __DIR__ . '/Database.php';

class Hotel {
    private PDO $db;

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }

    // ── CREATE ───────────────────────────────────────────────
    public function create(string $name, string $location, float $rating, string $description): int {
        $sql = "INSERT INTO Hotels (name, location, rating, description)
                VALUES (:name, :location, :rating, :description)";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            ':name'        => $name,
            ':location'    => $location,
            ':rating'      => $rating,
            ':description' => $description,
        ]);
        return (int)$this->db->lastInsertId();
    }

    // ── READ ALL ─────────────────────────────────────────────
    public function getAll(): array {
        return $this->db->query("SELECT * FROM Hotels ORDER BY created_at DESC")->fetchAll();
    }

    // ── READ ONE ─────────────────────────────────────────────
    public function getById(int $id): ?array {
        $stmt = $this->db->prepare("SELECT * FROM Hotels WHERE hotel_id = :id");
        $stmt->execute([':id' => $id]);
        $row = $stmt->fetch();
        return $row ?: null;
    }

    // ── UPDATE ───────────────────────────────────────────────
    public function update(int $id, array $fields): bool {
        $allowed = ['name', 'location', 'rating', 'description'];
        $set = [];
        $params = [':id' => $id];
        foreach ($fields as $key => $val) {
            if (in_array($key, $allowed)) {
                $set[] = "$key = :$key";
                $params[":$key"] = $val;
            }
        }
        if (empty($set)) return false;
        $sql = "UPDATE Hotels SET " . implode(', ', $set) . " WHERE hotel_id = :id";
        return $this->db->prepare($sql)->execute($params);
    }

    // ── DELETE ───────────────────────────────────────────────
    public function delete(int $id): bool {
        $stmt = $this->db->prepare("DELETE FROM Hotels WHERE hotel_id = :id");
        return $stmt->execute([':id' => $id]);
    }

    // ── REVENUE PER HOTEL ────────────────────────────────────
    public function revenueByHotel(): array {
        $sql = "SELECT h.name, SUM(p.amount) AS total_revenue
                FROM Payments p
                JOIN Bookings b ON p.booking_id = b.booking_id
                JOIN Rooms    r ON b.room_id    = r.room_id
                JOIN Hotels   h ON r.hotel_id   = h.hotel_id
                GROUP BY h.hotel_id
                ORDER BY total_revenue DESC";
        return $this->db->query($sql)->fetchAll();
    }

    // ── AVERAGE RATING PER HOTEL ─────────────────────────────
    public function ratingSummary(): array {
        $sql = "SELECT h.name, AVG(rv.rating) AS avg_rating, COUNT(*) AS total_reviews
                FROM Reviews rv
                JOIN Hotels h ON rv.hotel_id = h.hotel_id
                GROUP BY h.hotel_id
                ORDER BY avg_rating DESC";
        return $this->db->query($sql)->fetchAll();
    }
}
