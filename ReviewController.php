<?php
// ============================================================
//  controllers/ReviewController.php
// ============================================================

require_once __DIR__ . '/Review.php';
require_once __DIR__ . '/AuthMiddleware.php';
require_once __DIR__ . '/Response.php';

class ReviewController {

    // GET /reviews
    public function index(): void {
        AuthMiddleware::handle();
        Response::success((new Review())->getAll());
    }

    // GET /reviews/{id}
    public function show(int $id): void {
        AuthMiddleware::handle();
        $review = (new Review())->getById($id);
        if (!$review) Response::notFound("Review #$id not found.");
        Response::success($review);
    }

    // GET /reviews/hotel/{hotel_id}
    public function byHotel(int $hotel_id): void {
        AuthMiddleware::handle();
        Response::success((new Review())->getByHotel($hotel_id));
    }

    // POST /reviews
    public function store(): void {
        AuthMiddleware::handle();
        $body = json_decode(file_get_contents('php://input'), true) ?? [];

        $guest_id        = (int)($body['guest_id']        ?? 0);
        $hotel_id        = (int)($body['hotel_id']        ?? 0);
        $rating          = (int)($body['rating']          ?? 0);
        $comment         = trim($body['comment']          ?? '');
        $sentiment_score = (float)($body['sentiment_score'] ?? 0.00);

        if (!$guest_id || !$hotel_id || $rating < 1 || $rating > 5) {
            Response::error('guest_id, hotel_id, and rating (1–5) are required.');
        }

        $id = (new Review())->create($guest_id, $hotel_id, $rating, $comment, $sentiment_score);
        Response::success(['review_id' => $id], 'Review submitted.', 201);
    }

    // PATCH /reviews/{id}/sentiment
    public function updateSentiment(int $id): void {
        AuthMiddleware::requireRole('manager');
        $body  = json_decode(file_get_contents('php://input'), true) ?? [];
        $score = (float)($body['sentiment_score'] ?? 0);

        $model = new Review();
        if (!$model->getById($id)) Response::notFound("Review #$id not found.");
        $model->updateSentiment($id, $score);
        Response::success(null, 'Sentiment score updated.');
    }

    // PUT /reviews/{id}
    public function update(int $id): void {
        AuthMiddleware::requireRole('manager');
        $body  = json_decode(file_get_contents('php://input'), true) ?? [];
        $model = new Review();
        if (!$model->getById($id)) Response::notFound("Review #$id not found.");

        $fields = array_filter([
            'rating'          => isset($body['rating'])          ? (int)$body['rating']            : null,
            'comment'         => $body['comment']         ?? null,
            'sentiment_score' => isset($body['sentiment_score']) ? (float)$body['sentiment_score'] : null,
        ], fn($v) => $v !== null);

        if (empty($fields)) Response::error('No valid fields to update.');
        $model->update($id, $fields);
        Response::success(null, 'Review updated.');
    }

    // DELETE /reviews/{id}
    public function destroy(int $id): void {
        AuthMiddleware::requireRole('manager');
        $model = new Review();
        if (!$model->getById($id)) Response::notFound("Review #$id not found.");
        $model->delete($id);
        Response::success(null, 'Review deleted.');
    }
}
