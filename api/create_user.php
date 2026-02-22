<?php
/**
 * create_user.php
 * Creates a new user account (admin-only action).
 * Validates input, checks for email uniqueness, hashes the password, and inserts into users.
 *
 * Method: POST
 * Body (JSON): first_name, last_name, email, password, role
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

// Extract and trim fields
$firstName = trim($data['first_name'] ?? '');
$lastName  = trim($data['last_name']  ?? '');
$email     = trim($data['email']      ?? '');
$password  = $data['password']        ?? '';
$role      = $data['role']            ?? 'user'; // Default to 'user' if not specified

// Validate all required fields are present
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
    // Check for duplicate email before inserting
    $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
    $stmt->execute([$email]);
    if ($stmt->fetch()) {
        echo json_encode(['success' => false, 'message' => 'Email already registered']);
        exit;
    }

    // Hash password using bcrypt (PASSWORD_DEFAULT)
    $hashedPassword = password_hash($password, PASSWORD_DEFAULT);

    $stmt = $pdo->prepare("INSERT INTO users (first_name, last_name, email, password, role) VALUES (?, ?, ?, ?, ?)");
    $stmt->execute([$firstName, $lastName, $email, $hashedPassword, $role]);

    echo json_encode(['success' => true, 'message' => 'User created successfully']);

} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
?>
