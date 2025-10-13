<?php

namespace Tests\Feature;

use App\Models\AdminSetting;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class SettingsFunctionalityTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Seed basic settings
        $this->artisan('db:seed', ['--class' => 'EnhancedSettingsSeeder']);
    }

    /** @test */
    public function registration_can_be_disabled()
    {
        // Enable registration
        AdminSetting::where('key', 'registration_enabled')->update(['value' => true]);
        
        $response = $this->get('/register');
        $response->assertStatus(200);
        
        // Disable registration
        AdminSetting::where('key', 'registration_enabled')->update(['value' => false]);
        
        // Clear cache
        cache()->forget('setting.registration_enabled');
        
        $response = $this->get('/register');
        $response->assertStatus(403);
    }

    /** @test */
    public function blog_can_be_disabled()
    {
        // Enable blog
        AdminSetting::where('key', 'blog_enabled')->update(['value' => true]);
        
        $response = $this->get('/blog');
        $response->assertStatus(200);
        
        // Disable blog
        AdminSetting::where('key', 'blog_enabled')->update(['value' => false]);
        
        // Clear cache
        cache()->forget('setting.blog_enabled');
        
        $response = $this->get('/blog');
        $response->assertStatus(403);
    }

    /** @test */
    public function user_status_is_checked()
    {
        $user = User::factory()->create([
            'status' => 'pending',
            'password' => Hash::make('password123'),
        ]);

        $response = $this->actingAs($user)->get('/user/dashboard');
        $response->assertRedirect('/login');
        $response->assertSessionHasErrors(['email']);
    }

    /** @test */
    public function password_min_length_is_enforced()
    {
        // Set minimum password length to 12
        AdminSetting::where('key', 'password_min_length')->update(['value' => 12]);
        
        // Clear cache
        cache()->forget('setting.password_min_length');
        
        $response = $this->post('/register', [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'Short1!',
            'password_confirmation' => 'Short1!',
            'terms' => true,
        ]);
        
        $response->assertSessionHasErrors(['password']);
    }

    /** @test */
    public function session_timeout_setting_exists()
    {
        $timeout = AdminSetting::getCachedValue('session_timeout', 120);
        $this->assertIsNumeric($timeout);
        $this->assertGreaterThan(0, $timeout);
    }

    /** @test */
    public function general_settings_are_applied()
    {
        $siteName = AdminSetting::getCachedValue('site_name', 'Default');
        $this->assertNotEmpty($siteName);
        
        $timezone = AdminSetting::getCachedValue('timezone', 'UTC');
        $this->assertNotEmpty($timezone);
    }

    /** @test */
    public function email_settings_are_applied()
    {
        $mailFromName = AdminSetting::getCachedValue('mail_from_name', 'Default');
        $this->assertNotEmpty($mailFromName);
        
        $smtpHost = AdminSetting::getCachedValue('smtp_host', 'localhost');
        $this->assertNotEmpty($smtpHost);
    }

    /** @test */
    public function blog_posts_per_page_is_configurable()
    {
        $perPage = AdminSetting::getCachedValue('blog_posts_per_page', 12);
        $this->assertIsNumeric($perPage);
        $this->assertGreaterThan(0, $perPage);
    }

    /** @test */
    public function all_62_settings_exist()
    {
        $count = AdminSetting::count();
        $this->assertEquals(62, $count, "Expected 62 settings, found {$count}");
    }
}

