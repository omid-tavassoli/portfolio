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

function chipId($input): int {
    $id = is_array($input) ? ($input['id'] ?? null) : null;
    if (is_string($id) && ctype_digit($id)) {
        $id = (int) $id;
    }
    if (!is_int($id) || $id <= 0) {
        throw new InvalidArgumentException("id must be a positive whole number.");
    }
    return $id;
}

// checks the fields that were sent; returns them cleaned
function chipFields(array $input): array {
    $unknown = array_diff(array_keys($input), ['id', 'slot', 'label', 'icon']);
    if ($unknown) {
        throw new InvalidArgumentException("Unknown field(s): " . implode(', ', $unknown) . ".");
    }
    $values = [];
    if (array_key_exists('slot', $input)) {
        if (!is_int($input['slot']) || !in_array($input['slot'], Chips::SLOTS, true)) {
            throw new InvalidArgumentException("slot must be a whole number from 1 to 5.");
        }
        $values['slot'] = $input['slot'];
    }
    if (array_key_exists('label', $input)) {
        $label = $input['label'];
        if (!is_string($label) || trim($label) === '') {
            throw new InvalidArgumentException("label must be a non-empty string.");
        }
        $label = trim($label);
        if (mb_strlen($label) > 40) {
            throw new InvalidArgumentException("label is too long (max 40).");
        }
        $values['label'] = $label;
    }
    if (array_key_exists('icon', $input)) {
        // a Bootstrap Icons class name; nothing else can reach the page's class attribute
        if (!is_string($input['icon']) || !preg_match('/^bi-[a-z0-9-]{1,60}$/', $input['icon'])) {
            throw new InvalidArgumentException("icon must be a Bootstrap icon class like bi-box-seam.");
        }
        $values['icon'] = $input['icon'];
    }
    return $values;
}

function slotTaken(int $slot): void {
    http_response_code(409);
    echo json_encode(['success' => false, 'error' => "Position $slot already has a chip."]);
}

function notFound(int $id): void {
    http_response_code(404);
    echo json_encode(['success' => false, 'error' => "Chip $id does not exist."]);
}

try {
    switch ($_SERVER['REQUEST_METHOD']) {
        case 'GET':
            $chips = new Chips();
            echo json_encode(['success' => true, 'data' => $chips->get(), 'slots' => Chips::SLOTS]);
            break;

        case 'POST':
            if (!is_array($input)) {
                throw new InvalidArgumentException("Request body must be a JSON object with slot, label and icon.");
            }
            $values = chipFields($input);
            if (array_key_exists('id', $input)) {
                throw new InvalidArgumentException("Unknown field(s): id.");
            }
            $missing = array_diff(['slot', 'label', 'icon'], array_keys($values));
            if ($missing) {
                throw new InvalidArgumentException("Missing field(s): " . implode(', ', $missing) . ".");
            }
            $chips = new Chips();
            if ($chips->findBySlot($values['slot'])) {
                slotTaken($values['slot']);
                break;
            }
            $id = $chips->create($values['slot'], $values['label'], $values['icon']);
            http_response_code(201);
            echo json_encode(['success' => true, 'data' => $chips->find($id)]);
            break;

        case 'PATCH':
            $id = chipId($input);
            $changes = chipFields($input);
            if (!$changes) {
                throw new InvalidArgumentException("Send at least one field to update: slot, label, icon.");
            }
            $chips = new Chips();
            $current = $chips->find($id);
            if (!$current) {
                notFound($id);
                break;
            }
            if (isset($changes['slot'])) {
                $other = $chips->findBySlot($changes['slot']);
                if ($other && (int) $other['id'] !== $id) {
                    slotTaken($changes['slot']);
                    break;
                }
            }
            $row = array_merge($current, $changes);
            $chips->update($id, (int) $row['slot'], $row['label'], $row['icon']);
            echo json_encode(['success' => true, 'data' => $chips->find($id)]);
            break;

        case 'DELETE':
            $id = chipId($input);
            $chips = new Chips();
            if (!$chips->find($id)) {
                notFound($id);
                break;
            }
            $chips->delete($id);
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
