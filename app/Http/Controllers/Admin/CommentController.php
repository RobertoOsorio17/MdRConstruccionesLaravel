<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Comment;
use App\Models\Post;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CommentController extends Controller
{
    /**
     * Display a listing of comments.
     */
    public function index(Request $request)
    {
        $query = Comment::with(['post:id,title,slug', 'user:id,name', 'parent:id']);

        // Filter by status
        if ($request->has('status') && !empty($request->status)) {
            $query->where('status', $request->status);
        }

        // Filter by post
        if ($request->has('post') && !empty($request->post)) {
            $query->where('post_id', $request->post);
        }

        // Search functionality
        if ($request->has('search') && !empty($request->search)) {
            $query->where(function ($q) use ($request) {
                $q->where('body', 'like', '%' . $request->search . '%')
                  ->orWhere('author_name', 'like', '%' . $request->search . '%')
                  ->orWhere('author_email', 'like', '%' . $request->search . '%');
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
                    'created_at' => $comment->created_at->format('d/m/Y H:i'),
                    'updated_at' => $comment->updated_at->format('d/m/Y H:i'),
                ];
            });

        // Get posts for filter
        $posts = Post::select('id', 'title')->orderBy('title')->get();

        return Inertia::render('Admin/Comments/Index', [
            'comments' => $comments,
            'posts' => $posts,
            'filters' => [
                'search' => $request->search,
                'status' => $request->status,
                'post' => $request->post,
            ],
            'stats' => [
                'total' => Comment::count(),
                'pending' => Comment::where('status', 'pending')->count(),
                'approved' => Comment::where('status', 'approved')->count(),
                'spam' => Comment::where('status', 'spam')->count(),
            ]
        ]);
    }

    /**
     * Display the specified comment.
     */
    public function show(Comment $comment)
    {
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
     */
    public function update(Request $request, Comment $comment)
    {
        $validated = $request->validate([
            'status' => 'required|in:pending,approved,spam',
            'body' => 'sometimes|required|string',
        ]);

        $comment->update($validated);

        return response()->json([
            'success' => true,
            'status' => $comment->status,
            'message' => 'Comentario actualizado exitosamente'
        ]);
    }

    /**
     * Remove the specified comment.
     */
    public function destroy(Comment $comment)
    {
        // Delete all replies first
        $comment->replies()->delete();
        
        $comment->delete();

        return response()->json([
            'success' => true,
            'message' => 'Comentario eliminado exitosamente'
        ]);
    }

    /**
     * Approve comment
     */
    public function approve(Comment $comment)
    {
        $comment->update(['status' => 'approved']);

        return response()->json([
            'success' => true,
            'status' => 'approved',
            'message' => 'Comentario aprobado'
        ]);
    }

    /**
     * Mark comment as spam
     */
    public function markAsSpam(Comment $comment)
    {
        $comment->update(['status' => 'spam']);

        return response()->json([
            'success' => true,
            'status' => 'spam',
            'message' => 'Comentario marcado como spam'
        ]);
    }

    /**
     * Bulk approve comments
     */
    public function bulkApprove(Request $request)
    {
        $validated = $request->validate([
            'comment_ids' => 'required|array',
            'comment_ids.*' => 'exists:comments,id',
        ]);

        $count = Comment::whereIn('id', $validated['comment_ids'])
            ->update(['status' => 'approved']);

        return response()->json([
            'success' => true,
            'approved_count' => $count,
            'message' => "Se aprobaron {$count} comentarios"
        ]);
    }

    /**
     * Bulk delete comments
     */
    public function bulkDelete(Request $request)
    {
        $validated = $request->validate([
            'comment_ids' => 'required|array',
            'comment_ids.*' => 'exists:comments,id',
        ]);

        $count = Comment::whereIn('id', $validated['comment_ids'])->count();
        Comment::whereIn('id', $validated['comment_ids'])->delete();

        return response()->json([
            'success' => true,
            'deleted_count' => $count,
            'message' => "Se eliminaron {$count} comentarios"
        ]);
    }

    /**
     * Bulk mark as spam
     */
    public function bulkMarkAsSpam(Request $request)
    {
        $validated = $request->validate([
            'comment_ids' => 'required|array',
            'comment_ids.*' => 'exists:comments,id',
        ]);

        $count = Comment::whereIn('id', $validated['comment_ids'])
            ->update(['status' => 'spam']);

        return response()->json([
            'success' => true,
            'spam_count' => $count,
            'message' => "Se marcaron {$count} comentarios como spam"
        ]);
    }
}