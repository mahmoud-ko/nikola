<?php
// ============================================================
//  routes/api.php
//  All API route definitions
// ============================================================

require_once __DIR__ . '/Router.php';

// ── Controllers ──────────────────────────────────────────────
require_once __DIR__ . '/../controllers/AuthController.php';
require_once __DIR__ . '/../controllers/HotelController.php';
require_once __DIR__ . '/../controllers/GuestController.php';
require_once __DIR__ . '/../controllers/RoomController.php';
require_once __DIR__ . '/../controllers/BookingController.php';
require_once __DIR__ . '/../controllers/PaymentController.php';
require_once __DIR__ . '/../controllers/ReviewController.php';
require_once __DIR__ . '/../controllers/RoomFeatureController.php';
require_once __DIR__ . '/../controllers/AnalyticController.php';
require_once __DIR__ . '/../controllers/AdminController.php';

$router = new Router();

// ============================================================
//  AUTH
// ============================================================
$router->post('/api/auth/login', fn() => (new AuthController())->login());

// ============================================================
//  HOTELS
// ============================================================
$router->get   ('/api/hotels',           fn() => (new HotelController())->index());
$router->post  ('/api/hotels',           fn() => (new HotelController())->store());
$router->get   ('/api/hotels/revenue',   fn() => (new HotelController())->revenue());
$router->get   ('/api/hotels/ratings',   fn() => (new HotelController())->ratings());
$router->get   ('/api/hotels/:id',       fn(int $id) => (new HotelController())->show($id));
$router->put   ('/api/hotels/:id',       fn(int $id) => (new HotelController())->update($id));
$router->delete('/api/hotels/:id',       fn(int $id) => (new HotelController())->destroy($id));

// ============================================================
//  GUESTS
// ============================================================
$router->get   ('/api/guests',      fn() => (new GuestController())->index());
$router->post  ('/api/guests',      fn() => (new GuestController())->store());
$router->get   ('/api/guests/:id',  fn(int $id) => (new GuestController())->show($id));
$router->put   ('/api/guests/:id',  fn(int $id) => (new GuestController())->update($id));
$router->delete('/api/guests/:id',  fn(int $id) => (new GuestController())->destroy($id));

// ============================================================
//  ROOMS
// ============================================================
$router->get   ('/api/rooms',               fn() => (new RoomController())->index());
$router->post  ('/api/rooms',               fn() => (new RoomController())->store());
$router->get   ('/api/rooms/available',     fn() => (new RoomController())->available());
$router->get   ('/api/rooms/:id',           fn(int $id) => (new RoomController())->show($id));
$router->put   ('/api/rooms/:id',           fn(int $id) => (new RoomController())->update($id));
$router->patch ('/api/rooms/:id/status',    fn(int $id) => (new RoomController())->updateStatus($id));
$router->delete('/api/rooms/:id',           fn(int $id) => (new RoomController())->destroy($id));

// ============================================================
//  BOOKINGS
// ============================================================
$router->get   ('/api/bookings',             fn() => (new BookingController())->index());
$router->post  ('/api/bookings',             fn() => (new BookingController())->store());
$router->get   ('/api/bookings/active',      fn() => (new BookingController())->active());
$router->get   ('/api/bookings/:id',         fn(int $id) => (new BookingController())->show($id));
$router->patch ('/api/bookings/:id/status',  fn(int $id) => (new BookingController())->updateStatus($id));
$router->delete('/api/bookings/:id',         fn(int $id) => (new BookingController())->destroy($id));

// ============================================================
//  PAYMENTS
// ============================================================
$router->get   ('/api/payments',                      fn() => (new PaymentController())->index());
$router->post  ('/api/payments',                      fn() => (new PaymentController())->store());
$router->get   ('/api/payments/:id',                  fn(int $id) => (new PaymentController())->show($id));
$router->get   ('/api/payments/booking/:booking_id',  fn(int $booking_id) => (new PaymentController())->byBooking($booking_id));
$router->patch ('/api/payments/:id/method',           fn(int $id) => (new PaymentController())->updateMethod($id));
$router->delete('/api/payments/:id',                  fn(int $id) => (new PaymentController())->destroy($id));

// ============================================================
//  REVIEWS
// ============================================================
$router->get   ('/api/reviews',                     fn() => (new ReviewController())->index());
$router->post  ('/api/reviews',                     fn() => (new ReviewController())->store());
$router->get   ('/api/reviews/:id',                 fn(int $id) => (new ReviewController())->show($id));
$router->get   ('/api/reviews/hotel/:hotel_id',     fn(int $hotel_id) => (new ReviewController())->byHotel($hotel_id));
$router->put   ('/api/reviews/:id',                 fn(int $id) => (new ReviewController())->update($id));
$router->patch ('/api/reviews/:id/sentiment',       fn(int $id) => (new ReviewController())->updateSentiment($id));
$router->delete('/api/reviews/:id',                 fn(int $id) => (new ReviewController())->destroy($id));

// ============================================================
//  ROOM FEATURES
// ============================================================
$router->get   ('/api/room-features',                 fn() => (new RoomFeatureController())->index());
$router->post  ('/api/room-features',                 fn() => (new RoomFeatureController())->store());
$router->get   ('/api/room-features/:id',             fn(int $id) => (new RoomFeatureController())->show($id));
$router->get   ('/api/room-features/room/:room_id',   fn(int $room_id) => (new RoomFeatureController())->byRoom($room_id));
$router->put   ('/api/room-features/:id',             fn(int $id) => (new RoomFeatureController())->update($id));
$router->delete('/api/room-features/:id',             fn(int $id) => (new RoomFeatureController())->destroy($id));

// ============================================================
//  ANALYTICS
// ============================================================
$router->get   ('/api/analytics',                       fn() => (new AnalyticController())->index());
$router->post  ('/api/analytics',                       fn() => (new AnalyticController())->store());
$router->get   ('/api/analytics/:id',                   fn(int $id) => (new AnalyticController())->show($id));
$router->get   ('/api/analytics/hotel/:hotel_id',       fn(int $hotel_id) => (new AnalyticController())->byHotel($hotel_id));
$router->post  ('/api/analytics/compute/:hotel_id',     fn(int $hotel_id) => (new AnalyticController())->compute($hotel_id));
$router->put   ('/api/analytics/:id',                   fn(int $id) => (new AnalyticController())->update($id));
$router->delete('/api/analytics/:id',                   fn(int $id) => (new AnalyticController())->destroy($id));

// ============================================================
//  ADMINS
// ============================================================
$router->get   ('/api/admins',                 fn() => (new AdminController())->index());
$router->post  ('/api/admins',                 fn() => (new AdminController())->store());
$router->get   ('/api/admins/:id',             fn(int $id) => (new AdminController())->show($id));
$router->patch ('/api/admins/:id/role',        fn(int $id) => (new AdminController())->updateRole($id));
$router->patch ('/api/admins/:id/password',    fn(int $id) => (new AdminController())->updatePassword($id));
$router->delete('/api/admins/:id',             fn(int $id) => (new AdminController())->destroy($id));

return $router;
