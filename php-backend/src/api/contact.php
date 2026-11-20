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
            $contact = new Contact();
            $result = $contact->get();
            echo json_encode(['success' => true, 'data' => $result]);
            break;

        case 'PATCH':
            // column => max length; null means TEXT (65,535 bytes)
            $fields = [
                'header' => 255,
                'email' => 255,
                'phone' => 255,
                'github_url' => 255,
                'linkedin_url' => 255,
                'description' => null,
            ];

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
                if ($field === 'email' && !filter_var($value, FILTER_VALIDATE_EMAIL)) {
                    throw new InvalidArgumentException("email is not a valid email address.");
                }
                if (in_array($field, ['github_url', 'linkedin_url'], true)
                    && (!filter_var($value, FILTER_VALIDATE_URL) || !preg_match('#^https?://#i', $value))) {
                    throw new InvalidArgumentException("$field must be a valid http(s) URL.");
                }
                $changes[$field] = $value;
            }

            $contact = new Contact();
            $current = $contact->get();
            if (!$current) {
                http_response_code(404);
                echo json_encode(['success' => false, 'error' => 'The contact row does not exist yet.']);
                break;
            }

            $row = array_merge($current, $changes);
            $contact->update($row['header'], $row['email'], $row['phone'], $row['github_url'], $row['linkedin_url'], $row['description']);
            echo json_encode(['success' => true, 'data' => $contact->get()]);
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
