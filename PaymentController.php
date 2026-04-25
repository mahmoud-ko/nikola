<?php
// ============================================================
//  controllers/PaymentController.php
// ============================================================

require_once __DIR__ . '/Payment.php';
require_once __DIR__ . '/AuthMiddleware.php';
require_once __DIR__ . '/Response.php';

class PaymentController {

    // GET /payments
    public function index(): void {
        AuthMiddleware::handle();
        Response::success((new Payment())->getAll());
    }

    // GET /payments/{id}
    public function show(int $id): void {
        AuthMiddleware::handle();
        $payment = (new Payment())->getById($id);
        if (!$payment) Response::notFound("Payment #$id not found.");
        Response::success($payment);
    }

    // GET /payments/booking/{booking_id}
    public function byBooking(int $booking_id): void {
        AuthMiddleware::handle();
        Response::success((new Payment())->getByBooking($booking_id));
    }

    // POST /payments
    public function store(): void {
        AuthMiddleware::handle();
        $body = json_decode(file_get_contents('php://input'), true) ?? [];

        $booking_id = (int)($body['booking_id'] ?? 0);
        $amount     = (float)($body['amount']   ?? 0);
        $method     = trim($body['method']      ?? '');

        if (!$booking_id || $amount <= 0 || empty($method)) {
            Response::error('booking_id, amount, and method are required.');
        }

        $validMethods = ['cash','card','online','bank_transfer'];
        if (!in_array($method, $validMethods)) {
            Response::error('method must be one of: ' . implode(', ', $validMethods));
        }

        $id = (new Payment())->create($booking_id, $amount, $method);
        Response::success(['payment_id' => $id], 'Payment recorded.', 201);
    }

    // PATCH /payments/{id}/method
    public function updateMethod(int $id): void {
        AuthMiddleware::requireRole('manager');
        $body   = json_decode(file_get_contents('php://input'), true) ?? [];
        $method = trim($body['method'] ?? '');
        $valid  = ['cash','card','online','bank_transfer'];
        if (!in_array($method, $valid)) {
            Response::error('method must be one of: ' . implode(', ', $valid));
        }

        $model = new Payment();
        if (!$model->getById($id)) Response::notFound("Payment #$id not found.");
        $model->updateMethod($id, $method);
        Response::success(null, 'Payment method updated.');
    }

    // DELETE /payments/{id}
    public function destroy(int $id): void {
        AuthMiddleware::requireRole('superadmin');
        $model = new Payment();
        if (!$model->getById($id)) Response::notFound("Payment #$id not found.");
        $model->delete($id);
        Response::success(null, 'Payment deleted.');
    }
}
