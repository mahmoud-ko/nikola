<?php
require_once __DIR__ . '/Database.php';
require_once __DIR__ . '/Response.php';

class HotelsController {
    private PDO $db;
    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
        $this->ensureHotelsTable();
    }

    private function ensureHotelsTable(): void {
        $this->db->exec("CREATE TABLE IF NOT EXISTS hotels (
            hotel_id INT AUTO_INCREMENT PRIMARY KEY,
            owner_id INT DEFAULT NULL,
            name VARCHAR(200) NOT NULL,
            city VARCHAR(100) NOT NULL,
            country VARCHAR(100) NOT NULL,
            stars INT DEFAULT 5,
            price DECIMAL(10,2) NOT NULL,
            rating DECIMAL(3,2) DEFAULT 0,
            reviews INT DEFAULT 0,
            description TEXT,
            amenities TEXT,
            max_children INT DEFAULT 4,
            total_rooms INT DEFAULT 10,
            initial VARCHAR(10),
            color VARCHAR(20),
            status ENUM('active','pending') DEFAULT 'active'
        )");

        $stmt = $this->db->query("SELECT COUNT(*) FROM hotels");
        if ($stmt->fetchColumn() == 0) {
            $hotels = [
                ['Le Grand Hôtel',       'Paris',     'France',  5, 450,  4.9,  1284, 'Belle Époque grandeur',      'Wi-Fi,Spa,Restaurant', 4, 30, 'LG', '#1a1208'],
                ['Burj Al Arab',         'Dubai',     'UAE',     5, 1800, 4.85, 2341, 'Iconic sail-shaped hotel',   'Pool,Spa,Restaurant',  3, 20, 'BA', '#0a1218'],
                ['The Peninsula',        'Tokyo',     'Japan',   5, 720,  4.9,  998,  'Eastern refinement',         'Spa,Pool,Restaurant',  2, 40, 'TP', '#120a10'],
                ['Sofitel Algiers',      'Algiers',   'Algeria', 5, 220,  4.72, 642,  'French elegance in Algiers', 'Pool,Spa,Restaurant',  3, 40, 'SA', '#0a1a0e'],
                ['El Djazair Hotel',     'Algiers',   'Algeria', 5, 180,  4.65, 430,  'Colonial-era landmark',      'Pool,Restaurant,Bar',  4, 30, 'EJ', '#0e1a0a'],
                ['Four Seasons Bosphorus','Istanbul', 'Turkey',  5, 680,  4.91, 1120, 'Ottoman palace',             'Spa,Pool,Restaurant',  3, 35, 'FS', '#12100a'],
                ['La Mamounia',          'Marrakech', 'Morocco', 5, 750,  4.94, 890,  'Moorish splendour',          'Spa,Pool,Restaurant',  4, 25, 'LM', '#1a0e0a'],
                ['Hotel Arts Barcelona', 'Barcelona', 'Spain',   5, 480,  4.75, 760,  'Beachfront masterpiece',     'Pool,Spa,Restaurant',  3, 38, 'HA', '#0a0e1a'],
            ];
            $sql  = "INSERT INTO hotels (name,city,country,stars,price,rating,reviews,description,amenities,max_children,total_rooms,initial,color) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)";
            $stmt = $this->db->prepare($sql);
            foreach ($hotels as $h) $stmt->execute($h);
        }
    }

    public function getAll(): void {
        $stmt   = $this->db->query("SELECT * FROM hotels WHERE status='active' ORDER BY rating DESC");
        $hotels = $stmt->fetchAll(PDO::FETCH_ASSOC);
        foreach ($hotels as &$h) {
            $h['amenities'] = array_filter(explode(',', $h['amenities'] ?? ''));
        }
        Response::success($hotels);
    }

    public function getById(int $id): void {
        $stmt = $this->db->prepare("SELECT * FROM hotels WHERE hotel_id = ?");
        $stmt->execute([$id]);
        $hotel = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$hotel) Response::notFound('Hotel not found');
        $hotel['amenities'] = array_filter(explode(',', $hotel['amenities'] ?? ''));
        Response::success($hotel);
    }
}
?>
