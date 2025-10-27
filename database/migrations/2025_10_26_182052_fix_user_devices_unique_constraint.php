<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('user_devices', function (Blueprint $table) {
            // Drop the global unique constraint on device_id
            $table->dropUnique('user_devices_device_id_unique');

            // Add a composite unique constraint on user_id and device_id
            // This allows the same device_id for different users, but prevents duplicates per user
            $table->unique(['user_id', 'device_id'], 'user_devices_user_device_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('user_devices', function (Blueprint $table) {
            // Drop the composite unique constraint
            $table->dropUnique('user_devices_user_device_unique');

            // Restore the global unique constraint
            $table->unique('device_id', 'user_devices_device_id_unique');
        });
    }
};
