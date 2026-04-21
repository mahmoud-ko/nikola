<?php
// ============================================================
//  models/Analytic.php
// ============================================================

require_once __DIR__ . '/../config/Database.php';

class Analytic {
    private PDO $db;

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }

    public function create(int $hotel_id, float $occupancy_rate,
                           float $avg_daily_rate, float $rev_par): int {
        $sql = "INSERT INTO Analytics (hotel_id, occupancy_rate, avg_daily_rate, revenue_per_available_room)
                VALUES (:hotel_id, :occupancy_rate, :avg_daily_rate, :rev_par)";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            ':hotel_id'       => $hotel_id,
            ':occupancy_rate' => $occupancy_rate,
            ':avg_daily_rate' => $avg_daily_rate,
            ':rev_par'        => $rev_par,
        ]);
        return (int)$this->db->lastInsertId();
    }

    public function getAll(): array {
        $sql = "SELECT a.*, h.name AS hotel_name
                FROM Analytics a
                JOIN Hotels h ON a.hotel_id = h.hotel_id
                ORDER BY a.recorded_at DESC";
        return $this->db->query($sql)->fetchAll();
    }

    public function getById(int $id): ?array {
        $sql = "SELECT a.*, h.name AS hotel_name
                FROM Analytics a
                JOIN Hotels h ON a.hotel_id = h.hotel_id
                WHERE a.analytics_id = :id";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([':id' => $id]);
        $row = $stmt->fetch();
        return $row ?: null;
    }

    public function getByHotel(int $hotel_id): array {
        $stmt = $this->db->prepare(
            "SELECT * FROM Analytics WHERE hotel_id = :hotel_id ORDER BY recorded_at DESC"
        );
        $stmt->execute([':hotel_id' => $hotel_id]);
        return $stmt->fetchAll();
    }

    public function update(int $id, array $fields): bool {
        $allowed = ['occupancy_rate', 'avg_daily_rate', 'revenue_per_available_room'];
        $set = [];
        $params = [':id' => $id];
        foreach ($fields as $key => $val) {
            if (in_array($key, $allowed)) {
                $set[] = "$key = :$key";
                $params[":$key"] = $val;
            }
        }
        if (empty($set)) return false;
        $sql = "UPDATE Analytics SET " . implode(', ', $set) . " WHERE analytics_id = :id";
        return $this->db->prepare($sql)->execute($params);
    }

    public function delete(int $id): bool {
        $stmt = $this->db->prepare("DELETE FROM Analytics WHERE analytics_id = :id");
        return $stmt->execute([':id' => $id]);
    }

    // ── Auto-compute snapshot for a hotel ────────────────────
    public function computeAndSave(int $hotel_id): int {
        // Occupancy rate = confirmed bookings today / total rooms
        $occSql = "SELECT
                    (SELECT COUNT(*) FROM Bookings b
                     JOIN Rooms r ON b.room_id = r.room_id
                     WHERE r.hotel_id = :h1
                       AND b.status = 'confirmed'
                       AND CURDATE() BETWEEN b.check_in_date AND b.check_out_date)
                    /
                    NULLIF((SELECT COUNT(*) FROM Rooms WHERE hotel_id = :h2), 0) * 100
                    AS occ_rate";
        $occStmt = $this->db->prepare($occSql);
        $occStmt->execute([':h1' => $hotel_id, ':h2' => $hotel_id]);
        $occ = (float)($occStmt->fetchColumn() ?? 0);

        // ADR = average price of confirmed rooms
        $adrSql = "SELECT AVG(r.price_per_night)
                   FROM Rooms r
                   WHERE r.hotel_id = :hid AND r.status = 'occupied'";
        $adrStmt = $this->db->prepare($adrSql);
        $adrStmt->execute([':hid' => $hotel_id]);
        $adr = (float)($adrStmt->fetchColumn() ?? 0);

        $revpar = round($occ / 100 * $adr, 2);
        return $this->create($hotel_id, round($occ, 2), round($adr, 2), $revpar);
    }
}
