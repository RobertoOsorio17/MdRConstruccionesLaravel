<?php

namespace Tests\Unit;

use App\Http\Requests\Admin\ReviewBanAppealRequest;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Validator;
use Tests\TestCase;

class ReviewBanAppealRequestTest extends TestCase
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
    public function it_validates_required_decision()
    {
        $request = new ReviewBanAppealRequest();
        $validator = Validator::make([], $request->rules(), $request->messages());

        $this->assertFalse($validator->passes());
        $this->assertTrue($validator->errors()->has('decision'));
        $this->assertEquals(
            'Debes seleccionar una decisión (aprobar, rechazar o solicitar información).',
            $validator->errors()->first('decision')
        );
    }

    /** @test */
    public function it_validates_decision_values()
    {
        $request = new ReviewBanAppealRequest();
        $validator = Validator::make([
            'decision' => 'invalid_decision',
        ], $request->rules(), $request->messages());

        $this->assertFalse($validator->passes());
        $this->assertTrue($validator->errors()->has('decision'));
        $this->assertEquals(
            'La decisión debe ser: aprobar, rechazar o solicitar información.',
            $validator->errors()->first('decision')
        );
    }

    /** @test */
    public function it_accepts_valid_approve_decision()
    {
        $request = new ReviewBanAppealRequest();
        $validator = Validator::make([
            'decision' => 'approve',
        ], $request->rules());

        $this->assertTrue($validator->passes());
    }

    /** @test */
    public function it_accepts_valid_reject_decision()
    {
        $request = new ReviewBanAppealRequest();
        $validator = Validator::make([
            'decision' => 'reject',
            'response' => 'This is a valid rejection reason.',
        ], $request->rules());

        $this->assertTrue($validator->passes());
    }

    /** @test */
    public function it_accepts_valid_request_info_decision()
    {
        $request = new ReviewBanAppealRequest();
        $validator = Validator::make([
            'decision' => 'request_info',
            'response' => 'Please provide more information about...',
        ], $request->rules());

        $this->assertTrue($validator->passes());
    }

    /** @test */
    public function it_requires_response_when_rejecting()
    {
        $request = new ReviewBanAppealRequest();
        $validator = Validator::make([
            'decision' => 'reject',
        ], $request->rules(), $request->messages());

        $this->assertFalse($validator->passes());
        $this->assertTrue($validator->errors()->has('response'));
        $this->assertEquals(
            'Debes proporcionar una explicación cuando rechazas una apelación o solicitas más información.',
            $validator->errors()->first('response')
        );
    }

    /** @test */
    public function it_requires_response_when_requesting_info()
    {
        $request = new ReviewBanAppealRequest();
        $validator = Validator::make([
            'decision' => 'request_info',
        ], $request->rules(), $request->messages());

        $this->assertFalse($validator->passes());
        $this->assertTrue($validator->errors()->has('response'));
    }

    /** @test */
    public function it_does_not_require_response_when_approving()
    {
        $request = new ReviewBanAppealRequest();
        $validator = Validator::make([
            'decision' => 'approve',
        ], $request->rules());

        $this->assertTrue($validator->passes());
    }

    /** @test */
    public function it_validates_response_max_length()
    {
        $request = new ReviewBanAppealRequest();
        $validator = Validator::make([
            'decision' => 'reject',
            'response' => str_repeat('a', 1001), // Exceeds max length
        ], $request->rules(), $request->messages());

        $this->assertFalse($validator->passes());
        $this->assertTrue($validator->errors()->has('response'));
        $this->assertEquals(
            'La respuesta no puede exceder 1000 caracteres.',
            $validator->errors()->first('response')
        );
    }

    /** @test */
    public function it_accepts_response_at_max_length()
    {
        $request = new ReviewBanAppealRequest();
        $validator = Validator::make([
            'decision' => 'reject',
            'response' => str_repeat('a', 1000), // Exactly max length
        ], $request->rules());

        $this->assertTrue($validator->passes());
    }

    /** @test */
    public function it_sanitizes_response_to_prevent_xss()
    {
        $request = new ReviewBanAppealRequest();
        $request->merge([
            'decision' => 'reject',
            'response' => '<script>alert("XSS")</script>This is a response',
        ]);

        // Trigger prepareForValidation
        $request->prepareForValidation();

        // Response should be sanitized (tags stripped)
        $this->assertEquals(
            'This is a response',
            $request->input('response')
        );
    }

    /** @test */
    public function authorization_requires_admin_role()
    {
        $admin = User::factory()->create();
        $admin->assignRole('admin');

        $editor = User::factory()->create();
        $editor->assignRole('editor');

        $regularUser = User::factory()->create();
        $regularUser->assignRole('user');

        // Create request instances
        $adminRequest = new ReviewBanAppealRequest();
        $adminRequest->setUserResolver(fn() => $admin);

        $editorRequest = new ReviewBanAppealRequest();
        $editorRequest->setUserResolver(fn() => $editor);

        $userRequest = new ReviewBanAppealRequest();
        $userRequest->setUserResolver(fn() => $regularUser);

        // Admin should be authorized
        $this->assertTrue($adminRequest->authorize());

        // Editor should not be authorized (only admins can review appeals)
        $this->assertFalse($editorRequest->authorize());

        // Regular user should not be authorized
        $this->assertFalse($userRequest->authorize());
    }

    /** @test */
    public function authorization_requires_authenticated_user()
    {
        $request = new ReviewBanAppealRequest();
        $request->setUserResolver(fn() => null);

        $this->assertFalse($request->authorize());
    }

    /** @test */
    public function super_admin_cannot_be_assigned_through_this_request()
    {
        // This test verifies that ReviewBanAppealRequest doesn't handle role assignment
        // The guardAdminRoleAssignment method is in UserManagementController, not here
        
        // ReviewBanAppealRequest only handles ban appeal decisions
        $request = new ReviewBanAppealRequest();
        $rules = $request->rules();

        // Verify that role assignment is not part of this request
        $this->assertArrayNotHasKey('role', $rules);
        $this->assertArrayNotHasKey('roles', $rules);
    }

    /** @test */
    public function it_provides_custom_attribute_names()
    {
        $request = new ReviewBanAppealRequest();
        $attributes = $request->attributes();

        $this->assertEquals('decisión', $attributes['decision']);
        $this->assertEquals('respuesta', $attributes['response']);
    }

    /** @test */
    public function it_handles_null_response_for_approve_decision()
    {
        $request = new ReviewBanAppealRequest();
        $validator = Validator::make([
            'decision' => 'approve',
            'response' => null,
        ], $request->rules());

        $this->assertTrue($validator->passes());
    }

    /** @test */
    public function it_handles_empty_string_response_for_approve_decision()
    {
        $request = new ReviewBanAppealRequest();
        $validator = Validator::make([
            'decision' => 'approve',
            'response' => '',
        ], $request->rules());

        $this->assertTrue($validator->passes());
    }

    /** @test */
    public function it_rejects_empty_response_for_reject_decision()
    {
        $request = new ReviewBanAppealRequest();
        $validator = Validator::make([
            'decision' => 'reject',
            'response' => '',
        ], $request->rules());

        $this->assertFalse($validator->passes());
        $this->assertTrue($validator->errors()->has('response'));
    }

    /** @test */
    public function it_rejects_null_response_for_request_info_decision()
    {
        $request = new ReviewBanAppealRequest();
        $validator = Validator::make([
            'decision' => 'request_info',
            'response' => null,
        ], $request->rules());

        $this->assertFalse($validator->passes());
        $this->assertTrue($validator->errors()->has('response'));
    }

    /** @test */
    public function it_preserves_safe_html_entities_in_response()
    {
        $request = new ReviewBanAppealRequest();
        $request->merge([
            'decision' => 'reject',
            'response' => 'This &amp; that',
        ]);

        $request->prepareForValidation();

        // HTML entities should be preserved (strip_tags doesn't remove them)
        $this->assertEquals('This &amp; that', $request->input('response'));
    }
}

