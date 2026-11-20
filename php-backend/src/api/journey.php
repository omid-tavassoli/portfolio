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

// column => max length (null = TEXT, 65,535 bytes); every column is NOT NULL
const JOURNEY_FIELDS = [
    'type'        => 255,
    'timeline'    => 255,
    'title'       => 255,
    'institution' => 255,
    'description' => null,
];

function journeyId($input): int {
    $id = is_array($input) ? ($input['id'] ?? null) : null;
    if (is_string($id) && ctype_digit($id)) {
        $id = (int) $id;
    }
    if (!is_int($id) || $id <= 0) {
        throw new InvalidArgumentException("id must be a positive whole number.");
    }
    return $id;
}

function journeyFields(array $input): array {
    $unknown = array_diff(array_keys($input), array_keys(JOURNEY_FIELDS), ['id']);
    if ($unknown) {
        throw new InvalidArgumentException("Unknown field(s): " . implode(', ', $unknown) . ".");
    }

    $values = [];
    foreach (JOURNEY_FIELDS as $field => $max) {
        if (!array_key_exists($field, $input)) {
            continue;
        }
        $value = $input[$field];
        if (!is_string($value) || trim($value) === '') {
            throw new InvalidArgumentException("$field must be a non-empty string.");
        }
        $value = trim($value);
        if ($max === null ? strlen($value) > 65535 : mb_strlen($value) > $max) {
            throw new InvalidArgumentException("$field is too long (max " . ($max ?? '65535 bytes') . ").");
        }
        if ($field === 'type' && !in_array($value, Journey::TYPES, true)) {
            throw new InvalidArgumentException("type must be one of: " . implode(', ', Journey::TYPES) . ".");
        }
        $values[$field] = $value;
    }
    return $values;
}

function notFound(int $id): void {
    http_response_code(404);
    echo json_encode(['success' => false, 'error' => "Journey entry $id does not exist."]);
}

try {
    switch ($_SERVER['REQUEST_METHOD']) {
        case 'GET':
            $journey = new Journey();
            echo json_encode(['success' => true, 'data' => $journey->get(), 'types' => Journey::TYPES]);
            break;

        case 'POST':
            if (!is_array($input)) {
                throw new InvalidArgumentException("Request body must be a JSON object.");
            }
            $values = journeyFields($input);
            $missing = array_diff(array_keys(JOURNEY_FIELDS), array_keys($values));
            if ($missing) {
                throw new InvalidArgumentException("Missing field(s): " . implode(', ', $missing) . ".");
            }
            $journey = new Journey();
            $id = $journey->create($values['type'], $values['timeline'], $values['title'], $values['institution'], $values['description']);
            http_response_code(201);
            echo json_encode(['success' => true, 'data' => $journey->find($id)]);
            break;

        case 'PATCH':
            $id = journeyId($input);
            $changes = journeyFields($input);
            if (!$changes) {
                throw new InvalidArgumentException("Send at least one field to update: " . implode(', ', array_keys(JOURNEY_FIELDS)) . ".");
            }

            $journey = new Journey();
            $current = $journey->find($id);
            if (!$current) {
                notFound($id);
                break;
            }

            $row = array_merge($current, $changes);
            $journey->update($id, $row['type'], $row['timeline'], $row['title'], $row['institution'], $row['description']);
            echo json_encode(['success' => true, 'data' => $journey->find($id)]);
            break;

        case 'DELETE':
            $id = journeyId($input);
            $journey = new Journey();
            if (!$journey->find($id)) {
                notFound($id);
                break;
            }
            $journey->delete($id);
            echo json_encode(['success' => true]);
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
