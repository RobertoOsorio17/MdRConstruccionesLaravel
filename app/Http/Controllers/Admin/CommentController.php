<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Comment;
use App\Models\Post;
use Illuminate\Http\Request;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Inertia\Inertia;

/**
 * Moderates reader conversations by enabling administrators to review, update, and triage comment submissions.
 * Provides filtered listings and bulk actions that keep community discussions healthy and compliant.
 */
class CommentController extends Controller
{
    use AuthorizesRequests;
    /**
     * Display a listing of comments.
     */
    public function index(Request $request)
    {
        // Authorize action.
        $this->authorize('viewAny', Comment::class);

        $query = Comment::with(['post:id,title,slug', 'user:id,name', 'parent:id']);

        // Filter by deletion status
        if ($request->has('deleted_status')) {
            if ($request->deleted_status === 'deleted') {
                $query->onlyTrashed();
            } elseif ($request->deleted_status === 'active') {
                // Default: only non-deleted
            } elseif ($request->deleted_status === 'all') {
                $query->withTrashed();
            }
        }

        // Filter by moderation status when provided.
        if ($request->has('status') && !empty($request->status)) {
            $query->where('status', $request->status);
        }

        // Filter comments by the related post identifier.
        if ($request->has('post') && !empty($request->post)) {
            $query->where('post_id', $request->post);
        }

        // Apply keyword search across body and author information.
        // Security: Escape LIKE wildcards to prevent SQL injection.
        if ($request->has('search') && !empty($request->search)) {
            $search = str_replace(['\\', '%', '_'], ['\\\\', '\\%', '\\_'], $request->search);
            $query->where(function ($q) use ($search) {
                $q->where('body', 'like', '%' . $search . '%')
                  ->orWhere('author_name', 'like', '%' . $search . '%')
                  ->orWhere('author_email', 'like', '%' . $search . '%');
            });
        }

        $comments = $query->orderBy('created_at', 'desc')
            ->paginate(15)
            ->through(function ($comment) {
                return [
                    'id' => $comment->id,
                    'body' => $comment->body,
                    'author_name' => $comment->author_name,
                    'author_email' => $comment->author_email,
                    'status' => $comment->status,
                    'post' => $comment->post,
                    'user' => $comment->user,
                    'parent_id' => $comment->parent_id,
                    'is_reply' => $comment->parent_id !== null,
                    'replies_count' => $comment->replies()->count(),
                    'deleted_at' => $comment->deleted_at,
                    'created_at' => $comment->created_at->format('d/m/Y H:i'),
                    'updated_at' => $comment->updated_at->format('d/m/Y H:i'),
                ];
            });

        // Retrieve posts to populate the filter dropdown.
        $posts = Post::select('id', 'title')->orderBy('title')->get();

        return Inertia::render('Admin/Comments/Index', [
            'comments' => $comments,
            'posts' => $posts,
            'filters' => [
                'search' => $request->search,
                'status' => $request->status,
                'post' => $request->post,
                'deleted_status' => $request->deleted_status,
            ],
            'stats' => [
                'total' => Comment::count(),
                'pending' => Comment::where('status', 'pending')->count(),
                'approved' => Comment::where('status', 'approved')->count(),
                'spam' => Comment::where('status', 'spam')->count(),
                'deleted' => Comment::onlyTrashed()->count(),
            ]
        ]);
    }

    /**
     * Display the specified comment.
     */
    public function show(Comment $comment)
    {
        // Authorize action.
        $this->authorize('view', $comment);

        $comment->load(['post:id,title,slug', 'user:id,name', 'parent:id,content,author_name', 'replies']);

        return Inertia::render('Admin/Comments/Show', [
            'comment' => [
                'id' => $comment->id,
                'body' => $comment->body,
                'author_name' => $comment->author_name,
                'author_email' => $comment->author_email,
                'ip_address' => $comment->ip_address,
                'user_agent' => $comment->user_agent,
                'status' => $comment->status,
                'post' => $comment->post,
                'user' => $comment->user,
                'parent' => $comment->parent,
                'replies' => $comment->replies,
                'created_at' => $comment->created_at->format('d/m/Y H:i'),
                'updated_at' => $comment->updated_at->format('d/m/Y H:i'),
            ]
        ]);
    }

    /**
     * Update the specified comment status.
     *
     * Security: Added proper validation and sanitization.
     */
    public function update(Request $request, Comment $comment)
    {
        // Authorize action.
        $this->authorize('update', $comment);

        // Security: Proper validation with length limits and XSS prevention.
        $validated = $request->validate([
            'status' => 'required|in:pending,approved,spam,rejected',
            'body' => [
                'sometimes',
                'required',
                'string',
                'min:10',
                'max:2000',
                'regex:/^[^<>]*$/', // Prevent HTML tags
            ],
        ]);

        // Security: Sanitize body content if provided.
        if (isset($validated['body'])) {
            $validated['body'] = $this->sanitizeCommentBody($validated['body']);
        }

        $comment->update($validated);

        // Improvement: Return updated comment data to avoid page reload.
        return response()->json([
            'success' => true,
            'status' => $comment->status,
            'message' => 'Comment updated successfully.',
            'comment' => $comment->fresh(['user', 'post'])
        ]);
    }

    /**
     * Sanitize comment body to prevent XSS attacks.
     *
     * Security: Strip HTML tags and trim whitespace.
     */
    private function sanitizeCommentBody(string $body): string
    {
        return strip_tags(trim($body));
    }

    /**
     * Remove the specified comment.
     *
     * Uses soft delete to preserve conversation structure.
     * Soft-deleted comments display as "[Comentario eliminado]" in the UI.
     * ✅ SECURITY FIX: Added audit logging
     */
    public function destroy(Comment $comment)
    {
        // Authorize action.
        $this->authorize('delete', $comment);

        // Use soft delete to preserve conversation structure
        // Replies will remain visible even when parent is deleted
        $comment->delete();

        // Security: Log deletion in audit log.
        \App\Models\AdminAuditLog::logAction([
            'action' => 'delete',
            'model_type' => Comment::class,
            'model_id' => $comment->id,
            'severity' => 'medium',
            'description' => "Deleted comment #{$comment->id}",
            'metadata' => [
                'comment_id' => $comment->id,
                'post_id' => $comment->post_id,
                'author_name' => $comment->author_name,
            ]
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Comentario eliminado exitosamente.'
        ]);
    }

    /**
     * Approve a comment through the moderation endpoint.
     *
     * Security: Added audit logging.
     */
    public function approve(Comment $comment)
    {
        // Authorize action.
        $this->authorize('moderate', $comment);

        $oldStatus = $comment->status;
        $comment->update(['status' => 'approved']);

        // Security: Log approval in audit log.
        \App\Models\AdminAuditLog::logAction([
            'action' => 'approve',
            'model_type' => Comment::class,
            'model_id' => $comment->id,
            'severity' => 'low',
            'description' => "Approved comment #{$comment->id}",
            'metadata' => [
                'comment_id' => $comment->id,
                'old_status' => $oldStatus,
                'new_status' => 'approved',
            ]
        ]);

        return response()->json([
            'success' => true,
            'status' => 'approved',
            'message' => 'Comment approved.'
        ]);
    }

    /**
     * Mark a comment as spam for moderation purposes.
     *
     * Security: Added audit logging.
     */
    public function markAsSpam(Comment $comment)
    {
        // Authorize action.
        $this->authorize('moderate', $comment);

        $oldStatus = $comment->status;
        $comment->update(['status' => 'spam']);

        // Security: Log spam marking in audit log.
        \App\Models\AdminAuditLog::logAction([
            'action' => 'mark_spam',
            'model_type' => Comment::class,
            'model_id' => $comment->id,
            'severity' => 'medium',
            'description' => "Marked comment #{$comment->id} as spam",
            'metadata' => [
                'comment_id' => $comment->id,
                'old_status' => $oldStatus,
                'new_status' => 'spam',
            ]
        ]);

        return response()->json([
            'success' => true,
            'status' => 'spam',
            'message' => 'Comment marked as spam.'
        ]);
    }

    /**
     * Approve multiple comments in a single request.
     *
     * Security: Only update comments that aren't already approved and log audit entry.
     */
    public function bulkApprove(Request $request)
    {
        // Authorize bulk action capability.
        $this->authorize('moderate', Comment::class);

        $validated = $request->validate([
            'comment_ids' => 'required|array|max:100', // Limit to 100.
            'comment_ids.*' => 'exists:comments,id',
        ]);

        // Verify authorization for each comment.
        $comments = Comment::whereIn('id', $validated['comment_ids'])->get();
        foreach ($comments as $comment) {
            $this->authorize('moderate', $comment);
        }

        // Security fix: Only update comments that aren't already approved.
        $count = Comment::whereIn('id', $validated['comment_ids'])
            ->where('status', '!=', 'approved')
            ->update(['status' => 'approved']);

        // Security: Log bulk operation in audit log.
        \App\Models\AdminAuditLog::logAction([
            'action' => 'bulk_approve',
            'model_type' => Comment::class,
            'severity' => 'medium',
            'description' => "Bulk approved {$count} comments",
            'metadata' => [
                'comment_ids' => $validated['comment_ids'],
                'approved_count' => $count,
                'total_selected' => count($validated['comment_ids']),
            ]
        ]);

        return response()->json([
            'success' => true,
            'approved_count' => $count,
            'message' => "{$count} comment(s) approved successfully."
        ]);
    }

    /**
     * Delete multiple comments and their replies in bulk.
     *
     * Security: Added audit logging.
     */
    public function bulkDelete(Request $request)
    {
        // Authorize bulk action capability.
        $this->authorize('moderate', Comment::class);

        $validated = $request->validate([
            'comment_ids' => 'required|array|max:100', // Limit to 100.
            'comment_ids.*' => 'exists:comments,id',
        ]);

        // Verify authorization for each comment.
        $comments = Comment::whereIn('id', $validated['comment_ids'])->get();
        foreach ($comments as $comment) {
            $this->authorize('delete', $comment);
        }

        $count = Comment::whereIn('id', $validated['comment_ids'])->count();
        Comment::whereIn('id', $validated['comment_ids'])->delete();

        // Security: Log bulk operation in audit log.
        \App\Models\AdminAuditLog::logAction([
            'action' => 'bulk_delete',
            'model_type' => Comment::class,
            'severity' => 'high',
            'description' => "Bulk deleted {$count} comments",
            'metadata' => [
                'comment_ids' => $validated['comment_ids'],
                'deleted_count' => $count,
            ]
        ]);

        return response()->json([
            'success' => true,
            'deleted_count' => $count,
            'message' => "{$count} comment(s) deleted successfully."
        ]);
    }

    /**
     * Flag multiple comments as spam in one operation.
     *
     * Security: Only update non-spam comments and add audit logging.
     */
    public function bulkMarkAsSpam(Request $request)
    {
        // Authorize bulk action capability.
        $this->authorize('moderate', Comment::class);

        $validated = $request->validate([
            'comment_ids' => 'required|array|max:100', // Limit to 100.
            'comment_ids.*' => 'exists:comments,id',
        ]);

        // Verify authorization for each comment.
        $comments = Comment::whereIn('id', $validated['comment_ids'])->get();
        foreach ($comments as $comment) {
            $this->authorize('moderate', $comment);
        }

        // Security: Only update comments that aren't already spam.
        $count = Comment::whereIn('id', $validated['comment_ids'])
            ->where('status', '!=', 'spam')
            ->update(['status' => 'spam']);

        // Security: Log bulk operation in audit log.
        \App\Models\AdminAuditLog::logAction([
            'action' => 'bulk_mark_spam',
            'model_type' => Comment::class,
            'severity' => 'medium',
            'description' => "Bulk marked {$count} comments as spam",
            'metadata' => [
                'comment_ids' => $validated['comment_ids'],
                'spam_count' => $count,
                'total_selected' => count($validated['comment_ids']),
            ]
        ]);

        return response()->json([
            'success' => true,
            'spam_count' => $count,
            'message' => "{$count} comment(s) flagged as spam."
        ]);
    }

    /**
     * Restore a soft-deleted comment.
     *
     * Security validations:
     * - Verifies comment exists and is actually deleted
     * - Checks parent post integrity (not deleted)
     * - Validates author ban status
     * - Logs restoration action for audit trail
     * - Rate limited to prevent abuse
     *
     * @param Comment $comment The comment to restore (route model binding with trashed)
     * @return \Illuminate\Http\JsonResponse
     */
    public function restore($id)
    {
        // Find comment including soft-deleted ones.
        $comment = Comment::withTrashed()->findOrFail($id);

        // Security: Authorize restore action.
        $this->authorize('restore', $comment);

        // Validation: Verify comment is actually deleted.
        if (!$comment->trashed()) {
            return response()->json([
                'success' => false,
                'message' => 'El comentario no está eliminado y no puede ser restaurado.'
            ], 400);
        }

        // Validation: Check parent post integrity.
        if (!$comment->post || $comment->post->trashed()) {
            return response()->json([
                'success' => false,
                'message' => 'No se puede restaurar el comentario porque el post padre está eliminado.'
            ], 422);
        }

        // Validation: Check if author is banned (warning, not blocking).
        $authorWarning = null;
        if ($comment->user && $comment->user->isBanned()) {
            $banStatus = $comment->user->getBanStatus();
            $authorWarning = "Advertencia: El autor de este comentario está actualmente baneado. Motivo: {$banStatus['reason']}";
        }

        // Restore the comment
        $comment->restore();

        // Audit: Log restoration action with detailed metadata.
        \App\Models\AdminAuditLog::logAction([
            'action' => 'restore',
            'model_type' => Comment::class,
            'model_id' => $comment->id,
            'severity' => 'medium',
            'description' => "Restored comment #{$comment->id} on post '{$comment->post->title}'",
            'metadata' => [
                'comment_id' => $comment->id,
                'post_id' => $comment->post_id,
                'post_title' => $comment->post->title,
                'comment_author' => $comment->user ? $comment->user->name : $comment->author_name,
                'comment_author_id' => $comment->user_id,
                'deleted_at' => $comment->deleted_at,
                'restored_by' => auth()->user()->name,
                'restored_by_id' => auth()->id(),
                'author_banned' => $comment->user ? $comment->user->isBanned() : false,
            ]
        ]);

        // Notification: Create admin notification.
        \App\Models\AdminNotification::createSystem([
            'type' => 'success',
            'title' => 'Comentario Restaurado',
            'message' => auth()->user()->name . ' restauró un comentario en el post: ' . $comment->post->title,
            'data' => [
                'comment_id' => $comment->id,
                'post_id' => $comment->post_id,
                'restored_by' => auth()->user()->name,
            ],
            'action_url' => route('admin.comments.show', $comment->id),
            'action_text' => 'Ver Comentario',
            'priority' => 'medium',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Comentario restaurado exitosamente.',
            'warning' => $authorWarning,
            'comment' => [
                'id' => $comment->id,
                'body' => $comment->body,
                'author_name' => $comment->user ? $comment->user->name : $comment->author_name,
                'post_title' => $comment->post->title,
                'restored_at' => now()->toISOString(),
            ]
        ]);
    }
}
