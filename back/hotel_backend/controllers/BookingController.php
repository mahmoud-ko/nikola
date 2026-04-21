<?php
// ============================================================
//  controllers/BookingController.php
// ============================================================

require_once __DIR__ . '/../models/Booking.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';
require_once __DIR__ . '/../utils/Response.php';

class BookingController {

    // GET /bookings
    public function index(): void {
        AuthMiddleware::handle();
        Response::success((new Booking())->getAll());
    }

    // GET /bookings/active
    public function active(): void {
        AuthMiddleware::handle();
        Response::success((new Booking())->getActive());
    }

    // GET /bookings/{id}
    public function show(int $id): void {
        AuthMiddleware::handle();
        $booking = (new Booking())->getById($id);
        if (!$booking) Response::notFound("Booking #$id not found.");
        Response::success($booking);
    }

    // POST /bookings
    public function store(): void {
        AuthMiddleware::handle();
        $body = json_decode(file_get_contents('php://input'), true) ?? [];

        $guest_id   = (int)($body['guest_id']      ?? 0);
        $room_id    = (int)($body['room_id']        ?? 0);
        $check_in   = trim($body['check_in_date']   ?? '');
        $check_out  = trim($body['check_out_date']  ?? '');
        $status     = trim($body['status']          ?? 'pending');

        if (!$guest_id || !$room_id || empty($check_in) || empty($check_out)) {
            Response::error('guest_id, room_id, check_in_date, and check_out_date are required.');
        }
        if (strtotime($check_out) <= strtotime($check_in)) {
            Response::error('check_out_date must be after check_in_date.');
        }
        $validStatuses = ['pending','confirmed','cancelled','completed'];
        if (!in_array($status, $validStatuses)) {
            Response::error('Invalid status value.');
        }

        $id = (new Booking())->create($guest_id, $room_id, $check_in, $check_out, $status);
        Response::success(['booking_id' => $id], 'Booking created.', 201);
    }

    // PATCH /bookings/{id}/status
    public function updateStatus(int $id): void {
        AuthMiddleware::handle();
        $body   = json_decode(file_get_contents('php://input'), true) ?? [];
        $status = trim($body['status'] ?? '');
        $valid  = ['pending','confirmed','cancelled','completed'];
        if (!in_array($status, $valid)) {
            Response::error('status must be one of: ' . implode(', ', $valid));
        }

        $model = new Booking();
        if (!$model->getById($id)) Response::notFound("Booking #$id not found.");
        $model->updateStatus($id, $status);
        Response::success(null, 'Booking status updated.');
    }

    // DELETE /bookings/{id}
    public function destroy(int $id): void {
        AuthMiddleware::requireRole('manager');
        $model = new Booking();
        if (!$model->getById($id)) Response::notFound("Booking #$id not found.");
        $model->delete($id);
        Response::success(null, 'Booking deleted.');
    }
}
