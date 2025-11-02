<?php

namespace App\Services;

use App\Models\User;
use App\Models\Comment;
use Illuminate\Support\Facades\Log;

/**
 * User Comment Service
 * 
 * Handles all business logic related to user comments including retrieval,
 * status updates, deletion, and bulk operations.
 * 
 * @package App\Services
 */
class UserCommentService
{
    /**
     * Get paginated comments for a user with optional filters.
     * 
     * Supports search, status filtering, date range filtering, and sorting.
     *
     * @param User $user The user whose comments to retrieve.
     * @param array<string, mixed> $filters Filter parameters including search, status, dates, sort.
     * @param int $perPage Number of items per page.
     * @return \Illuminate\Contracts\Pagination\LengthAwarePaginator Paginated comments collection.
     * 
     * @example
     * $service = new UserCommentService();
     * $comments = $service->getUserComments($user, [
     *     'search' => 'keyword',
     *     'status' => 'approved',
     *     'per_page' => 15
     * ], 15);
     */
    public function getUserComments(User $user, array $filters = [], int $perPage = 10)
    {
        $query = $user->comments()->with(['post:id,title,slug']);

        // Apply search filter
        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('body', 'like', "%{$search}%")
                  ->orWhereHas('post', function ($postQuery) use ($search) {
                      $postQuery->where('title', 'like', "%{$search}%");
                  });
            });
        }

        // Apply status filter
        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        // Apply date range filters
        if (!empty($filters['date_from'])) {
            $query->whereDate('created_at', '>=', $filters['date_from']);
        }

        if (!empty($filters['date_to'])) {
            $query->whereDate('created_at', '<=', $filters['date_to']);
        }

        // Apply sorting
        $sortField = $filters['sort'] ?? 'created_at';
        $sortDirection = $filters['direction'] ?? 'desc';
        $allowedSorts = ['created_at', 'status', 'body'];

        if (in_array($sortField, $allowedSorts)) {
            $query->orderBy($sortField, $sortDirection);
        }

        // Validate and apply pagination
        $perPage = in_array($perPage, [5, 10, 15, 25]) ? $perPage : 10;

        return $query->paginate($perPage)->withQueryString();
    }

    /**
     * Transform comment collection for API response.
     * 
     * Maps comment data to a standardized format for frontend consumption.
     *
     * @param \Illuminate\Contracts\Pagination\LengthAwarePaginator $comments Paginated comments.
     * @return \Illuminate\Contracts\Pagination\LengthAwarePaginator Transformed comments.
     */
    public function transformCommentsForResponse($comments)
    {
        $comments->getCollection()->transform(function ($comment) {
            return [
                'id' => $comment->id,
                'body' => $comment->body,
                'status' => $comment->status,
                'created_at' => $comment->created_at,
                'updated_at' => $comment->updated_at,
                'post' => $comment->post ? [
                    'id' => $comment->post->id,
                    'title' => $comment->post->title,
                    'slug' => $comment->post->slug,
                ] : null,
                'author_name' => $comment->author_name,
                'author_email' => $comment->author_email,
                'is_guest' => $comment->isGuest(),
                'reports_count' => $comment->reports()->count(),
                'interactions_count' => $comment->interactions()->count(),
            ];
        });

        return $comments;
    }

    /**
     * Update the status of a specific comment.
     * 
     * Changes the moderation status of a comment and logs the action.
     *
     * @param User $user The comment author.
     * @param int $commentId The comment ID to update.
     * @param string $status New status (approved, pending, rejected, spam).
     * @param User $admin The administrator performing the update.
     * @return Comment The updated comment.
     * 
     * @throws \Illuminate\Database\Eloquent\ModelNotFoundException If comment not found.
     * 
     * @example
     * $service = new UserCommentService();
     * $comment = $service->updateCommentStatus($user, 123, 'approved', $admin);
     */
    public function updateCommentStatus(User $user, int $commentId, string $status, User $admin): Comment
    {
        $comment = $user->comments()->findOrFail($commentId);
        $oldStatus = $comment->status;
        
        $comment->update(['status' => $status]);

        Log::info('Comment status updated from user management', [
            'comment_id' => $comment->id,
            'user_id' => $user->id,
            'old_status' => $oldStatus,
            'new_status' => $status,
            'updated_by' => $admin->id,
        ]);

        return $comment;
    }

    /**
     * Delete a specific comment and its replies.
     * 
     * Removes the comment and all nested replies, with comprehensive logging.
     *
     * @param User $user The comment author.
     * @param int $commentId The comment ID to delete.
     * @param User $admin The administrator performing the deletion.
     * @return bool True if deletion was successful.
     * 
     * @throws \Exception If comment doesn't belong to user or deletion fails.
     * 
     * @example
     * $service = new UserCommentService();
     * $success = $service->deleteComment($user, 123, $admin);
     */
    public function deleteComment(User $user, int $commentId, User $admin): bool
    {
        Log::info('Attempting to delete comment', [
            'comment_id' => $commentId,
            'user_id' => $user->id,
            'admin_id' => $admin->id,
        ]);

        $comment = $user->comments()->findOrFail($commentId);

        // Verify ownership
        if ($comment->user_id !== $user->id) {
            Log::warning('Attempt to delete comment that does not belong to user', [
                'comment_id' => $commentId,
                'comment_user_id' => $comment->user_id,
                'expected_user_id' => $user->id,
                'admin_id' => $admin->id,
            ]);
            throw new \Exception('This comment does not belong to the specified user.');
        }

        // Delete replies first
        if ($comment->replies()->exists()) {
            $repliesCount = $comment->replies()->count();
            $comment->replies()->delete();
            
            Log::info('Deleted comment replies', [
                'comment_id' => $commentId,
                'replies_deleted' => $repliesCount,
            ]);
        }

        $comment->delete();

        Log::info('Comment deleted successfully from user management', [
            'comment_id' => $commentId,
            'user_id' => $user->id,
            'user_name' => $user->name,
            'deleted_by' => $admin->id,
            'admin_name' => $admin->name,
        ]);

        return true;
    }

    /**
     * Execute bulk moderation actions on user comments.
     * 
     * Supports approve, reject, mark_spam, and delete actions on multiple comments.
     *
     * @param User $user The comment author.
     * @param string $action The action to perform (approve, reject, mark_spam, delete).
     * @param array<int> $commentIds Array of comment IDs to process.
     * @param User $admin The administrator performing the action.
     * @return int Number of comments processed.
     * 
     * @example
     * $service = new UserCommentService();
     * $count = $service->bulkCommentActions($user, 'approve', [1, 2, 3], $admin);
     */
    public function bulkCommentActions(User $user, string $action, array $commentIds, User $admin): int
    {
        $comments = $user->comments()->whereIn('id', $commentIds)->get();
        $processedCount = 0;

        foreach ($comments as $comment) {
            switch ($action) {
                case 'approve':
                    $comment->update(['status' => 'approved']);
                    $processedCount++;
                    break;
                    
                case 'reject':
                    $comment->update(['status' => 'rejected']);
                    $processedCount++;
                    break;
                    
                case 'mark_spam':
                    $comment->update(['status' => 'spam']);
                    $processedCount++;
                    break;
                    
                case 'delete':
                    $comment->replies()->delete();
                    $comment->delete();
                    $processedCount++;
                    break;
            }
        }

        Log::info('Bulk comment action performed from user management', [
            'action' => $action,
            'user_id' => $user->id,
            'comment_ids' => $commentIds,
            'processed_count' => $processedCount,
            'performed_by' => $admin->id,
        ]);

        return $processedCount;
    }
}

