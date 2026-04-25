<?php
require_once __DIR__ . '/JwtHelper.php';
require_once __DIR__ . '/Response.php';

class AuthMiddleware {
    public static function handle(): array {
        $token = self::extractToken();
        if (!$token) Response::unauthorized('No token provided');
        $payload = JwtHelper::decode($token);
        if (!$payload) Response::unauthorized('Invalid or expired token');
        return $payload;
    }

    public static function requireRole(string $role): array {
        $payload = self::handle();
        $levels  = ['guest' => 0, 'owner' => 1, 'admin' => 2];
        if (($levels[$payload['role']] ?? 0) < ($levels[$role] ?? 0)) {
            Response::forbidden("Requires '{$role}' role");
        }
        return $payload;
    }

    private static function extractToken(): ?string {
        // Try Authorization header first
        $headers = function_exists('getallheaders') ? getallheaders() : [];
        $auth    = $headers['Authorization'] ?? $headers['authorization'] ?? '';
        if (preg_match('/Bearer\s+(.+)$/i', $auth, $m)) return $m[1];

        // Try apache_request_headers fallback
        if (function_exists('apache_request_headers')) {
            $apache = apache_request_headers();
            $auth   = $apache['Authorization'] ?? $apache['authorization'] ?? '';
            if (preg_match('/Bearer\s+(.+)$/i', $auth, $m)) return $m[1];
        }

        // Try HTTP_AUTHORIZATION server variable
        $auth = $_SERVER['HTTP_AUTHORIZATION'] ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? '';
        if (preg_match('/Bearer\s+(.+)$/i', $auth, $m)) return $m[1];

        return null;
    }
}
?>
