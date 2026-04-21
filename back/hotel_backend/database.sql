-- ============================================================
--  HOTEL MANAGEMENT SYSTEM — DATABASE SCHEMA
-- ============================================================

CREATE DATABASE IF NOT EXISTS hotel_management
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE hotel_management;

-- ============================================================
--  1. HOTELS
-- ============================================================
CREATE TABLE IF NOT EXISTS Hotels (
    hotel_id      INT AUTO_INCREMENT PRIMARY KEY,
    name          VARCHAR(150)  NOT NULL,
    location      VARCHAR(255)  NOT NULL,
    rating        DECIMAL(2,1)  DEFAULT 0.0,
    description   TEXT,
    created_at    TIMESTAMP     DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
--  2. GUESTS
-- ============================================================
CREATE TABLE IF NOT EXISTS Guests (
    guest_id      INT AUTO_INCREMENT PRIMARY KEY,
    full_name     VARCHAR(150)  NOT NULL,
    email         VARCHAR(150)  NOT NULL UNIQUE,
    phone         VARCHAR(20),
    nationality   VARCHAR(80),
    created_at    TIMESTAMP     DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
--  3. ROOMS
-- ============================================================
CREATE TABLE IF NOT EXISTS Rooms (
    room_id         INT AUTO_INCREMENT PRIMARY KEY,
    hotel_id        INT           NOT NULL,
    room_number     VARCHAR(10)   NOT NULL,
    type            ENUM('single','double','suite','deluxe') NOT NULL,
    price_per_night DECIMAL(10,2) NOT NULL,
    status          ENUM('available','occupied','maintenance') DEFAULT 'available',
    created_at      TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (hotel_id) REFERENCES Hotels(hotel_id) ON DELETE CASCADE
);

-- ============================================================
--  4. BOOKINGS
-- ============================================================
CREATE TABLE IF NOT EXISTS Bookings (
    booking_id     INT AUTO_INCREMENT PRIMARY KEY,
    guest_id       INT  NOT NULL,
    room_id        INT  NOT NULL,
    check_in_date  DATE NOT NULL,
    check_out_date DATE NOT NULL,
    status         ENUM('pending','confirmed','cancelled','completed') DEFAULT 'pending',
    created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (guest_id) REFERENCES Guests(guest_id) ON DELETE CASCADE,
    FOREIGN KEY (room_id)  REFERENCES Rooms(room_id)   ON DELETE CASCADE
);

-- ============================================================
--  5. PAYMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS Payments (
    payment_id   INT AUTO_INCREMENT PRIMARY KEY,
    booking_id   INT           NOT NULL,
    amount       DECIMAL(10,2) NOT NULL,
    method       ENUM('cash','card','online','bank_transfer') NOT NULL,
    payment_date TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES Bookings(booking_id) ON DELETE CASCADE
);

-- ============================================================
--  6. REVIEWS
-- ============================================================
CREATE TABLE IF NOT EXISTS Reviews (
    review_id       INT AUTO_INCREMENT PRIMARY KEY,
    guest_id        INT      NOT NULL,
    hotel_id        INT      NOT NULL,
    rating          TINYINT  NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment         TEXT,
    sentiment_score DECIMAL(3,2) DEFAULT 0.00,
    created_at      TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (guest_id) REFERENCES Guests(guest_id) ON DELETE CASCADE,
    FOREIGN KEY (hotel_id) REFERENCES Hotels(hotel_id) ON DELETE CASCADE
);

-- ============================================================
--  7. ROOM FEATURES
-- ============================================================
CREATE TABLE IF NOT EXISTS RoomFeatures (
    feature_id   INT AUTO_INCREMENT PRIMARY KEY,
    room_id      INT          NOT NULL,
    feature_name VARCHAR(100) NOT NULL,
    FOREIGN KEY (room_id) REFERENCES Rooms(room_id) ON DELETE CASCADE
);

-- ============================================================
--  8. ANALYTICS
-- ============================================================
CREATE TABLE IF NOT EXISTS Analytics (
    analytics_id               INT AUTO_INCREMENT PRIMARY KEY,
    hotel_id                   INT           NOT NULL,
    occupancy_rate             DECIMAL(5,2)  DEFAULT 0.00,
    avg_daily_rate             DECIMAL(10,2) DEFAULT 0.00,
    revenue_per_available_room DECIMAL(10,2) DEFAULT 0.00,
    recorded_at                TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (hotel_id) REFERENCES Hotels(hotel_id) ON DELETE CASCADE
);

-- ============================================================
--  9. ADMIN
-- ============================================================
CREATE TABLE IF NOT EXISTS Admin (
    admin_id   INT AUTO_INCREMENT PRIMARY KEY,
    username   VARCHAR(80)  NOT NULL UNIQUE,
    password   VARCHAR(255) NOT NULL,
    role       ENUM('superadmin','manager','staff') DEFAULT 'staff',
    created_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
--  DEFAULT SUPERADMIN (password: admin123)
-- ============================================================
INSERT INTO Admin (username, password, role)
VALUES ('superadmin', MD5('admin123'), 'superadmin')
ON DUPLICATE KEY UPDATE admin_id = admin_id;
