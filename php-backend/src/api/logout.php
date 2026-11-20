<?php
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../AutoLoader.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method Not Allowed']);
    exit;
}

try {
    Auth::logOutAdmin();

    echo json_encode(['message' => 'Logout successful']);

} catch (InvalidArgumentException $e) {
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);

} catch (Throwable $e) {
    error_log($e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Something went wrong, please try again.']);
}

?>
