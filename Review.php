<?php
// ============================================================
//  models/Review.php
// ============================================================

require_once __DIR__ . '/Database.php';

class Review {
    private PDO $db;

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }

    public function create(int $guest_id, int $hotel_id, int $rating,
                           string $comment, float $sentiment_score = 0.00): int {
        $sql = "INSERT INTO Reviews (guest_id, hotel_id, rating, comment, sentiment_score)
                VALUES (:guest_id, :hotel_id, :rating, :comment, :sentiment_score)";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            ':guest_id'       => $guest_id,
            ':hotel_id'       => $hotel_id,
            ':rating'         => $rating,
            ':comment'        => $comment,
            ':sentiment_score'=> $sentiment_score,
        ]);
        $review_id = (int)$this->db->lastInsertId();
        // Recompute hotel average rating
        $this->refreshHotelRating($hotel_id);
        return $review_id;
    }

    public function getAll(): array {
        $sql = "SELECT
                    rv.review_id,
                    g.full_name  AS guest,
                    h.name       AS hotel,
                    rv.rating,
                    rv.comment,
                    rv.sentiment_score,
                    rv.created_at
                FROM Reviews rv
                JOIN Guests g ON rv.guest_id = g.guest_id
                JOIN Hotels h ON rv.hotel_id = h.hotel_id
                ORDER BY rv.created_at DESC";
        return $this->db->query($sql)->fetchAll();
    }

    public function getById(int $id): ?array {
        $sql = "SELECT rv.*, g.full_name AS guest, h.name AS hotel
                FROM Reviews rv
                JOIN Guests g ON rv.guest_id = g.guest_id
                JOIN Hotels h ON rv.hotel_id = h.hotel_id
                WHERE rv.review_id = :id";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([':id' => $id]);
        $row = $stmt->fetch();
        return $row ?: null;
    }

    public function getByHotel(int $hotel_id): array {
        $sql = "SELECT rv.*, g.full_name AS guest
                FROM Reviews rv
                JOIN Guests g ON rv.guest_id = g.guest_id
                WHERE rv.hotel_id = :hotel_id
                ORDER BY rv.created_at DESC";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([':hotel_id' => $hotel_id]);
        return $stmt->fetchAll();
    }

    public function updateSentiment(int $id, float $score): bool {
        $stmt = $this->db->prepare(
            "UPDATE Reviews SET sentiment_score = :score WHERE review_id = :id"
        );
        return $stmt->execute([':score' => $score, ':id' => $id]);
    }

    public function update(int $id, array $fields): bool {
        $allowed = ['rating', 'comment', 'sentiment_score'];
        $set = [];
        $params = [':id' => $id];
        foreach ($fields as $key => $val) {
            if (in_array($key, $allowed)) {
                $set[] = "$key = :$key";
                $params[":$key"] = $val;
            }
        }
        if (empty($set)) return false;
        $sql = "UPDATE Reviews SET " . implode(', ', $set) . " WHERE review_id = :id";
        return $this->db->prepare($sql)->execute($params);
    }

    public function delete(int $id): bool {
        // Fetch hotel_id before delete to refresh rating
        $row = $this->db->prepare("SELECT hotel_id FROM Reviews WHERE review_id = :id");
        $row->execute([':id' => $id]);
        $hotel_id = (int)($row->fetchColumn() ?? 0);

        $stmt = $this->db->prepare("DELETE FROM Reviews WHERE review_id = :id");
        $result = $stmt->execute([':id' => $id]);
        if ($result && $hotel_id) $this->refreshHotelRating($hotel_id);
        return $result;
    }

    // ── Recompute Hotels.rating from Reviews ─────────────────
    private function refreshHotelRating(int $hotel_id): void {
        $stmt = $this->db->prepare(
            "UPDATE Hotels h
             SET h.rating = (
                 SELECT COALESCE(AVG(rv.rating), 0)
                 FROM Reviews rv WHERE rv.hotel_id = h.hotel_id
             )
             WHERE h.hotel_id = :hotel_id"
        );
        $stmt->execute([':hotel_id' => $hotel_id]);
    }
}
