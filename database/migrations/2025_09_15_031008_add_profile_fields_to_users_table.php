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
            $table->text('bio')->nullable()->after('email');
            $table->string('website')->nullable()->after('bio');
            $table->string('location')->nullable()->after('website');
            $table->string('profession')->nullable()->after('location');
            $table->string('phone')->nullable()->after('profession');
            $table->date('birth_date')->nullable()->after('phone');
            $table->enum('gender', ['male', 'female', 'other', 'prefer_not_to_say'])->nullable()->after('birth_date');
            $table->json('social_links')->nullable()->after('gender');
            $table->boolean('profile_visibility')->default(true)->after('social_links');
            $table->boolean('show_email')->default(false)->after('profile_visibility');
            $table->timestamp('profile_updated_at')->nullable()->after('show_email');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'bio',
                'website',
                'location',
                'profession',
                'phone',
                'birth_date',
                'gender',
                'social_links',
                'profile_visibility',
                'show_email',
                'profile_updated_at'
            ]);
        });
    }
};
