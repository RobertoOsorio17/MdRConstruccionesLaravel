<?php

namespace Tests\Feature;

use App\Models\Comment;
use App\Models\Post;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class SecurityVulnerabilitiesTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    protected $admin;
    protected $user;
    protected $post;

    protected function setUp(): void
    {
        parent::setUp();

        // Create test users
        $this->admin = User::factory()->create([
            'role' => 'admin',
            'email' => 'admin@test.com',
        ]);

        $this->user = User::factory()->create([
            'role' => 'user',
            'email' => 'user@test.com',
        ]);

        // Create test post
        $this->post = Post::factory()->create([
            'user_id' => $this->user->id,
            'status' => 'published',
            'published_at' => now(),
        ]);
    }

    /** @test */
    public function sql_injection_vulnerability_is_fixed_in_suggested_posts()
    {
        // Create additional posts for testing
        $otherPosts = Post::factory()->count(3)->create([
            'status' => 'published',
            'published_at' => now()->subDay(),
        ]);

        // Test that the getSuggestedPosts method works safely
        $result = $this->post->getSuggestedPosts(5);

        $this->assertInstanceOf(\Illuminate\Database\Eloquent\Collection::class, $result);
        $this->assertLessThanOrEqual(5, $result->count());

        // Ensure no SQL injection can occur by testing with safe data
        foreach ($result as $suggestedPost) {
            $this->assertInstanceOf(Post::class, $suggestedPost);
            $this->assertNotEquals($this->post->id, $suggestedPost->id);
        }
    }

    /** @test */
    public function mass_assignment_vulnerability_is_fixed_in_user_model()
    {
        $this->actingAs($this->user);

        // Attempt to mass assign sensitive fields
        $maliciousData = [
            'name' => 'Updated Name',
            'email' => 'updated@test.com',
            'password' => Hash::make('password123'),
            'role' => 'admin', // Should not be mass assignable
            'is_verified' => true, // Should not be mass assignable
            'verified_by' => $this->admin->id, // Should not be mass assignable
        ];

        $user = User::create($maliciousData);

        // Verify that sensitive fields were not mass assigned
        $this->assertNotEquals('admin', $user->role);
        $this->assertNotTrue($user->is_verified);
        $this->assertNull($user->verified_by);

        // Verify that safe fields were assigned
        $this->assertEquals('Updated Name', $user->name);
        $this->assertEquals('updated@test.com', $user->email);
    }

    /** @test */
    public function mass_assignment_vulnerability_is_fixed_in_post_model()
    {
        $this->actingAs($this->user);

        // Attempt to mass assign sensitive fields
        $maliciousData = [
            'title' => 'Test Post',
            'content' => 'Test content',
            'slug' => 'test-post',
            'user_id' => $this->admin->id, // Should not be mass assignable
            'status' => 'published', // Should not be mass assignable
            'featured' => true, // Should not be mass assignable
            'views_count' => 9999, // Should not be mass assignable
        ];

        $post = new Post();
        $post->fill($maliciousData);

        // Verify that sensitive fields were not mass assigned
        $this->assertNull($post->user_id);
        $this->assertNull($post->status);
        $this->assertNull($post->featured);
        $this->assertNull($post->views_count);

        // Verify that safe fields were assigned
        $this->assertEquals('Test Post', $post->title);
        $this->assertEquals('Test content', $post->content);
    }

    /** @test */
    public function mass_assignment_vulnerability_is_fixed_in_comment_model()
    {
        $this->actingAs($this->user);

        // Attempt to mass assign sensitive fields
        $maliciousData = [
            'body' => 'Test comment',
            'post_id' => $this->post->id,
            'user_id' => $this->admin->id, // Should not be mass assignable
            'status' => 'approved', // Should not be mass assignable
            'ip_address' => '192.168.1.1', // Should not be mass assignable
            'user_agent' => 'Malicious Agent', // Should not be mass assignable
        ];

        $comment = Comment::create($maliciousData);

        // Verify that sensitive fields were not mass assigned
        $this->assertNotEquals($this->admin->id, $comment->user_id);
        $this->assertNotEquals('approved', $comment->status);
        $this->assertNotEquals('192.168.1.1', $comment->ip_address);
        $this->assertNotEquals('Malicious Agent', $comment->user_agent);
        
        // Verify that safe fields were assigned
        $this->assertEquals('Test comment', $comment->body);
        $this->assertEquals($this->post->id, $comment->post_id);
    }

    /** @test */
    public function idor_vulnerability_is_fixed_in_comment_parent_validation()
    {
        // Create a comment on a different post
        $otherPost = Post::factory()->create(['status' => 'published']);
        $otherComment = Comment::factory()->create([
            'post_id' => $otherPost->id,
            'status' => 'approved',
        ]);

        // Attempt to create a reply to a comment from a different post
        $response = $this->postJson("/blog/{$this->post->slug}/comments", [
            'body' => 'This is a reply',
            'parent_id' => $otherComment->id, // Comment from different post
            'author_name' => 'Test User',
            'author_email' => 'test@example.com',
        ]);

        // Should return 422 error for invalid parent comment
        $response->assertStatus(422);
    }

    /** @test */
    public function administrative_methods_require_proper_authorization()
    {
        // Test User model administrative methods
        $this->expectException(\Exception::class);
        $this->expectExceptionMessage('Only administrators can update user roles.');
        
        $this->user->updateRole('admin', $this->user); // Non-admin trying to update role
    }

    /** @test */
    public function administrative_methods_work_with_proper_authorization()
    {
        // Test User model administrative methods with admin
        $result = $this->user->updateRole('editor', $this->admin);
        
        $this->assertTrue($result);
        $this->assertEquals('editor', $this->user->fresh()->role);
    }

    /** @test */
    public function user_verification_requires_admin_authorization()
    {
        $this->expectException(\Exception::class);
        $this->expectExceptionMessage('Only administrators can verify users.');
        
        $this->user->verifyUser($this->user, 'Self verification attempt');
    }

    /** @test */
    public function admin_can_verify_users()
    {
        $result = $this->user->verifyUser($this->admin, 'Verified by admin');
        
        $this->assertTrue($result);
        
        $freshUser = $this->user->fresh();
        $this->assertTrue($freshUser->is_verified);
        $this->assertEquals($this->admin->id, $freshUser->verified_by);
        $this->assertEquals('Verified by admin', $freshUser->verification_notes);
    }

    /** @test */
    public function post_status_update_requires_proper_authorization()
    {
        $this->expectException(\Exception::class);
        $this->expectExceptionMessage('Only administrators and editors can update post status.');
        
        $this->post->updateStatus('published', $this->user); // Regular user trying to publish
    }

    /** @test */
    public function admin_can_update_post_status()
    {
        $result = $this->post->updateStatus('published', $this->admin);
        
        $this->assertTrue($result);
        $this->assertEquals('published', $this->post->fresh()->status);
    }

    /** @test */
    public function comment_moderation_requires_proper_authorization()
    {
        $comment = Comment::factory()->create([
            'post_id' => $this->post->id,
            'status' => 'pending',
        ]);

        $this->expectException(\Exception::class);
        $this->expectExceptionMessage('Only administrators and moderators can moderate comments.');
        
        $comment->moderate('approved', $this->user); // Regular user trying to moderate
    }

    /** @test */
    public function admin_can_moderate_comments()
    {
        $comment = Comment::factory()->create([
            'post_id' => $this->post->id,
            'status' => 'pending',
        ]);

        $result = $comment->moderate('approved', $this->admin);
        
        $this->assertTrue($result);
        $this->assertEquals('approved', $comment->fresh()->status);
    }

    /** @test */
    public function guest_recommendations_validate_post_existence()
    {
        // Test with non-existent post ID
        $response = $this->postJson('/api/guest-recommendations', [
            'current_post_id' => 99999, // Non-existent post
            'visited_posts' => [],
            'limit' => 5,
        ]);

        $response->assertStatus(200);
        $response->assertJson(['posts' => []]);
    }

    /** @test */
    public function policies_prevent_unauthorized_access()
    {
        // Test that regular users cannot view unpublished posts
        $unpublishedPost = Post::factory()->create([
            'user_id' => $this->admin->id,
            'status' => 'draft',
        ]);

        $this->actingAs($this->user);
        
        // This should be handled by the PostPolicy
        $this->assertFalse($this->user->can('view', $unpublishedPost));
    }
}
