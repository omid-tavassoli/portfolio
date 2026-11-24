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
            $currently = new Currently();
            echo json_encode(['success' => true, 'data' => $currently->get()]);
            break;

        case 'PATCH':
            // text columns are VARCHAR(255); available is BOOLEAN
            $textFields = ['status', 'location', 'degree', 'focus'];
            $fields = [...$textFields, 'available'];

            if (!is_array($input) || $input === []) {
                throw new InvalidArgumentException("Send at least one field to update: " . implode(', ', $fields) . ".");
            }
            $unknown = array_diff(array_keys($input), $fields);
            if ($unknown) {
                throw new InvalidArgumentException("Unknown field(s): " . implode(', ', $unknown) . ".");
            }

            $changes = [];
            foreach ($input as $field => $value) {
                if ($field === 'available') {
                    if (!is_bool($value)) {
                        throw new InvalidArgumentException("available must be true or false.");
                    }
                    $changes[$field] = $value;
                    continue;
                }
                if (!is_string($value) || trim($value) === '') {
                    throw new InvalidArgumentException("$field must be a non-empty string.");
                }
                $value = trim($value);
                if (mb_strlen($value) > 255) {
                    throw new InvalidArgumentException("$field is too long (max 255).");
                }
                $changes[$field] = $value;
            }

            $currently = new Currently();
            $current = $currently->get();
            if (!$current) {
                http_response_code(404);
                echo json_encode(['success' => false, 'error' => 'The currently row does not exist yet.']);
                break;
            }

            $row = array_merge($current, $changes);
            $currently->update($row['status'], $row['available'], $row['location'], $row['degree'], $row['focus']);
            echo json_encode(['success' => true, 'data' => $currently->get()]);
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
