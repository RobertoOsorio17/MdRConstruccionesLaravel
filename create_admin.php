<?php

/**
 * Script to create an admin user for testing
 * Run with: php create_admin.php
 */

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\User;
use App\Models\Role;
use Illuminate\Support\Facades\Hash;

if (!app()->environment(['local', 'development', 'testing'])) {
    fwrite(STDERR, "❌ Este script solo puede ejecutarse en entornos locales.\n");
    exit(1);
}

echo "=== Creating Admin User ===\n\n";

// Admin user data
$generatedPassword = bin2hex(random_bytes(10));
$adminData = [
    'name' => 'Admin Test',
    'email' => 'admin@test.com',
    'password' => Hash::make($generatedPassword),
    'role' => 'admin',
    'email_verified_at' => now(),
];

// Check if user already exists
$existingUser = User::where('email', $adminData['email'])->first();

if ($existingUser) {
    echo "User already exists. Updating password...\n";
    $existingUser->update([
        'password' => Hash::make($generatedPassword),
        'role' => 'admin',
        'email_verified_at' => now(),
    ]);
    $user = $existingUser;
    echo "✅ User updated successfully!\n";
} else {
    echo "Creating new admin user...\n";
    $user = User::create($adminData);
    echo "✅ User created successfully!\n";
}

// Assign admin role from roles table if it exists
$adminRole = Role::where('name', 'admin')->first();
if ($adminRole && !$user->roles()->where('role_id', $adminRole->id)->exists()) {
    $user->roles()->attach($adminRole->id, [
        'assigned_at' => now(),
        'assigned_by' => $user->id,
    ]);
    echo "✅ Admin role assigned from roles table!\n";
}

echo "\n=== Admin User Details ===\n";
echo "Email: {$user->email}\n";
echo "Password: {$generatedPassword}\n";
echo "Role: {$user->role}\n";
echo "ID: {$user->id}\n";
echo "\n✅ You can now login at: http://localhost:8000/login\n";
