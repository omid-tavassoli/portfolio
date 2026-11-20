<?php
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../AutoLoader.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['error' => 'Method Not Allowed']);
    exit;
}

try {
    $result = [];

    $about = new About();
    $result['about'] = $about->get();

    $skills = new Skills();
    $result['skills'] = $skills->get();

    $projects = new Projects();
    $result['projects'] = $projects->get();

    $journey = new Journey();
    $result['journey'] = $journey->get();

    $contact = new Contact();
    $result['contact'] = $contact->get();

    echo json_encode(['success' => true, 'data' => $result]);

} catch (InvalidArgumentException $e) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);

} catch (Throwable $e) {
    error_log($e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Something went wrong, please try again.']);
}

?>
