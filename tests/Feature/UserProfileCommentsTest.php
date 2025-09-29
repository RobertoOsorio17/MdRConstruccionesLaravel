<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Post;
use App\Models\Comment;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;

class UserProfileCommentsTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    protected $user;
    protected $otherUser;
    protected $post;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->user = User::factory()->create();
        $this->otherUser = User::factory()->create();
        $this->post = Post::factory()->create([
            'user_id' => $this->user->id,
            'status' => 'published'
        ]);
    }

    /** @test */
    public function user_can_view_their_own_profile_comments()
    {
        // Create some comments for the user
        $comments = Comment::factory()->count(5)->create([
            'user_id' => $this->user->id,
            'post_id' => $this->post->id,
            'status' => 'approved'
        ]);

        $response = $this->actingAs($this->user)
            ->get("/user/{$this->user->id}");

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => 
            $page->component('User/Profile')
                ->has('userComments', 5)
        );
    }

    /** @test */
    public function user_can_get_paginated_comments_via_api()
    {
        // Create 25 comments for pagination testing
        Comment::factory()->count(25)->create([
            'user_id' => $this->user->id,
            'post_id' => $this->post->id,
            'status' => 'approved'
        ]);

        $response = $this->actingAs($this->user)
            ->getJson('/api/user/comments?per_page=10&page=1');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'comments' => [
                    'data',
                    'current_page',
                    'per_page',
                    'total',
                    'last_page'
                ]
            ])
            ->assertJson([
                'success' => true,
                'comments' => [
                    'current_page' => 1,
                    'per_page' => 10,
                    'total' => 25,
                    'last_page' => 3
                ]
            ]);

        $this->assertCount(10, $response->json('comments.data'));
    }

    /** @test */
    public function user_can_search_their_comments_via_api()
    {
        // Create comments with specific content
        Comment::factory()->create([
            'user_id' => $this->user->id,
            'post_id' => $this->post->id,
            'status' => 'approved',
            'body' => 'This is a test comment about Laravel'
        ]);

        Comment::factory()->create([
            'user_id' => $this->user->id,
            'post_id' => $this->post->id,
            'status' => 'approved',
            'body' => 'This is about React and JavaScript'
        ]);

        $response = $this->actingAs($this->user)
            ->getJson('/api/user/comments?search=Laravel');

        $response->assertStatus(200);
        $this->assertCount(1, $response->json('comments.data'));
        $this->assertStringContainsString('Laravel', $response->json('comments.data.0.body'));
    }

    /** @test */
    public function user_can_view_other_users_public_comments()
    {
        // Create comments for other user
        Comment::factory()->count(3)->create([
            'user_id' => $this->otherUser->id,
            'post_id' => $this->post->id,
            'status' => 'approved'
        ]);

        $response = $this->actingAs($this->user)
            ->getJson("/api/user/{$this->otherUser->id}/comments");

        $response->assertStatus(200);
        $this->assertCount(3, $response->json('comments.data'));
    }

    /** @test */
    public function guest_cannot_access_comments_api()
    {
        $response = $this->getJson('/api/user/comments');
        $response->assertStatus(401);
    }

    /** @test */
    public function comments_are_properly_filtered_by_status()
    {
        // Create approved and pending comments
        Comment::factory()->create([
            'user_id' => $this->user->id,
            'post_id' => $this->post->id,
            'status' => 'approved'
        ]);

        Comment::factory()->create([
            'user_id' => $this->user->id,
            'post_id' => $this->post->id,
            'status' => 'pending'
        ]);

        Comment::factory()->create([
            'user_id' => $this->user->id,
            'post_id' => $this->post->id,
            'status' => 'rejected'
        ]);

        $response = $this->actingAs($this->user)
            ->getJson('/api/user/comments');

        $response->assertStatus(200);
        // Should only return approved comments
        $this->assertCount(1, $response->json('comments.data'));
        $this->assertEquals('approved', $response->json('comments.data.0.status'));
    }

    /** @test */
    public function comments_include_post_information()
    {
        Comment::factory()->create([
            'user_id' => $this->user->id,
            'post_id' => $this->post->id,
            'status' => 'approved'
        ]);

        $response = $this->actingAs($this->user)
            ->getJson('/api/user/comments');

        $response->assertStatus(200);
        $comment = $response->json('comments.data.0');
        
        $this->assertArrayHasKey('post', $comment);
        $this->assertEquals($this->post->id, $comment['post']['id']);
        $this->assertEquals($this->post->title, $comment['post']['title']);
        $this->assertEquals($this->post->slug, $comment['post']['slug']);
    }

    /** @test */
    public function pagination_parameters_are_validated()
    {
        $response = $this->actingAs($this->user)
            ->getJson('/api/user/comments?per_page=100');

        $response->assertStatus(200);
        // Should default to reasonable limit even if large number requested
        $this->assertLessThanOrEqual(50, $response->json('comments.per_page'));
    }

    /** @test */
    public function comments_are_ordered_by_creation_date_desc()
    {
        // Create comments with different timestamps
        $oldComment = Comment::factory()->create([
            'user_id' => $this->user->id,
            'post_id' => $this->post->id,
            'status' => 'approved',
            'created_at' => now()->subDays(2)
        ]);

        $newComment = Comment::factory()->create([
            'user_id' => $this->user->id,
            'post_id' => $this->post->id,
            'status' => 'approved',
            'created_at' => now()
        ]);

        $response = $this->actingAs($this->user)
            ->getJson('/api/user/comments');

        $response->assertStatus(200);
        $comments = $response->json('comments.data');
        
        // Newest comment should be first
        $this->assertEquals($newComment->id, $comments[0]['id']);
        $this->assertEquals($oldComment->id, $comments[1]['id']);
    }
}
