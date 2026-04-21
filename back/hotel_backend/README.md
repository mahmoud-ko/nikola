# Hotel Management System — PHP REST API

## Requirements
- PHP 8.1+
- MySQL 8.0+ (or MariaDB 10.5+)
- Apache (`mod_rewrite`) **or** Nginx
- PDO + PDO_MySQL extension enabled

---

## Quick Start

### 1. Import the database
```bash
mysql -u root -p < database.sql
```

### 2. Configure the connection
Edit `config/Database.php` and set your credentials:
```php
private string $host     = 'localhost';
private string $db_name  = 'hotel_management';
private string $username = 'root';
private string $password = 'your_password';
```

### 3. Deploy
Place the entire `hotel_backend/` folder inside your web root (e.g. `htdocs/` or `/var/www/html/`).
Apache: `.htaccess` is already included.
Nginx: copy the block from `nginx.conf` into your server config.

### 4. Change the JWT secret
In `utils/JwtHelper.php`, replace:
```php
private static string $secret = 'HOTEL_SECRET_KEY_CHANGE_ME_IN_PROD';
```
with a long, random string.

---

## Authentication

All endpoints (except login) require a **Bearer token** in the `Authorization` header.

```
Authorization: Bearer <token>
```

### Role hierarchy
| Role        | Level |
|-------------|-------|
| staff       | 1     |
| manager     | 2     |
| superadmin  | 3     |

### POST /api/auth/login
```json
{ "username": "superadmin", "password": "admin123" }
```
Returns:
```json
{ "success": true, "data": { "token": "...", "admin": { ... } } }
```

---

## Endpoints

### HOTELS
| Method | Endpoint             | Role    | Description              |
|--------|----------------------|---------|--------------------------|
| GET    | /api/hotels          | staff   | List all hotels          |
| GET    | /api/hotels/:id      | staff   | Get hotel by ID          |
| POST   | /api/hotels          | manager | Create hotel             |
| PUT    | /api/hotels/:id      | manager | Update hotel             |
| DELETE | /api/hotels/:id      | superadmin | Delete hotel          |
| GET    | /api/hotels/revenue  | manager | Revenue per hotel        |
| GET    | /api/hotels/ratings  | staff   | Avg rating per hotel     |

**POST /api/hotels body:**
```json
{
  "name": "Grand Palace",
  "location": "Paris, France",
  "rating": 4.5,
  "description": "Luxury hotel in the heart of Paris."
}
```

---

### GUESTS
| Method | Endpoint          | Role    | Description        |
|--------|-------------------|---------|--------------------|
| GET    | /api/guests       | staff   | List all guests    |
| GET    | /api/guests/:id   | staff   | Get guest by ID    |
| POST   | /api/guests       | staff   | Create guest       |
| PUT    | /api/guests/:id   | staff   | Update guest       |
| DELETE | /api/guests/:id   | manager | Delete guest       |

**POST /api/guests body:**
```json
{
  "full_name": "Jane Doe",
  "email": "jane@example.com",
  "phone": "+1-555-0100",
  "nationality": "American"
}
```

---

### ROOMS
| Method | Endpoint                  | Role    | Description           |
|--------|---------------------------|---------|-----------------------|
| GET    | /api/rooms                | staff   | List all rooms        |
| GET    | /api/rooms/available      | staff   | List available rooms  |
| GET    | /api/rooms/:id            | staff   | Get room by ID        |
| POST   | /api/rooms                | manager | Create room           |
| PUT    | /api/rooms/:id            | manager | Update room           |
| PATCH  | /api/rooms/:id/status     | staff   | Update room status    |
| DELETE | /api/rooms/:id            | manager | Delete room           |

**POST /api/rooms body:**
```json
{
  "hotel_id": 1,
  "room_number": "101",
  "type": "double",
  "price_per_night": 150.00,
  "status": "available"
}
```
`type` values: `single` | `double` | `suite` | `deluxe`
`status` values: `available` | `occupied` | `maintenance`

---

### BOOKINGS
| Method | Endpoint                    | Role    | Description              |
|--------|-----------------------------|---------|--------------------------|
| GET    | /api/bookings               | staff   | List all bookings        |
| GET    | /api/bookings/active        | staff   | Active bookings only     |
| GET    | /api/bookings/:id           | staff   | Get booking by ID        |
| POST   | /api/bookings               | staff   | Create booking           |
| PATCH  | /api/bookings/:id/status    | staff   | Update booking status    |
| DELETE | /api/bookings/:id           | manager | Delete booking           |

**POST /api/bookings body:**
```json
{
  "guest_id": 1,
  "room_id": 3,
  "check_in_date": "2026-05-01",
  "check_out_date": "2026-05-05",
  "status": "pending"
}
```
`status` values: `pending` | `confirmed` | `cancelled` | `completed`

> **Note:** Confirming a booking automatically sets the room to `occupied`. Cancelling or completing sets it back to `available`.

---

### PAYMENTS
| Method | Endpoint                         | Role       | Description             |
|--------|----------------------------------|------------|-------------------------|
| GET    | /api/payments                    | staff      | List all payments       |
| GET    | /api/payments/:id                | staff      | Get payment by ID       |
| GET    | /api/payments/booking/:id        | staff      | Payments for a booking  |
| POST   | /api/payments                    | staff      | Record payment          |
| PATCH  | /api/payments/:id/method         | manager    | Update payment method   |
| DELETE | /api/payments/:id                | superadmin | Delete payment          |

**POST /api/payments body:**
```json
{
  "booking_id": 2,
  "amount": 600.00,
  "method": "card"
}
```
`method` values: `cash` | `card` | `online` | `bank_transfer`

> **Note:** Recording a payment automatically confirms the linked booking.

---

### REVIEWS
| Method | Endpoint                         | Role    | Description              |
|--------|----------------------------------|---------|--------------------------|
| GET    | /api/reviews                     | staff   | List all reviews         |
| GET    | /api/reviews/:id                 | staff   | Get review by ID         |
| GET    | /api/reviews/hotel/:hotel_id     | staff   | Reviews for a hotel      |
| POST   | /api/reviews                     | staff   | Submit review            |
| PUT    | /api/reviews/:id                 | manager | Update review            |
| PATCH  | /api/reviews/:id/sentiment       | manager | Update sentiment score   |
| DELETE | /api/reviews/:id                 | manager | Delete review            |

**POST /api/reviews body:**
```json
{
  "guest_id": 1,
  "hotel_id": 1,
  "rating": 5,
  "comment": "Outstanding service!",
  "sentiment_score": 0.95
}
```
`rating` must be between `1` and `5`.

> **Note:** Creating or deleting a review automatically recomputes the hotel's average rating.

---

### ROOM FEATURES
| Method | Endpoint                          | Role    | Description             |
|--------|-----------------------------------|---------|-------------------------|
| GET    | /api/room-features                | staff   | List all features       |
| GET    | /api/room-features/:id            | staff   | Get feature by ID       |
| GET    | /api/room-features/room/:room_id  | staff   | Features for a room     |
| POST   | /api/room-features                | manager | Add feature             |
| PUT    | /api/room-features/:id            | manager | Update feature          |
| DELETE | /api/room-features/:id            | manager | Delete feature          |

**POST /api/room-features body:**
```json
{ "room_id": 3, "feature_name": "Ocean View" }
```

---

### ANALYTICS
| Method | Endpoint                             | Role    | Description                   |
|--------|--------------------------------------|---------|-------------------------------|
| GET    | /api/analytics                       | manager | List all records              |
| GET    | /api/analytics/:id                   | manager | Get record by ID              |
| GET    | /api/analytics/hotel/:hotel_id       | manager | Records for a hotel           |
| POST   | /api/analytics                       | manager | Manual entry                  |
| POST   | /api/analytics/compute/:hotel_id     | manager | Auto-compute snapshot         |
| PUT    | /api/analytics/:id                   | manager | Update record                 |
| DELETE | /api/analytics/:id                   | superadmin | Delete record              |

**POST /api/analytics/compute/:hotel_id** — computes occupancy rate, ADR, and RevPAR from live data and saves a snapshot automatically.

---

### ADMINS
| Method | Endpoint                   | Role       | Description             |
|--------|----------------------------|------------|-------------------------|
| GET    | /api/admins                | superadmin | List all admins         |
| GET    | /api/admins/:id            | superadmin | Get admin by ID         |
| POST   | /api/admins                | superadmin | Create admin            |
| PATCH  | /api/admins/:id/role       | superadmin | Update role             |
| PATCH  | /api/admins/:id/password   | manager    | Update password         |
| DELETE | /api/admins/:id            | superadmin | Delete admin            |

---

## Standard Response Format

**Success:**
```json
{
  "success": true,
  "message": "OK",
  "data": { ... }
}
```

**Error:**
```json
{
  "success": false,
  "message": "Descriptive error message.",
  "errors": null
}
```

## HTTP Status Codes Used
| Code | Meaning                     |
|------|-----------------------------|
| 200  | OK                          |
| 201  | Created                     |
| 204  | No Content (OPTIONS)        |
| 400  | Bad Request / Validation    |
| 401  | Unauthorized (bad/no token) |
| 403  | Forbidden (insufficient role)|
| 404  | Not Found                   |
| 409  | Conflict (duplicate)        |
| 500  | Internal Server Error       |

---

## Project Structure
```
hotel_backend/
├── index.php               ← Front controller (entry point)
├── .htaccess               ← Apache URL rewriting
├── nginx.conf              ← Nginx config reference
├── database.sql            ← Full schema + default superadmin
├── config/
│   └── Database.php        ← PDO singleton
├── middleware/
│   └── AuthMiddleware.php  ← JWT guard + role check
├── utils/
│   ├── JwtHelper.php       ← HS256 JWT encode/decode
│   └── Response.php        ← Standardised JSON responses
├── models/
│   ├── Hotel.php
│   ├── Guest.php
│   ├── Room.php
│   ├── Booking.php
│   ├── Payment.php
│   ├── Review.php
│   ├── RoomFeature.php
│   ├── Analytic.php
│   └── AdminUser.php
├── controllers/
│   ├── AuthController.php
│   ├── HotelController.php
│   ├── GuestController.php
│   ├── RoomController.php
│   ├── BookingController.php
│   ├── PaymentController.php
│   ├── ReviewController.php
│   ├── RoomFeatureController.php
│   ├── AnalyticController.php
│   └── AdminController.php
└── routes/
    ├── Router.php          ← Lightweight regex router
    └── api.php             ← All route definitions
```
