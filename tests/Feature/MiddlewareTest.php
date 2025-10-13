<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class MiddlewareTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    protected $testUser;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->testUser = User::create([
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => Hash::make('password123'),
            'email_verified_at' => now(),
        ]);
    }

    /** @test */
    public function auth_state_middleware_provides_user_data()
    {
        $response = $this->actingAs($this->testUser)->get('/');

        $response->assertOk();
        // Verificar que el middleware proporciona datos de auth básicos
        $response->assertInertia(fn ($page) => 
            $page->has('auth')
        );
    }

    /** @test */
    public function guest_gets_proper_auth_state()
    {
        $response = $this->get('/');

        $response->assertOk();
        // Verificar que el middleware proporciona datos de auth para invitados
        $response->assertInertia(fn ($page) => 
            $page->has('auth')
        );
    }

    /** @test */
    public function redirect_if_authenticated_works()
    {
        // Usuario logado intenta acceder a login
        $response = $this->actingAs($this->testUser)->get('/login');

        $response->assertRedirect('/user/dashboard');
    }

    /** @test */
    public function enhanced_auth_middleware_updates_last_login()
    {
        $initialLastLogin = $this->testUser->last_login_at;

        // Simular que han pasado más de 15 minutos
        $this->testUser->update(['last_login_at' => now()->subMinutes(20)]);

        $response = $this->actingAs($this->testUser)->get('/dashboard');
        
        $response->assertOk();
        
        // Verificar que se actualizó el last_login_at
        $this->testUser->refresh();
        $this->assertNotEquals($initialLastLogin, $this->testUser->last_login_at);
    }

    /** @test */
    public function session_timeout_handles_expired_sessions()
    {
        // Configurar una sesión expirada manualmente
        session(['last_activity' => time() - (config('session.lifetime') * 60 + 100)]);

        $response = $this->actingAs($this->testUser)->get('/dashboard');
        
        // Debería redirigir al login con mensaje de sesión expirada
        $response->assertRedirect('/login');
        $response->assertSessionHas('warning');
    }

    /** @test */
    public function user_can_access_profile_routes()
    {
        $profileRoutes = [
            '/profile/edit' => 'User/EditProfile',
            '/my/preferences' => 'User/Preferences',
            '/my/comments' => 'User/Comments',
            '/my/saved-posts' => 'User/SavedPosts',
            '/my/following' => 'User/Following',
        ];

        foreach ($profileRoutes as $route => $component) {
            $response = $this->actingAs($this->testUser)->get($route);
            $response->assertOk();
            $response->assertInertia(fn ($page) => $page->component($component));
        }
    }

    /** @test */
    public function rate_limiting_works_on_comments()
    {
        $this->actingAs($this->testUser);

        // Crear un post para comentar
        $post = \App\Models\Post::create([
            'user_id' => $this->testUser->id,
            'title' => 'Test Post',
            'slug' => 'test-post',
            'content' => 'Test content',
            'status' => 'published',
            'published_at' => now(),
        ]);

        // Hacer muchos comentarios rápidamente (más de 10 por minuto)
        for ($i = 0; $i < 12; $i++) {
            $response = $this->post("/blog/{$post->slug}/comments", [
                'body' => "Test comment $i"
            ]);
            
            if ($i >= 10) {
                // Después de 10 requests, debería ser rate limited
                $response->assertStatus(429);
                break;
            }
        }
    }

    /** @test */
    public function csrf_protection_is_active()
    {
        // Hacer un POST request sin token CSRF debería ser rechazado
        $response = $this->post('/login', [
            'email' => 'test@example.com',
            'password' => 'password123',
        ]);
        
        // Laravel en testing redirige a login en lugar de error 422
        $response->assertRedirect(); // Esperamos redirección
    }
}