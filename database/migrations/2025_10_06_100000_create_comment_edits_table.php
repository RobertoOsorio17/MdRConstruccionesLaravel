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
        // Create comment_edits table for tracking edit history
        Schema::create('comment_edits', function (Blueprint $table) {
            $table->id();
            $table->foreignId('comment_id')
                ->constrained()
                ->onDelete('cascade')
                ->comment('ID of the edited comment');
            
            $table->foreignId('user_id')
                ->constrained()
                ->onDelete('cascade')
                ->comment('User who made the edit');
            
            $table->text('original_content')
                ->comment('Original content before the edit');
            
            $table->text('new_content')
                ->comment('New content after the edit');
            
            $table->string('edit_reason', 500)
                ->nullable()
                ->comment('Optional reason for the edit provided by the user');
            
            $table->timestamp('edited_at')
                ->comment('Date and time of the edit');
            
            $table->timestamps();
            
            // Indexes for performance
            $table->index(['comment_id', 'edited_at']);
            $table->index('user_id');
        });
        
        // Add edit tracking columns to comments table
        Schema::table('comments', function (Blueprint $table) {
            $table->timestamp('edited_at')
                ->nullable()
                ->after('created_at')
                ->comment('Last edit timestamp');
            
            $table->string('edit_reason', 500)
                ->nullable()
                ->after('edited_at')
                ->comment('Reason for the last edit');
            
            $table->unsignedTinyInteger('edit_count')
                ->default(0)
                ->after('edit_reason')
                ->comment('Total number of edits');
            
            // Index for querying edited comments
            $table->index('edited_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Remove columns from comments table
        Schema::table('comments', function (Blueprint $table) {
            $table->dropIndex(['edited_at']);
            $table->dropColumn(['edited_at', 'edit_reason', 'edit_count']);
        });
        
        // Drop comment_edits table
        Schema::dropIfExists('comment_edits');
    }
};

