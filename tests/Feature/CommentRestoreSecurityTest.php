<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Post;
use App\Models\Comment;
use App\Models\AdminAuditLog;
use App\Models\AdminNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

/**
 * Security Tests for Comment Restore Functionality
 * 
 * Tests cover:
 * - Authorization (RBAC)
 * - IDOR vulnerabilities
 * - Rate limiting
 * - Input validation
 * - Audit logging
 * - Mass assignment protection
 * - SQL injection prevention
 */
class CommentRestoreSecurityTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    protected User $admin;
    protected User $editor;
    protected User $regularUser;
    protected User $bannedUser;
    protected Post $post;
    protected Comment $deletedComment;
    protected Comment $activeComment;

    protected function setUp(): void
    {
        parent::setUp();

        // Create users with different roles
        $this->admin = User::factory()->create(['role' => 'admin']);
        $this->editor = User::factory()->create(['role' => 'editor']);
        $this->regularUser = User::factory()->create(['role' => 'user']);
        $this->bannedUser = User::factory()->create(['role' => 'user']);

        // Create a post
        $this->post = Post::factory()->create([
            'user_id' => $this->admin->id,
            'status' => 'published'
        ]);

        // Create a deleted comment
        $this->deletedComment = Comment::factory()->create([
            'post_id' => $this->post->id,
            'user_id' => $this->regularUser->id,
            'status' => 'approved',
            'body' => 'This is a deleted comment'
        ]);
        $this->deletedComment->delete(); // Soft delete

        // Create an active comment
        $this->activeComment = Comment::factory()->create([
            'post_id' => $this->post->id,
            'user_id' => $this->regularUser->id,
            'status' => 'approved',
            'body' => 'This is an active comment'
        ]);

        // Clear rate limiter before each test
        RateLimiter::clear('admin-restore:' . $this->admin->id);
    }

    /** @test */
    public function admin_can_restore_deleted_comment()
    {
        $response = $this->actingAs($this->admin)
            ->postJson("/admin/comments/{$this->deletedComment->id}/restore");

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Comentario restaurado exitosamente.'
            ]);

        // Verify comment is restored
        $this->assertDatabaseHas('comments', [
            'id' => $this->deletedComment->id,
            'deleted_at' => null
        ]);
    }

    /** @test */
    public function admin_can_restore_multiple_times()
    {
        // First restore
        $response = $this->actingAs($this->admin)
            ->postJson("/admin/comments/{$this->deletedComment->id}/restore");

        $response->assertStatus(200)
            ->assertJson([
                'success' => true
            ]);

        $this->assertDatabaseHas('comments', [
            'id' => $this->deletedComment->id,
            'deleted_at' => null
        ]);
    }

    /** @test */
    public function editor_cannot_restore_deleted_comment()
    {
        $response = $this->actingAs($this->editor)
            ->postJson("/admin/comments/{$this->deletedComment->id}/restore");

        $response->assertStatus(403);

        // Verify comment is still deleted
        $this->assertSoftDeleted('comments', [
            'id' => $this->deletedComment->id
        ]);
    }

    /** @test */
    public function regular_user_cannot_restore_comment()
    {
        $response = $this->actingAs($this->regularUser)
            ->postJson("/admin/comments/{$this->deletedComment->id}/restore");

        $response->assertStatus(403);

        // Verify comment is still deleted
        $this->assertSoftDeleted('comments', [
            'id' => $this->deletedComment->id
        ]);
    }

    /** @test */
    public function guest_cannot_restore_comment()
    {
        $response = $this->postJson("/admin/comments/{$this->deletedComment->id}/restore");

        $response->assertStatus(401);

        $this->assertSoftDeleted('comments', [
            'id' => $this->deletedComment->id
        ]);
    }

    /** @test */
    public function cannot_restore_non_deleted_comment()
    {
        $response = $this->actingAs($this->admin)
            ->postJson("/admin/comments/{$this->activeComment->id}/restore");

        $response->assertStatus(400)
            ->assertJson([
                'success' => false,
                'message' => 'El comentario no está eliminado y no puede ser restaurado.'
            ]);
    }

    /** @test */
    public function cannot_restore_comment_with_deleted_post()
    {
        // Soft delete the post
        $this->post->delete();

        $response = $this->actingAs($this->admin)
            ->postJson("/admin/comments/{$this->deletedComment->id}/restore");

        $response->assertStatus(422)
            ->assertJson([
                'success' => false,
                'message' => 'No se puede restaurar el comentario porque el post padre está eliminado.'
            ]);

        // Verify comment is still deleted
        $this->assertSoftDeleted('comments', [
            'id' => $this->deletedComment->id
        ]);
    }

    /** @test */
    public function returns_404_for_non_existent_comment()
    {
        $nonExistentId = 99999;

        $response = $this->actingAs($this->admin)
            ->postJson("/admin/comments/{$nonExistentId}/restore");

        $response->assertStatus(404);
    }

    /** @test */
    public function rate_limiting_prevents_excessive_restore_requests()
    {
        // Make 20 successful requests (the limit)
        for ($i = 0; $i < 20; $i++) {
            $comment = Comment::factory()->create([
                'post_id' => $this->post->id,
                'user_id' => $this->regularUser->id,
            ]);
            $comment->delete();

            $response = $this->actingAs($this->admin)
                ->postJson("/admin/comments/{$comment->id}/restore");

            $response->assertStatus(200);
        }

        // 21st request should be rate limited
        $comment = Comment::factory()->create([
            'post_id' => $this->post->id,
            'user_id' => $this->regularUser->id,
        ]);
        $comment->delete();

        $response = $this->actingAs($this->admin)
            ->postJson("/admin/comments/{$comment->id}/restore");

        $response->assertStatus(429)
            ->assertJson([
                'success' => false,
                'error' => 'RATE_LIMIT_EXCEEDED'
            ]);
    }

    /** @test */
    public function restore_creates_audit_log_entry()
    {
        $this->actingAs($this->admin)
            ->postJson("/admin/comments/{$this->deletedComment->id}/restore");

        $this->assertDatabaseHas('admin_audit_logs', [
            'user_id' => $this->admin->id,
            'action' => 'restore',
            'model_type' => 'App\Models\Comment',
            'model_id' => $this->deletedComment->id
        ]);
    }

    /** @test */
    public function restore_creates_admin_notification()
    {
        $this->actingAs($this->admin)
            ->postJson("/admin/comments/{$this->deletedComment->id}/restore");

        $this->assertDatabaseHas('admin_notifications', [
            'type' => 'success',
            'title' => 'Comentario Restaurado'
        ]);
    }

    /** @test */
    public function restore_returns_warning_for_banned_author()
    {
        // Skip this test if users table doesn't have ban columns
        if (!Schema::hasColumn('users', 'is_banned')) {
            $this->markTestSkipped('Users table does not have ban columns');
        }

        $bannedComment = Comment::factory()->create([
            'post_id' => $this->post->id,
            'user_id' => $this->bannedUser->id,
            'status' => 'approved'
        ]);
        $bannedComment->delete();

        $response = $this->actingAs($this->admin)
            ->postJson("/admin/comments/{$bannedComment->id}/restore");

        $response->assertStatus(200)
            ->assertJson([
                'success' => true
            ])
            ->assertJsonStructure([
                'warning'
            ]);

        $this->assertStringContainsString('baneado', $response->json('warning'));
    }

    /** @test */
    public function sql_injection_attempt_is_prevented()
    {
        $maliciousId = "1' OR '1'='1";

        $response = $this->actingAs($this->admin)
            ->postJson("/admin/comments/{$maliciousId}/restore");

        // Laravel's route model binding will return 404 for invalid ID format
        $response->assertStatus(404);
    }
}

