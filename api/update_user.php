<?php
/**
 * update_user.php
 * Admin-only endpoint to update another user's profile details.
 * Supports updating name, email, role, and optionally the password.
 * Uses conditional SQL to avoid overwriting the password if not provided.
 *
 * Method: POST
 * Body (JSON): id, first_name, last_name, email, role, password (optional)
 * Returns: JSON { success, message }
 */
header('Content-Type: application/json');
require_once '../includes/db_config.php';

// Decode incoming JSON body
$data = json_decode(file_get_contents('php://input'), true);

if (!$data || !isset($data['id'])) {
    echo json_encode(['success' => false, 'message' => 'Invalid request']);
    exit;
}

// Extract and cast fields
$id        = (int) $data['id'];
$firstName = trim($data['first_name'] ?? '');
$lastName  = trim($data['last_name']  ?? '');
$email     = trim($data['email']      ?? '');
$role      = $data['role']            ?? 'user';
$password  = $data['password']        ?? '';

// Validate required fields
if (empty($firstName) || empty($lastName) || empty($email)) {
    echo json_encode(['success' => false, 'message' => 'Name and email are required']);
    exit;
}

try {
    // Ensure the new email isn't already taken by a different user
    $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ? AND id != ?");
    $stmt->execute([$email, $id]);
    if ($stmt->fetch()) {
        echo json_encode(['success' => false, 'message' => 'Email already in use']);
        exit;
    }

    if (!empty($password)) {
        // Password change requested — validate and hash it
        if (strlen($password) < 6) {
            echo json_encode(['success' => false, 'message' => 'Password must be at least 6 characters']);
            exit;
        }
        $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
        $stmt = $pdo->prepare("UPDATE users SET first_name = ?, last_name = ?, email = ?, role = ?, password = ? WHERE id = ?");
        $stmt->execute([$firstName, $lastName, $email, $role, $hashedPassword, $id]);
    } else {
        // No password change — update everything else without touching the password field
        $stmt = $pdo->prepare("UPDATE users SET first_name = ?, last_name = ?, email = ?, role = ? WHERE id = ?");
        $stmt->execute([$firstName, $lastName, $email, $role, $id]);
    }

    echo json_encode(['success' => true, 'message' => 'User updated successfully']);

} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
?>
