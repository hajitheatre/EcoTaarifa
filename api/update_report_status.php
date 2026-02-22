<?php
/**
 * update_report_status.php
 * Updates the status of a report on both the active `reports` table and the `report_history` table.
 * A transaction ensures both updates are always in sync.
 *
 * Method: POST
 * Body (JSON): id (integer), status (string: 'Pending' | 'In Progress' | 'Resolved')
 * Returns: JSON { success, message }
 */
header('Content-Type: application/json');
require_once '../includes/db_config.php';

// Decode incoming JSON body
$data = json_decode(file_get_contents('php://input'), true);

// Validate required fields
if (!$data || !isset($data['id']) || !isset($data['status'])) {
    echo json_encode(['success' => false, 'message' => 'Invalid request']);
    exit;
}

try {
    // Use a transaction to keep reports and report_history in sync
    $pdo->beginTransaction();

    // 1. Update the status on the active admin board
    $stmt = $pdo->prepare("UPDATE reports SET status = ? WHERE id = ?");
    $stmt->execute([$data['status'], $data['id']]);

    // 2. Mirror the status update to the user's personal history view
    $stmt = $pdo->prepare("UPDATE report_history SET status = ? WHERE original_report_id = ?");
    $stmt->execute([$data['status'], $data['id']]);

    $pdo->commit();

    echo json_encode(['success' => true, 'message' => 'Status updated successfully']);

} catch (PDOException $e) {
    if ($pdo->inTransaction()) $pdo->rollBack();
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>
