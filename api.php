<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

require_once 'Database.php';
require_once 'Response.php';
require_once 'AuthMiddleware.php';
require_once 'JwtHelper.php';

$route = $_GET['route'] ?? '';
$method = $_SERVER['REQUEST_METHOD'];

// Auth
if ($route === 'auth/login' && $method === 'POST') {
    require_once 'AuthController.php';
    (new AuthController())->login();
    exit;
}
if ($route === 'auth/register' && $method === 'POST') {
    require_once 'AuthController.php';
    (new AuthController())->register();
    exit;
}

// Hotels
if ($route === 'hotels' && $method === 'GET') {
    require_once 'HotelsController.php';
    (new HotelsController())->getAll();
    exit;
}
if (preg_match('#^hotels/(\d+)$#', $route, $m) && $method === 'GET') {
    require_once 'HotelsController.php';
    (new HotelsController())->getById((int)$m[1]);
    exit;
}

// Bookings
if ($route === 'bookings' && $method === 'POST') {
    require_once 'BookingsController.php';
    (new BookingsController())->create();
    exit;
}
if ($route === 'bookings' && $method === 'GET') {
    require_once 'BookingsController.php';
    (new BookingsController())->getUserBookings();
    exit;
}

// Owner Properties
if ($route === 'owner/properties' && $method === 'GET') {
    require_once 'OwnerPropertiesController.php';
    (new OwnerPropertiesController())->getAll();
    exit;
}
if ($route === 'owner/properties' && $method === 'POST') {
    require_once 'OwnerPropertiesController.php';
    (new OwnerPropertiesController())->create();
    exit;
}
if (preg_match('#^owner/properties/(\d+)$#', $route, $m) && $method === 'PUT') {
    require_once 'OwnerPropertiesController.php';
    (new OwnerPropertiesController())->update((int)$m[1]);
    exit;
}
if (preg_match('#^owner/properties/(\d+)$#', $route, $m) && $method === 'DELETE') {
    require_once 'OwnerPropertiesController.php';
    (new OwnerPropertiesController())->delete((int)$m[1]);
    exit;
}

// Analytics
if ($route === 'analytics/dashboard' && $method === 'GET') {
    require_once 'AnalyticsController.php';
    (new AnalyticsController())->getDashboard();
    exit;
}

// AI Concierge (اختياري – لن يُستخدم لأن app.js يتصل مباشرة بـ Groq)
if ($route === 'ai/concierge' && $method === 'POST') {
    require_once 'AIConciergeController.php';
    (new AIConciergeController())->chat();
    exit;
}

Response::notFound('API endpoint not found');
