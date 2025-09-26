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
        Schema::table('comment_reports', function (Blueprint $table) {
            $table->enum('category', ['spam', 'harassment', 'hate_speech', 'inappropriate', 'misinformation', 'off_topic', 'other'])->default('other')->after('reason');
            $table->text('description')->nullable()->after('category');
            $table->text('notes')->nullable()->after('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('comment_reports', function (Blueprint $table) {
            $table->dropColumn(['category', 'description', 'notes']);
        });
    }
};
