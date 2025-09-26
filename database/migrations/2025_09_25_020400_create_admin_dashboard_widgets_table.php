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
        Schema::create('admin_dashboard_widgets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('widget_type', 100); // stats, chart, recent_activity, quick_actions, etc.
            $table->string('title', 200);
            $table->json('configuration'); // Widget-specific configuration
            $table->integer('position_x')->default(0); // Grid position
            $table->integer('position_y')->default(0);
            $table->integer('width')->default(1); // Grid width
            $table->integer('height')->default(1); // Grid height
            $table->boolean('is_visible')->default(true);
            $table->integer('refresh_interval')->default(300); // Seconds
            $table->timestamps();

            $table->index(['user_id', 'is_visible']);
            $table->index(['widget_type']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('admin_dashboard_widgets');
    }
};
