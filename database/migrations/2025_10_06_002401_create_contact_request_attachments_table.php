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
        Schema::create('contact_request_attachments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('contact_request_id')
                ->constrained('contact_requests')
                ->onDelete('cascade');

            // File information
            $table->string('original_filename');
            $table->string('encrypted_filename')->unique();
            $table->string('mime_type');
            $table->unsignedBigInteger('file_size'); // in bytes

            // Security
            $table->text('encryption_key'); // Encrypted with app key
            $table->string('file_hash', 64); // SHA-256 hash for integrity verification

            // Metadata
            $table->unsignedInteger('downloaded_count')->default(0);
            $table->timestamp('last_downloaded_at')->nullable();

            $table->timestamps();

            // Indexes
            $table->index('contact_request_id');
            $table->index('encrypted_filename');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('contact_request_attachments');
    }
};
