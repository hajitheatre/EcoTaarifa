<?php
header('Content-Type: application/json');
require_once '../includes/db_config.php';
session_start();

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Unauthorized. Please log in again.']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);
if (!$data) {
    echo json_encode(['success' => false, 'message' => 'No data received']);
    exit;
}

$userId = $_SESSION['user_id'];
$newName = trim($data['name'] ?? '');
$newEmail = trim($data['email'] ?? '');
$currentPassword = $data['current_password'] ?? '';
$newPassword = $data['new_password'] ?? '';

// Fetch current user details AND role
try {
    $stmt = $pdo->prepare("SELECT role, password FROM users WHERE id = ?");
    $stmt->execute([$userId]);
    $user = $stmt->fetch();

    if (!$user) {
        echo json_encode(['success' => false, 'message' => 'User not found']);
        exit;
    }

    $isAdmin = ($user['role'] === 'admin');

    // If changing password, verify current password
    if (!empty($newPassword)) {
        if (empty($currentPassword)) {
            echo json_encode(['success' => false, 'message' => 'Current password is required to set a new password']);
            exit;
        }
        if (!password_verify($currentPassword, $user['password'])) {
            echo json_encode(['success' => false, 'message' => 'Incorrect current password']);
            exit;
        }
        if (strlen($newPassword) < 6) {
            echo json_encode(['success' => false, 'message' => 'New password must be at least 6 characters']);
            exit;
        }
    }

    // Prepare Dynamic Update Query
    $fieldsToUpdate = [];
    $params = [];


    // ADMIN UPDATES
    // ADMIN/USER UPDATES (Name/Email)
    // Only update Name/Email if explicitly provided (and not empty)
    if (isset($data['name']) && !empty($newName)) {
        $parts = explode(' ', $newName, 2);
        $fieldsToUpdate[] = "first_name = ?";
        $params[] = $parts[0];
        $fieldsToUpdate[] = "last_name = ?";
        $params[] = $parts[1] ?? '';
        // Update Session Name (corrected from user_name to name)
        $_SESSION['name'] = $newName;
    } elseif (isset($data['name']) && empty($newName)) {
         echo json_encode(['success' => false, 'message' => 'Name cannot be empty']);
         exit;
    }

    if (isset($data['email']) && !empty($newEmail)) {
        // Check uniqueness if email is changing
        $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ? AND id != ?");
        $stmt->execute([$newEmail, $userId]);
        if ($stmt->fetch()) {
            echo json_encode(['success' => false, 'message' => 'Email already in use']);
            exit;
        }
        $fieldsToUpdate[] = "email = ?";
        $params[] = $newEmail;
        // Update Session Email (corrected from user_email to email)
        $_SESSION['email'] = $newEmail;
    } elseif (isset($data['email']) && empty($newEmail)) {
         echo json_encode(['success' => false, 'message' => 'Email cannot be empty']);
         exit;
    }

    // COMMON UPDATES (Admin + User)
    
    // Password
    if (!empty($newPassword)) {
        $fieldsToUpdate[] = "password = ?";
        $params[] = password_hash($newPassword, PASSWORD_DEFAULT);
    }
    

    if (empty($fieldsToUpdate)) {
        echo json_encode(['success' => true, 'message' => 'No changes made']);
        exit;
    }

    $sql = "UPDATE users SET " . implode(", ", $fieldsToUpdate) . " WHERE id = ?";
    $params[] = $userId;
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);

    echo json_encode(['success' => true, 'message' => 'Profile updated successfully']);

} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
?>
