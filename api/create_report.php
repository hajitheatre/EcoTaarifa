<?php
/**
 * create_report.php
 * Creates a new report in both the active `reports` table and the `report_history` table.
 * Uses a transaction to ensure both inserts succeed or both fail (atomicity).
 *
 * Method: POST
 * Body (JSON): category, title, description, location, reporter, reporterEmail
 * Returns: JSON { success, message, id }
 */
header('Content-Type: application/json');
require_once '../includes/db_config.php';

// Decode incoming JSON body
$data = json_decode(file_get_contents('php://input'), true);

if (!$data) {
    echo json_encode(['success' => false, 'message' => 'No data provided']);
    exit;
}

// Extract fields with safe defaults
$category     = $data['category']      ?? '';
$title        = $data['title']         ?? '';
$description  = $data['description']   ?? '';
$location     = $data['location']      ?? '';
$reporter     = $data['reporter']      ?? '';
$reporterEmail = $data['reporterEmail'] ?? '';
$date = date('Y-m-d'); // Server-side date to prevent client tampering

// Validate required fields
if (!$category || !$title || !$description || !$location) {
    echo json_encode(['success' => false, 'message' => 'Required fields are missing']);
    exit;
}

try {
    // Begin transaction: both inserts must succeed together
    $pdo->beginTransaction();

    // 1. Insert into the active reports board
    $stmt = $pdo->prepare("INSERT INTO reports (category, title, description, location, date, reporter, reporterEmail) VALUES (?, ?, ?, ?, ?, ?, ?)");
    $stmt->execute([$category, $title, $description, $location, $date, $reporter, $reporterEmail]);
    $reportId = $pdo->lastInsertId();

    // 2. Mirror the new report into history for personal report tracking
    $stmt = $pdo->prepare("INSERT INTO report_history (original_report_id, category, title, description, location, date, reporter, reporterEmail) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
    $stmt->execute([$reportId, $category, $title, $description, $location, $date, $reporter, $reporterEmail]);

    $pdo->commit();

    echo json_encode(['success' => true, 'message' => 'Report created successfully', 'id' => $reportId]);

} catch (PDOException $e) {
    // Roll back both inserts if anything fails
    if ($pdo->inTransaction()) $pdo->rollBack();
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>
