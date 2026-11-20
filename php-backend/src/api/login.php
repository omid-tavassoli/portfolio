<?php
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../AutoLoader.php';

header('Content-Type: application/json');

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
    $email = is_string($input['email'] ?? null) ? strtolower(trim($input['email'])) : '';
    $password = $input['password'] ?? null;
    if ($email === '' || !is_string($password) || $password === '') {
        throw new InvalidArgumentException("Email and password are required.");
    }

    $ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
    $attempts = new LoginAttempts();

    // checked before the password is tested, so guesses during a lockout reveal nothing
    $retryAfter = $attempts->retryAfter($email, $ip);
    if ($retryAfter > 0) {
        http_response_code(429);
        header("Retry-After: $retryAfter");
        $minutes = (int) ceil($retryAfter / 60);
        echo json_encode(['success' => false, 'error' => "Too many failed login attempts. Try again in $minutes minute" . ($minutes === 1 ? '' : 's') . "."]);
        exit;
    }

    $admin = new Admin();
    try {
        $credentials = $admin->logInAdmin($email, $password);
    } catch (InvalidArgumentException $e) {
        $attempts->recordFailure($email, $ip);
        throw $e;
    }
    $attempts->clear($email, $ip);

    $email = $credentials->getEmail() ?? '';
    $adminId = $credentials->getId() ?? 0;
    Auth::logInAdmin($email, $adminId);

    echo json_encode(['message' => 'Login successful', 
    'access_token' => $_SESSION['access_token']]);

} catch (InvalidArgumentException $e) {
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);

} catch (Throwable $e) {
    error_log($e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Something went wrong, please try again.']);
}

?>
