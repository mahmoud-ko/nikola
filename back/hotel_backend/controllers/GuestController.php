<?php
// ============================================================
//  controllers/GuestController.php
// ============================================================

require_once __DIR__ . '/../models/Guest.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';
require_once __DIR__ . '/../utils/Response.php';

class GuestController {

    // GET /guests
    public function index(): void {
        AuthMiddleware::handle();
        Response::success((new Guest())->getAll());
    }

    // GET /guests/{id}
    public function show(int $id): void {
        AuthMiddleware::handle();
        $guest = (new Guest())->getById($id);
        if (!$guest) Response::notFound("Guest #$id not found.");
        Response::success($guest);
    }

    // POST /guests
    public function store(): void {
        AuthMiddleware::handle();
        $body = json_decode(file_get_contents('php://input'), true) ?? [];

        $full_name   = trim($body['full_name']   ?? '');
        $email       = trim($body['email']       ?? '');
        $phone       = trim($body['phone']       ?? '');
        $nationality = trim($body['nationality'] ?? '');

        if (empty($full_name) || empty($email)) {
            Response::error('full_name and email are required.');
        }
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            Response::error('Invalid email address.');
        }

        $model = new Guest();
        if ($model->getByEmail($email)) {
            Response::error('A guest with this email already exists.', 409);
        }

        $id = $model->create($full_name, $email, $phone, $nationality);
        Response::success(['guest_id' => $id], 'Guest created.', 201);
    }

    // PUT /guests/{id}
    public function update(int $id): void {
        AuthMiddleware::handle();
        $body = json_decode(file_get_contents('php://input'), true) ?? [];

        $model = new Guest();
        if (!$model->getById($id)) Response::notFound("Guest #$id not found.");

        $fields = array_filter([
            'full_name'   => $body['full_name']   ?? null,
            'email'       => $body['email']       ?? null,
            'phone'       => $body['phone']       ?? null,
            'nationality' => $body['nationality'] ?? null,
        ], fn($v) => $v !== null);

        if (empty($fields)) Response::error('No valid fields to update.');

        $model->update($id, $fields);
        Response::success(null, 'Guest updated.');
    }

    // DELETE /guests/{id}
    public function destroy(int $id): void {
        AuthMiddleware::requireRole('manager');
        $model = new Guest();
        if (!$model->getById($id)) Response::notFound("Guest #$id not found.");
        $model->delete($id);
        Response::success(null, 'Guest deleted.');
    }
}
