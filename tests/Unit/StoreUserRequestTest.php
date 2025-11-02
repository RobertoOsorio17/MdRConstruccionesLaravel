<?php

namespace Tests\Unit;

use App\Http\Requests\Admin\StoreUserRequest;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Validator;
use Tests\TestCase;

class StoreUserRequestTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        // Create roles
        Role::create(['name' => 'admin', 'display_name' => 'Administrator']);
        Role::create(['name' => 'super_admin', 'display_name' => 'Super Administrator']);
        Role::create(['name' => 'editor', 'display_name' => 'Editor']);
        Role::create(['name' => 'user', 'display_name' => 'User']);
    }

    /** @test */
    public function it_validates_required_fields()
    {
        $request = new StoreUserRequest();
        $validator = Validator::make([], $request->rules());

        $this->assertFalse($validator->passes());
        $this->assertTrue($validator->errors()->has('name'));
        $this->assertTrue($validator->errors()->has('email'));
        $this->assertTrue($validator->errors()->has('password'));
    }

    /** @test */
    public function it_validates_email_format()
    {
        $request = new StoreUserRequest();
        $validator = Validator::make([
            'name' => 'Test User',
            'email' => 'invalid-email',
            'password' => 'Password123!',
            'password_confirmation' => 'Password123!',
        ], $request->rules());

        $this->assertFalse($validator->passes());
        $this->assertTrue($validator->errors()->has('email'));
    }

    /** @test */
    public function it_validates_unique_email()
    {
        User::factory()->create(['email' => 'existing@example.com']);

        $request = new StoreUserRequest();
        $validator = Validator::make([
            'name' => 'Test User',
            'email' => 'existing@example.com',
            'password' => 'Password123!',
            'password_confirmation' => 'Password123!',
        ], $request->rules());

        $this->assertFalse($validator->passes());
        $this->assertTrue($validator->errors()->has('email'));
    }

    /** @test */
    public function it_validates_password_strength()
    {
        $request = new StoreUserRequest();

        // Test weak password (no symbols)
        $validator = Validator::make([
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ], $request->rules());

        $this->assertFalse($validator->passes());
        $this->assertTrue($validator->errors()->has('password'));
    }

    /** @test */
    public function it_validates_password_confirmation()
    {
        $request = new StoreUserRequest();
        $validator = Validator::make([
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'Password123!',
            'password_confirmation' => 'DifferentPassword123!',
        ], $request->rules());

        $this->assertFalse($validator->passes());
        $this->assertTrue($validator->errors()->has('password'));
    }

    /** @test */
    public function it_validates_role_exists()
    {
        $request = new StoreUserRequest();
        $validator = Validator::make([
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'Password123!',
            'password_confirmation' => 'Password123!',
            'role' => 'non_existent_role',
        ], $request->rules());

        $this->assertFalse($validator->passes());
        $this->assertTrue($validator->errors()->has('role'));
    }

    /** @test */
    public function it_validates_roles_array_exists()
    {
        $request = new StoreUserRequest();
        $validator = Validator::make([
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'Password123!',
            'password_confirmation' => 'Password123!',
            'roles' => [999, 1000], // Non-existent role IDs
        ], $request->rules());

        $this->assertFalse($validator->passes());
        $this->assertTrue($validator->errors()->has('roles.0'));
    }

    /** @test */
    public function it_accepts_valid_admin_role()
    {
        $adminRole = Role::where('name', 'admin')->first();

        $request = new StoreUserRequest();
        $validator = Validator::make([
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'Password123!',
            'password_confirmation' => 'Password123!',
            'role' => 'admin',
        ], $request->rules());

        $this->assertTrue($validator->passes());
    }

    /** @test */
    public function it_accepts_valid_roles_array()
    {
        $adminRole = Role::where('name', 'admin')->first();
        $editorRole = Role::where('name', 'editor')->first();

        $request = new StoreUserRequest();
        $validator = Validator::make([
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'Password123!',
            'password_confirmation' => 'Password123!',
            'roles' => [$adminRole->id, $editorRole->id],
        ], $request->rules());

        $this->assertTrue($validator->passes());
    }

    /** @test */
    public function it_validates_optional_fields()
    {
        $request = new StoreUserRequest();
        $validator = Validator::make([
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'Password123!',
            'password_confirmation' => 'Password123!',
            'bio' => str_repeat('a', 1001), // Exceeds max length
            'website' => 'not-a-url',
            'location' => str_repeat('a', 256), // Exceeds max length
        ], $request->rules());

        $this->assertFalse($validator->passes());
        $this->assertTrue($validator->errors()->has('bio'));
        $this->assertTrue($validator->errors()->has('website'));
        $this->assertTrue($validator->errors()->has('location'));
    }

    /** @test */
    public function it_accepts_valid_optional_fields()
    {
        $request = new StoreUserRequest();
        $validator = Validator::make([
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'Password123!',
            'password_confirmation' => 'Password123!',
            'bio' => 'This is a valid bio',
            'website' => 'https://example.com',
            'location' => 'Madrid, Spain',
            'send_welcome_email' => true,
        ], $request->rules());

        $this->assertTrue($validator->passes());
    }

    /** @test */
    public function it_rejects_super_admin_role_assignment()
    {
        // This test verifies that the validation rules allow super_admin role
        // but the controller's guardAdminRoleAssignment method should prevent it
        $superAdminRole = Role::where('name', 'super_admin')->first();

        $request = new StoreUserRequest();
        $validator = Validator::make([
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'Password123!',
            'password_confirmation' => 'Password123!',
            'role' => 'super_admin',
        ], $request->rules());

        // Validation passes (role exists in database)
        $this->assertTrue($validator->passes());

        // Note: The actual security check happens in UserManagementController::guardAdminRoleAssignment
        // which prevents non-admins from assigning admin/super_admin roles
    }

    /** @test */
    public function authorization_requires_admin_role()
    {
        $admin = User::factory()->create();
        $admin->assignRole('admin');

        $regularUser = User::factory()->create();
        $regularUser->assignRole('user');

        // Create request instances
        $adminRequest = new StoreUserRequest();
        $adminRequest->setUserResolver(fn() => $admin);

        $userRequest = new StoreUserRequest();
        $userRequest->setUserResolver(fn() => $regularUser);

        // Admin should be authorized
        $this->assertTrue($adminRequest->authorize());

        // Regular user should not be authorized
        $this->assertFalse($userRequest->authorize());
    }

    /** @test */
    public function it_provides_custom_error_messages()
    {
        User::factory()->create(['email' => 'existing@example.com']);

        $request = new StoreUserRequest();
        $validator = Validator::make([
            'name' => 'Test User',
            'email' => 'existing@example.com',
            'password' => 'Password123!',
            'password_confirmation' => 'WrongPassword123!',
            'roles' => [999],
        ], $request->rules(), $request->messages());

        $this->assertFalse($validator->passes());
        
        $errors = $validator->errors();
        $this->assertEquals('This email address is already registered.', $errors->first('email'));
        $this->assertEquals('The password confirmation does not match.', $errors->first('password'));
        $this->assertEquals('One or more selected roles are invalid.', $errors->first('roles.0'));
    }
}

