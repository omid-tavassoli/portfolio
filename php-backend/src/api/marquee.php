<?php
// marquee words are only added and deleted, like skills
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
            $marquee = new Marquee();
            echo json_encode(['success' => true, 'data' => $marquee->get()]);
            break;

        case 'POST':
            if (!is_array($input)) {
                throw new InvalidArgumentException("Request body must be a JSON object with label.");
            }
            $unknown = array_diff(array_keys($input), ['label']);
            if ($unknown) {
                throw new InvalidArgumentException("Unknown field(s): " . implode(', ', $unknown) . ".");
            }
            $label = $input['label'] ?? null;
            if (!is_string($label) || trim($label) === '') {
                throw new InvalidArgumentException("label must be a non-empty string.");
            }
            $label = trim($label);
            if (mb_strlen($label) > 40) {
                throw new InvalidArgumentException("label is too long (max 40).");
            }
            $marquee = new Marquee();
            if ($marquee->exists($label)) {
                http_response_code(409);
                echo json_encode(['success' => false, 'error' => "\"$label\" is already in the marquee."]);
                break;
            }
            $id = $marquee->create($label);
            http_response_code(201);
            echo json_encode(['success' => true, 'data' => $marquee->find($id)]);
            break;

        case 'DELETE':
            $id = is_array($input) ? ($input['id'] ?? null) : null;
            if (is_string($id) && ctype_digit($id)) {
                $id = (int) $id;
            }
            if (!is_int($id) || $id <= 0) {
                throw new InvalidArgumentException("id must be a positive whole number.");
            }
            $marquee = new Marquee();
            if (!$marquee->find($id)) {
                http_response_code(404);
                echo json_encode(['success' => false, 'error' => "Marquee item $id does not exist."]);
                break;
            }
            $marquee->delete($id);
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
