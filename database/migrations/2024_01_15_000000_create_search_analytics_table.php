<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('search_analytics', function (Blueprint $table) {
            $table->id();
            $table->string('query', 500);
            $table->string('query_normalized', 191); // Shortened for MySQL compatibility
            $table->integer('results_count')->default(0);
            $table->string('user_ip', 45)->nullable();
            $table->string('user_agent', 500)->nullable();
            $table->json('filters')->nullable(); // Store applied filters
            $table->decimal('response_time', 8, 3)->nullable(); // Response time in seconds
            $table->boolean('has_results')->default(true);
            $table->timestamps();

            // Indexes for performance - avoid duplicate names
            $table->index('query_normalized', 'idx_search_query_normalized');
            $table->index('created_at', 'idx_search_created_at');
            $table->index(['has_results', 'created_at'], 'idx_search_results_date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('search_analytics');
    }
};
