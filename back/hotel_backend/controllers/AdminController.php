<?php
// ============================================================
//  controllers/AdminController.php
// ============================================================

require_once __DIR__ . '/../models/AdminUser.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';
require_once __DIR__ . '/../utils/Response.php';

class AdminController {

    // GET /admins
    public function index(): void {
        AuthMiddleware::requireRole('superadmin');
        Response::success((new AdminUser())->getAll());
    }

    // GET /admins/{id}
    public function show(int $id): void {
        AuthMiddleware::requireRole('superadmin');
        $admin = (new AdminUser())->getById($id);
        if (!$admin) Response::notFound("Admin #$id not found.");
        Response::success($admin);
    }

    // POST /admins
    public function store(): void {
        AuthMiddleware::requireRole('superadmin');
        $body = json_decode(file_get_contents('php://input'), true) ?? [];

        $username = trim($body['username'] ?? '');
        $password = $body['password']      ?? '';
        $role     = trim($body['role']     ?? 'staff');

        if (empty($username) || empty($password)) {
            Response::error('username and password are required.');
        }

        $validRoles = ['superadmin','manager','staff'];
        if (!in_array($role, $validRoles)) {
            Response::error('role must be one of: ' . implode(', ', $validRoles));
        }

        $model = new AdminUser();
        if ($model->getByUsername($username)) {
            Response::error('Username already taken.', 409);
        }

        $id = $model->create($username, $password, $role);
        Response::success(['admin_id' => $id], 'Admin created.', 201);
    }

    // PATCH /admins/{id}/role
    public function updateRole(int $id): void {
        AuthMiddleware::requireRole('superadmin');
        $body = json_decode(file_get_contents('php://input'), true) ?? [];
        $role = trim($body['role'] ?? '');
        $valid = ['superadmin','manager','staff'];
        if (!in_array($role, $valid)) {
            Response::error('role must be one of: ' . implode(', ', $valid));
        }

        $model = new AdminUser();
        if (!$model->getById($id)) Response::notFound("Admin #$id not found.");
        $model->updateRole($id, $role);
        Response::success(null, 'Admin role updated.');
    }

    // PATCH /admins/{id}/password
    public function updatePassword(int $id): void {
        $caller = AuthMiddleware::requireRole('manager');
        // Managers can only change their own password; superadmin can change anyone's
        if ($caller['role'] !== 'superadmin' && $caller['admin_id'] !== $id) {
            Response::forbidden('You can only change your own password.');
        }

        $body     = json_decode(file_get_contents('php://input'), true) ?? [];
        $password = $body['password'] ?? '';
        if (strlen($password) < 6) Response::error('Password must be at least 6 characters.');

        $model = new AdminUser();
        if (!$model->getById($id)) Response::notFound("Admin #$id not found.");
        $model->updatePassword($id, $password);
        Response::success(null, 'Password updated.');
    }

    // DELETE /admins/{id}
    public function destroy(int $id): void {
        AuthMiddleware::requireRole('superadmin');
        $model = new AdminUser();
        if (!$model->getById($id)) Response::notFound("Admin #$id not found.");
        $model->delete($id);
        Response::success(null, 'Admin deleted.');
    }
}
