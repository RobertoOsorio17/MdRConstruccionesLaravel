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
            $table->json('attachments')->nullable()->after('message');
            $table->string('preferred_contact')->nullable()->after('phone');
            $table->string('contact_time')->nullable()->after('preferred_contact');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('contact_requests', function (Blueprint $table) {
            $table->dropColumn(['attachments', 'preferred_contact', 'contact_time']);
        });
    }
};

