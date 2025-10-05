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
        // Add soft deletes to users table
        Schema::table('users', function (Blueprint $table) {
            $table->softDeletes();
        });

        // Add soft deletes to posts table
        Schema::table('posts', function (Blueprint $table) {
            $table->softDeletes();
        });

        // Add soft deletes to comments table
        Schema::table('comments', function (Blueprint $table) {
            $table->softDeletes();
        });

        // Add soft deletes to services table
        Schema::table('services', function (Blueprint $table) {
            $table->softDeletes();
        });

        // Add soft deletes to projects table
        Schema::table('projects', function (Blueprint $table) {
            $table->softDeletes();
        });

        // Add soft deletes to reviews table
        Schema::table('reviews', function (Blueprint $table) {
            $table->softDeletes();
        });

        // Add soft deletes to categories table
        Schema::table('categories', function (Blueprint $table) {
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropSoftDeletes();
        });

        Schema::table('posts', function (Blueprint $table) {
            $table->dropSoftDeletes();
        });

        Schema::table('comments', function (Blueprint $table) {
            $table->dropSoftDeletes();
        });

        Schema::table('services', function (Blueprint $table) {
            $table->dropSoftDeletes();
        });

        Schema::table('projects', function (Blueprint $table) {
            $table->dropSoftDeletes();
        });

        Schema::table('reviews', function (Blueprint $table) {
            $table->dropSoftDeletes();
        });

        Schema::table('categories', function (Blueprint $table) {
            $table->dropSoftDeletes();
        });
    }
};
