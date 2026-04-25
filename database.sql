-- إنشاء قاعدة البيانات (اختياري، يمكنك إنشاؤها يدوياً)
CREATE DATABASE IF NOT EXISTS hotel_management;
USE hotel_management;

-- جدول المستخدمين (ينشأ بواسطة AuthController تلقائياً، لكن وجد للتوثيق)
CREATE TABLE IF NOT EXISTS users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255),
    role ENUM('guest','owner','admin') DEFAULT 'guest',
    initials VARCHAR(10),
    hotel_name VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- جدول الفنادق
CREATE TABLE IF NOT EXISTS hotels (
    hotel_id INT AUTO_INCREMENT PRIMARY KEY,
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
);

-- جدول الحجوزات
CREATE TABLE IF NOT EXISTS bookings (
    booking_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    hotel_id INT NOT NULL,
    hotel_name VARCHAR(200),
    check_in DATE NOT NULL,
    check_out DATE NOT NULL,
    rooms INT DEFAULT 1,
    guests INT DEFAULT 2,
    total_price DECIMAL(10,2) NOT NULL,
    status ENUM('pending','confirmed','cancelled') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- جدول خصائص المالك
CREATE TABLE IF NOT EXISTS owner_properties (
    property_id INT AUTO_INCREMENT PRIMARY KEY,
    owner_id INT NOT NULL,
    name VARCHAR(200) NOT NULL,
    city VARCHAR(100),
    country VARCHAR(100),
    stars INT DEFAULT 5,
    rooms INT DEFAULT 10,
    price_from DECIMAL(10,2),
    description TEXT,
    amenities TEXT,
    status ENUM('pending','approved','rejected') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- جدول تحليلات المالك
CREATE TABLE IF NOT EXISTS owner_analytics (
    id INT AUTO_INCREMENT PRIMARY KEY,
    owner_id INT NOT NULL,
    total_bookings INT DEFAULT 0,
    total_revenue DECIMAL(12,2) DEFAULT 0,
    occupancy_rate DECIMAL(5,2) DEFAULT 0,
    month_year DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- جدول محادثات الذكاء الاصطناعي
CREATE TABLE IF NOT EXISTS ai_conversations (
    conversation_id INT AUTO_INCREMENT PRIMARY KEY,
    session_id VARCHAR(100),
    user_message TEXT,
    ai_response TEXT,
    extracted_city VARCHAR(100),
    extracted_budget INT,
    extracted_rooms INT,
    extracted_children INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
