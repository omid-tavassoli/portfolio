<?php
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../AutoLoader.php';
header('Content-Type: application/json');


if (Auth::checkAdminSession() === false) {
    http_response_code(403);
    echo json_encode(['error' => 'Forbidden']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    exit;
}

// public address of this backend, e.g. APP_URL=https://api.omidtavassoli.dev
try {
    $baseUrl = rtrim(EnvUtil::getEnv('APP_URL'), '/');
} catch (Exception $e) {
    error_log('upload-image: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Could not save the image, please try again.']);
    exit;
}

if (!isset($_FILES['image']) || $_FILES['image']['error'] !== UPLOAD_ERR_OK) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'No valid image uploaded']);
    exit;
}

$file = $_FILES['image'];

$allowedTypes = ['image/jpeg' => 'jpg', 'image/png' => 'png', 'image/webp' => 'webp'];
$mimeType = mime_content_type($file['tmp_name']);

if (!isset($allowedTypes[$mimeType])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Only JPG, PNG, or WEBP images are allowed']);
    exit;
}

$maxSize = 5 * 1024 * 1024; // 5MB
if ($file['size'] > $maxSize) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Image must be under 5MB']);
    exit;
}

$extension = $allowedTypes[$mimeType];
$filename = bin2hex(random_bytes(16)) . '.' . $extension;
$uploadDir = __DIR__ . '/../uploads/projects/';

if (!is_dir($uploadDir) && !@mkdir($uploadDir, 0755, true) && !is_dir($uploadDir)) {
    error_log("upload-image: could not create upload directory $uploadDir");
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Could not save the image, please try again.']);
    exit;
}

if (!@move_uploaded_file($file['tmp_name'], $uploadDir . $filename)) {
    error_log("upload-image: could not move uploaded file to $uploadDir$filename");
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Could not save the image, please try again.']);
    exit;
}

echo json_encode([
    'success' => true,
    'image_url' => $baseUrl . '/uploads/projects/' . $filename
]);