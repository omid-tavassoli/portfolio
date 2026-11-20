<?php
// comma-separated list in .env, e.g. CORS_ORIGINS=https://portfolio.omidtavassoli.dev
$allowedOrigins = array_filter(array_map('trim', explode(',', (string) getenv('CORS_ORIGINS'))));
if (!$allowedOrigins) {
    error_log('cors: CORS_ORIGINS is not set, no browser origin is allowed');
}
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

header('Vary: Origin');
if (in_array($origin, $allowedOrigins, true)) {
    header("Access-Control-Allow-Origin: $origin");
}
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS, PATCH, DELETE');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}