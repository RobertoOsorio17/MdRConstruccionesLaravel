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
            // Check if authenticated user is banned
            $user = Auth::user();
            if ($user->isBanned()) {
                $banStatus = $user->getBanStatus();

                // Log the banned user's attempt to comment
                \Log::warning('Banned user attempted to comment', [
                    'user_id' => $user->id,
                    'user_email' => $user->email,
                    'post_id' => $post->id,
                    'ban_reason' => $banStatus['reason'],
                    'ip' => $request->ip(),
                    'timestamp' => now()->toISOString()
                ]);

                return response()->json([
                    'success' => false,
                    'message' => 'Tu cuenta ha sido suspendida y no puedes crear comentarios.',
                    'error' => 'USER_BANNED'
                ], 403);
            }

            // Authenticated user validation
            $validated = $request->validate([
                'body' => 'required|string|min:10|max:2000',
                'parent_id' => 'nullable|exists:comments,id'
            ]);

            $validated['user_id'] = Auth::id();
            $validated['author_name'] = null;
            $validated['author_email'] = null;
        } else {
            // Guest user - check IP comment limit (max 2 comments per IP per post)
            $guestCommentsCount = Comment::where('post_id', $post->id)
                ->where('ip_address', $request->ip())
                ->whereNull('user_id') // Only count guest comments
                ->count();

            if ($guestCommentsCount >= 2) {
                // Log the guest comment limit reached
                \Log::info('Guest user reached comment limit', [
                    'ip' => $request->ip(),
                    'post_id' => $post->id,
                    'post_title' => $post->title,
                    'existing_comments' => $guestCommentsCount,
                    'user_agent' => $request->userAgent(),
                    'timestamp' => now()->toISOString()
                ]);

                return response()->json([
                    'success' => false,
                    'message' => 'Has alcanzado el límite máximo de 2 comentarios por artículo como usuario invitado. Regístrate para comentar sin límites.',
                    'error' => 'GUEST_COMMENT_LIMIT_REACHED'
                ], 429);
            }

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
        $validated['ip_address'] = $request->ip();
        $validated['user_agent'] = $request->userAgent();

        // Set status based on user type
        if (Auth::check()) {
            // Authenticated users get auto-approved comments
            $validated['status'] = 'approved';
        } else {
            // Guest comments start as pending for moderation
            $validated['status'] = 'pending';
        }

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
            'message' => $this->getCommentStatusMessage($comment),
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
     * Get appropriate message based on comment status and user type
     */
    private function getCommentStatusMessage($comment)
    {
        if ($comment->status === 'spam') {
            return 'Tu comentario ha sido marcado para revisión debido a posible contenido spam.';
        }

        if (Auth::check()) {
            return 'Tu comentario ha sido publicado exitosamente.';
        } else {
            return 'Tu comentario ha sido enviado y aparecerá aquí mientras espera moderación. Una vez aprobado, será visible para todos los visitantes.';
        }
    }

    /**
     * Get comments for a specific post (public API)
     */
    public function getComments(Request $request, Post $post)
    {
        $userIp = $request->ip();

        // Build the main query based on user type
        if (!Auth::check()) {
            // For guests, show approved comments + their own pending comments (by IP)
            $comments = Comment::where('post_id', $post->id)
                ->topLevel()
                ->where(function ($query) use ($userIp) {
                    $query->where('status', 'approved')
                          ->orWhere(function ($subQuery) use ($userIp) {
                              $subQuery->where('status', 'pending')
                                       ->where('ip_address', $userIp)
                                       ->whereNull('user_id');
                          });
                })
                ->with(['user:id,name,is_verified', 'replies' => function ($query) use ($userIp) {
                    // For replies, also include guest's pending replies
                    $query->where(function ($q) use ($userIp) {
                        $q->where('status', 'approved')
                          ->orWhere(function ($subQ) use ($userIp) {
                              $subQ->where('status', 'pending')
                                   ->where('ip_address', $userIp)
                                   ->whereNull('user_id');
                          });
                    })->with('user:id,name,is_verified')->orderBy('created_at', 'asc');
                }])
                ->orderBy('created_at', 'desc')
                ->get();
        } else {
            // For authenticated users, only show approved comments
            $comments = Comment::where('post_id', $post->id)
                ->approved()
                ->topLevel()
                ->with(['user:id,name,is_verified', 'replies' => function ($query) {
                    $query->approved()->with('user:id,name,is_verified')->orderBy('created_at', 'asc');
                }])
                ->orderBy('created_at', 'desc')
                ->get();
        }

        $formattedComments = $comments->map(function ($comment) use ($userIp) {
            return [
                'id' => $comment->id,
                'body' => $comment->body,
                'author_name' => $comment->user ? $comment->user->name : $comment->author_name,
                'created_at' => $comment->created_at->format('d/m/Y H:i'),
                'status' => $comment->status,
                'user' => $comment->user,
                'is_guest' => $comment->isGuest(),
                'is_own_pending' => !Auth::check() && $comment->status === 'pending' && $comment->ip_address === $userIp,
                'replies' => $comment->replies->map(function ($reply) use ($userIp) {
                    return [
                        'id' => $reply->id,
                        'body' => $reply->body,
                        'author_name' => $reply->user ? $reply->user->name : $reply->author_name,
                        'created_at' => $reply->created_at->format('d/m/Y H:i'),
                        'status' => $reply->status,
                        'user' => $reply->user,
                        'is_guest' => $reply->isGuest(),
                        'is_own_pending' => !Auth::check() && $reply->status === 'pending' && $reply->ip_address === $userIp,
                    ];
                })
            ];
        });

        return response()->json([
            'comments' => $formattedComments,
            'count' => $formattedComments->count()
        ]);
    }

    /**
     * Delete a comment (admin only).
     */
    public function destroy(Comment $comment)
    {
        // Check if user is authenticated
        if (!Auth::check()) {
            return response()->json([
                'success' => false,
                'message' => 'No tienes permisos para realizar esta acción.'
            ], 403);
        }

        $user = Auth::user();

        // Check if user is admin
        if (!$user->hasRole('admin')) {
            return response()->json([
                'success' => false,
                'message' => 'No tienes permisos para eliminar comentarios.'
            ], 403);
        }

        try {
            // Store comment info for response
            $commentAuthor = $comment->user ? $comment->user->name : $comment->author_name;

            // Delete the comment (this will also delete replies due to cascade)
            $comment->delete();

            return response()->json([
                'success' => true,
                'message' => "Comentario de {$commentAuthor} eliminado correctamente."
            ]);

        } catch (\Exception $e) {
            \Log::error('Error deleting comment', [
                'comment_id' => $comment->id,
                'admin_user_id' => $user->id,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Error al eliminar el comentario. Inténtalo de nuevo.'
            ], 500);
        }
    }
}