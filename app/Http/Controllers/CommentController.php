<?php

namespace App\Http\Controllers;

use App\Models\AdminSetting;
use App\Models\Comment;
use App\Models\CommentEdit;
use App\Models\Post;
use App\Http\Requests\UpdateCommentRequest;
use App\Helpers\DeviceFingerprintHelper;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

/**
 * Powers public comment submission and moderation logic, balancing usability with anti-abuse safeguards.
 *
 * Features:
 * - Global feature flag to enable/disable comments site‑wide.
 * - Per‑IP rate limiting to reduce spam bursts.
 * - Split validation flows for authenticated users and guests.
 * - Guest device fingerprint + IP checks to cap anonymous posting per post.
 * - HTML sanitization and link hardening to mitigate XSS.
 * - Simple spam heuristics with status escalation to 'spam'.
 * - Reply constraints (only reply to top‑level comments) to keep thread depth shallow.
 * - Soft deletion to preserve conversation structure.
 * - Edit history with pessimistic locking to avoid race conditions.
 */
class CommentController extends Controller
{
    use AuthorizesRequests;
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
        // 1) Check if comments are globally enabled via settings.
        $commentsEnabled = AdminSetting::getCachedValue('blog_allow_comments', true, 300);
        if (!$commentsEnabled) {
            return response()->json([
                'message' => 'Los comentarios están deshabilitados temporalmente.',
            ], 403);
        }

        // 2) Ensure the target post is published and not trashed.
        if ($post->status !== 'published' || $post->trashed()) {
            abort(404);
        }

        // 3) Apply per‑IP rate limiting to throttle comment creation.
        $executed = RateLimiter::attempt(
            'comments:' . $request->ip(),
            $perMinute = 3,
            function () {
                // Return true to indicate successful execution.
                return true;
            }
        );

        if (!$executed) {
            throw ValidationException::withMessages([
                'rate_limit' => 'You are posting comments too quickly. Please wait a moment before trying again.',
            ]);
        }

        // 4) Validation rules differ for guests vs authenticated users.
        if (Auth::check()) {
            // 4a) For authenticated users, block banned accounts and validate payload.
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

            // 4b) Authenticated user validation with enhanced security.
            $validated = $request->validate([
                'body' => [
                    'required',
                    'string',
                    'min:10',
                    'max:2000',
                    'regex:/^[^<>]*$/', // Prevent HTML tags.
                ],
                'parent_id' => [
                    'nullable',
                    'exists:comments,id',
                    function ($attribute, $value, $fail) use ($post) {
                        // Verify parent comment belongs to same post.
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
            // 4c) Guest users: derive a device fingerprint and enforce per‑post caps.
            //     This helps control abuse from non‑logged‑in traffic while still
            //     allowing limited participation.
            //     (Max 2 comments per device/IP per post.)
            
            // Use device fingerprinting for guest comment limits.
            $clientData = DeviceFingerprintHelper::parseClientData($request);
            $deviceFingerprint = DeviceFingerprintHelper::generate($request, $clientData);

            // Guest user - check device fingerprint comment limit (max 2 comments per device per post)
            $guestCommentsCount = Comment::where('post_id', $post->id)
                ->where(function ($query) use ($request, $deviceFingerprint) {
                    $query->where('device_fingerprint', $deviceFingerprint)
                          ->orWhere('ip_address', $request->ip());
                })
                ->whereNull('user_id') // Only count guest comments.
                ->count();

            if ($guestCommentsCount >= 2) {
                // Log the guest comment limit reached.
                \Log::info('Guest user reached comment limit', [
                    'ip' => $request->ip(),
                    'device_fingerprint' => $deviceFingerprint,
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

            // Guest user validation with enhanced security.
            $validated = $request->validate([
                'body' => [
                    'required',
                    'string',
                    'min:10',
                    'max:2000',
                    'regex:/^[^<>]*$/', // Prevent HTML tags.
                ],
                'author_name' => [
                    'required',
                    'string',
                    'min:2',
                    'max:100',
                    // Support Unicode letters (ñ, á, é, etc.) for Spanish names.
                    'regex:/^[\p{L}\p{M}\s\-\'\.]+$/u', // Unicode letters, marks, spaces, hyphens, apostrophes, dots
                ],
                'author_email' => [
                    'required',
                    'email:rfc,dns', // ✅ FIXED: Use Laravel's built-in strict email validation
                    'max:255',
                ],
                'parent_id' => [
                    'nullable',
                    'exists:comments,id',
                    function ($attribute, $value, $fail) use ($post) {
                        // Verify parent comment belongs to same post.
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

        // 5) Sanitize the comment body before persisting it (XSS mitigation and safe links).
        $validated['body'] = $this->sanitizeCommentBody($validated['body']);

        if ($validated['body'] === '') {
            throw ValidationException::withMessages([
                'body' => 'Comment content is empty after removing unsupported formatting.'
            ]);
        }

        // 6) If replying to a comment, ensure the parent belongs to this post.
        if (!empty($validated['parent_id'])) {
            $parentComment = Comment::find($validated['parent_id']);
            if (!$parentComment || $parentComment->post_id !== $post->id) {
                abort(422, 'The parent comment does not belong to this post.');
            }

            // YouTube‑style: Only allow replies to main comments (level 0).
            // If the parent comment has a parent_id, it means it is already a reply.
            if ($parentComment->parent_id !== null) {
                return response()->json([
                    'success' => false,
                    'message' => 'Solo puedes responder a comentarios principales. Para mencionar a alguien, usa @usuario en tu respuesta.',
                    'error' => 'REPLY_TO_REPLY_NOT_ALLOWED'
                ], 422);
            }
        }

        // 7) Set additional fields (post, client hints).
        $validated['post_id'] = $post->id;
        $validated['ip_address'] = $request->ip();
        $validated['user_agent'] = $request->userAgent();

        // 8) Set initial moderation status based on user type.
        if (Auth::check()) {
            // Authenticated users get auto-approved comments.
            $validated['status'] = 'approved';
        } else {
            // Guest comments start as pending for moderation.
            $validated['status'] = 'pending';
        }

        // 9) Apply basic spam heuristics; escalate status when score is high.
        $spamScore = $this->calculateSpamScore($validated['body'], $validated['author_name'] ?? null);
        if ($spamScore > 7) {
            $validated['status'] = 'spam';
        }

        // 10) Create and persist the comment; assign admin‑only fields explicitly.
        $comment = new Comment($validated);
        $comment->status = $validated['status'];
        $comment->ip_address = $request->ip();
        $comment->user_agent = $request->userAgent();

        // Store device fingerprint for guest comments.
        if (!Auth::check()) {
            $clientData = DeviceFingerprintHelper::parseClientData($request);
            $comment->device_fingerprint = DeviceFingerprintHelper::generate($request, $clientData);
        }

        // Set user_id if authenticated
        if (Auth::check()) {
            $comment->user_id = Auth::id();
        }

        $comment->save();

        // 11) Load minimal relationships for response shaping.
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
     * Sanitize comment content to mitigate XSS while allowing minimal formatting.
     *
     * Strategy:
     * - Strip script/style blocks explicitly.
     * - Whitelist simple tags for readability (b, i, em, strong, a, br, p).
     * - Rebuild <a> tags to only allow http/https href and add rel/target attributes.
     * - Normalize whitespace and trim.
     *
     * @param string|null $body The raw comment body.
     * @return string The sanitized content ready for storage.
     */
    private function sanitizeCommentBody(?string $body): string
    {
        $body = $body ?? '';

        // Remove script/style blocks explicitly.
        $body = preg_replace('/<\/(?:script|style)>/i', '', preg_replace('/<(script|style)[^>]*>.*?<\/\1>/is', '', $body));

        // Allow only safe HTML tags for basic formatting
        $allowed_tags = '<b><i><em><strong><a><br><p>';
        $body = strip_tags($body, $allowed_tags);

        // Sanitize <a> tags to only allow href attribute and add security attributes
        $body = preg_replace_callback(
            '/<a\s+([^>]+)>/i',
            function($matches) {
                // Only allow href attribute with http/https URLs
                if (preg_match('/href=["\'](https?:\/\/[^"\']+)["\']/', $matches[1], $href)) {
                    $cleanUrl = htmlspecialchars($href[1], ENT_QUOTES, 'UTF-8');
                    return '<a href="' . $cleanUrl . '" rel="nofollow noopener noreferrer" target="_blank">';
                }
                // If no valid href, remove the tag entirely
                return '';
            },
            $body
        );

        // Normalize whitespace and trim.
        $body = preg_replace("/\s+/u", ' ', $body);

        return trim($body);
    }

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
     * Includes soft-deleted comments to preserve conversation structure.
     * Deleted comments will be marked with is_deleted flag for frontend display.
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
            // Include soft-deleted comments to preserve conversation structure
            $comments = Comment::withTrashed()
                ->where('post_id', $post->id)
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
                    // For replies, also include the guest's pending replies and soft-deleted
                    $query->withTrashed()
                        ->where(function ($q) use ($userIp) {
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
            // Include soft-deleted comments to preserve conversation structure
            $comments = Comment::withTrashed()
                ->where('post_id', $post->id)
                ->approved()
                ->topLevel()
                ->with(['user:id,name,is_verified', 'replies' => function ($query) {
                    $query->withTrashed()->approved()->with('user:id,name,is_verified')->orderBy('created_at', 'asc');
                }])
                ->orderBy('created_at', 'desc')
                ->get();
        }

        $currentUser = Auth::user();

        $formattedComments = $comments->map(function ($comment) use ($userIp, $currentUser) {
            $isDeleted = $comment->trashed();

            // Check if user has reported this comment.
            $userHasReported = false;
            if ($currentUser) {
                $userHasReported = \App\Models\CommentReport::where('comment_id', $comment->id)
                    ->where('user_id', $currentUser->id)
                    ->exists();
            }

            // Check if user has reported this comment
            $userHasReported = false;
            if ($currentUser) {
                $userHasReported = \App\Models\CommentReport::where('comment_id', $comment->id)
                    ->where('user_id', $currentUser->id)
                    ->exists();
            }

            return [
                'id' => $comment->id,
                'body' => $isDeleted ? '[Comentario eliminado]' : $comment->body,
                'author_name' => $comment->user ? $comment->user->name : ($comment->author_name ?? 'Usuario invitado'),
                'created_at' => $comment->created_at->format('d/m/Y H:i'),
                'status' => $comment->status,
                'user' => $isDeleted ? null : $comment->user,
                'is_guest' => $comment->isGuest(),
                'is_own_pending' => !Auth::check() && $comment->status === 'pending' && $comment->ip_address === $userIp,
                'is_deleted' => $isDeleted,
                'user_id' => $comment->user_id,
                'likes_count' => $comment->likeCount(),
                'dislikes_count' => $comment->dislikeCount(),
                'user_has_liked' => $currentUser ? $comment->isLikedBy($currentUser) : false,
                'user_has_disliked' => $currentUser ? $comment->isDislikedBy($currentUser) : false,
                'user_has_reported' => $userHasReported,
                'user_has_reported' => $userHasReported,
                'replies' => $comment->replies->map(function ($reply) use ($userIp, $currentUser) {
                    $isReplyDeleted = $reply->trashed();

                    // Check if user has reported this reply.
                    $userHasReportedReply = false;
                    if ($currentUser) {
                        $userHasReportedReply = \App\Models\CommentReport::where('comment_id', $reply->id)
                            ->where('user_id', $currentUser->id)
                            ->exists();
                    }

                    // Check if user has reported this reply
                    $userHasReportedReply = false;
                    if ($currentUser) {
                        $userHasReportedReply = \App\Models\CommentReport::where('comment_id', $reply->id)
                            ->where('user_id', $currentUser->id)
                            ->exists();
                    }

                    return [
                        'id' => $reply->id,
                        'body' => $isReplyDeleted ? '[Comentario eliminado]' : $reply->body,
                        'author_name' => $reply->user ? $reply->user->name : ($reply->author_name ?? 'Usuario invitado'),
                        'created_at' => $reply->created_at->format('d/m/Y H:i'),
                        'status' => $reply->status,
                        'user' => $isReplyDeleted ? null : $reply->user,
                        'is_guest' => $reply->isGuest(),
                        'is_own_pending' => !Auth::check() && $reply->status === 'pending' && $reply->ip_address === $userIp,
                        'is_deleted' => $isReplyDeleted,
                        'user_id' => $reply->user_id,
                        'likes_count' => $reply->likeCount(),
                        'dislikes_count' => $reply->dislikeCount(),
                        'user_has_liked' => $currentUser ? $reply->isLikedBy($currentUser) : false,
                        'user_has_disliked' => $currentUser ? $reply->isDislikedBy($currentUser) : false,
                        'user_has_reported' => $userHasReportedReply,
                        'user_has_reported' => $userHasReportedReply,
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

        // Store original content for history (outside transaction for comparison)
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
            // Race condition fix: perform all validations inside transaction with pessimistic locking.
            DB::transaction(function () use ($comment, $originalContent, $newContent, $request) {
                // Lock the row first to prevent concurrent modifications.
                $lockedComment = Comment::where('id', $comment->id)->lockForUpdate()->first();

                if (!$lockedComment) {
                    throw new \Exception('Comment not found or was deleted');
                }

                // Check edit window (24 hours) inside transaction.
                if (!$lockedComment->canBeEditedBy($request->user())) {
                    throw new \Exception('EDIT_WINDOW_EXPIRED');
                }

                // Check edit limit inside transaction (prevents race condition).
                if ($lockedComment->hasReachedEditLimit($request->user())) {
                    throw new \Exception('EDIT_LIMIT_REACHED');
                }

                // Create edit history record.
                $lockedComment->captureEdit(
                    $originalContent,
                    $newContent,
                    $request->user(),
                    $request->edit_reason
                );

                // Update comment.
                $lockedComment->forceFill([
                    'body' => $newContent,
                    'edited_at' => now(),
                    'edit_reason' => $request->edit_reason,
                ])->save();

                $lockedComment->increment('edit_count');
            }, 3); // Retry up to 3 times on deadlock

            // Reload comment with relationships.
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

        } catch (\Illuminate\Database\QueryException $e) {
            // Handle deadlocks specifically.
            if ($e->getCode() === '40001' || str_contains($e->getMessage(), 'Deadlock')) {
                \Log::warning('Deadlock detected while updating comment', [
                    'comment_id' => $comment->id,
                    'user_id' => Auth::id(),
                    'error' => $e->getMessage()
                ]);

                return response()->json([
                    'success' => false,
                    'message' => 'El sistema está ocupado. Por favor, intenta nuevamente.',
                    'error' => 'DEADLOCK'
                ], 409);
            }

            // Other database errors
            throw $e;

        } catch (\Exception $e) {
            // Handle specific transaction exceptions
            if ($e->getMessage() === 'EDIT_WINDOW_EXPIRED') {
                return response()->json([
                    'success' => false,
                    'message' => 'Los comentarios solo pueden editarse dentro de las 24 horas posteriores a su publicación.',
                    'error' => 'EDIT_WINDOW_EXPIRED'
                ], 403);
            }

            if ($e->getMessage() === 'EDIT_LIMIT_REACHED') {
                return response()->json([
                    'success' => false,
                    'message' => 'Has alcanzado el límite máximo de 5 ediciones para este comentario.',
                    'error' => 'EDIT_LIMIT_REACHED'
                ], 403);
            }

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
     * Delete a comment.
     *
     * Uses soft delete to preserve conversation structure when comments have replies.
     * Soft-deleted comments will display as "[Comentario eliminado]" in the UI.
     *
     * @param Comment $comment The comment instance targeted for deletion.
     * @return \Illuminate\Http\JsonResponse JSON response summarizing the deletion.
     */
    public function destroy($commentId)
    {
        // Retrieve comment including soft-deleted ones to provide graceful responses
        $comment = Comment::withTrashed()->find($commentId);

        if (!$comment) {
            return response()->json([
                'success' => false,
                'message' => 'El comentario no existe o ya fue eliminado.'
            ], 404);
        }

        // Use policy for authorization.
        $this->authorize('delete', $comment);

        if ($comment->trashed()) {
            return response()->json([
                'success' => true,
                'message' => 'El comentario ya se encontraba eliminado.'
            ]);
        }

        try {
            // Store comment info for response.
            $commentAuthor = $comment->user ? $comment->user->name : $comment->author_name;

            // Always use soft delete to preserve conversation structure
            // This allows replies to remain visible even when parent is deleted
            $comment->delete();

            return response()->json([
                'success' => true,
                'message' => "Comentario de {$commentAuthor} eliminado exitosamente."
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
