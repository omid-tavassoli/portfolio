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

// column => [max length (null = TEXT, 65,535 bytes), nullable, must be an http(s) URL]
const PROJECT_FIELDS = [
    'title'        => [255,  false, false],
    'description'  => [null, false, false],
    'technologies' => [null, false, false],
    'image_url'    => [255,  true,  true],
    'github_url'   => [255,  true,  true],
    'live_url'     => [255,  true,  true],
];

function projectId($input): int {
    $id = is_array($input) ? ($input['id'] ?? null) : null;
    if (is_string($id) && ctype_digit($id)) {
        $id = (int) $id;
    }
    if (!is_int($id) || $id <= 0) {
        throw new InvalidArgumentException("id must be a positive whole number.");
    }
    return $id;
}

function projectFields(array $input): array {
    $unknown = array_diff(array_keys($input), array_keys(PROJECT_FIELDS), ['id']);
    if ($unknown) {
        throw new InvalidArgumentException("Unknown field(s): " . implode(', ', $unknown) . ".");
    }

    $values = [];
    foreach (PROJECT_FIELDS as $field => [$max, $nullable, $isUrl]) {
        if (!array_key_exists($field, $input)) {
            continue;
        }
        $value = $input[$field];

        if ($value === null && $nullable) {
            $values[$field] = null;
            continue;
        }
        if (!is_string($value) || trim($value) === '') {
            throw new InvalidArgumentException("$field must be a non-empty string" . ($nullable ? " or null." : "."));
        }
        $value = trim($value);
        if ($max === null ? strlen($value) > 65535 : mb_strlen($value) > $max) {
            throw new InvalidArgumentException("$field is too long (max " . ($max ?? '65535 bytes') . ").");
        }
        if ($isUrl && (!filter_var($value, FILTER_VALIDATE_URL) || !preg_match('#^https?://#i', $value))) {
            throw new InvalidArgumentException("$field must be a valid http(s) URL.");
        }
        $values[$field] = $value;
    }
    return $values;
}

function notFound(int $id): void {
    http_response_code(404);
    echo json_encode(['success' => false, 'error' => "Project $id does not exist."]);
}

try {
    switch ($_SERVER['REQUEST_METHOD']) {
        case 'GET':
            $projects = new Projects();
            $result = $projects->get();
            echo json_encode(['success' => true, 'data' => $result]);
            break;

        case 'POST':
            if (!is_array($input)) {
                throw new InvalidArgumentException("Request body must be a JSON object.");
            }
            $values = projectFields($input);
            foreach (['title', 'description', 'technologies'] as $required) {
                if (!isset($values[$required])) {
                    throw new InvalidArgumentException("title, description and technologies are required.");
                }
            }
            $projects = new Projects();
            $id = $projects->create(
                $values['title'], $values['description'], $values['technologies'],
                $values['image_url'] ?? null, $values['github_url'] ?? null, $values['live_url'] ?? null
            );
            http_response_code(201);
            echo json_encode(['success' => true, 'data' => $projects->find($id)]);
            break;

        case 'PATCH':
            $id = projectId($input);
            $changes = projectFields($input);
            if (!$changes) {
                throw new InvalidArgumentException("Send at least one field to update: " . implode(', ', array_keys(PROJECT_FIELDS)) . ".");
            }

            $projects = new Projects();
            $current = $projects->find($id);
            if (!$current) {
                notFound($id);
                break;
            }

            $row = array_merge($current, $changes);
            $projects->update(
                $id, $row['title'], $row['description'], $row['technologies'],
                $row['image_url'], $row['github_url'], $row['live_url']
            );
            echo json_encode(['success' => true, 'data' => $projects->find($id)]);
            break;

        case 'DELETE':
            $id = projectId($input);
            $projects = new Projects();
            if (!$projects->find($id)) {
                notFound($id);
                break;
            }
            $projects->delete($id);
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
