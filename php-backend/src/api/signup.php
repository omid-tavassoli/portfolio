<?php
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../AutoLoader.php';

header('Content-Type: application/json');

exit("This endpoint is disabled for security reasons. Please contact the administrator to create an admin account.");

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method Not Allowed']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);

if (empty($input)) {
    http_response_code(400);
    echo json_encode(['error' => 'Bad Request']);
    exit;
}

try {
    if (empty($input['username']) ||  empty($input['email']) || empty($input['password'])) {
        throw new InvalidArgumentException("Email and password are required.");
    }

    $admin = new Admin();
    $credentials = $admin->createAdmin($input['username'] ?? '', $input['email'] ?? '', $input['password'] ?? '');

    echo json_encode(['message' => 'signup successful']);

} catch (InvalidArgumentException $e) {
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);

} catch (Throwable $e) {
    error_log($e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Something went wrong, please try again.']);
}

?>
