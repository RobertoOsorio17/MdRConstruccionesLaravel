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
        Schema::table('contact_requests', function (Blueprint $table) {
            if (!Schema::hasColumn('contact_requests', 'type')) {
                $table->string('type')->default('contact')->after('status'); // 'contact' or 'budget_request'
            }
            if (!Schema::hasColumn('contact_requests', 'metadata')) {
                $table->json('metadata')->nullable()->after('type'); // Additional data for budget requests
            }
            if (!Schema::hasColumn('contact_requests', 'preferred_contact')) {
                $table->string('preferred_contact')->nullable()->after('phone'); // Email, Phone, WhatsApp
            }
            if (!Schema::hasColumn('contact_requests', 'contact_time')) {
                $table->string('contact_time')->nullable()->after('preferred_contact'); // Preferred contact time
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('contact_requests', function (Blueprint $table) {
            $table->dropColumn(['type', 'metadata', 'preferred_contact', 'contact_time']);
        });
    }
};
