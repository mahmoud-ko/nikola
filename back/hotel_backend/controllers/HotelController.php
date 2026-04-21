<?php
// ============================================================
//  controllers/HotelController.php
// ============================================================

require_once __DIR__ . '/../models/Hotel.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';
require_once __DIR__ . '/../utils/Response.php';

class HotelController {

    // GET /hotels
    public function index(): void {
        AuthMiddleware::handle();
        $model = new Hotel();
        Response::success($model->getAll());
    }

    // GET /hotels/{id}
    public function show(int $id): void {
        AuthMiddleware::handle();
        $hotel = (new Hotel())->getById($id);
        if (!$hotel) Response::notFound("Hotel #$id not found.");
        Response::success($hotel);
    }

    // POST /hotels
    public function store(): void {
        AuthMiddleware::requireRole('manager');
        $body = json_decode(file_get_contents('php://input'), true) ?? [];

        $name        = trim($body['name']        ?? '');
        $location    = trim($body['location']    ?? '');
        $rating      = (float)($body['rating']   ?? 0.0);
        $description = trim($body['description'] ?? '');

        if (empty($name) || empty($location)) {
            Response::error('name and location are required.');
        }

        $id = (new Hotel())->create($name, $location, $rating, $description);
        Response::success(['hotel_id' => $id], 'Hotel created.', 201);
    }

    // PUT /hotels/{id}
    public function update(int $id): void {
        AuthMiddleware::requireRole('manager');
        $body = json_decode(file_get_contents('php://input'), true) ?? [];

        $model = new Hotel();
        if (!$model->getById($id)) Response::notFound("Hotel #$id not found.");

        $fields = array_filter([
            'name'        => $body['name']        ?? null,
            'location'    => $body['location']    ?? null,
            'rating'      => isset($body['rating'])      ? (float)$body['rating']      : null,
            'description' => $body['description'] ?? null,
        ], fn($v) => $v !== null);

        if (empty($fields)) Response::error('No valid fields to update.');

        $model->update($id, $fields);
        Response::success(null, 'Hotel updated.');
    }

    // DELETE /hotels/{id}
    public function destroy(int $id): void {
        AuthMiddleware::requireRole('superadmin');
        $model = new Hotel();
        if (!$model->getById($id)) Response::notFound("Hotel #$id not found.");
        $model->delete($id);
        Response::success(null, 'Hotel deleted.');
    }

    // GET /hotels/revenue
    public function revenue(): void {
        AuthMiddleware::requireRole('manager');
        Response::success((new Hotel())->revenueByHotel());
    }

    // GET /hotels/ratings
    public function ratings(): void {
        AuthMiddleware::handle();
        Response::success((new Hotel())->ratingSummary());
    }
}
