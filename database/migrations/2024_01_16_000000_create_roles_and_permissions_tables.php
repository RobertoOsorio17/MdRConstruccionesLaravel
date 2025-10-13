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
        // Create roles table
        if (!Schema::hasTable('roles')) {
            Schema::create('roles', function (Blueprint $table) {
                $table->id();
                $table->string('name', 191)->unique();
                $table->string('display_name', 191);
                $table->text('description')->nullable();
                $table->string('color', 20)->default('#6b7280');
                $table->integer('level')->default(1);
                $table->boolean('is_active')->default(true);
                $table->timestamps();

                $table->index(['name', 'is_active'], 'roles_name_active_idx');
                $table->index('level', 'roles_level_idx');
            });
        }

        // Create permissions table
        if (!Schema::hasTable('permissions')) {
            Schema::create('permissions', function (Blueprint $table) {
                $table->id();
                $table->string('name', 191)->unique();
                $table->string('display_name', 191);
                $table->text('description')->nullable();
                $table->string('module', 100)->nullable();
                $table->string('action', 100)->nullable();
                $table->timestamps();

                $table->index(['module', 'action'], 'permissions_module_action_idx');
                $table->index('name', 'permissions_name_idx');
            });
        }

        // Create role_user pivot table
        if (!Schema::hasTable('role_user')) {
            Schema::create('role_user', function (Blueprint $table) {
                $table->id();
                $table->foreignId('user_id')->constrained()->onDelete('cascade');
                $table->foreignId('role_id')->constrained()->onDelete('cascade');
                $table->timestamp('assigned_at')->nullable();
                $table->foreignId('assigned_by')->nullable()->constrained('users')->onDelete('set null');
                $table->timestamps();
                
                $table->unique(['user_id', 'role_id']);
                $table->index('assigned_at');
            });
        }

        // Create role_permission pivot table
        if (!Schema::hasTable('role_permission')) {
            Schema::create('role_permission', function (Blueprint $table) {
                $table->id();
                $table->foreignId('role_id')->constrained()->onDelete('cascade');
                $table->foreignId('permission_id')->constrained()->onDelete('cascade');
                $table->timestamps();
                
                $table->unique(['role_id', 'permission_id']);
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('role_permission');
        Schema::dropIfExists('role_user');
        Schema::dropIfExists('permissions');
        Schema::dropIfExists('roles');
    }
};
