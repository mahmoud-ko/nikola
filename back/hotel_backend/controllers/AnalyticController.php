<?php
// ============================================================
//  controllers/AnalyticController.php
// ============================================================

require_once __DIR__ . '/../models/Analytic.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';
require_once __DIR__ . '/../utils/Response.php';

class AnalyticController {

    // GET /analytics
    public function index(): void {
        AuthMiddleware::requireRole('manager');
        Response::success((new Analytic())->getAll());
    }

    // GET /analytics/{id}
    public function show(int $id): void {
        AuthMiddleware::requireRole('manager');
        $record = (new Analytic())->getById($id);
        if (!$record) Response::notFound("Analytics record #$id not found.");
        Response::success($record);
    }

    // GET /analytics/hotel/{hotel_id}
    public function byHotel(int $hotel_id): void {
        AuthMiddleware::requireRole('manager');
        Response::success((new Analytic())->getByHotel($hotel_id));
    }

    // POST /analytics  (manual entry)
    public function store(): void {
        AuthMiddleware::requireRole('manager');
        $body = json_decode(file_get_contents('php://input'), true) ?? [];

        $hotel_id        = (int)($body['hotel_id']                   ?? 0);
        $occupancy_rate  = (float)($body['occupancy_rate']           ?? 0);
        $avg_daily_rate  = (float)($body['avg_daily_rate']           ?? 0);
        $rev_par         = (float)($body['revenue_per_available_room'] ?? 0);

        if (!$hotel_id) Response::error('hotel_id is required.');

        $id = (new Analytic())->create($hotel_id, $occupancy_rate, $avg_daily_rate, $rev_par);
        Response::success(['analytics_id' => $id], 'Analytics record created.', 201);
    }

    // POST /analytics/compute/{hotel_id}  (auto-compute snapshot)
    public function compute(int $hotel_id): void {
        AuthMiddleware::requireRole('manager');
        $id = (new Analytic())->computeAndSave($hotel_id);
        Response::success(['analytics_id' => $id], 'Analytics snapshot computed and saved.');
    }

    // PUT /analytics/{id}
    public function update(int $id): void {
        AuthMiddleware::requireRole('manager');
        $body  = json_decode(file_get_contents('php://input'), true) ?? [];
        $model = new Analytic();
        if (!$model->getById($id)) Response::notFound("Analytics record #$id not found.");

        $fields = array_filter([
            'occupancy_rate'             => isset($body['occupancy_rate'])             ? (float)$body['occupancy_rate']             : null,
            'avg_daily_rate'             => isset($body['avg_daily_rate'])             ? (float)$body['avg_daily_rate']             : null,
            'revenue_per_available_room' => isset($body['revenue_per_available_room']) ? (float)$body['revenue_per_available_room'] : null,
        ], fn($v) => $v !== null);

        if (empty($fields)) Response::error('No valid fields to update.');
        $model->update($id, $fields);
        Response::success(null, 'Analytics record updated.');
    }

    // DELETE /analytics/{id}
    public function destroy(int $id): void {
        AuthMiddleware::requireRole('superadmin');
        $model = new Analytic();
        if (!$model->getById($id)) Response::notFound("Analytics record #$id not found.");
        $model->delete($id);
        Response::success(null, 'Analytics record deleted.');
    }
}
