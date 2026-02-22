<?php
/**
 * login.php
 * Authenticates a user by verifying their email and password against the database.
 * On success, creates a PHP session with user_id, role, and name.
 * The session is used by auth_guard.php to protect dashboard routes.
 *
 * Method: POST
 * Body (JSON): email, password
 * Returns: JSON { success, user: { name, email, role } } | { success: false, message }
 */
header('Content-Type: application/json');
require_once '../includes/db_config.php';

session_start();

// Decode incoming JSON body
$data = json_decode(file_get_contents('php://input'), true);

if (!$data) {
    echo json_encode(['success' => false, 'message' => 'No data received']);
    exit;
}

$email    = trim($data['email']    ?? '');
$password = $data['password']      ?? '';

// Validate that both fields are provided
if (empty($email) || empty($password)) {
    echo json_encode(['success' => false, 'message' => 'Email and password are required']);
    exit;
}

try {
    // Fetch the user by email — only fields needed for auth, no sensitive extras
    $stmt = $pdo->prepare("SELECT id, first_name, last_name, email, password, role FROM users WHERE email = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch();

    if ($user && password_verify($password, $user['password'])) {
        // Credentials match — establish session
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['role']    = $user['role'];
        $_SESSION['name']    = $user['first_name'] . ' ' . $user['last_name'];

        // Return user data to the frontend (password hash intentionally excluded)
        echo json_encode([
            'success' => true,
            'user'    => [
                'name'  => $_SESSION['name'],
                'email' => $user['email'],
                'role'  => $user['role']
            ]
        ]);
    } else {
        // Generic failure message — don't reveal whether email or password was wrong
        echo json_encode(['success' => false, 'message' => 'Invalid email or password. Please try again.']);
    }

} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
?>
