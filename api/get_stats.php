<?php
/**
 * get_stats.php
 * Returns aggregate statistics for the admin dashboard:
 * total users, total reports, and report counts by status (Pending, In Progress, Resolved).
 *
 * Method: GET
 * Returns: JSON { success, data: { totalUsers, totalReports, pendingReports, inProgressReports, resolvedReports } }
 */
header('Content-Type: application/json');
require_once '../includes/db_config.php';

try {
    // Count total registered users
    $stmt = $pdo->query("SELECT COUNT(*) FROM users");
    $totalUsers = $stmt->fetchColumn();

    // Default report stats (handles case where table might be empty)
    $stats = [
        'total'      => 0,
        'pending'    => 0,
        'inprogress' => 0,
        'resolved'   => 0
    ];

    // Verify the reports table exists before querying it
    $tableExists = $pdo->query("SHOW TABLES LIKE 'reports'")->rowCount() > 0;

    if ($tableExists) {
        // Group by status for a single-query aggregation
        $stmt = $pdo->query("SELECT status, COUNT(*) as count FROM reports GROUP BY status");
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $stats['total'] += (int) $row['count'];
            if ($row['status'] === 'Pending')     $stats['pending']    = (int) $row['count'];
            if ($row['status'] === 'In Progress') $stats['inprogress'] = (int) $row['count'];
            if ($row['status'] === 'Resolved')    $stats['resolved']   = (int) $row['count'];
        }
    }

    echo json_encode([
        'success' => true,
        'data'    => [
            'totalUsers'        => (int) $totalUsers,
            'totalReports'      => $stats['total'],
            'pendingReports'    => $stats['pending'],
            'inProgressReports' => $stats['inprogress'],
            'resolvedReports'   => $stats['resolved']
        ]
    ]);

} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>
