<?php
// ============================================================
//  index.php  —  Front Controller / Entry Point
// ============================================================

declare(strict_types=1);

// ── Error reporting (disable in production) ──────────────────
ini_set('display_errors', '0');
error_reporting(E_ALL);

// ── CORS headers ─────────────────────────────────────────────
// Replace '*' with your actual front-end origin in production.
header('Content-Type: application/json; charset=UTF-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Pre-flight request — stop here
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// ── Bootstrap ────────────────────────────────────────────────
require_once __DIR__ . '/config/Database.php';
require_once __DIR__ . '/utils/Response.php';

// ── Load routes & dispatch ───────────────────────────────────
try {
    /** @var \Router $router */
    $router = require_once __DIR__ . '/routes/api.php';
    $router->dispatch($_SERVER['REQUEST_METHOD'], $_SERVER['REQUEST_URI']);
} catch (PDOException $e) {
    Response::error('Database error: ' . $e->getMessage(), 500);
} catch (Throwable $e) {
    Response::error('Server error: ' . $e->getMessage(), 500);
}
