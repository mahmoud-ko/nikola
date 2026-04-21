<?php
// ============================================================
//  models/Payment.php
// ============================================================

require_once __DIR__ . '/../config/Database.php';

class Payment {
    private PDO $db;

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }

    public function create(int $booking_id, float $amount, string $method): int {
        $sql = "INSERT INTO Payments (booking_id, amount, method)
                VALUES (:booking_id, :amount, :method)";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            ':booking_id' => $booking_id,
            ':amount'     => $amount,
            ':method'     => $method,
        ]);
        // Auto-confirm the booking once payment is recorded
        $this->db->prepare("UPDATE Bookings SET status = 'confirmed' WHERE booking_id = :id")
                 ->execute([':id' => $booking_id]);
        return (int)$this->db->lastInsertId();
    }

    public function getAll(): array {
        $sql = "SELECT
                    p.payment_id,
                    b.booking_id,
                    g.full_name AS guest,
                    g.email,
                    p.amount,
                    p.method,
                    p.payment_date
                FROM Payments p
                JOIN Bookings b ON p.booking_id = b.booking_id
                JOIN Guests   g ON b.guest_id   = g.guest_id
                ORDER BY p.payment_date DESC";
        return $this->db->query($sql)->fetchAll();
    }

    public function getById(int $id): ?array {
        $sql = "SELECT p.*, b.booking_id, g.full_name AS guest
                FROM Payments p
                JOIN Bookings b ON p.booking_id = b.booking_id
                JOIN Guests   g ON b.guest_id   = g.guest_id
                WHERE p.payment_id = :id";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([':id' => $id]);
        $row = $stmt->fetch();
        return $row ?: null;
    }

    public function getByBooking(int $booking_id): array {
        $stmt = $this->db->prepare(
            "SELECT * FROM Payments WHERE booking_id = :booking_id ORDER BY payment_date DESC"
        );
        $stmt->execute([':booking_id' => $booking_id]);
        return $stmt->fetchAll();
    }

    public function updateMethod(int $id, string $method): bool {
        $stmt = $this->db->prepare("UPDATE Payments SET method = :method WHERE payment_id = :id");
        return $stmt->execute([':method' => $method, ':id' => $id]);
    }

    public function delete(int $id): bool {
        $stmt = $this->db->prepare("DELETE FROM Payments WHERE payment_id = :id");
        return $stmt->execute([':id' => $id]);
    }
}
