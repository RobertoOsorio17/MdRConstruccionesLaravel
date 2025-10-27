<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;
use App\Models\Comment;
use App\Models\CommentReport;
use App\Models\User;

/**
 * Handles advanced moderation workflows for comments by integrating reports, escalations, and resolution tracking into one surface.
 * Equips administrators with targeted filters and batch tools to enforce community guidelines effectively.
 */
class CommentManagementController extends Controller
{
    /**
     * Display a listing of comments.
     */
    public function index(Request $request)
    {
        // Include soft-deleted comments if filter is set to 'deleted'.
        $query = Comment::with(['user', 'post:id,title,slug', 'parent:id,body,author_name', 'replies'])
                        ->withCount(['reports', 'interactions']);

        // Filter by deletion status.
        if ($request->has('deleted_status')) {
            if ($request->deleted_status === 'deleted') {
                $query->onlyTrashed();
            } elseif ($request->deleted_status === 'active') {
                // Default: only non-deleted
            } elseif ($request->deleted_status === 'all') {
                $query->withTrashed();
            }
        }

        // Apply status-based filtering.
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Restrict results to a specific post when requested.
        if ($request->has('post_id') && $request->post_id !== '') {
            $query->where('post_id', $request->post_id);
        }

        // Filter by reporter type (registered user vs. guest).
        if ($request->has('user_type')) {
            if ($request->user_type === 'registered') {
                $query->whereNotNull('user_id');
            } elseif ($request->user_type === 'guest') {
                $query->whereNull('user_id');
            }
        }

        // Filter by creation date range.
        if ($request->has('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }
        if ($request->has('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }
        
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('body', 'like', "%{$search}%")
                  ->orWhere('author_name', 'like', "%{$search}%")
                  ->orWhere('author_email', 'like', "%{$search}%")
                  ->orWhereHas('user', function($q) use ($search) {
                      $q->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                  })
                  ->orWhereHas('post', function($q) use ($search) {
                      $q->where('title', 'like', "%{$search}%");
                  });
            });
        }
        
        // Sorting configuration with full validation.
        $sortBy = $request->get('sort_by', 'created_at');
        $sortDirection = $request->get('sort_direction', 'desc');

        // Security: Validate both sort field and direction.
        $allowedSortFields = ['created_at', 'status', 'reports_count', 'interactions_count'];
        $allowedDirections = ['asc', 'desc'];

        if (!in_array($sortBy, $allowedSortFields)) {
            $sortBy = 'created_at';
        }

        if (!in_array(strtolower($sortDirection), $allowedDirections)) {
            $sortDirection = 'desc';
        }

        $query->orderBy($sortBy, $sortDirection);
        
        $comments = $query->paginate(20);
        
        // Retrieve posts with comments for the filter dropdown.
        $posts = \App\Models\Post::select('id', 'title', 'slug')
                                  ->withCount('comments')
                                  ->having('comments_count', '>', 0)
                                  ->orderBy('title')
                                  ->get();

        // Compile high-level comment statistics.
        $stats = [
            'total' => Comment::count(),
            'pending' => Comment::where('status', 'pending')->count(),
            'approved' => Comment::where('status', 'approved')->count(),
            'rejected' => Comment::where('status', 'rejected')->count(),
            'spam' => Comment::where('status', 'spam')->count(),
            'guest_comments' => Comment::whereNull('user_id')->count(),
            'reported_comments' => Comment::has('reports')->count(),
            'deleted' => Comment::onlyTrashed()->count(),
        ];

        return inertia('Admin/Comments/Index', [
            'comments' => $comments,
            'posts' => $posts,
            'stats' => $stats,
            'filters' => $request->only(['status', 'search', 'post_id', 'user_type', 'date_from', 'date_to', 'sort_by', 'sort_direction', 'deleted_status'])
        ]);
    }
    
    /**
     * Display a listing of reports.
     *
     * Enhanced with additional filters:
     * - Category filtering
     * - Priority filtering
     * - Date range filtering
     * - Reporter type filtering (user vs guest)
     * - Cached statistics
     */
    public function reports(Request $request)
    {
        $query = CommentReport::with(['user', 'comment.user', 'comment.post']);

        // Filter: Status filter.
        if ($request->has('status') && $request->status !== '') {
            $query->where('status', $request->status);
        }

        // Filter: Category filter.
        if ($request->has('category') && $request->category !== '') {
            $query->where('category', $request->category);
        }

        // Filter: Priority filter (only if column exists).
        if ($request->has('priority') && $request->priority !== '') {
            try {
                $query->where('priority', $request->priority);
            } catch (\Exception $e) {
                // Ignore if priority column doesn't exist yet
            }
        }

        // Filter: Reporter type filter (user vs guest).
        if ($request->has('reporter_type')) {
            if ($request->reporter_type === 'user') {
                $query->where('is_guest_report', false);
            } elseif ($request->reporter_type === 'guest') {
                $query->where('is_guest_report', true);
            }
        }

        // Filter: Date range filter.
        if ($request->has('date_from') && $request->date_from !== '') {
            $query->whereDate('created_at', '>=', $request->date_from);
        }
        if ($request->has('date_to') && $request->date_to !== '') {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        // Filter: Search filter.
        if ($request->has('search') && $request->search !== '') {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('reason', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%")
                  ->orWhereHas('user', function($q) use ($search) {
                      $q->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                  })
                  ->orWhereHas('comment', function($q) use ($search) {
                      $q->where('body', 'like', "%{$search}%");
                  })
                  ->orWhereHas('comment.post', function($q) use ($search) {
                      $q->where('title', 'like', "%{$search}%");
                  });
            });
        }

        // Sorting: Configuration for reports with validation.
        $sortBy = $request->get('sort_by', 'created_at');
        $sortDirection = $request->get('sort_direction', 'desc');

        // Security: Validate both sort field and direction.
        $allowedSortFields = ['created_at', 'status', 'category', 'priority'];
        $allowedDirections = ['asc', 'desc'];

        if (!in_array($sortBy, $allowedSortFields)) {
            $sortBy = 'created_at';
        }

        if (!in_array(strtolower($sortDirection), $allowedDirections)) {
            $sortDirection = 'desc';
        }

        // Optimization: Sort by priority first for pending reports, then by created_at.
        // Only if priority column exists
        if ($request->get('status') === 'pending') {
            try {
                // Try to order by priority if column exists
                $query->orderBy('priority', 'desc')->orderBy('created_at', 'desc');
            } catch (\Exception $e) {
                // Fallback to created_at only if priority column doesn't exist
                $query->orderBy('created_at', 'desc');
            }
        } else {
            $query->orderBy($sortBy, $sortDirection);
        }

        $reports = $query->paginate(20);

        // Optimization: Get cached statistics.
        $stats = $this->getCachedReportStats();

        return inertia('Admin/Comments/Reports', [
            'reports' => $reports,
            'stats' => $stats,
            'filters' => $request->only([
                'status',
                'category',
                'priority',
                'reporter_type',
                'date_from',
                'date_to',
                'search',
                'sort_by',
                'sort_direction'
            ])
        ]);
    }

    /**
     * Get cached report statistics.
     *
     * @return array
     */
    private function getCachedReportStats(): array
    {
        return Cache::remember('comment_reports_stats', 300, function () {
            $stats = [
                'total' => CommentReport::count(),
                'pending' => CommentReport::where('status', 'pending')->count(),
                'resolved' => CommentReport::where('status', 'resolved')->count(),
                'dismissed' => CommentReport::where('status', 'dismissed')->count(),
                'by_category' => [
                    'spam' => CommentReport::where('category', 'spam')->count(),
                    'harassment' => CommentReport::where('category', 'harassment')->count(),
                    'hate_speech' => CommentReport::where('category', 'hate_speech')->count(),
                    'inappropriate' => CommentReport::where('category', 'inappropriate')->count(),
                    'misinformation' => CommentReport::where('category', 'misinformation')->count(),
                    'off_topic' => CommentReport::where('category', 'off_topic')->count(),
                    'other' => CommentReport::where('category', 'other')->count(),
                ],
                'by_reporter_type' => [
                    'user' => CommentReport::where('is_guest_report', false)->count(),
                    'guest' => CommentReport::where('is_guest_report', true)->count(),
                ]
            ];

            // ✅ COMPATIBILITY: Only query priority if column exists
            try {
                $stats['high_priority'] = CommentReport::where('priority', 'high')
                    ->where('status', 'pending')
                    ->count();
            } catch (\Exception $e) {
                // Column doesn't exist yet, set to 0
                $stats['high_priority'] = 0;
            }

            return $stats;
        });
    }
    
    /**
     * Update the status of a comment.
     */
    public function updateStatus(Request $request, Comment $comment): JsonResponse
    {
        // Security: Authorize action.
        $this->authorize('moderate', $comment);

        $request->validate([
            'status' => 'required|in:approved,pending,rejected'
        ]);

        $comment->update(['status' => $request->status]);

        return response()->json([
            'success' => true,
            'message' => 'Comment status updated successfully.'
        ]);
    }

    /**
     * Resolve a comment report.
     *
     * Enhanced with:
     * - Input sanitization
     * - Audit logging
     * - Cache invalidation
     */
    public function resolveReport(Request $request, CommentReport $report): JsonResponse
    {
        // ✅ FIXED IDOR: Authorize action (only admins/moderators can resolve reports)
        $this->authorize('moderate', Comment::class);

        // Security: Validate and sanitize inputs.
        $validated = $request->validate([
            'status' => 'required|in:resolved,dismissed',
            'notes' => 'nullable|string|max:500'
        ]);

        // Security: Sanitize notes to prevent XSS.
        $sanitizedNotes = $validated['notes'] ? strip_tags($validated['notes']) : null;

        $oldStatus = $report->status;

        $report->update([
            'status' => $validated['status'],
            'notes' => $sanitizedNotes
        ]);

        // Audit: Log report resolution.
        \App\Models\AdminAuditLog::logAction([
            'action' => 'resolve_report',
            'model_type' => CommentReport::class,
            'model_id' => $report->id,
            'severity' => 'medium',
            'description' => auth()->user()->name . " {$validated['status']} comment report #{$report->id}",
            'old_values' => ['status' => $oldStatus],
            'new_values' => ['status' => $validated['status'], 'notes' => $sanitizedNotes],
            'metadata' => [
                'report_id' => $report->id,
                'comment_id' => $report->comment_id,
                'category' => $report->category,
                'priority' => $report->priority,
                'old_status' => $oldStatus,
                'new_status' => $validated['status']
            ]
        ]);

        // Optimization: Invalidate reports cache.
        Cache::forget('comment_reports_stats');

        return response()->json([
            'success' => true,
            'message' => $validated['status'] === 'resolved'
                ? 'Reporte resuelto exitosamente.'
                : 'Reporte desestimado exitosamente.'
        ]);
    }

    /**
     * Delete a comment.
     *
     * Uses soft delete to preserve conversation structure.
     */
    public function destroy(Comment $comment): JsonResponse
    {
        // Security: Authorize action.
        $this->authorize('delete', $comment);

        // Use soft delete
        $comment->delete();

        return response()->json([
            'success' => true,
            'message' => 'Comentario eliminado exitosamente.'
        ]);
    }
    
    /**
     * Get comment statistics.
     */
    public function statistics()
    {
        $totalComments = Comment::count();
        $approvedComments = Comment::where('status', 'approved')->count();
        $pendingComments = Comment::where('status', 'pending')->count();
        $rejectedComments = Comment::where('status', 'rejected')->count();
        
        $totalReports = CommentReport::count();
        $pendingReports = CommentReport::where('status', 'pending')->count();
        $resolvedReports = CommentReport::where('status', 'resolved')->count();
        $dismissedReports = CommentReport::where('status', 'dismissed')->count();
        
        $topReportedComments = Comment::withCount('reports')
            ->having('reports_count', '>', 0)
            ->orderByDesc('reports_count')
            ->limit(5)
            ->get();
            
        return response()->json([
            'comments' => [
                'total' => $totalComments,
                'approved' => $approvedComments,
                'pending' => $pendingComments,
                'rejected' => $rejectedComments
            ],
            'reports' => [
                'total' => $totalReports,
                'pending' => $pendingReports,
                'resolved' => $resolvedReports,
                'dismissed' => $dismissedReports
            ],
            'top_reported_comments' => $topReportedComments
        ]);
    }
    
    /**
     * Bulk approve comments
     */
    public function bulkApprove(Request $request): JsonResponse
    {
        // Security: Authorize bulk action capability.
        $this->authorize('moderate', Comment::class);

        $request->validate([
            'comment_ids' => 'required|array|max:100', // Limit to 100.
            'comment_ids.*' => 'exists:comments,id',
        ]);

        // Verify authorization for each comment.
        $comments = Comment::whereIn('id', $request->comment_ids)->get();
        foreach ($comments as $comment) {
            $this->authorize('moderate', $comment);
        }

        $count = Comment::whereIn('id', $request->comment_ids)
                       ->update(['status' => 'approved']);

        return response()->json([
            'success' => true,
            'approved_count' => $count,
            'message' => "{$count} comment(s) approved successfully."
        ]);
    }

    /**
     * Bulk reject comments
     */
    public function bulkReject(Request $request): JsonResponse
    {
        // Security: Authorize bulk action capability.
        $this->authorize('moderate', Comment::class);

        $request->validate([
            'comment_ids' => 'required|array|max:100', // Limit to 100.
            'comment_ids.*' => 'exists:comments,id',
        ]);

        // Verify authorization for each comment.
        $comments = Comment::whereIn('id', $request->comment_ids)->get();
        foreach ($comments as $comment) {
            $this->authorize('moderate', $comment);
        }

        $count = Comment::whereIn('id', $request->comment_ids)
                       ->update(['status' => 'rejected']);

        return response()->json([
            'success' => true,
            'rejected_count' => $count,
            'message' => "{$count} comment(s) rejected successfully."
        ]);
    }

    /**
     * Bulk delete comments
     *
     * Uses soft delete to preserve conversation structure.
     */
    public function bulkDelete(Request $request): JsonResponse
    {
        // Security: Authorize bulk action capability.
        $this->authorize('delete', Comment::class);

        $request->validate([
            'comment_ids' => 'required|array|max:100', // Limit to 100.
            'comment_ids.*' => 'exists:comments,id',
        ]);

        // Verify authorization for each comment.
        $comments = Comment::whereIn('id', $request->comment_ids)->get();
        foreach ($comments as $comment) {
            $this->authorize('delete', $comment);
        }

        $count = $comments->count();

        // Use soft delete to preserve conversation structure
        // Each comment is soft-deleted individually to trigger model events
        foreach ($comments as $comment) {
            $comment->delete();
        }

        return response()->json([
            'success' => true,
            'deleted_count' => $count,
            'message' => "{$count} comentario(s) eliminado(s) exitosamente."
        ]);
    }

    /**
     * Mark comment as spam
     */
    public function markAsSpam(Comment $comment): JsonResponse
    {
        // ✅ FIXED IDOR: Authorize action
        $this->authorize('moderate', $comment);

        $comment->update(['status' => 'spam']);

        return response()->json([
            'success' => true,
            'message' => 'Comment flagged as spam successfully.'
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
     * @param int $id The comment ID to restore
     * @return \Illuminate\Http\JsonResponse
     */
    public function restore($id): JsonResponse
    {
        // Find comment including soft-deleted ones
        $comment = Comment::withTrashed()->findOrFail($id);

        // ✅ SECURITY: Authorize restore action
        $this->authorize('restore', $comment);

        // ✅ VALIDATION: Verify comment is actually deleted
        if (!$comment->trashed()) {
            return response()->json([
                'success' => false,
                'message' => 'El comentario no está eliminado y no puede ser restaurado.'
            ], 400);
        }

        // ✅ VALIDATION: Check parent post integrity
        if ($comment->post->trashed()) {
            return response()->json([
                'success' => false,
                'message' => 'No se puede restaurar el comentario porque el post padre está eliminado.'
            ], 422);
        }

        // ✅ VALIDATION: Check if author is banned (warning, not blocking)
        $authorWarning = null;
        if ($comment->user && $comment->user->isBanned()) {
            $banStatus = $comment->user->getBanStatus();
            $authorWarning = "Advertencia: El autor de este comentario está actualmente baneado. Motivo: {$banStatus['reason']}";
        }

        // Restore the comment
        $comment->restore();

        // ✅ AUDIT: Log restoration action with detailed metadata
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
    
    /**
     * Get pending comments for quick moderation
     */
    public function getPendingComments(Request $request): JsonResponse
    {
        $comments = Comment::with(['user:id,name', 'post:id,title,slug'])
                          ->where('status', 'pending')
                          ->orderBy('created_at', 'desc')
                          ->limit($request->get('limit', 10))
                          ->get();
        
        return response()->json([
            'success' => true,
            'comments' => $comments
        ]);
    }

    /**
     * Export comments to Excel/CSV using Laravel Excel.
     */
    public function export(Request $request)
    {
        $filters = [
            'search' => $request->get('search'),
            'status' => $request->get('status'),
            'post_id' => $request->get('post_id'),
        ];

        $format = $request->get('format', 'xlsx'); // xlsx, csv
        $filename = 'comentarios_' . now()->format('Y-m-d_H-i-s');

        try {
            return \Maatwebsite\Excel\Facades\Excel::download(
                new \App\Exports\CommentsExport($filters),
                $filename . '.' . $format
            );
        } catch (\Exception $e) {
            \Log::error('Comment export failed', [
                'user_id' => auth()->id(),
                'error' => $e->getMessage(),
            ]);

            return back()->with('error', 'Error al exportar comentarios: ' . $e->getMessage());
        }
    }
}
