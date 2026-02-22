<?php
/**
 * get_reports.php
 * Fetches all active reports from the `reports` table, ordered by newest first.
 * Used by both the admin board and the user's map view.
 *
 * Method: GET
 * Returns: JSON { success, data: [ ...reports ] }
 */
header('Content-Type: application/json');
require_once '../includes/db_config.php';

try {
    // Fetch all reports ordered by date then insertion order (newest first)
    $stmt = $pdo->query("SELECT * FROM reports ORDER BY date DESC, id DESC");
    $reports = $stmt->fetchAll();

    // Cast numeric fields to proper types for consistent JSON output
    foreach ($reports as &$r) {
        $r['id']       = (int)  $r['id'];
        $r['hasImage'] = (bool) $r['hasImage'];
    }

    echo json_encode(['success' => true, 'data' => $reports]);

} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>
