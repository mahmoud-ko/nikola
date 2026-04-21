<?php
// ============================================================
//  controllers/AuthController.php
// ============================================================

require_once __DIR__ . '/../models/AdminUser.php';
require_once __DIR__ . '/../utils/JwtHelper.php';
require_once __DIR__ . '/../utils/Response.php';

class AuthController {

    // POST /auth/login
    public function login(): void {
        $body = json_decode(file_get_contents('php://input'), true) ?? [];

        $username = trim($body['username'] ?? '');
        $password = $body['password'] ?? '';

        if (empty($username) || empty($password)) {
            Response::error('username and password are required.');
        }

        $model = new AdminUser();
        $admin = $model->verifyCredentials($username, $password);
        if (!$admin) {
            Response::unauthorized('Invalid credentials.');
        }

        $token = JwtHelper::encode([
            'admin_id' => $admin['admin_id'],
            'username' => $admin['username'],
            'role'     => $admin['role'],
        ]);

        Response::success(['token' => $token, 'admin' => $admin], 'Login successful.');
    }
}
