<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Models\Comment;
use App\Models\CommentReport;
use App\Models\User;

class CommentManagementController extends Controller
{
    /**
     * Display a listing of comments.
     */
    public function index(Request $request)
    {
        $query = Comment::with(['user', 'post:id,title,slug', 'parent:id,body,author_name', 'replies'])
                        ->withCount(['reports', 'interactions']);
        
        // Filtros
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }
        
        // Nuevo filtro por post
        if ($request->has('post_id') && $request->post_id !== '') {
            $query->where('post_id', $request->post_id);
        }
        
        // Filtro por tipo de usuario (registrado vs invitado)
        if ($request->has('user_type')) {
            if ($request->user_type === 'registered') {
                $query->whereNotNull('user_id');
            } elseif ($request->user_type === 'guest') {
                $query->whereNull('user_id');
            }
        }
        
        // Filtro por fecha
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
        
        // Ordenamiento
        $sortBy = $request->get('sort_by', 'created_at');
        $sortDirection = $request->get('sort_direction', 'desc');
        
        // Validar campos de ordenamiento
        $allowedSortFields = ['created_at', 'status', 'reports_count', 'interactions_count'];
        if (!in_array($sortBy, $allowedSortFields)) {
            $sortBy = 'created_at';
        }
        
        if ($sortBy === 'reports_count' || $sortBy === 'interactions_count') {
            $query->orderBy($sortBy, $sortDirection);
        } else {
            $query->orderBy($sortBy, $sortDirection);
        }
        
        $comments = $query->paginate(20);
        
        // Obtener lista de posts para el filtro
        $posts = \App\Models\Post::select('id', 'title', 'slug')
                                  ->withCount('comments')
                                  ->having('comments_count', '>', 0)
                                  ->orderBy('title')
                                  ->get();
        
        // Estadísticas de comentarios
        $stats = [
            'total' => Comment::count(),
            'pending' => Comment::where('status', 'pending')->count(),
            'approved' => Comment::where('status', 'approved')->count(),
            'rejected' => Comment::where('status', 'rejected')->count(),
            'spam' => Comment::where('status', 'spam')->count(),
            'guest_comments' => Comment::whereNull('user_id')->count(),
            'reported_comments' => Comment::has('reports')->count(),
        ];
        
        return inertia('Admin/Comments/Index', [
            'comments' => $comments,
            'posts' => $posts,
            'stats' => $stats,
            'filters' => $request->only(['status', 'search', 'post_id', 'user_type', 'date_from', 'date_to', 'sort_by', 'sort_direction'])
        ]);
    }
    
    /**
     * Display a listing of reports.
     */
    public function reports(Request $request)
    {
        $query = CommentReport::with(['user', 'comment.user', 'comment.post']);
        
        // Filtros
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }
        
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('reason', 'like', "%{$search}%")
                  ->orWhereHas('user', function($q) use ($search) {
                      $q->where('name', 'like', "%{$search}%");
                  })
                  ->orWhereHas('comment', function($q) use ($search) {
                      $q->where('body', 'like', "%{$search}%");
                  });
            });
        }
        
        // Ordenamiento
        $sortBy = $request->get('sort_by', 'created_at');
        $sortDirection = $request->get('sort_direction', 'desc');
        $query->orderBy($sortBy, $sortDirection);
        
        $reports = $query->paginate(20);
        
        return inertia('Admin/Comments/Reports', [
            'reports' => $reports,
            'filters' => $request->only(['status', 'search', 'sort_by', 'sort_direction'])
        ]);
    }
    
    /**
     * Update the status of a comment.
     */
    public function updateStatus(Request $request, Comment $comment): JsonResponse
    {
        $request->validate([
            'status' => 'required|in:approved,pending,rejected'
        ]);
        
        $comment->update(['status' => $request->status]);
        
        return response()->json([
            'success' => true,
            'message' => 'Estado del comentario actualizado exitosamente'
        ]);
    }
    
    /**
     * Resolve a comment report.
     */
    public function resolveReport(Request $request, CommentReport $report): JsonResponse
    {
        $request->validate([
            'status' => 'required|in:resolved,dismissed',
            'notes' => 'nullable|string|max:500'
        ]);
        
        $report->update([
            'status' => $request->status,
            'notes' => $request->notes
        ]);
        
        return response()->json([
            'success' => true,
            'message' => 'Reporte actualizado exitosamente'
        ]);
    }
    
    /**
     * Delete a comment.
     */
    public function destroy(Comment $comment): JsonResponse
    {
        $comment->delete();
        
        return response()->json([
            'success' => true,
            'message' => 'Comentario eliminado exitosamente'
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
        $request->validate([
            'comment_ids' => 'required|array',
            'comment_ids.*' => 'exists:comments,id',
        ]);
        
        $count = Comment::whereIn('id', $request->comment_ids)
                       ->update(['status' => 'approved']);
        
        return response()->json([
            'success' => true,
            'approved_count' => $count,
            'message' => "Se aprobaron {$count} comentarios exitosamente"
        ]);
    }
    
    /**
     * Bulk reject comments
     */
    public function bulkReject(Request $request): JsonResponse
    {
        $request->validate([
            'comment_ids' => 'required|array',
            'comment_ids.*' => 'exists:comments,id',
        ]);
        
        $count = Comment::whereIn('id', $request->comment_ids)
                       ->update(['status' => 'rejected']);
        
        return response()->json([
            'success' => true,
            'rejected_count' => $count,
            'message' => "Se rechazaron {$count} comentarios exitosamente"
        ]);
    }
    
    /**
     * Bulk delete comments
     */
    public function bulkDelete(Request $request): JsonResponse
    {
        $request->validate([
            'comment_ids' => 'required|array',
            'comment_ids.*' => 'exists:comments,id',
        ]);
        
        $count = Comment::whereIn('id', $request->comment_ids)->count();
        
        // Delete all replies first
        Comment::whereIn('parent_id', $request->comment_ids)->delete();
        
        // Delete main comments
        Comment::whereIn('id', $request->comment_ids)->delete();
        
        return response()->json([
            'success' => true,
            'deleted_count' => $count,
            'message' => "Se eliminaron {$count} comentarios exitosamente"
        ]);
    }
    
    /**
     * Mark comment as spam
     */
    public function markAsSpam(Comment $comment): JsonResponse
    {
        $comment->update(['status' => 'spam']);
        
        return response()->json([
            'success' => true,
            'message' => 'Comentario marcado como spam exitosamente'
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
}