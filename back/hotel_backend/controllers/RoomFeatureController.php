<?php
// ============================================================
//  controllers/RoomFeatureController.php
// ============================================================

require_once __DIR__ . '/../models/RoomFeature.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';
require_once __DIR__ . '/../utils/Response.php';

class RoomFeatureController {

    // GET /room-features
    public function index(): void {
        AuthMiddleware::handle();
        Response::success((new RoomFeature())->getAll());
    }

    // GET /room-features/{id}
    public function show(int $id): void {
        AuthMiddleware::handle();
        $feature = (new RoomFeature())->getById($id);
        if (!$feature) Response::notFound("RoomFeature #$id not found.");
        Response::success($feature);
    }

    // GET /room-features/room/{room_id}
    public function byRoom(int $room_id): void {
        AuthMiddleware::handle();
        Response::success((new RoomFeature())->getByRoom($room_id));
    }

    // POST /room-features
    public function store(): void {
        AuthMiddleware::requireRole('manager');
        $body = json_decode(file_get_contents('php://input'), true) ?? [];

        $room_id      = (int)($body['room_id']      ?? 0);
        $feature_name = trim($body['feature_name']  ?? '');

        if (!$room_id || empty($feature_name)) {
            Response::error('room_id and feature_name are required.');
        }

        $id = (new RoomFeature())->create($room_id, $feature_name);
        Response::success(['feature_id' => $id], 'Room feature added.', 201);
    }

    // PUT /room-features/{id}
    public function update(int $id): void {
        AuthMiddleware::requireRole('manager');
        $body         = json_decode(file_get_contents('php://input'), true) ?? [];
        $feature_name = trim($body['feature_name'] ?? '');

        if (empty($feature_name)) Response::error('feature_name is required.');

        $model = new RoomFeature();
        if (!$model->getById($id)) Response::notFound("RoomFeature #$id not found.");
        $model->update($id, $feature_name);
        Response::success(null, 'Room feature updated.');
    }

    // DELETE /room-features/{id}
    public function destroy(int $id): void {
        AuthMiddleware::requireRole('manager');
        $model = new RoomFeature();
        if (!$model->getById($id)) Response::notFound("RoomFeature #$id not found.");
        $model->delete($id);
        Response::success(null, 'Room feature deleted.');
    }
}
