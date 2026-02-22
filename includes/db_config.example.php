<?php
/**
 * db_config.php — Database Configuration Template
 * ================================================
 * Copy this file to includes/db_config.php and fill in your credentials.
 * The real db_config.php is excluded from version control (.gitignore).
 */
$host    = 'localhost';
$db      = 'eco_report_db';
$user    = 'YOUR_DB_USERNAME';  // e.g. 'root' for XAMPP
$pass    = 'YOUR_DB_PASSWORD';  // e.g. '' for XAMPP default
$charset = 'utf8mb4';

$dsn = "mysql:host=$host;dbname=$db;charset=$charset";
$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
];

try {
    $pdo = new PDO($dsn, $user, $pass, $options);
} catch (\PDOException $e) {
    throw new \PDOException($e->getMessage(), (int) $e->getCode());
}
?>
