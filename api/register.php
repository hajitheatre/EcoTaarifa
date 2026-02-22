<?php
/**
 * register.php
 * Self-service user registration endpoint. Creates a new user account with the 'user' role.
 * Validates input, checks for duplicate emails, and stores a bcrypt-hashed password.
 * Note: New accounts are always created as 'user'. Admins must use create_user.php for role assignment.
 *
 * Method: POST
 * Body (JSON): first_name, last_name, email, password
 * Returns: JSON { success, message }
 */
header('Content-Type: application/json');
require_once '../includes/db_config.php';

// Decode incoming JSON body
$data = json_decode(file_get_contents('php://input'), true);

if (!$data) {
    echo json_encode(['success' => false, 'message' => 'No data received']);
    exit;
}

// Extract and sanitize fields
$firstName = trim($data['first_name'] ?? '');
$lastName  = trim($data['last_name']  ?? '');
$email     = trim($data['email']      ?? '');
$password  = $data['password']        ?? '';

// Validate required fields
if (empty($firstName) || empty($lastName) || empty($email) || empty($password)) {
    echo json_encode(['success' => false, 'message' => 'All fields are required']);
    exit;
}

// Validate email format
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(['success' => false, 'message' => 'Invalid email format']);
    exit;
}

// Enforce minimum password length
if (strlen($password) < 6) {
    echo json_encode(['success' => false, 'message' => 'Password must be at least 6 characters']);
    exit;
}

try {
    // Prevent duplicate accounts with the same email
    $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
    $stmt->execute([$email]);
    if ($stmt->fetch()) {
        echo json_encode(['success' => false, 'message' => 'Email already registered']);
        exit;
    }

    // Hash password using bcrypt before storing
    $hashedPassword = password_hash($password, PASSWORD_DEFAULT);

    // Insert new user — role is always 'user' for self-registration
    $stmt = $pdo->prepare("INSERT INTO users (first_name, last_name, email, password, role) VALUES (?, ?, ?, ?, 'user')");
    $stmt->execute([$firstName, $lastName, $email, $hashedPassword]);

    echo json_encode(['success' => true, 'message' => 'Registration successful']);

} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
?>
