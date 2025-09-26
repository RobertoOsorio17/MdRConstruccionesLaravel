<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Post;
use App\Models\Comment;
use App\Models\Category;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class AuthenticationFlowTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    protected $testUser;
    protected $testPost;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Crear categoria de prueba
        $category = Category::create([
            'name' => 'Test Category',
            'slug' => 'test-category',
            'description' => 'Category for testing'
        ]);

        // Crear usuario de prueba
        $this->testUser = User::create([
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => Hash::make('password123'),
            'bio' => 'Test user bio',
            'profession' => 'Developer',
            'profile_visibility' => true,
            'email_verified_at' => now(),
        ]);

        // Crear post de prueba
        $this->testPost = Post::create([
            'user_id' => $this->testUser->id,
            'title' => 'Test Post',
            'slug' => 'test-post',
            'excerpt' => 'This is a test post excerpt',
            'content' => 'This is the full content of the test post.',
            'status' => 'published',
            'published_at' => now(),
        ]);

        $this->testPost->categories()->attach($category->id);
    }

    /** @test */
    public function user_can_register_successfully()
    {
        $userData = [
            'name' => 'New User',
            'email' => 'newuser@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ];

        $response = $this->post('/register', $userData);

        $response->assertRedirect('/dashboard');
        $this->assertDatabaseHas('users', [
            'name' => 'New User',
            'email' => 'newuser@example.com',
        ]);
    }

    /** @test */
    public function user_can_login_successfully()
    {
        $response = $this->post('/login', [
            'email' => 'test@example.com',
            'password' => 'password123',
        ]);

        $response->assertRedirect('/dashboard');
        $this->assertAuthenticatedAs($this->testUser);
    }

    /** @test */
    public function user_cannot_login_with_invalid_credentials()
    {
        $response = $this->post('/login', [
            'email' => 'test@example.com',
            'password' => 'wrongpassword',
        ]);

        $response->assertSessionHasErrors();
        $this->assertGuest();
    }

    /** @test */
    public function user_can_request_password_reset()
    {
        $response = $this->post('/forgot-password', [
            'email' => 'test@example.com',
        ]);

        $response->assertSessionHas('status');
    }

    /** @test */
    public function authenticated_user_can_access_dashboard()
    {
        $response = $this->actingAs($this->testUser)
                         ->get('/dashboard');

        $response->assertOk();
        $response->assertInertia(fn ($page) => 
            $page->component('User/Dashboard')
                 ->has('stats')
                 ->has('recentComments')
                 ->has('recentSavedPosts')
        );
    }

    /** @test */
    public function user_can_view_their_profile()
    {
        $response = $this->actingAs($this->testUser)
                         ->get("/user/{$this->testUser->id}");

        $response->assertOk();
        $response->assertInertia(fn ($page) => 
            $page->component('User/Profile')
                 ->has('profileUser')
                 ->where('profileUser.name', 'Test User')
        );
    }

    /** @test */
    public function user_can_edit_their_profile()
    {
        $updateData = [
            'name' => 'Updated Name',
            'bio' => 'Updated bio',
            'profession' => 'Updated profession',
            'location' => 'Updated location',
        ];

        $response = $this->actingAs($this->testUser)
                         ->put('/profile/update', $updateData);

        $response->assertRedirect();
        $this->assertDatabaseHas('users', [
            'id' => $this->testUser->id,
            'name' => 'Updated Name',
            'bio' => 'Updated bio',
        ]);
    }

    /** @test */
    public function user_can_comment_on_posts()
    {
        $commentData = [
            'body' => 'This is a test comment',
        ];

        $response = $this->actingAs($this->testUser)
                         ->post("/blog/{$this->testPost->slug}/comments", $commentData);

        $response->assertOk();
        $this->assertDatabaseHas('comments', [
            'post_id' => $this->testPost->id,
            'user_id' => $this->testUser->id,
            'body' => 'This is a test comment',
        ]);
    }

    /** @test */
    public function user_can_bookmark_posts()
    {
        $response = $this->actingAs($this->testUser)
                         ->post("/posts/{$this->testPost->id}/bookmark");

        $response->assertOk();
        $response->assertJson(['success' => true]);
        
        // Verificar que se creó la interacción
        $this->assertDatabaseHas('user_interactions', [
            'user_id' => $this->testUser->id,
            'interactable_type' => 'App\Models\Post',
            'interactable_id' => $this->testPost->id,
            'type' => 'bookmark',
        ]);
    }

    /** @test */
    public function user_can_like_posts()
    {
        $response = $this->actingAs($this->testUser)
                         ->post("/posts/{$this->testPost->id}/like");

        $response->assertOk();
        $response->assertJson(['success' => true]);
        
        // Verificar que se creó la interacción
        $this->assertDatabaseHas('user_interactions', [
            'user_id' => $this->testUser->id,
            'interactable_type' => 'App\Models\Post',
            'interactable_id' => $this->testPost->id,
            'type' => 'like',
        ]);
    }

    /** @test */
    public function user_can_follow_other_users()
    {
        $otherUser = User::create([
            'name' => 'Other User',
            'email' => 'other@example.com',
            'password' => Hash::make('password123'),
            'email_verified_at' => now(),
        ]);

        $response = $this->actingAs($this->testUser)
                         ->post("/users/{$otherUser->id}/follow");

        $response->assertOk();
        $response->assertJson(['success' => true]);
        
        // Verificar que se creó la relación
        $this->assertDatabaseHas('user_follows', [
            'follower_id' => $this->testUser->id,
            'following_id' => $otherUser->id,
        ]);
    }

    /** @test */
    public function user_can_view_saved_posts()
    {
        // Primero guardar un post
        $this->actingAs($this->testUser)
             ->post("/posts/{$this->testPost->id}/bookmark");

        $response = $this->actingAs($this->testUser)
                         ->get('/my/saved-posts');

        $response->assertOk();
        $response->assertInertia(fn ($page) => 
            $page->component('User/SavedPosts')
                 ->has('savedPosts')
        );
    }

    /** @test */
    public function user_can_view_their_comments()
    {
        // Crear un comentario
        Comment::create([
            'post_id' => $this->testPost->id,
            'user_id' => $this->testUser->id,
            'body' => 'Test comment',
            'status' => 'approved',
        ]);

        $response = $this->actingAs($this->testUser)
                         ->get('/my/comments');

        $response->assertOk();
        $response->assertInertia(fn ($page) => 
            $page->component('User/Comments')
                 ->has('comments')
        );
    }

    /** @test */
    public function user_can_update_preferences()
    {
        $preferencesData = [
            'email_notifications' => true,
            'browser_notifications' => false,
            'marketing_emails' => true,
            'comment_notifications' => true,
            'follow_notifications' => false,
        ];

        $response = $this->actingAs($this->testUser)
                         ->post('/my/preferences', $preferencesData);

        $response->assertRedirect();
        $response->assertSessionHas('success');
    }

    /** @test */
    public function guest_cannot_access_protected_routes()
    {
        $protectedRoutes = [
            '/dashboard',
            '/my/comments',
            '/my/saved-posts',
            '/my/preferences',
            '/profile/edit',
        ];

        foreach ($protectedRoutes as $route) {
            $response = $this->get($route);
            $response->assertRedirect('/login');
        }
    }

    /** @test */
    public function guest_can_view_public_content()
    {
        $publicRoutes = [
            '/',
            '/blog',
            "/blog/{$this->testPost->slug}",
            '/servicios',
            '/proyectos',
            '/empresa',
            '/contacto',
        ];

        foreach ($publicRoutes as $route) {
            $response = $this->get($route);
            $response->assertOk();
        }
    }

    /** @test */
    public function user_can_logout()
    {
        $response = $this->actingAs($this->testUser)
                         ->post('/logout');

        $response->assertRedirect('/');
        $this->assertGuest();
    }

    /** @test */
    public function middleware_provides_auth_state_to_inertia()
    {
        $response = $this->actingAs($this->testUser)
                         ->get('/dashboard');

        $response->assertOk();
        
        // Verificar que los datos de autenticación están disponibles
        $response->assertInertia(fn ($page) => 
            $page->has('auth')
                 ->where('auth.isAuthenticated', true)
                 ->has('auth.user')
                 ->where('auth.user.name', 'Test User')
        );
    }
}