<?php
// ============================================================
//  models/Booking.php
// ============================================================

require_once __DIR__ . '/Database.php';

class Booking {
    private PDO $db;

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }

    public function create(int $guest_id, int $room_id,
                           string $check_in, string $check_out,
                           string $status = 'pending'): int {
        $sql = "INSERT INTO Bookings (guest_id, room_id, check_in_date, check_out_date, status)
                VALUES (:guest_id, :room_id, :check_in_date, :check_out_date, :status)";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            ':guest_id'      => $guest_id,
            ':room_id'       => $room_id,
            ':check_in_date' => $check_in,
            ':check_out_date'=> $check_out,
            ':status'        => $status,
        ]);
        // Mark room as occupied on confirmation
        if ($status === 'confirmed') {
            $this->db->prepare("UPDATE Rooms SET status = 'occupied' WHERE room_id = :id")
                     ->execute([':id' => $room_id]);
        }
        return (int)$this->db->lastInsertId();
    }

    public function getAll(): array {
        $sql = "SELECT
                    b.booking_id,
                    g.full_name  AS guest,
                    g.email,
                    h.name       AS hotel,
                    r.room_number,
                    r.type,
                    r.price_per_night,
                    b.check_in_date,
                    b.check_out_date,
                    b.status,
                    DATEDIFF(b.check_out_date, b.check_in_date)                                    AS nights,
                    (r.price_per_night * DATEDIFF(b.check_out_date, b.check_in_date))              AS total_price,
                    b.created_at
                FROM Bookings b
                JOIN Guests g ON b.guest_id = g.guest_id
                JOIN Rooms  r ON b.room_id  = r.room_id
                JOIN Hotels h ON r.hotel_id = h.hotel_id
                ORDER BY b.created_at DESC";
        return $this->db->query($sql)->fetchAll();
    }

    public function getById(int $id): ?array {
        $sql = "SELECT
                    b.booking_id,
                    g.full_name  AS guest,
                    g.email,
                    h.name       AS hotel,
                    r.room_number,
                    r.type,
                    r.price_per_night,
                    b.check_in_date,
                    b.check_out_date,
                    b.status,
                    DATEDIFF(b.check_out_date, b.check_in_date)                               AS nights,
                    (r.price_per_night * DATEDIFF(b.check_out_date, b.check_in_date))         AS total_price,
                    b.created_at
                FROM Bookings b
                JOIN Guests g ON b.guest_id = g.guest_id
                JOIN Rooms  r ON b.room_id  = r.room_id
                JOIN Hotels h ON r.hotel_id = h.hotel_id
                WHERE b.booking_id = :id";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([':id' => $id]);
        $row = $stmt->fetch();
        return $row ?: null;
    }

    public function getActive(): array {
        $sql = "SELECT
                    b.booking_id,
                    g.full_name  AS guest,
                    g.email,
                    h.name       AS hotel,
                    r.room_number,
                    r.type,
                    r.price_per_night,
                    b.check_in_date,
                    b.check_out_date,
                    b.status,
                    DATEDIFF(b.check_out_date, b.check_in_date)                               AS nights,
                    (r.price_per_night * DATEDIFF(b.check_out_date, b.check_in_date))         AS total_price
                FROM Bookings b
                JOIN Guests g ON b.guest_id = g.guest_id
                JOIN Rooms  r ON b.room_id  = r.room_id
                JOIN Hotels h ON r.hotel_id = h.hotel_id
                WHERE b.status IN ('pending','confirmed')
                ORDER BY b.check_in_date ASC";
        return $this->db->query($sql)->fetchAll();
    }

    public function getByGuest(int $guest_id): array {
        $stmt = $this->db->prepare(
            "SELECT b.*, r.room_number, r.type, r.price_per_night
             FROM Bookings b
             JOIN Rooms r ON b.room_id = r.room_id
             WHERE b.guest_id = :guest_id
             ORDER BY b.created_at DESC"
        );
        $stmt->execute([':guest_id' => $guest_id]);
        return $stmt->fetchAll();
    }

    public function updateStatus(int $id, string $status): bool {
        // Sync room status when booking is updated
        $booking = $this->getById($id);
        if ($booking) {
            $roomStmt = $this->db->prepare(
                "UPDATE Rooms SET status = :rs WHERE room_id = 
                 (SELECT room_id FROM Bookings WHERE booking_id = :bid)"
            );
            $roomStatus = match($status) {
                'confirmed'  => 'occupied',
                'cancelled',
                'completed'  => 'available',
                default      => null,
            };
            if ($roomStatus) {
                $roomStmt->execute([':rs' => $roomStatus, ':bid' => $id]);
            }
        }
        $stmt = $this->db->prepare("UPDATE Bookings SET status = :status WHERE booking_id = :id");
        return $stmt->execute([':status' => $status, ':id' => $id]);
    }

    public function delete(int $id): bool {
        $stmt = $this->db->prepare("DELETE FROM Bookings WHERE booking_id = :id");
        return $stmt->execute([':id' => $id]);
    }
}
