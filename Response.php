<?php
class Response {
    public static function json($data, int $code = 200) {
        http_response_code($code);
        echo json_encode($data, JSON_UNESCAPED_UNICODE);
        exit;
    }
    public static function success($data = null, string $message = 'OK', int $code = 200) {
        self::json(['success' => true, 'message' => $message, 'data' => $data], $code);
    }
    public static function error(string $message, int $code = 400, $errors = null) {
        self::json(['success' => false, 'message' => $message, 'errors' => $errors], $code);
    }
    public static function notFound(string $message = 'Not found') { self::error($message, 404); }
    public static function unauthorized(string $message = 'Unauthorized') { self::error($message, 401); }
    public static function forbidden(string $message = 'Forbidden') { self::error($message, 403); }
}
