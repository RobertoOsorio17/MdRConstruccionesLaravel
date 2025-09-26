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
        Schema::table('users', function (Blueprint $table) {
            // Add admin-specific fields if they don't exist
            if (!Schema::hasColumn('users', 'two_factor_enabled')) {
                $table->boolean('two_factor_enabled')->default(false)->after('remember_token');
            }
            
            if (!Schema::hasColumn('users', 'two_factor_secret')) {
                $table->text('two_factor_secret')->nullable()->after('two_factor_enabled');
            }
            
            if (!Schema::hasColumn('users', 'two_factor_recovery_codes')) {
                $table->text('two_factor_recovery_codes')->nullable()->after('two_factor_secret');
            }
            
            if (!Schema::hasColumn('users', 'last_password_change')) {
                $table->timestamp('last_password_change')->nullable()->after('two_factor_recovery_codes');
            }
            
            if (!Schema::hasColumn('users', 'password_expires_at')) {
                $table->timestamp('password_expires_at')->nullable()->after('last_password_change');
            }
            
            if (!Schema::hasColumn('users', 'failed_login_attempts')) {
                $table->integer('failed_login_attempts')->default(0)->after('password_expires_at');
            }
            
            if (!Schema::hasColumn('users', 'locked_until')) {
                $table->timestamp('locked_until')->nullable()->after('failed_login_attempts');
            }
            
            if (!Schema::hasColumn('users', 'last_activity_at')) {
                $table->timestamp('last_activity_at')->nullable()->after('locked_until');
            }
            
            if (!Schema::hasColumn('users', 'preferences')) {
                $table->json('preferences')->nullable()->after('last_activity_at');
            }
            
            if (!Schema::hasColumn('users', 'timezone')) {
                $table->string('timezone', 50)->default('UTC')->after('preferences');
            }
            
            if (!Schema::hasColumn('users', 'language')) {
                $table->string('language', 10)->default('es')->after('timezone');
            }
        });

        // Add indexes for performance
        Schema::table('users', function (Blueprint $table) {
            $table->index(['role', 'email_verified_at']);
            $table->index(['last_login_at']);
            $table->index(['failed_login_attempts', 'locked_until']);
            $table->index(['last_activity_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropIndex(['role', 'email_verified_at']);
            $table->dropIndex(['last_login_at']);
            $table->dropIndex(['failed_login_attempts', 'locked_until']);
            $table->dropIndex(['last_activity_at']);
            
            $table->dropColumn([
                'two_factor_enabled',
                'two_factor_secret',
                'two_factor_recovery_codes',
                'last_password_change',
                'password_expires_at',
                'failed_login_attempts',
                'locked_until',
                'last_activity_at',
                'preferences',
                'timezone',
                'language'
            ]);
        });
    }
};
