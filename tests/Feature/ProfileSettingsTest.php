<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\UserDevice;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProfileSettingsTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function user_can_access_settings_page()
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->get('/profile/settings');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Profile/Settings')
            ->has('user')
            ->has('devices')
            ->has('deviceStats')
            ->has('connectedAccounts')
            ->has('twoFactorEnabled')
        );
    }

    /** @test */
    public function legacy_profile_edit_redirects_to_settings()
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->get('/profile');

        $response->assertRedirect('/profile/settings?tab=personal');
    }

    /** @test */
    public function settings_page_includes_device_stats()
    {
        $user = User::factory()->create();
        
        // Create some devices
        UserDevice::factory()->count(3)->create([
            'user_id' => $user->id,
            'is_trusted' => true,
            'last_used_at' => now()
        ]);

        UserDevice::factory()->count(2)->create([
            'user_id' => $user->id,
            'is_trusted' => false,
            'last_used_at' => now()->subDays(40) // Inactive
        ]);

        $response = $this->actingAs($user)->get('/profile/settings');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->where('deviceStats.total', 5)
            ->where('deviceStats.active', 3)
            ->where('deviceStats.trusted', 3)
        );
    }

    /** @test */
    public function settings_page_shows_connected_oauth_accounts()
    {
        $user = User::factory()->create([
            'provider' => 'google',
            'provider_id' => '123456789'
        ]);

        $response = $this->actingAs($user)->get('/profile/settings');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->where('connectedAccounts.0.provider', 'google')
            ->where('connectedAccounts.0.provider_id', '123456789')
        );
    }

    /** @test */
    public function settings_page_shows_two_factor_status()
    {
        $user = User::factory()->create([
            'two_factor_secret' => encrypt('secret'),
            'two_factor_confirmed_at' => now()
        ]);

        $response = $this->actingAs($user)->get('/profile/settings');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->where('twoFactorEnabled', true)
        );
    }

    /** @test */
    public function settings_page_shows_recovery_codes_when_2fa_enabled()
    {
        $recoveryCodes = ['code1', 'code2', 'code3'];
        $user = User::factory()->create([
            'two_factor_secret' => encrypt('secret'),
            'two_factor_confirmed_at' => now(),
            'two_factor_recovery_codes' => encrypt(json_encode($recoveryCodes))
        ]);

        $response = $this->actingAs($user)->get('/profile/settings');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->where('twoFactorEnabled', true)
            ->has('recoveryCodes', 3)
        );
    }

    /** @test */
    public function guest_cannot_access_settings_page()
    {
        $response = $this->get('/profile/settings');

        $response->assertRedirect('/login');
    }

    /** @test */
    public function settings_page_includes_has_password_flag()
    {
        // User with password
        $userWithPassword = User::factory()->create([
            'password' => bcrypt('password123')
        ]);

        $response = $this->actingAs($userWithPassword)->get('/profile/settings');
        $response->assertInertia(fn ($page) => $page->where('hasPassword', true));

        // User without password (OAuth only)
        $userWithoutPassword = User::factory()->create([
            'password' => null,
            'provider' => 'google',
            'provider_id' => '123456'
        ]);

        $response = $this->actingAs($userWithoutPassword)->get('/profile/settings');
        $response->assertInertia(fn ($page) => $page->where('hasPassword', false));
    }

    /** @test */
    public function settings_page_includes_notification_settings()
    {
        $user = User::factory()->create([
            'preferences' => [
                'notifications' => [
                    'email_comments' => true,
                    'email_likes' => false
                ]
            ]
        ]);

        $response = $this->actingAs($user)->get('/profile/settings');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->has('notificationSettings')
        );
    }

    /** @test */
    public function settings_page_includes_privacy_settings()
    {
        $user = User::factory()->create([
            'profile_visibility' => true,
            'show_email' => false
        ]);

        $response = $this->actingAs($user)->get('/profile/settings');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->where('privacySettings.profile_visibility', true)
            ->where('privacySettings.show_email', false)
        );
    }
}

