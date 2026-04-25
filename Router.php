<?php
// ============================================================
//  routes/Router.php
//  Minimal, dependency-free HTTP router
// ============================================================

class Router {
    private array $routes = [];

    // ── Registration helpers ──────────────────────────────────
    public function get(string $pattern, callable $handler): void {
        $this->add('GET', $pattern, $handler);
    }
    public function post(string $pattern, callable $handler): void {
        $this->add('POST', $pattern, $handler);
    }
    public function put(string $pattern, callable $handler): void {
        $this->add('PUT', $pattern, $handler);
    }
    public function patch(string $pattern, callable $handler): void {
        $this->add('PATCH', $pattern, $handler);
    }
    public function delete(string $pattern, callable $handler): void {
        $this->add('DELETE', $pattern, $handler);
    }

    private function add(string $method, string $pattern, callable $handler): void {
        // Convert :param tokens → named capture groups
        $regex = preg_replace('/:([a-zA-Z_]+)/', '(?P<$1>[^/]+)', $pattern);
        $this->routes[] = [
            'method'  => $method,
            'regex'   => "#^{$regex}$#",
            'handler' => $handler,
        ];
    }

    // ── Dispatch ─────────────────────────────────────────────
    public function dispatch(string $method, string $uri): void {
        // Strip query string
        $path = parse_url($uri, PHP_URL_PATH);
        // Remove script directory prefix (useful when API sits in a sub-folder)
        $base = rtrim(dirname($_SERVER['SCRIPT_NAME']), '/');
        if ($base && str_starts_with($path, $base)) {
            $path = substr($path, strlen($base));
        }
        $path = '/' . ltrim($path, '/');

        foreach ($this->routes as $route) {
            if ($route['method'] !== strtoupper($method)) continue;
            if (preg_match($route['regex'], $path, $matches)) {
                // Collect only named captures (the int-keyed ones are duplicates)
                $params = array_filter(
                    $matches,
                    fn($k) => !is_int($k),
                    ARRAY_FILTER_USE_KEY
                );
                // Cast numeric-looking params to int
                $params = array_map(
                    fn($v) => ctype_digit($v) ? (int)$v : $v,
                    $params
                );
                call_user_func_array($route['handler'], array_values($params));
                return;
            }
        }

        // 404
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Route not found.']);
    }
}
