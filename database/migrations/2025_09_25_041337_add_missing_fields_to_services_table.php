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
        Schema::table('services', function (Blueprint $table) {
            // Add category relationship
            $table->foreignId('category_id')->nullable()->after('id')->constrained()->onDelete('set null');

            // Add price field for service pricing
            $table->decimal('price', 10, 2)->nullable()->after('body');

            // Add image field for service images
            $table->string('image')->nullable()->after('icon');

            // Add status field for better service management
            $table->enum('status', ['draft', 'published', 'archived'])->default('published')->after('is_active');

            // Add description field for SEO
            $table->text('description')->nullable()->after('excerpt');

            // Add views counter
            $table->integer('views_count')->default(0)->after('sort_order');

            // Add indexes for performance
            $table->index(['category_id', 'status']);
            $table->index(['featured', 'is_active']);
            $table->index('views_count');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('services', function (Blueprint $table) {
            $table->dropForeign(['category_id']);
            $table->dropIndex(['category_id', 'status']);
            $table->dropIndex(['featured', 'is_active']);
            $table->dropIndex('views_count');

            $table->dropColumn([
                'category_id',
                'price',
                'image',
                'status',
                'description',
                'views_count'
            ]);
        });
    }
};
