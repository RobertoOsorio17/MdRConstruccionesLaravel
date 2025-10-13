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
            $table->boolean('is_verified')->default(false)->after('email_verified_at');
            $table->timestamp('verified_at')->nullable()->after('is_verified');
            $table->text('verification_notes')->nullable()->after('verified_at');
            $table->unsignedBigInteger('verified_by')->nullable()->after('verification_notes');

            $table->foreign('verified_by')->references('id')->on('users')->onDelete('set null');
            $table->index(['is_verified', 'verified_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['verified_by']);
            $table->dropIndex(['is_verified', 'verified_at']);
            $table->dropColumn(['is_verified', 'verified_at', 'verification_notes', 'verified_by']);
        });
    }
};
