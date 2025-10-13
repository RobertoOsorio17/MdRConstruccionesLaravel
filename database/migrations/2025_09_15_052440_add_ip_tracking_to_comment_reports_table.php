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
            $table->string('ip_address', 45)->nullable()->after('notes');
            $table->text('user_agent')->nullable()->after('ip_address');
            $table->boolean('is_guest_report')->default(false)->after('user_agent');
            
            // Hacer que user_id sea nullable para permitir reportes de invitados
            $table->foreignId('user_id')->nullable()->change();
            
            // Índice compuesto para mejorar rendimiento de consultas
            $table->index(['ip_address', 'created_at']);
            $table->index(['comment_id', 'ip_address']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('comment_reports', function (Blueprint $table) {
            $table->dropIndex(['ip_address', 'created_at']);
            $table->dropIndex(['comment_id', 'ip_address']);
            $table->dropColumn(['ip_address', 'user_agent', 'is_guest_report']);
            
            // Revertir user_id a no nullable
            $table->foreignId('user_id')->nullable(false)->change();
        });
    }
};
