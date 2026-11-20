<?php
// each skill is a row in the skills table with a header and a skill; skills are only created and deleted, never edited
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../AutoLoader.php';

header('Content-Type: application/json');

$input = json_decode(file_get_contents('php://input'), true);

if (Auth::checkAdminSession() === false) {
    http_response_code(403);
    echo json_encode(['error' => 'Forbidden']);
    exit;
}

function skillValues($input): array {
    if (!is_array($input)) {
        throw new InvalidArgumentException("Request body must be a JSON object with header and skill.");
    }
    $unknown = array_diff(array_keys($input), ['header', 'skill']);
    if ($unknown) {
        throw new InvalidArgumentException("Unknown field(s): " . implode(', ', $unknown) . ".");
    }

    $values = [];
    foreach (['header', 'skill'] as $field) {
        $value = $input[$field] ?? null;
        if (!is_string($value) || trim($value) === '') {
            throw new InvalidArgumentException("$field must be a non-empty string.");
        }
        $value = trim($value);
        if (mb_strlen($value) > 255) {
            throw new InvalidArgumentException("$field is too long (max 255).");
        }
        $values[$field] = $value;
    }
    if (!in_array($values['header'], Skills::HEADERS, true)) {
        throw new InvalidArgumentException("header must be one of: " . implode(', ', Skills::HEADERS) . ".");
    }
    return $values;
}

try {
    switch ($_SERVER['REQUEST_METHOD']) {
        case 'GET':
            $skills = new Skills();
            echo json_encode(['success' => true, 'data' => $skills->get(), 'headers' => Skills::HEADERS]);
            break;

        case 'POST':
            $values = skillValues($input);
            $skills = new Skills();
            if ($skills->skillExists($values['header'], $values['skill'])) {
                http_response_code(409);
                echo json_encode(['success' => false, 'error' => "Skill \"{$values['skill']}\" already exists under \"{$values['header']}\"."]);
                break;
            }
            $id = $skills->create($values['header'], $values['skill']);
            http_response_code(201);
            echo json_encode(['success' => true, 'data' => $skills->find($id)]);
            break;

        case 'DELETE':
            $values = skillValues($input);
            $skills = new Skills();
            if (!$skills->skillExists($values['header'], $values['skill'])) {
                http_response_code(404);
                echo json_encode(['success' => false, 'error' => "Skill \"{$values['skill']}\" does not exist under \"{$values['header']}\"."]);
                break;
            }
            $skills->delete($values['header'], $values['skill']);
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
