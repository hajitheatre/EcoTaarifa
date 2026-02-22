<?php
/**
 * get_users.php
 * Fetches all user accounts from the `users` table for the admin user management panel.
 * Password field is intentionally excluded from the query for security.
 *
 * Method: GET
 * Returns: JSON { success, data: [ ...users ] }
 */
header('Content-Type: application/json');
require_once '../includes/db_config.php';

try {
    // Exclude password hash — never expose it in API responses
    $stmt = $pdo->query("SELECT id, first_name, last_name, email, role, created_at FROM users ORDER BY id DESC");
    $users = $stmt->fetchAll();

    echo json_encode(['success' => true, 'data' => $users]);

} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
?>
