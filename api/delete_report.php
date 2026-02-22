<?php
/**
 * delete_report.php
 * Permanently deletes a report from the active `reports` table by its ID.
 * Note: The corresponding record in `report_history` is kept for user history tracking.
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
    // Hard delete from the active reports board only
    $stmt = $pdo->prepare("DELETE FROM reports WHERE id = ?");
    $stmt->execute([$data['id']]);

    echo json_encode(['success' => true, 'message' => 'Report permanently deleted from board']);

} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>
