<?php
/**
 * logout.php
 * Destroys the current PHP session, effectively logging the user out server-side.
 * Called by the frontend before redirecting to the login page.
 *
 * Method: GET or POST
 * Returns: JSON { success, message }
 */
header('Content-Type: application/json');
session_start();
session_unset();   // Clear all session variables
session_destroy(); // Destroy the session cookie
echo json_encode(['success' => true, 'message' => 'Logged out successfully']);
?>
