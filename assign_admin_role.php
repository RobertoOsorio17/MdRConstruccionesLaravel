<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\User;

$user = User::find(1);

if ($user) {
    $user->assignRole('admin');
    echo "✅ Admin role assigned to user: {$user->name}\n";
    echo "User ID: {$user->id}\n";
    echo "Email: {$user->email}\n";
    echo "Roles: " . $user->roles->pluck('name')->implode(', ') . "\n";
} else {
    echo "❌ User not found\n";
}

