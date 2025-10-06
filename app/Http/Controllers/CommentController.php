<?php

namespace App\Http\Controllers;

use App\Models\Comment;
use App\Models\CommentEdit;
use App\Models\Post;
use App\Http\Requests\UpdateCommentRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

/**
 * Manage comment creation, retrieval, and moderation endpoints.
 */
class CommentController extends Controller
{
    /**
     * Store a new comment for a blog post.
     *
     * @param Request $request The current HTTP request containing comment data.
     * @param Post $post The post model receiving the comment.
     * @return \Illuminate\Http\JsonResponse JSON response indicating the outcome.
     * @throws ValidationException When the request fails validation or rate limiting.
     */
    public function store(Request $request, Post $post)
    {
        // Check if post allows comments.
        if ($post->status !== 'published') {
            abort(404);
        }

        // Rate limiting: max 3 comments per minute per IP.
        $executed = RateLimiter::attempt(
            'comments:' . $request->ip(),
            $perMinute = 3,
            function () {
                // Empty callback.
            }
        );

        if (!$executed) {
            throw ValidationException::withMessages([
                'rate_limit' => 'You are posting comments too quickly. Please wait a moment before trying again.',
            ]);
        }

        // Validation rules differ for guests vs authenticated users.
        if (Auth::check()) {
            // Check if authenticated user is banned.
            $user = Auth::user();
            if ($user->isBanned()) {
                $banStatus = $user->getBanStatus();

                // Log the banned user's attempt to comment.
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
                    'message' => 'Your account is suspended and cannot post comments.',
                    'error' => 'USER_BANNED'
                ], 403);
            }

            // ✅ Authenticated user validation with enhanced security
            $validated = $request->validate([
                'body' => [
                    'required',
                    'string',
                    'min:10',
                    'max:2000',
                    'regex:/^[^<>]*$/', // ✅ Prevent HTML tags
                ],
                'parent_id' => [
                    'nullable',
                    'exists:comments,id',
                    function ($attribute, $value, $fail) use ($post) {
                        // ✅ Verify parent comment belongs to same post
                        if ($value) {
                            $parent = Comment::find($value);
                            if ($parent && $parent->post_id !== $post->id) {
                                $fail('The parent comment does not belong to this post.');
                            }
                        }
                    },
                ]
            ]);

            $validated['user_id'] = Auth::id();
            $validated['author_name'] = null;
            $validated['author_email'] = null;
        } else {
            // Guest user - check IP comment limit (max 2 comments per IP per post).
            $guestCommentsCount = Comment::where('post_id', $post->id)
                ->where('ip_address', $request->ip())
                ->whereNull('user_id') // Only count guest comments.
                ->count();

            if ($guestCommentsCount >= 2) {
                // Log the guest comment limit reached.
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
                    'message' => 'You reached the guest limit of two comments per article. Sign up to keep commenting.',
                    'error' => 'GUEST_COMMENT_LIMIT_REACHED'
                ], 429);
            }

            // ✅ Guest user validation with enhanced security
            $validated = $request->validate([
                'body' => [
                    'required',
                    'string',
                    'min:10',
                    'max:2000',
                    'regex:/^[^<>]*$/', // ✅ Prevent HTML tags
                ],
                'author_name' => [
                    'required',
                    'string',
                    'min:2',
                    'max:100',
                    'regex:/^[a-zA-Z\s\-\'\.]+$/', // ✅ Only letters, spaces, hyphens, apostrophes, dots
                ],
                'author_email' => [
                    'required',
                    'email',
                    'max:255',
                    'regex:/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/', // ✅ Strict email format
                ],
                'parent_id' => [
                    'nullable',
                    'exists:comments,id',
                    function ($attribute, $value, $fail) use ($post) {
                        // ✅ Verify parent comment belongs to same post
                        if ($value) {
                            $parent = Comment::find($value);
                            if ($parent && $parent->post_id !== $post->id) {
                                $fail('The parent comment does not belong to this post.');
                            }
                        }
                    },
                ]
            ]);

            $validated['user_id'] = null;
        }

        // Sanitize the comment body before persisting it.
        $validated['body'] = $this->sanitizeCommentBody($validated['body']);

        if ($validated['body'] === '') {
            throw ValidationException::withMessages([
                'body' => 'Comment content is empty after removing unsupported formatting.'
            ]);
        }

        // If replying to a comment, ensure it belongs to this post.
        if (!empty($validated['parent_id'])) {
            $parentComment = Comment::find($validated['parent_id']);
            if (!$parentComment || $parentComment->post_id !== $post->id) {
                abort(422, 'The parent comment does not belong to this post.');
            }
        }

        // Set additional fields.
        $validated['post_id'] = $post->id;
        $validated['ip_address'] = $request->ip();
        $validated['user_agent'] = $request->userAgent();

        // Set status based on user type.
        if (Auth::check()) {
            // Authenticated users get auto-approved comments.
            $validated['status'] = 'approved';
        } else {
            // Guest comments start as pending for moderation.
            $validated['status'] = 'pending';
        }

        // Basic spam detection.
        $spamScore = $this->calculateSpamScore($validated['body'], $validated['author_name'] ?? null);
        if ($spamScore > 7) {
            $validated['status'] = 'spam';
        }

        // Create the comment - use direct assignment for admin-only fields
        $comment = new Comment($validated);
        $comment->status = $validated['status'];
        $comment->ip_address = $request->ip();
        $comment->user_agent = $request->userAgent();

        // Set user_id if authenticated
        if (Auth::check()) {
            $comment->user_id = Auth::id();
        }

        $comment->save();

        // Load relationships for response.
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
     * Calculate a basic spam score for a comment body.
     *
     * @param string|null $body The comment text to evaluate.
     * @param string|null $authorName Optional author name for heuristic checks.
     * @return int Numeric spam score derived from simple heuristics.
     */
    private function calculateSpamScore($body, $authorName = null)
    {
        $score = 0;
        $originalBody = $body ?? '';
        $lowerBody = strtolower($originalBody);

        // Common spam patterns.
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

        // Too many links.
        $linkCount = substr_count($lowerBody, 'http');
        if ($linkCount > 2) {
            $score += $linkCount * 2;
        }

        // Too many capital letters (measure on original text, excluding spaces).
        $nonSpaceLength = strlen(preg_replace('/\s+/', '', $originalBody));
        $upperCount = preg_match_all('/[A-Z]/', $originalBody);
        if ($nonSpaceLength > 0 && $upperCount > $nonSpaceLength * 0.5) {
            $score += 3;
        }

        // Repetitive content.
        if (preg_match('/(.{10,})\1{2,}/', $lowerBody)) {
            $score += 4;
        }

        // Very short comments from guests only.
        if ($authorName && strlen(trim($originalBody)) < 20) {
            $score += 2;
        }

        return $score;
    }

    /**
     * Sanitize comment content to mitigate XSS attacks.
     */
    private function sanitizeCommentBody(?string $body): string
    {
        $body = $body ?? '';

        // Remove script/style blocks explicitly.
        $body = preg_replace('/<\/(?:script|style)>/i', '', preg_replace('/<(script|style)[^>]*>.*?<\/\1>/is', '', $body));

        // Strip all remaining HTML tags to store plain text content.
        $body = strip_tags($body);

        // Normalize whitespace and trim.
        $body = preg_replace("/\s+/u", ' ', $body);

        return trim($body);
    }

    /**
     * Get the appropriate message based on comment status and user type.
     */
    /**
     * Resolve a user-friendly status message for the given comment.
     *
     * @param Comment $comment The comment instance being returned to the client.
     * @return string Message explaining the moderation outcome.
     */
    private function getCommentStatusMessage($comment)
    {
        if ($comment->status === 'spam') {
            return 'Your comment was flagged for review due to potential spam content.';
        }

        if (Auth::check()) {
            return 'Your comment was published successfully.';
        } else {
            return 'Your comment was submitted and will appear here once moderation approves it.';
        }
    }

    /**
     * Get comments for a specific post (public API).
     *
     * @param Request $request The current HTTP request instance.
     * @param Post $post The post whose comments are being retrieved.
     * @return \Illuminate\Http\JsonResponse JSON response containing formatted comments.
     */
    public function getComments(Request $request, Post $post)
    {
        $userIp = $request->ip();

        // Build the main query based on user type.
        if (!Auth::check()) {
            // For guests, show approved comments plus their own pending comments (by IP).
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
                    // For replies, also include the guest's pending replies.
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
            // For authenticated users, only show approved comments.
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
     * Update a comment's content (authenticated users only).
     *
     * @param UpdateCommentRequest $request The validated request containing updated content.
     * @param Comment $comment The comment instance to update.
     * @return \Illuminate\Http\JsonResponse JSON response indicating the outcome.
     */
    public function update(UpdateCommentRequest $request, Comment $comment)
    {
        // Authorize the action using policy
        $this->authorize('update', $comment);

        // Check if comment can be edited (24-hour window)
        if (!$comment->canBeEditedBy($request->user())) {
            return response()->json([
                'success' => false,
                'message' => 'Los comentarios solo pueden editarse dentro de las 24 horas posteriores a su publicación.',
                'error' => 'EDIT_WINDOW_EXPIRED'
            ], 403);
        }

        // Check edit limit (maximum 5 edits for regular users)
        if ($comment->hasReachedEditLimit($request->user())) {
            return response()->json([
                'success' => false,
                'message' => 'Has alcanzado el límite máximo de 5 ediciones para este comentario.',
                'error' => 'EDIT_LIMIT_REACHED'
            ], 403);
        }

        // Store original content for history
        $originalContent = $comment->body;
        $newContent = $this->sanitizeCommentBody($request->body);

        // Check if content actually changed
        if ($originalContent === $newContent) {
            return response()->json([
                'success' => false,
                'message' => 'No se detectaron cambios en el contenido del comentario.',
                'error' => 'NO_CHANGES'
            ], 400);
        }

        try {
            DB::transaction(function () use ($comment, $originalContent, $newContent, $request) {
                // Create edit history record
                $comment->captureEdit(
                    $originalContent,
                    $newContent,
                    $request->user(),
                    $request->edit_reason
                );

                // Update comment
                $comment->update([
                    'body' => $newContent,
                    'edited_at' => now(),
                    'edit_reason' => $request->edit_reason,
                    'edit_count' => $comment->edit_count + 1,
                ]);
            });

            // Reload comment with relationships
            $comment->refresh();
            $comment->load(['user:id,name,avatar,is_verified']);

            return response()->json([
                'success' => true,
                'message' => 'Comentario actualizado exitosamente.',
                'comment' => [
                    'id' => $comment->id,
                    'body' => $comment->body,
                    'edited_at' => $comment->edited_at?->format('d/m/Y H:i'),
                    'edited_at_human' => $comment->edited_at_human,
                    'edit_reason' => $comment->edit_reason,
                    'edit_count' => $comment->edit_count,
                    'is_edited' => $comment->isEdited(),
                    'author_name' => $comment->user ? $comment->user->name : $comment->author_name,
                    'user' => $comment->user,
                ]
            ]);

        } catch (\Exception $e) {
            \Log::error('Error updating comment', [
                'comment_id' => $comment->id,
                'user_id' => Auth::id(),
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Error al actualizar el comentario. Por favor, inténtalo de nuevo.',
                'error' => 'UPDATE_FAILED'
            ], 500);
        }
    }

    /**
     * Get edit history for a comment.
     *
     * @param Comment $comment The comment whose history is being retrieved.
     * @return \Illuminate\Http\JsonResponse JSON response containing edit history.
     */
    public function editHistory(Comment $comment)
    {
        // Only the comment author or admins can view edit history
        if (!Auth::check()) {
            return response()->json([
                'success' => false,
                'message' => 'Debes iniciar sesión para ver el historial de ediciones.',
                'error' => 'UNAUTHORIZED'
            ], 401);
        }

        $user = Auth::user();
        $canView = $user->id === $comment->user_id ||
                   $user->hasRole('admin') ||
                   $user->hasRole('moderator');

        if (!$canView) {
            return response()->json([
                'success' => false,
                'message' => 'No tienes permiso para ver el historial de ediciones de este comentario.',
                'error' => 'FORBIDDEN'
            ], 403);
        }

        // Get edit history with user information
        $history = $comment->edits()
            ->with('user:id,name,avatar')
            ->orderBy('edited_at', 'desc')
            ->get()
            ->map(function ($edit) {
                return [
                    'id' => $edit->id,
                    'original_content' => $edit->original_content,
                    'new_content' => $edit->new_content,
                    'edit_reason' => $edit->edit_reason,
                    'edited_at' => $edit->edited_at->format('d/m/Y H:i'),
                    'edited_at_human' => $edit->edited_at->locale('es')->diffForHumans(),
                    'editor' => [
                        'id' => $edit->user->id,
                        'name' => $edit->user->name,
                        'avatar' => $edit->user->avatar,
                    ],
                ];
            });

        return response()->json([
            'success' => true,
            'history' => $history,
            'total_edits' => $history->count(),
        ]);
    }

    /**
     * Delete a comment (admin only).
     *
     * @param Comment $comment The comment instance targeted for deletion.
     * @return \Illuminate\Http\JsonResponse JSON response summarizing the deletion.
     */
    public function destroy(Comment $comment)
    {
        // ✅ Use policy for authorization
        $this->authorize('delete', $comment);

        try {
            // Store comment info for response.
            $commentAuthor = $comment->user ? $comment->user->name : $comment->author_name;

            // Delete the comment (this will also delete replies due to cascade).
            $comment->delete();

            return response()->json([
                'success' => true,
                'message' => "Comment from {$commentAuthor} deleted successfully."
            ]);

        } catch (\Exception $e) {
            \Log::error('Error deleting comment', [
                'comment_id' => $comment->id,
                'user_id' => Auth::id(),
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to delete the comment. Please try again.'
            ], 500);
        }
    }
}
