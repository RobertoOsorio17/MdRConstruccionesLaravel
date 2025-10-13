<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Comment;
use App\Models\Post;
use Illuminate\Http\Request;
use Inertia\Inertia;

/**
 * Moderates reader conversations by enabling administrators to review, update, and triage comment submissions.
 * Provides filtered listings and bulk actions that keep community discussions healthy and compliant.
 */
class CommentController extends Controller
{
    /**
     * Display a listing of comments.
     */
    public function index(Request $request)
    {
        // ✅ Authorize action
        $this->authorize('viewAny', Comment::class);

        $query = Comment::with(['post:id,title,slug', 'user:id,name', 'parent:id']);

        // Filter by moderation status when provided.
        if ($request->has('status') && !empty($request->status)) {
            $query->where('status', $request->status);
        }

        // Filter comments by the related post identifier.
        if ($request->has('post') && !empty($request->post)) {
            $query->where('post_id', $request->post);
        }

        // Apply keyword search across body and author information.
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

        // Retrieve posts to populate the filter dropdown.
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
        // ✅ Authorize action
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
     */
    public function update(Request $request, Comment $comment)
    {
        // ✅ Authorize action
        $this->authorize('update', $comment);

        $validated = $request->validate([
            'status' => 'required|in:pending,approved,spam',
            'body' => 'sometimes|required|string',
        ]);

        $comment->update($validated);

        return response()->json([
            'success' => true,
            'status' => $comment->status,
            'message' => 'Comment updated successfully.'
        ]);
    }

    /**
     * Remove the specified comment.
     */
    public function destroy(Comment $comment)
    {
        // ✅ Authorize action
        $this->authorize('delete', $comment);

        // Delete all replies first to avoid orphaned records.
        $comment->replies()->delete();

        $comment->delete();

        return response()->json([
            'success' => true,
            'message' => 'Comment deleted successfully.'
        ]);
    }

    /**
     * Approve a comment through the moderation endpoint.
     */
    public function approve(Comment $comment)
    {
        // ✅ Authorize action
        $this->authorize('moderate', $comment);

        $comment->update(['status' => 'approved']);

        return response()->json([
            'success' => true,
            'status' => 'approved',
            'message' => 'Comment approved.'
        ]);
    }

    /**
     * Mark a comment as spam for moderation purposes.
     */
    public function markAsSpam(Comment $comment)
    {
        // ✅ Authorize action
        $this->authorize('moderate', $comment);

        $comment->update(['status' => 'spam']);

        return response()->json([
            'success' => true,
            'status' => 'spam',
            'message' => 'Comment marked as spam.'
        ]);
    }

    /**
     * Approve multiple comments in a single request.
     */
    public function bulkApprove(Request $request)
    {
        // ✅ Authorize bulk action capability
        $this->authorize('moderate', Comment::class);

        $validated = $request->validate([
            'comment_ids' => 'required|array|max:100', // ✅ Limit to 100
            'comment_ids.*' => 'exists:comments,id',
        ]);

        // ✅ Verify authorization for each comment
        $comments = Comment::whereIn('id', $validated['comment_ids'])->get();
        foreach ($comments as $comment) {
            $this->authorize('moderate', $comment);
        }

        $count = Comment::whereIn('id', $validated['comment_ids'])
            ->update(['status' => 'approved']);

        return response()->json([
            'success' => true,
            'approved_count' => $count,
            'message' => "{$count} comment(s) approved successfully."
        ]);
    }

    /**
     * Delete multiple comments and their replies in bulk.
     */
    public function bulkDelete(Request $request)
    {
        // ✅ Authorize bulk action capability
        $this->authorize('moderate', Comment::class);

        $validated = $request->validate([
            'comment_ids' => 'required|array|max:100', // ✅ Limit to 100
            'comment_ids.*' => 'exists:comments,id',
        ]);

        // ✅ Verify authorization for each comment
        $comments = Comment::whereIn('id', $validated['comment_ids'])->get();
        foreach ($comments as $comment) {
            $this->authorize('delete', $comment);
        }

        $count = Comment::whereIn('id', $validated['comment_ids'])->count();
        Comment::whereIn('id', $validated['comment_ids'])->delete();

        return response()->json([
            'success' => true,
            'deleted_count' => $count,
            'message' => "{$count} comment(s) deleted successfully."
        ]);
    }

    /**
     * Flag multiple comments as spam in one operation.
     */
    public function bulkMarkAsSpam(Request $request)
    {
        // ✅ Authorize bulk action capability
        $this->authorize('moderate', Comment::class);

        $validated = $request->validate([
            'comment_ids' => 'required|array|max:100', // ✅ Limit to 100
            'comment_ids.*' => 'exists:comments,id',
        ]);

        // ✅ Verify authorization for each comment
        $comments = Comment::whereIn('id', $validated['comment_ids'])->get();
        foreach ($comments as $comment) {
            $this->authorize('moderate', $comment);
        }

        $count = Comment::whereIn('id', $validated['comment_ids'])
            ->update(['status' => 'spam']);

        return response()->json([
            'success' => true,
            'spam_count' => $count,
            'message' => "{$count} comment(s) flagged as spam."
        ]);
    }
}
