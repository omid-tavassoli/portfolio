<?php
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../AutoLoader.php';

header('Content-Type: application/json');

$input = json_decode(file_get_contents('php://input'), true);

if (Auth::checkAdminSession() === false) {
    http_response_code(403);
    echo json_encode(['error' => 'Forbidden']);
    exit;
}

try {
    switch ($_SERVER['REQUEST_METHOD']) {
        case 'GET':
            $about = new About();
            $result = $about->get();
            echo json_encode(['success' => true, 'data' => $result]);
            break;

        case 'PATCH':
            // column => max length; null means TEXT (65,535 bytes)
            $fields = ['title' => 255, 'description' => null];

            if (!is_array($input) || $input === []) {
                throw new InvalidArgumentException("Send at least one field to update: " . implode(', ', array_keys($fields)) . ".");
            }
            $unknown = array_diff(array_keys($input), array_keys($fields));
            if ($unknown) {
                throw new InvalidArgumentException("Unknown field(s): " . implode(', ', $unknown) . ".");
            }

            $changes = [];
            foreach ($input as $field => $value) {
                if (!is_string($value) || trim($value) === '') {
                    throw new InvalidArgumentException("$field must be a non-empty string.");
                }
                $value = trim($value);
                $max = $fields[$field];
                if ($max === null ? strlen($value) > 65535 : mb_strlen($value) > $max) {
                    throw new InvalidArgumentException("$field is too long (max " . ($max ?? '65535 bytes') . ").");
                }
                $changes[$field] = $value;
            }

            $about = new About();
            $current = $about->get();
            if (!$current) {
                http_response_code(404);
                echo json_encode(['success' => false, 'error' => 'The about row does not exist yet.']);
                break;
            }

            $row = array_merge($current, $changes);
            $about->update($row['title'], $row['description']);
            echo json_encode(['success' => true, 'data' => $about->get()]);
            break;

        default:
            http_response_code(405);
            echo json_encode(['error' => 'Method Not Allowed']);
    }

} catch (InvalidArgumentException $e) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);

} catch (Throwable $e) {
    error_log($e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Something went wrong, please try again.']);
}

?>
