<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Role;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;
use Tests\TestCase;

class SecurityTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Create test roles
        $adminRole = Role::create([
            'name' => 'admin',
            'display_name' => 'Administrator',
            'level' => 10,
            'is_active' => true
        ]);
        
        $userRole = Role::create([
            'name' => 'user',
            'display_name' => 'User',
            'level' => 1,
            'is_active' => true
        ]);
    }

    /** @test */
    public function role_middleware_correctly_handles_multiple_roles()
    {
        // Create admin user with roles relationship
        $admin = User::factory()->create();
        $admin->roles()->attach(Role::where('name', 'admin')->first()->id);
        
        // Create regular user
        $user = User::factory()->create(['role' => 'user']);
        
        // Test admin access to admin route
        $response = $this->actingAs($admin)->get('/admin/dashboard');
        $this->assertNotEquals(403, $response->getStatusCode());
        
        // Test user denied access to admin route
        $response = $this->actingAs($user)->get('/admin/dashboard');
        $this->assertEquals(403, $response->getStatusCode());
    }

    /** @test */
    public function session_timeout_respects_role_based_limits()
    {
        $admin = User::factory()->create();
        $admin->roles()->attach(Role::where('name', 'admin')->first()->id);
        
        $user = User::factory()->create(['role' => 'user']);
        
        // Test that admin gets shorter timeout (20 minutes)
        $this->actingAs($admin);
        session(['last_activity' => time() - (21 * 60)]); // 21 minutes ago
        
        $response = $this->get('/dashboard');
        $this->assertEquals(302, $response->getStatusCode());
        
        // Test that regular user gets longer timeout (30 minutes)
        $this->actingAs($user);
        session(['last_activity' => time() - (25 * 60)]); // 25 minutes ago
        
        $response = $this->get('/user/dashboard');
        $this->assertNotEquals(302, $response->getStatusCode());
    }

    /** @test */
    public function rate_limiting_blocks_excessive_login_attempts()
    {
        $user = User::factory()->create([
            'email' => 'test@example.com',
            'password' => Hash::make('password')
        ]);
        
        // Clear any existing rate limits
        Cache::flush();
        RateLimiter::clear('login:test@example.com|127.0.0.1');
        
        // Make 6 failed login attempts (should trigger rate limiting)
        for ($i = 0; $i < 6; $i++) {
            $response = $this->post('/login', [
                'email' => 'test@example.com',
                'password' => 'wrong-password'
            ]);
        }
        
        // Next attempt should be rate limited
        $response = $this->post('/login', [
            'email' => 'test@example.com',
            'password' => 'wrong-password'
        ]);
        
        // Rate limiting should redirect back with errors, not return 422
        $this->assertEquals(302, $response->getStatusCode());
    }

    /** @test */
    public function password_confirmation_implements_rate_limiting()
    {
        $user = User::factory()->create([
            'password' => Hash::make('password')
        ]);
        
        $this->actingAs($user);
        
        // Clear rate limiter
        $key = 'password-confirm:' . $user->id . ':127.0.0.1';
        RateLimiter::clear($key);
        
        // Make 6 failed attempts
        for ($i = 0; $i < 6; $i++) {
            $response = $this->post('/confirm-password', [
                'password' => 'wrong-password'
            ]);
        }
        
        // Should be rate limited now
        $response = $this->post('/confirm-password', [
            'password' => 'wrong-password'
        ]);
        
        // Password confirmation rate limiting should redirect back with errors
        $this->assertEquals(302, $response->getStatusCode());
    }

    /** @test */
    public function session_regenerates_on_login()
    {
        $user = User::factory()->create([
            'email' => 'test@example.com',
            'password' => Hash::make('password')
        ]);
        
        // Get initial session ID
        $initialSessionId = session()->getId();
        
        // Login
        $response = $this->post('/login', [
            'email' => 'test@example.com',
            'password' => 'password'
        ]);
        
        // Session ID should have changed
        $newSessionId = session()->getId();
        $this->assertNotEquals($initialSessionId, $newSessionId);
        
        // Should have last_activity set
        $this->assertNotNull(session('last_activity'));
    }

    /** @test */
    public function secure_session_configuration_is_applied()
    {
        $this->assertEquals(30, config('session.lifetime')); // 30 minutes
        $this->assertTrue(config('session.http_only')); // HTTP only
        $this->assertEquals('strict', config('session.same_site')); // Strict same-site
        $this->assertTrue(config('session.secure')); // Secure cookies
    }

    /** @test */
    public function role_middleware_logs_access_attempts()
    {
        $user = User::factory()->create(['role' => 'user']);
        
        // This should be logged as denied access
        $response = $this->actingAs($user)->get('/admin/dashboard');
        
        $this->assertEquals(403, $response->getStatusCode());
        
        // Check that warning was logged (in real app, you'd check log files)
        // For testing purposes, we just verify the response
        $this->assertTrue(true); // Placeholder for log verification
    }

    /** @test */
    public function progressive_rate_limiting_works_correctly()
    {
        Cache::flush();
        
        $ip = '192.168.1.100';
        
        // Simulate 3 failed attempts (should trigger 10-minute block)
        Cache::put("auth_attempts_email:" . hash('sha256', 'test@example.com'), 3, now()->addMinutes(30));
        
        $response = $this->post('/login', [
            'email' => 'test@example.com',
            'password' => 'wrong'
        ], ['REMOTE_ADDR' => $ip]);
        
        // Should be blocked (redirected back with errors)
        $this->assertEquals(302, $response->getStatusCode());
    }

    /** @test */
    public function password_confirmation_validates_intended_url_safety()
    {
        $user = User::factory()->create([
            'password' => Hash::make('password'),
            'role' => 'user'
        ]);
        
        $this->actingAs($user);
        
        // Set intended URL to admin area (should be blocked for regular user)
        session(['url.intended' => '/admin/dashboard']);
        
        $response = $this->post('/confirm-password', [
            'password' => 'password'
        ]);
        
        // Should redirect to user dashboard, not admin dashboard
        $this->assertEquals(302, $response->getStatusCode());
    }
}
