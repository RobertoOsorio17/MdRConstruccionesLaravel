<?php

namespace App\Http\Controllers;

use App\Models\Comment;
use App\Models\Post;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Validation\ValidationException;

class CommentController extends Controller
{
    /**
     * Store a new comment for a blog post.
     */
    public function store(Request $request, Post $post)
    {
        // Check if post allows comments
        if ($post->status !== 'published') {
            abort(404);
        }

        // Rate limiting: max 3 comments per minute per IP
        $executed = RateLimiter::attempt(
            'comments:' . $request->ip(),
            $perMinute = 3,
            function () {
                // Empty callback
            }
        );

        if (!$executed) {
            throw ValidationException::withMessages([
                'rate_limit' => 'Has enviado demasiados comentarios muy rápido. Espera un momento antes de enviar otro comentario.',
            ]);
        }

        // Validation rules differ for guests vs authenticated users
        if (Auth::check()) {
            // Authenticated user validation
            $validated = $request->validate([
                'body' => 'required|string|min:10|max:2000',
                'parent_id' => 'nullable|exists:comments,id'
            ]);
            
            $validated['user_id'] = Auth::id();
            $validated['author_name'] = null;
            $validated['author_email'] = null;
        } else {
            // Guest user validation
            $validated = $request->validate([
                'body' => 'required|string|min:10|max:2000',
                'author_name' => 'required|string|min:2|max:100',
                'author_email' => 'required|email|max:255',
                'parent_id' => 'nullable|exists:comments,id'
            ]);
            
            $validated['user_id'] = null;
        }

        // If replying to a comment, ensure it belongs to this post
        if (!empty($validated['parent_id'])) {
            $parentComment = Comment::find($validated['parent_id']);
            if (!$parentComment || $parentComment->post_id !== $post->id) {
                abort(422, 'El comentario padre no pertenece a este post.');
            }
        }

        // Set additional fields
        $validated['post_id'] = $post->id;
        $validated['status'] = 'pending'; // All comments start as pending for moderation
        $validated['ip_address'] = $request->ip();
        $validated['user_agent'] = $request->userAgent();

        // Basic spam detection
        $spamScore = $this->calculateSpamScore($validated['body'], $validated['author_name'] ?? null);
        if ($spamScore > 7) {
            $validated['status'] = 'spam';
        }

        // Create the comment
        $comment = Comment::create($validated);

        // Load relationships for response
        $comment->load(['user:id,name', 'parent:id,author_name']);

        return response()->json([
            'success' => true,
            'message' => $validated['status'] === 'spam' 
                ? 'Tu comentario ha sido marcado para revisión.' 
                : 'Tu comentario ha sido enviado y está pendiente de moderación.',
            'comment' => [
                'id' => $comment->id,
                'body' => $comment->body,
                'author_name' => $comment->user ? $comment->user->name : $comment->author_name,
                'created_at' => $comment->created_at->format('d/m/Y H:i'),
                'status' => $comment->status,
                'parent_id' => $comment->parent_id,
                'user' => $comment->user,
                'is_guest' => $comment->isGuest(),
            ]
        ], 201);
    }

    /**
     * Basic spam score calculation
     */
    private function calculateSpamScore($body, $authorName = null)
    {
        $score = 0;
        $originalBody = $body ?? '';
        $lowerBody = strtolower($originalBody);

        // Common spam patterns
        $spamKeywords = [
            'viagra', 'casino', 'lottery', 'winner', 'click here', 'free money',
            'make money', 'work from home', 'lose weight', 'single women',
            'hot girls', 'porn', 'sex', 'dating', 'loan', 'credit',
        ];

        foreach ($spamKeywords as $keyword) {
            if (strpos($lowerBody, $keyword) !== false) {
                $score += 2;
            }
        }

        // Too many links
        $linkCount = substr_count($lowerBody, 'http');
        if ($linkCount > 2) {
            $score += $linkCount * 2;
        }

        // Too many capital letters (measure on original text, excluding spaces)
        $nonSpaceLength = strlen(preg_replace('/\s+/', '', $originalBody));
        $upperCount = preg_match_all('/[A-Z]/', $originalBody);
        if ($nonSpaceLength > 0 && $upperCount > $nonSpaceLength * 0.5) {
            $score += 3;
        }

        // Repetitive content
        if (preg_match('/(.{10,})\1{2,}/', $lowerBody)) {
            $score += 4;
        }

        // Very short comments from guests only
        if ($authorName && strlen(trim($originalBody)) < 20) {
            $score += 2;
        }

        return $score;
    }

    /**
     * Get comments for a specific post (public API)
     */
    public function getComments(Post $post)
    {
        $comments = Comment::where('post_id', $post->id)
            ->approved()
            ->topLevel()
            ->with(['user:id,name', 'replies' => function ($query) {
                $query->approved()->with('user:id,name')->orderBy('created_at', 'asc');
            }])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($comment) {
                return [
                    'id' => $comment->id,
                    'body' => $comment->body,
                    'author_name' => $comment->user ? $comment->user->name : $comment->author_name,
                    'created_at' => $comment->created_at->format('d/m/Y H:i'),
                    'user' => $comment->user,
                    'is_guest' => $comment->isGuest(),
                    'replies' => $comment->replies->map(function ($reply) {
                        return [
                            'id' => $reply->id,
                            'body' => $reply->body,
                            'author_name' => $reply->user ? $reply->user->name : $reply->author_name,
                            'created_at' => $reply->created_at->format('d/m/Y H:i'),
                            'user' => $reply->user,
                            'is_guest' => $reply->isGuest(),
                        ];
                    })
                ];
            });

        return response()->json([
            'comments' => $comments,
            'count' => $comments->count()
        ]);
    }
}