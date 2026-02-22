<?php
/**
 * auth_guard.php
 * Server-side session authentication guard.
 * Provides two functions used at the top of all protected dashboard pages:
 *  - require_login():  Ensures a valid session exists; redirects to login page if not.
 *  - require_admin():  Additionally enforces that the user has the 'admin' role.
 *
 * Session timeout is 10 minutes of inactivity (mirrors the JS-side inactivity timer).
 * On timeout, the user is redirected with ?timeout=1 for the toast notification.
 */
session_start();

/**
 * Redirect to login if no valid session exists or session has timed out.
 * Updates $_SESSION['last_activity'] on every valid request.
 */
function require_login() {
    $timeout_duration = 600; // 10 minutes in seconds

    // No session — redirect to login
    if (!isset($_SESSION['user_id'])) {
        header("Location: /EcoTaarifa/index.php");
        exit;
    }

    // Inactivity timeout — destroy session and redirect with timeout flag
    if (isset($_SESSION['last_activity']) && (time() - $_SESSION['last_activity'] > $timeout_duration)) {
        session_unset();
        session_destroy();
        header("Location: /EcoTaarifa/index.php?timeout=1");
        exit;
    }

    // Refresh activity timestamp on every valid page load
    $_SESSION['last_activity'] = time();
}

/**
 * Redirect to login if the user is not logged in or does not have the 'admin' role.
 */
function require_admin() {
    require_login(); // First ensure they're logged in
    if ($_SESSION['role'] !== 'admin') {
        header("Location: /EcoTaarifa/index.php");
        exit;
    }
}
?>
