<?php
// ============================================================
//  controllers/RoomController.php
// ============================================================

require_once __DIR__ . '/../models/Room.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';
require_once __DIR__ . '/../utils/Response.php';

class RoomController {

    // GET /rooms
    public function index(): void {
        AuthMiddleware::handle();
        Response::success((new Room())->getAll());
    }

    // GET /rooms/available
    public function available(): void {
        AuthMiddleware::handle();
        Response::success((new Room())->getAvailable());
    }

    // GET /rooms/{id}
    public function show(int $id): void {
        AuthMiddleware::handle();
        $room = (new Room())->getById($id);
        if (!$room) Response::notFound("Room #$id not found.");
        Response::success($room);
    }

    // POST /rooms
    public function store(): void {
        AuthMiddleware::requireRole('manager');
        $body = json_decode(file_get_contents('php://input'), true) ?? [];

        $hotel_id       = (int)($body['hotel_id']        ?? 0);
        $room_number    = trim($body['room_number']       ?? '');
        $type           = trim($body['type']              ?? '');
        $price_per_night= (float)($body['price_per_night']?? 0);
        $status         = trim($body['status']            ?? 'available');

        if (!$hotel_id || empty($room_number) || empty($type) || $price_per_night <= 0) {
            Response::error('hotel_id, room_number, type and price_per_night are required.');
        }

        $validTypes   = ['single','double','suite','deluxe'];
        $validStatuses= ['available','occupied','maintenance'];
        if (!in_array($type, $validTypes))    Response::error("Invalid type. Allowed: " . implode(', ', $validTypes));
        if (!in_array($status, $validStatuses)) Response::error("Invalid status.");

        $id = (new Room())->create($hotel_id, $room_number, $type, $price_per_night, $status);
        Response::success(['room_id' => $id], 'Room created.', 201);
    }

    // PATCH /rooms/{id}/status
    public function updateStatus(int $id): void {
        AuthMiddleware::handle();
        $body   = json_decode(file_get_contents('php://input'), true) ?? [];
        $status = trim($body['status'] ?? '');
        $valid  = ['available','occupied','maintenance'];
        if (!in_array($status, $valid)) Response::error("status must be one of: " . implode(', ', $valid));

        $model = new Room();
        if (!$model->getById($id)) Response::notFound("Room #$id not found.");
        $model->updateStatus($id, $status);
        Response::success(null, 'Room status updated.');
    }

    // PUT /rooms/{id}
    public function update(int $id): void {
        AuthMiddleware::requireRole('manager');
        $body  = json_decode(file_get_contents('php://input'), true) ?? [];
        $model = new Room();
        if (!$model->getById($id)) Response::notFound("Room #$id not found.");

        $fields = array_filter([
            'hotel_id'        => isset($body['hotel_id'])        ? (int)$body['hotel_id']         : null,
            'room_number'     => $body['room_number']     ?? null,
            'type'            => $body['type']            ?? null,
            'price_per_night' => isset($body['price_per_night'])  ? (float)$body['price_per_night'] : null,
            'status'          => $body['status']          ?? null,
        ], fn($v) => $v !== null);

        if (empty($fields)) Response::error('No valid fields to update.');
        $model->update($id, $fields);
        Response::success(null, 'Room updated.');
    }

    // DELETE /rooms/{id}
    public function destroy(int $id): void {
        AuthMiddleware::requireRole('manager');
        $model = new Room();
        if (!$model->getById($id)) Response::notFound("Room #$id not found.");
        $model->delete($id);
        Response::success(null, 'Room deleted.');
    }
}
