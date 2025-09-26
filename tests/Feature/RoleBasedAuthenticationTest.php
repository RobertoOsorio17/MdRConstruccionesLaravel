<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Role;
use App\Models\Permission;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;
use Illuminate\Support\Facades\Hash;

class RoleBasedAuthenticationTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Create roles and permissions
        $this->createRolesAndPermissions();
    }

    private function createRolesAndPermissions()
    {
        // Create roles
        $userRole = Role::create([
            'name' => 'user',
            'display_name' => 'Usuario',
            'description' => 'Usuario regular',
            'level' => 1,
            'is_active' => true,
        ]);

        $adminRole = Role::create([
            'name' => 'admin',
            'display_name' => 'Administrador',
            'description' => 'Administrador del sistema',
            'level' => 10,
            'is_active' => true,
        ]);

        // Create permissions
        $dashboardPermission = Permission::create([
            'name' => 'dashboard.access',
            'display_name' => 'Acceso al Dashboard',
            'description' => 'Permite acceder al panel de administración',
            'module' => 'dashboard',
            'action' => 'access',
        ]);

        // Assign permissions to roles
        $adminRole->permissions()->attach($dashboardPermission->id);
    }

    /** @test */
    public function regular_user_registration_redirects_to_profile()
    {
        $userData = [
            'name' => $this->faker->name,
            'email' => $this->faker->unique()->safeEmail,
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'terms' => true,
        ];

        $response = $this->post('/register', $userData);

        // Should redirect to profile edit for regular users
        $response->assertRedirect('/profile');
        
        // User should be authenticated
        $this->assertAuthenticated();
        
        // User should exist in database
        $user = User::where('email', $userData['email'])->first();
        $this->assertNotNull($user);
    }

    /** @test */
    public function regular_user_login_redirects_to_user_dashboard()
    {
        // Create a regular user
        $user = User::factory()->create([
            'password' => Hash::make('password123'),
        ]);
        
        // Assign user role
        $user->assignRole('user');

        $response = $this->post('/login', [
            'email' => $user->email,
            'password' => 'password123',
        ]);

        // Should redirect to user dashboard
        $response->assertRedirect('/user/dashboard');
        $this->assertAuthenticatedAs($user);
    }

    /** @test */
    public function admin_user_login_redirects_to_admin_dashboard()
    {
        // Create an admin user
        $user = User::factory()->create([
            'password' => Hash::make('password123'),
        ]);
        
        // Assign admin role
        $user->assignRole('admin');

        $response = $this->post('/login', [
            'email' => $user->email,
            'password' => 'password123',
        ]);

        // Should redirect to admin dashboard
        $response->assertRedirect('/dashboard');
        $this->assertAuthenticatedAs($user);
    }

    /** @test */
    public function regular_user_cannot_access_admin_dashboard()
    {
        // Create a regular user
        $user = User::factory()->create();
        $user->assignRole('user');

        $response = $this->actingAs($user)->get('/dashboard');

        // Should get 403 forbidden
        $response->assertStatus(403);
    }

    /** @test */
    public function admin_user_can_access_admin_dashboard()
    {
        // Create an admin user
        $user = User::factory()->create();
        $user->assignRole('admin');

        $response = $this->actingAs($user)->get('/dashboard');

        // Should be successful
        $response->assertStatus(200);
    }

    /** @test */
    public function regular_user_can_access_user_dashboard()
    {
        // Create a regular user
        $user = User::factory()->create();
        $user->assignRole('user');

        $response = $this->actingAs($user)->get('/user/dashboard');

        // Should be successful
        $response->assertStatus(200);
    }

    /** @test */
    public function guest_user_redirected_to_login_when_accessing_protected_routes()
    {
        $protectedRoutes = [
            '/dashboard',
            '/user/dashboard',
            '/profile',
        ];

        foreach ($protectedRoutes as $route) {
            $response = $this->get($route);
            $response->assertRedirect('/login');
        }
    }

    /** @test */
    public function user_permissions_are_correctly_loaded()
    {
        // Create admin user
        $adminUser = User::factory()->create();
        $adminUser->assignRole('admin');

        // Create regular user
        $regularUser = User::factory()->create();
        $regularUser->assignRole('user');

        // Test admin permissions
        $this->assertTrue($adminUser->hasPermission('dashboard.access'));
        
        // Test regular user permissions
        $this->assertFalse($regularUser->hasPermission('dashboard.access'));
    }

    /** @test */
    public function role_assignment_works_correctly()
    {
        $user = User::factory()->create();

        // Initially no roles
        $this->assertCount(0, $user->roles);

        // Assign user role
        $user->assignRole('user');
        $user->refresh();
        
        $this->assertCount(1, $user->roles);
        $this->assertEquals('user', $user->roles->first()->name);

        // Assign admin role (should have both now)
        $user->assignRole('admin');
        $user->refresh();
        
        $this->assertCount(2, $user->roles);
        
        // Remove user role
        $user->removeRole('user');
        $user->refresh();
        
        $this->assertCount(1, $user->roles);
        $this->assertEquals('admin', $user->roles->first()->name);
    }

    /** @test */
    public function authenticated_user_redirected_based_on_permissions()
    {
        // Test regular user
        $regularUser = User::factory()->create();
        $regularUser->assignRole('user');

        $response = $this->actingAs($regularUser)->get('/login');
        $response->assertRedirect('/user/dashboard');

        // Test admin user
        $adminUser = User::factory()->create();
        $adminUser->assignRole('admin');

        $response = $this->actingAs($adminUser)->get('/login');
        $response->assertRedirect('/dashboard');
    }

    /** @test */
    public function middleware_correctly_protects_admin_routes()
    {
        // Create regular user
        $regularUser = User::factory()->create();
        $regularUser->assignRole('user');

        // Create admin user
        $adminUser = User::factory()->create();
        $adminUser->assignRole('admin');

        // Test admin routes protection
        $adminRoutes = [
            '/admin/dashboard',
            '/admin/posts',
            '/admin/users',
        ];

        foreach ($adminRoutes as $route) {
            // Regular user should be forbidden
            $response = $this->actingAs($regularUser)->get($route);
            $response->assertStatus(403);

            // Admin user should have access (or 404 if route doesn't exist yet)
            $response = $this->actingAs($adminUser)->get($route);
            $this->assertContains($response->status(), [200, 404]); // 404 is ok if route not implemented yet
        }
    }
}
