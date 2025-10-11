<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * ✅ FIXED: Add unique constraints to prevent duplicate profiles
     */
    public function up(): void
    {
        Schema::table('ml_user_profiles', function (Blueprint $table) {
            // ✅ Add unique constraint for user_id (nullable, so only non-null values must be unique)
            $table->unique('user_id', 'ml_user_profiles_user_id_unique');

            // ✅ Add unique constraint for session_id (nullable, so only non-null values must be unique)
            $table->unique('session_id', 'ml_user_profiles_session_id_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('ml_user_profiles', function (Blueprint $table) {
            // Drop unique constraints
            $table->dropUnique('ml_user_profiles_user_id_unique');
            $table->dropUnique('ml_user_profiles_session_id_unique');
        });
    }
};
