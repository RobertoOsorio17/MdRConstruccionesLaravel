<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Fortify\Contracts\TwoFactorAuthenticationProvider;
use Tests\TestCase;

class TwoFactorAuthenticationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Create a test user
        $this->user = User::factory()->create([
            'email' => 'test@example.com',
            'password' => bcrypt('password'),
            'role' => 'admin',
        ]);
    }

    /** @test */
    public function user_can_view_two_factor_setup_page()
    {
        $response = $this->actingAs($this->user)
            ->get(route('two-factor.show'));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Auth/TwoFactorSetup')
            ->has('twoFactorEnabled')
            ->has('twoFactorConfirmed')
        );
    }

    /** @test */
    public function user_can_enable_two_factor_authentication()
    {
        $response = $this->actingAs($this->user)
            ->post(route('two-factor.enable'));

        $response->assertRedirect();
        $response->assertSessionHas('status', 'two-factor-authentication-enabled');

        $this->user->refresh();
        $this->assertNotNull($this->user->two_factor_secret);
        $this->assertNotNull($this->user->two_factor_recovery_codes);
    }

    /** @test */
    public function user_can_get_qr_code_after_enabling()
    {
        // Enable 2FA first
        $this->actingAs($this->user)
            ->post(route('two-factor.enable'));

        $response = $this->actingAs($this->user)
            ->get(route('two-factor.qr-code'));

        $response->assertStatus(200);
        $response->assertJsonStructure(['svg', 'url']);
    }

    /** @test */
    public function user_cannot_get_qr_code_without_enabling_first()
    {
        $response = $this->actingAs($this->user)
            ->get(route('two-factor.qr-code'));

        $response->assertStatus(400);
        $response->assertJson(['error' => 'Two factor authentication is not enabled.']);
    }

    /** @test */
    public function user_can_confirm_two_factor_with_valid_code()
    {
        // Enable 2FA
        $this->actingAs($this->user)
            ->post(route('two-factor.enable'));

        $this->user->refresh();

        // Get a valid code using google2fa directly
        $google2fa = app(\PragmaRX\Google2FA\Google2FA::class);
        $code = $google2fa->getCurrentOtp(decrypt($this->user->two_factor_secret));

        $response = $this->actingAs($this->user)
            ->post(route('two-factor.confirm'), ['code' => $code]);

        $response->assertRedirect();
        $response->assertSessionHas('status', 'two-factor-authentication-confirmed');

        $this->user->refresh();
        $this->assertNotNull($this->user->two_factor_confirmed_at);
    }

    /** @test */
    public function user_cannot_confirm_with_invalid_code()
    {
        // Enable 2FA
        $this->actingAs($this->user)
            ->post(route('two-factor.enable'));

        $response = $this->actingAs($this->user)
            ->post(route('two-factor.confirm'), ['code' => '000000']);

        $response->assertRedirect();
        $response->assertSessionHasErrors('code');

        $this->user->refresh();
        $this->assertNull($this->user->two_factor_confirmed_at);
    }

    /** @test */
    public function user_can_get_recovery_codes()
    {
        // Enable 2FA
        $this->actingAs($this->user)
            ->post(route('two-factor.enable'));

        $response = $this->actingAs($this->user)
            ->get(route('two-factor.recovery-codes'));

        $response->assertStatus(200);
        $response->assertJsonStructure(['recoveryCodes']);
        $this->assertCount(8, $response->json('recoveryCodes'));
    }

    /** @test */
    public function user_can_regenerate_recovery_codes()
    {
        // Enable and confirm 2FA
        $this->actingAs($this->user)
            ->post(route('two-factor.enable'));

        $this->user->refresh();
        $oldCodes = $this->user->two_factor_recovery_codes;

        $response = $this->actingAs($this->user)
            ->post(route('two-factor.recovery-codes.regenerate'));

        $response->assertRedirect();
        $response->assertSessionHas('status', 'recovery-codes-generated');

        $this->user->refresh();
        $this->assertNotEquals($oldCodes, $this->user->two_factor_recovery_codes);
    }

    /** @test */
    public function user_can_disable_two_factor_authentication()
    {
        // Enable 2FA
        $this->actingAs($this->user)
            ->post(route('two-factor.enable'));

        $this->user->refresh();
        $this->assertNotNull($this->user->two_factor_secret);

        $response = $this->actingAs($this->user)
            ->delete(route('two-factor.disable'));

        $response->assertRedirect();
        $response->assertSessionHas('status', 'two-factor-authentication-disabled');

        $this->user->refresh();
        $this->assertNull($this->user->two_factor_secret);
        $this->assertNull($this->user->two_factor_recovery_codes);
        $this->assertNull($this->user->two_factor_confirmed_at);
    }

    /** @test */
    public function guest_cannot_access_two_factor_routes()
    {
        $routes = [
            ['get', route('two-factor.show')],
            ['post', route('two-factor.enable')],
            ['get', route('two-factor.qr-code')],
            ['get', route('two-factor.recovery-codes')],
        ];

        foreach ($routes as [$method, $route]) {
            $response = $this->$method($route);
            $response->assertRedirect(route('login'));
        }
    }

    /** @test */
    public function two_factor_challenge_page_is_accessible()
    {
        $response = $this->get(route('two-factor.login'));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Auth/TwoFactorChallenge')
        );
    }
}

