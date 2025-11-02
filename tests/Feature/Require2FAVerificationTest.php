<?php

namespace Tests\Feature;

use App\Models\AdminSetting;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class Require2FAVerificationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        // Create roles
        Role::create(['name' => 'admin', 'display_name' => 'Administrator']);
        Role::create(['name' => 'editor', 'display_name' => 'Editor']);
        Role::create(['name' => 'user', 'display_name' => 'User']);

        // Clear cache before each test
        Cache::flush();
    }

    /** @test */
    public function middleware_allows_access_when_2fa_is_globally_disabled()
    {
        // Disable 2FA globally
        AdminSetting::setValue('enable_2fa', false);
        Cache::forget('setting.enable_2fa');

        $admin = User::factory()->create();
        $admin->assignRole('admin');

        $response = $this->actingAs($admin)->get('/dashboard');

        $response->assertOk();
    }

    /** @test */
    public function middleware_redirects_admin_without_2fa_to_profile_settings()
    {
        // Enable 2FA globally
        AdminSetting::setValue('enable_2fa', true);
        Cache::forget('setting.enable_2fa');

        $admin = User::factory()->create([
            'two_factor_secret' => null,
            'two_factor_confirmed_at' => null,
        ]);
        $admin->assignRole('admin');

        $response = $this->actingAs($admin)->get('/dashboard');

        $response->assertRedirect(route('profile.settings', ['tab' => 'security']));
        $response->assertSessionHas('error');
        $this->assertTrue(session()->has('2fa_setup_mandatory'));
    }

    /** @test */
    public function middleware_redirects_editor_without_2fa_to_profile_settings()
    {
        // Enable 2FA globally
        AdminSetting::setValue('enable_2fa', true);
        Cache::forget('setting.enable_2fa');

        $editor = User::factory()->create([
            'two_factor_secret' => null,
            'two_factor_confirmed_at' => null,
        ]);
        $editor->assignRole('editor');

        $response = $this->actingAs($editor)->get('/dashboard');

        $response->assertRedirect(route('profile.settings', ['tab' => 'security']));
        $response->assertSessionHas('error');
        $this->assertTrue(session()->has('2fa_setup_mandatory'));
    }

    /** @test */
    public function middleware_allows_regular_user_without_2fa_with_warning()
    {
        // Enable 2FA globally
        AdminSetting::setValue('enable_2fa', true);
        Cache::forget('setting.enable_2fa');

        $user = User::factory()->create([
            'two_factor_secret' => null,
            'two_factor_confirmed_at' => null,
        ]);
        $user->assignRole('user');

        $response = $this->actingAs($user)->get('/dashboard');

        $response->assertOk();
        $this->assertTrue(session()->has('2fa_warning'));
    }

    /** @test */
    public function middleware_allows_admin_with_2fa_enabled()
    {
        // Enable 2FA globally
        AdminSetting::setValue('enable_2fa', true);
        Cache::forget('setting.enable_2fa');

        $admin = User::factory()->create([
            'two_factor_secret' => encrypt('secret'),
            'two_factor_confirmed_at' => now(),
        ]);
        $admin->assignRole('admin');

        $response = $this->actingAs($admin)->get('/dashboard');

        $response->assertOk();
        $this->assertFalse(session()->has('2fa_setup_mandatory'));
    }

    /** @test */
    public function middleware_excludes_2fa_setup_routes()
    {
        // Enable 2FA globally
        AdminSetting::setValue('enable_2fa', true);
        Cache::forget('setting.enable_2fa');

        $admin = User::factory()->create([
            'two_factor_secret' => null,
            'two_factor_confirmed_at' => null,
        ]);
        $admin->assignRole('admin');

        // These routes should be accessible even without 2FA
        $excludedRoutes = [
            route('profile.settings'),
            route('logout'),
        ];

        foreach ($excludedRoutes as $route) {
            $response = $this->actingAs($admin)->get($route);
            // Should not redirect to 2FA setup (may redirect elsewhere or return 200)
            $this->assertNotEquals(
                route('profile.settings', ['tab' => 'security']),
                $response->headers->get('Location')
            );
        }
    }

    /** @test */
    public function middleware_excludes_notification_routes()
    {
        // Enable 2FA globally
        AdminSetting::setValue('enable_2fa', true);
        Cache::forget('setting.enable_2fa');

        $admin = User::factory()->create([
            'two_factor_secret' => null,
            'two_factor_confirmed_at' => null,
        ]);
        $admin->assignRole('admin');

        // Notification routes should be accessible
        $response = $this->actingAs($admin)->get(route('notifications.unread-count'));
        $response->assertOk();

        $response = $this->actingAs($admin)->get(route('notifications.recent'));
        $response->assertOk();
    }

    /** @test */
    public function middleware_returns_json_for_api_requests()
    {
        // Enable 2FA globally
        AdminSetting::setValue('enable_2fa', true);
        Cache::forget('setting.enable_2fa');

        $admin = User::factory()->create([
            'two_factor_secret' => null,
            'two_factor_confirmed_at' => null,
        ]);
        $admin->assignRole('admin');

        $response = $this->actingAs($admin)
            ->withHeaders(['Accept' => 'application/json'])
            ->get('/dashboard');

        $response->assertStatus(403);
        $response->assertJson([
            'requires_2fa' => true,
            'force_2fa_setup' => true,
        ]);
    }

    /** @test */
    public function middleware_clears_mandatory_flag_when_2fa_is_enabled()
    {
        // Enable 2FA globally
        AdminSetting::setValue('enable_2fa', true);
        Cache::forget('setting.enable_2fa');

        $admin = User::factory()->create([
            'two_factor_secret' => encrypt('secret'),
            'two_factor_confirmed_at' => now(),
        ]);
        $admin->assignRole('admin');

        // Set mandatory flag manually
        session()->put('2fa_setup_mandatory', true);
        session()->put('2fa_setup_user_id', $admin->id);

        $response = $this->actingAs($admin)->get('/dashboard');

        $response->assertOk();
        $this->assertFalse(session()->has('2fa_setup_mandatory'));
        $this->assertFalse(session()->has('2fa_setup_user_id'));
    }

    /** @test */
    public function middleware_allows_guest_users()
    {
        // Enable 2FA globally
        AdminSetting::setValue('enable_2fa', true);
        Cache::forget('setting.enable_2fa');

        $response = $this->get('/');

        $response->assertOk();
    }

    /** @test */
    public function middleware_does_not_block_admin_heartbeat_routes()
    {
        // Enable 2FA globally
        AdminSetting::setValue('enable_2fa', true);
        Cache::forget('setting.enable_2fa');

        $admin = User::factory()->create([
            'two_factor_secret' => null,
            'two_factor_confirmed_at' => null,
        ]);
        $admin->assignRole('admin');

        // Admin heartbeat should be accessible
        $response = $this->actingAs($admin)->post(route('admin.heartbeat'));
        
        // Should not redirect to 2FA setup
        $this->assertNotEquals(
            route('profile.settings', ['tab' => 'security']),
            $response->headers->get('Location')
        );
    }
}

