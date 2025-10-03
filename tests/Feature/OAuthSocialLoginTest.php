<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Socialite\Facades\Socialite;
use Laravel\Socialite\Two\User as SocialiteUser;
use Mockery;
use Tests\TestCase;

class OAuthSocialLoginTest extends TestCase
{
    use RefreshDatabase;

    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }

    /** @test */
    public function user_can_redirect_to_google_oauth()
    {
        $response = $this->get(route('social.redirect', ['provider' => 'google']));

        $response->assertRedirect();
    }

    /** @test */
    public function user_can_redirect_to_facebook_oauth()
    {
        $response = $this->get(route('social.redirect', ['provider' => 'facebook']));

        $response->assertRedirect();
    }

    /** @test */
    public function user_can_redirect_to_github_oauth()
    {
        $response = $this->get(route('social.redirect', ['provider' => 'github']));

        $response->assertRedirect();
    }

    /** @test */
    public function unsupported_provider_redirects_to_login_with_error()
    {
        $response = $this->get(route('social.redirect', ['provider' => 'twitter']));

        $response->assertRedirect(route('login'));
        $response->assertSessionHas('error', 'Proveedor de autenticación no soportado.');
    }

    /** @test */
    public function new_user_can_login_with_google()
    {
        $socialiteUser = Mockery::mock(SocialiteUser::class);
        $socialiteUser->shouldReceive('getId')->andReturn('123456');
        $socialiteUser->shouldReceive('getEmail')->andReturn('test@example.com');
        $socialiteUser->shouldReceive('getName')->andReturn('Test User');
        $socialiteUser->shouldReceive('getAvatar')->andReturn('https://example.com/avatar.jpg');
        $socialiteUser->token = 'mock-token';
        $socialiteUser->refreshToken = 'mock-refresh-token';

        Socialite::shouldReceive('driver->user')->andReturn($socialiteUser);

        $response = $this->get(route('social.callback', ['provider' => 'google']));

        $response->assertRedirect(route('dashboard'));
        $response->assertSessionHas('success');

        $this->assertDatabaseHas('users', [
            'email' => 'test@example.com',
            'provider' => 'google',
            'provider_id' => '123456',
        ]);

        $user = User::where('email', 'test@example.com')->first();
        $this->assertNotNull($user->email_verified_at);
        $this->assertNull($user->password);
        $this->assertEquals('user', $user->role);
    }

    /** @test */
    public function existing_user_can_link_oauth_account()
    {
        $existingUser = User::factory()->create([
            'email' => 'test@example.com',
            'password' => bcrypt('password'),
        ]);

        $socialiteUser = Mockery::mock(SocialiteUser::class);
        $socialiteUser->shouldReceive('getId')->andReturn('123456');
        $socialiteUser->shouldReceive('getEmail')->andReturn('test@example.com');
        $socialiteUser->shouldReceive('getName')->andReturn('Test User');
        $socialiteUser->shouldReceive('getAvatar')->andReturn('https://example.com/avatar.jpg');
        $socialiteUser->token = 'mock-token';
        $socialiteUser->refreshToken = 'mock-refresh-token';

        Socialite::shouldReceive('driver->user')->andReturn($socialiteUser);

        $response = $this->get(route('social.callback', ['provider' => 'google']));

        $response->assertRedirect();

        $existingUser->refresh();
        $this->assertEquals('google', $existingUser->provider);
        $this->assertEquals('123456', $existingUser->provider_id);
        $this->assertNotNull($existingUser->provider_token);
    }

    /** @test */
    public function returning_oauth_user_can_login()
    {
        $user = User::factory()->create([
            'email' => 'test@example.com',
            'provider' => 'google',
            'provider_id' => '123456',
            'password' => null,
        ]);

        $socialiteUser = Mockery::mock(SocialiteUser::class);
        $socialiteUser->shouldReceive('getId')->andReturn('123456');
        $socialiteUser->shouldReceive('getEmail')->andReturn('test@example.com');
        $socialiteUser->shouldReceive('getName')->andReturn('Test User');
        $socialiteUser->shouldReceive('getAvatar')->andReturn('https://example.com/avatar.jpg');
        $socialiteUser->token = 'new-mock-token';
        $socialiteUser->refreshToken = 'new-mock-refresh-token';

        Socialite::shouldReceive('driver->user')->andReturn($socialiteUser);

        $response = $this->get(route('social.callback', ['provider' => 'google']));

        $response->assertRedirect();
        $this->assertAuthenticatedAs($user);

        $user->refresh();
        $this->assertNotNull($user->provider_token);
    }

    /** @test */
    public function admin_user_redirects_to_admin_dashboard_after_oauth_login()
    {
        $socialiteUser = Mockery::mock(SocialiteUser::class);
        $socialiteUser->shouldReceive('getId')->andReturn('admin123');
        $socialiteUser->shouldReceive('getEmail')->andReturn('admin@example.com');
        $socialiteUser->shouldReceive('getName')->andReturn('Admin User');
        $socialiteUser->shouldReceive('getAvatar')->andReturn('https://example.com/avatar.jpg');
        $socialiteUser->token = 'mock-token';
        $socialiteUser->refreshToken = 'mock-refresh-token';

        Socialite::shouldReceive('driver->user')->andReturn($socialiteUser);

        // Create admin user first
        User::factory()->create([
            'email' => 'admin@example.com',
            'role' => 'admin',
            'provider' => 'google',
            'provider_id' => 'admin123',
        ]);

        $response = $this->get(route('social.callback', ['provider' => 'google']));

        $response->assertRedirect(route('admin.dashboard'));
    }

    /** @test */
    public function user_cannot_unlink_oauth_without_password()
    {
        $user = User::factory()->create([
            'email' => 'test@example.com',
            'provider' => 'google',
            'provider_id' => '123456',
            'password' => null,
        ]);

        $response = $this->actingAs($user)
            ->delete(route('social.unlink', ['provider' => 'google']));

        $response->assertRedirect();
        $response->assertSessionHas('error');

        $user->refresh();
        $this->assertEquals('google', $user->provider);
    }

    /** @test */
    public function user_can_unlink_oauth_with_password_set()
    {
        $user = User::factory()->create([
            'email' => 'test@example.com',
            'provider' => 'google',
            'provider_id' => '123456',
            'password' => bcrypt('password'),
        ]);

        $response = $this->actingAs($user)
            ->delete(route('social.unlink', ['provider' => 'google']));

        $response->assertRedirect();
        $response->assertSessionHas('success');

        $user->refresh();
        $this->assertNull($user->provider);
        $this->assertNull($user->provider_id);
        $this->assertNull($user->provider_token);
    }

    /** @test */
    public function user_cannot_unlink_wrong_provider()
    {
        $user = User::factory()->create([
            'email' => 'test@example.com',
            'provider' => 'google',
            'provider_id' => '123456',
            'password' => bcrypt('password'),
        ]);

        $response = $this->actingAs($user)
            ->delete(route('social.unlink', ['provider' => 'facebook']));

        $response->assertRedirect();
        $response->assertSessionHas('error');

        $user->refresh();
        $this->assertEquals('google', $user->provider);
    }

    /** @test */
    public function oauth_callback_handles_errors_gracefully()
    {
        Socialite::shouldReceive('driver->user')->andThrow(new \Exception('OAuth error'));

        $response = $this->get(route('social.callback', ['provider' => 'google']));

        $response->assertRedirect(route('login'));
        $response->assertSessionHas('error');
    }
}

