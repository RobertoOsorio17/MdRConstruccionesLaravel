<?php

namespace Tests\Feature;

use App\Models\Comment;
use App\Models\Post;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SecurityPoliciesTest extends TestCase
{
    use RefreshDatabase;

    protected $admin;
    protected $editor;
    protected $user;
    protected $otherUser;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = User::factory()->create(['role' => 'admin']);
        $this->editor = User::factory()->create(['role' => 'editor']);
        $this->user = User::factory()->create(['role' => 'user']);
        $this->otherUser = User::factory()->create(['role' => 'user']);
    }

    /** @test */
    public function post_policy_allows_anyone_to_view_published_posts()
    {
        $post = Post::factory()->create([
            'status' => 'published',
            'published_at' => now()->subDay(),
        ]);

        // Guest user
        $this->assertTrue($this->user->can('view', $post));
        
        // Authenticated user
        $this->actingAs($this->user);
        $this->assertTrue($this->user->can('view', $post));
    }

    /** @test */
    public function post_policy_restricts_unpublished_posts_to_authors_and_admins()
    {
        $post = Post::factory()->create([
            'user_id' => $this->user->id,
            'status' => 'draft',
        ]);

        // Author can view
        $this->assertTrue($this->user->can('view', $post));
        
        // Admin can view
        $this->assertTrue($this->admin->can('view', $post));
        
        // Editor can view
        $this->assertTrue($this->editor->can('view', $post));
        
        // Other users cannot view
        $this->assertFalse($this->otherUser->can('view', $post));
    }

    /** @test */
    public function post_policy_allows_authors_to_update_their_posts()
    {
        $post = Post::factory()->create(['user_id' => $this->user->id]);

        $this->assertTrue($this->user->can('update', $post));
        $this->assertTrue($this->admin->can('update', $post));
        $this->assertTrue($this->editor->can('update', $post));
        $this->assertFalse($this->otherUser->can('update', $post));
    }

    /** @test */
    public function post_policy_allows_authors_and_admins_to_delete_posts()
    {
        $post = Post::factory()->create(['user_id' => $this->user->id]);

        $this->assertTrue($this->user->can('delete', $post));
        $this->assertTrue($this->admin->can('delete', $post));
        $this->assertFalse($this->editor->can('delete', $post));
        $this->assertFalse($this->otherUser->can('delete', $post));
    }

    /** @test */
    public function post_policy_restricts_featuring_to_admins_and_editors()
    {
        $post = Post::factory()->create(['user_id' => $this->user->id]);

        $this->assertFalse($this->user->can('feature', $post));
        $this->assertTrue($this->admin->can('feature', $post));
        $this->assertTrue($this->editor->can('feature', $post));
        $this->assertFalse($this->otherUser->can('feature', $post));
    }

    /** @test */
    public function comment_policy_allows_anyone_to_view_approved_comments()
    {
        $comment = Comment::factory()->create(['status' => 'approved']);

        $this->assertTrue($this->user->can('view', $comment));
        $this->assertTrue($this->admin->can('view', $comment));
    }

    /** @test */
    public function comment_policy_restricts_pending_comments_to_authors_and_moderators()
    {
        $comment = Comment::factory()->create([
            'user_id' => $this->user->id,
            'status' => 'pending',
        ]);

        $this->assertTrue($this->user->can('view', $comment));
        $this->assertTrue($this->admin->can('view', $comment));
        $this->assertFalse($this->otherUser->can('view', $comment));
    }

    /** @test */
    public function comment_policy_allows_users_to_update_own_comments_within_time_limit()
    {
        $recentComment = Comment::factory()->create([
            'user_id' => $this->user->id,
            'created_at' => now()->subMinutes(10), // Within 15 minute limit
        ]);

        $oldComment = Comment::factory()->create([
            'user_id' => $this->user->id,
            'created_at' => now()->subMinutes(20), // Beyond 15 minute limit
        ]);

        $this->assertTrue($this->user->can('update', $recentComment));
        $this->assertFalse($this->user->can('update', $oldComment));
        $this->assertTrue($this->admin->can('update', $oldComment)); // Admin can always update
    }

    /** @test */
    public function comment_policy_allows_users_to_delete_own_comments()
    {
        $comment = Comment::factory()->create(['user_id' => $this->user->id]);

        $this->assertTrue($this->user->can('delete', $comment));
        $this->assertTrue($this->admin->can('delete', $comment));
        $this->assertFalse($this->otherUser->can('delete', $comment));
    }

    /** @test */
    public function comment_policy_restricts_moderation_to_admins_and_moderators()
    {
        $comment = Comment::factory()->create();

        $this->assertFalse($this->user->can('moderate', $comment));
        $this->assertTrue($this->admin->can('moderate', $comment));
    }

    /** @test */
    public function comment_policy_allows_replies_to_approved_comments()
    {
        $approvedComment = Comment::factory()->create(['status' => 'approved']);
        $pendingComment = Comment::factory()->create(['status' => 'pending']);

        $this->assertTrue($this->user->can('reply', $approvedComment));
        $this->assertFalse($this->user->can('reply', $pendingComment));
    }

    /** @test */
    public function user_policy_allows_users_to_view_own_profile()
    {
        $this->assertTrue($this->user->can('view', $this->user));
    }

    /** @test */
    public function user_policy_allows_viewing_public_profiles()
    {
        $publicUser = User::factory()->create(['profile_visibility' => 'public']);
        $privateUser = User::factory()->create(['profile_visibility' => 'private']);

        $this->assertTrue($this->user->can('view', $publicUser));
        $this->assertFalse($this->user->can('view', $privateUser));
        $this->assertTrue($this->admin->can('view', $privateUser)); // Admin can view private profiles
    }

    /** @test */
    public function user_policy_allows_users_to_update_own_profile()
    {
        $this->assertTrue($this->user->can('update', $this->user));
        $this->assertTrue($this->admin->can('update', $this->user));
        $this->assertFalse($this->otherUser->can('update', $this->user));
    }

    /** @test */
    public function user_policy_prevents_users_from_deleting_themselves()
    {
        $this->assertFalse($this->user->can('delete', $this->user));
        $this->assertTrue($this->admin->can('delete', $this->user));
        $this->assertFalse($this->otherUser->can('delete', $this->user));
    }

    /** @test */
    public function user_policy_restricts_role_management_to_admins()
    {
        $this->assertFalse($this->user->can('manageRoles', $this->user));
        $this->assertFalse($this->user->can('manageRoles', $this->otherUser));
        $this->assertTrue($this->admin->can('manageRoles', $this->user));
        $this->assertFalse($this->admin->can('manageRoles', $this->admin)); // Cannot manage own roles
    }

    /** @test */
    public function user_policy_restricts_banning_to_admins()
    {
        $this->assertFalse($this->user->can('ban', $this->otherUser));
        $this->assertTrue($this->admin->can('ban', $this->user));
        $this->assertFalse($this->admin->can('ban', $this->admin)); // Cannot ban self
        
        // Cannot ban other admins
        $otherAdmin = User::factory()->create(['role' => 'admin']);
        $this->assertFalse($this->admin->can('ban', $otherAdmin));
    }

    /** @test */
    public function user_policy_restricts_verification_to_admins()
    {
        $this->assertFalse($this->user->can('verify', $this->user));
        $this->assertFalse($this->user->can('verify', $this->otherUser));
        $this->assertTrue($this->admin->can('verify', $this->user));
        $this->assertFalse($this->admin->can('verify', $this->admin)); // Cannot verify self
    }

    /** @test */
    public function user_policy_restricts_user_creation_to_admins()
    {
        $this->assertFalse($this->user->can('create', User::class));
        $this->assertTrue($this->admin->can('create', User::class));
    }

    /** @test */
    public function user_policy_restricts_user_list_viewing_to_admins()
    {
        $this->assertFalse($this->user->can('viewAny', User::class));
        $this->assertTrue($this->admin->can('viewAny', User::class));
    }
}
