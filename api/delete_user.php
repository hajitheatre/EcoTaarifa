<?php
/**
 * delete_user.php
 * Permanently deletes a user account from the `users` table by their ID.
 * Admin-only action. Any reports submitted by this user remain in the reports table.
 *
 * Method: POST
 * Body (JSON): id (integer)
 * Returns: JSON { success, message }
 */
header('Content-Type: application/json');
require_once '../includes/db_config.php';

// Decode incoming JSON body
$data = json_decode(file_get_contents('php://input'), true);

// Validate that an ID was provided
if (!$data || !isset($data['id'])) {
    echo json_encode(['success' => false, 'message' => 'Invalid request']);
    exit;
}

try {
    $stmt = $pdo->prepare("DELETE FROM users WHERE id = ?");
    $stmt->execute([$data['id']]);

    echo json_encode(['success' => true, 'message' => 'User permanently deleted']);

} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
?>
