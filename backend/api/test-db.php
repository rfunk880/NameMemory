<?php
/**
 * Database Connection Test Script
 * Use this to verify your database connection and schema
 */

// Load configuration
require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/config/Database.php';

echo "=== Database Connection Test ===\n\n";

// Test 1: Configuration values
echo "1. Configuration Check:\n";
echo "   DB_HOST: " . DB_HOST . "\n";
echo "   DB_NAME: " . DB_NAME . "\n";
echo "   DB_USER: " . DB_USER . "\n";
echo "   DB_PASS: " . (DB_PASS ? "***SET***" : "NOT SET") . "\n\n";

// Test 2: Database connection
echo "2. Database Connection:\n";
try {
    $db = new Database();
    echo "   ✓ Connection successful!\n\n";
} catch (Exception $e) {
    echo "   ✗ Connection FAILED: " . $e->getMessage() . "\n";
    exit(1);
}

// Test 3: Check if tables exist
echo "3. Database Tables:\n";
$tables = ['users', 'groups', 'people', 'group_shares', 'password_resets'];
foreach ($tables as $table) {
    try {
        $result = $db->query("SHOW TABLES LIKE ?", [$table]);
        if ($result->rowCount() > 0) {
            echo "   ✓ Table '$table' exists\n";
        } else {
            echo "   ✗ Table '$table' NOT FOUND\n";
        }
    } catch (Exception $e) {
        echo "   ✗ Error checking table '$table': " . $e->getMessage() . "\n";
    }
}

// Test 4: Check groups table structure
echo "\n4. Groups Table Structure:\n";
try {
    $result = $db->query("DESCRIBE `groups`");
    $columns = $result->fetchAll();
    foreach ($columns as $col) {
        echo "   - " . $col['Field'] . " (" . $col['Type'] . ")\n";
    }
} catch (Exception $e) {
    echo "   ✗ Error: " . $e->getMessage() . "\n";
}

// Test 5: Try to create a test group
echo "\n5. Test Group Creation:\n";
try {
    // Create test user first
    $testEmail = 'test_' . time() . '@example.com';
    $db->execute(
        "INSERT INTO users (email, password, name) VALUES (?, ?, ?)",
        [$testEmail, password_hash('test123', PASSWORD_DEFAULT), 'Test User']
    );
    $userId = $db->lastInsertId();
    echo "   ✓ Test user created (ID: $userId)\n";

    // Try to create a group
    $db->execute(
        "INSERT INTO `groups` (name, owner_id) VALUES (?, ?)",
        ['Test Group', $userId]
    );
    $groupId = $db->lastInsertId();
    echo "   ✓ Test group created (ID: $groupId)\n";

    // Clean up
    $db->execute("DELETE FROM `groups` WHERE id = ?", [$groupId]);
    $db->execute("DELETE FROM users WHERE id = ?", [$userId]);
    echo "   ✓ Test data cleaned up\n";

    echo "\n✅ All tests PASSED! Database is working correctly.\n";

} catch (Exception $e) {
    echo "   ✗ Error: " . $e->getMessage() . "\n";
    echo "   File: " . $e->getFile() . ":" . $e->getLine() . "\n";
    echo "\n❌ Database test FAILED!\n";
}

echo "\n=== End of Test ===\n";
