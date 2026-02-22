<?php
/**
 * get_user_history.php
 * Fetches all historical reports submitted by a specific user, identified by email.
 * Reads from `report_history` so the user's submissions persist even if admins delete them from the board.
 *
 * Method: GET
 * Query param: email (string)
 * Returns: JSON { success, data: [ ...reports ] }
 */
header('Content-Type: application/json');
require_once '../includes/db_config.php';

// Email is passed as a GET parameter from the frontend
$email = $_GET['email'] ?? '';

if (!$email) {
    echo json_encode(['success' => false, 'message' => 'Email is required']);
    exit;
}

try {
    // Fetch the user's full report history, newest first
    $stmt = $pdo->prepare("SELECT * FROM report_history WHERE reporterEmail = ? ORDER BY date DESC, history_id DESC");
    $stmt->execute([$email]);
    $reports = $stmt->fetchAll();

    // Normalize the `id` field for frontend consistency
    // The JS frontend uses report.id — map it from original_report_id with history_id as fallback
    foreach ($reports as &$r) {
        $r['id']         = (int) ($r['original_report_id'] ?? $r['history_id']);
        $r['history_id'] = (int) $r['history_id'];
    }

    echo json_encode(['success' => true, 'data' => $reports]);

} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>
