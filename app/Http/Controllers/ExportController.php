<?php

namespace App\Http\Controllers;

use App\Exports\PostsExport;
use App\Exports\CommentsExport;
use App\Exports\UsersExport;
use App\Models\Post;
use App\Models\Comment;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Maatwebsite\Excel\Facades\Excel;
use Barryvdh\DomPDF\Facade\Pdf;
use Inertia\Inertia;

/**
 * Facilitates administrative data exports by validating filters and delegating to Excel/PDF pipelines.
 * Centralizes export authorization to ensure only privileged staff can extract bulk application data.
 */
class ExportController extends Controller
{
    /**
     * Display export options page.
     */
    public function index()
    {
        // ✅ Authorize: Only admins can export data
        $this->authorize('viewAny', User::class);

        return Inertia::render('Admin/Export/Index', [
            'stats' => [
                'posts' => Post::count(),
                'comments' => Comment::count(),
                'users' => User::count(),
            ],
        ]);
    }

    /**
     * Export posts to Excel/CSV.
     */
    public function exportPosts(Request $request)
    {
        // ✅ Authorize: Only admins can export
        $this->authorize('viewAny', User::class);

        // ✅ Validate input
        $validated = $request->validate([
            'format' => 'required|in:xlsx,csv',
            'status' => 'nullable|in:draft,published,archived',
            'category_id' => 'nullable|exists:categories,id',
            'user_id' => 'nullable|exists:users,id',
            'date_from' => 'nullable|date',
            'date_to' => 'nullable|date|after_or_equal:date_from',
        ]);

        $filters = array_filter([
            'status' => $request->status,
            'category_id' => $request->category_id,
            'user_id' => $request->user_id,
            'date_from' => $request->date_from,
            'date_to' => $request->date_to,
        ]);

        $filename = 'posts_' . now()->format('Y-m-d_His') . '.' . $validated['format'];

        // ✅ Log export action
        \Log::info('Posts exported', [
            'user_id' => Auth::id(),
            'format' => $validated['format'],
            'filters' => $filters,
        ]);

        return Excel::download(new PostsExport($filters), $filename);
    }

    /**
     * Export comments to Excel/CSV.
     */
    public function exportComments(Request $request)
    {
        // ✅ Authorize: Only admins can export
        $this->authorize('viewAny', User::class);

        // ✅ Validate input
        $validated = $request->validate([
            'format' => 'required|in:xlsx,csv',
            'status' => 'nullable|in:pending,approved,rejected,spam',
            'post_id' => 'nullable|exists:posts,id',
            'user_id' => 'nullable|exists:users,id',
            'date_from' => 'nullable|date',
            'date_to' => 'nullable|date|after_or_equal:date_from',
        ]);

        $filters = array_filter([
            'status' => $request->status,
            'post_id' => $request->post_id,
            'user_id' => $request->user_id,
            'date_from' => $request->date_from,
            'date_to' => $request->date_to,
        ]);

        $filename = 'comments_' . now()->format('Y-m-d_His') . '.' . $validated['format'];

        // ✅ Log export action
        \Log::info('Comments exported', [
            'user_id' => Auth::id(),
            'format' => $validated['format'],
            'filters' => $filters,
        ]);

        return Excel::download(new CommentsExport($filters), $filename);
    }

    /**
     * Export posts to PDF.
     */
    public function exportPostsPdf(Request $request)
    {
        // ✅ Authorize: Only admins can export
        $this->authorize('viewAny', User::class);

        // ✅ Validate input
        $validated = $request->validate([
            'status' => 'nullable|in:draft,published,archived',
            'category_id' => 'nullable|exists:categories,id',
            'user_id' => 'nullable|exists:users,id',
            'date_from' => 'nullable|date',
            'date_to' => 'nullable|date|after_or_equal:date_from',
        ]);

        $query = Post::with(['user', 'category']);

        // Apply filters
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        if ($request->filled('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        $posts = $query->latest()->get();

        // ✅ Log export action
        \Log::info('Posts PDF exported', [
            'user_id' => Auth::id(),
            'count' => $posts->count(),
        ]);

        $pdf = Pdf::loadView('exports.posts-pdf', [
            'posts' => $posts,
            'filters' => $validated,
            'generated_at' => now()->format('d/m/Y H:i'),
        ]);

        return $pdf->download('posts_' . now()->format('Y-m-d_His') . '.pdf');
    }

    /**
     * Export comments to PDF.
     */
    public function exportCommentsPdf(Request $request)
    {
        // ✅ Authorize: Only admins can export
        $this->authorize('viewAny', User::class);

        // ✅ Validate input
        $validated = $request->validate([
            'status' => 'nullable|in:pending,approved,rejected,spam',
            'post_id' => 'nullable|exists:posts,id',
            'user_id' => 'nullable|exists:users,id',
            'date_from' => 'nullable|date',
            'date_to' => 'nullable|date|after_or_equal:date_from',
        ]);

        $query = Comment::with(['user', 'post']);

        // Apply filters
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('post_id')) {
            $query->where('post_id', $request->post_id);
        }

        if ($request->filled('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        $comments = $query->latest()->get();

        // ✅ Log export action
        \Log::info('Comments PDF exported', [
            'user_id' => Auth::id(),
            'count' => $comments->count(),
        ]);

        $pdf = Pdf::loadView('exports.comments-pdf', [
            'comments' => $comments,
            'filters' => $validated,
            'generated_at' => now()->format('d/m/Y H:i'),
        ]);

        return $pdf->download('comments_' . now()->format('Y-m-d_His') . '.pdf');
    }

    /**
     * Export users to Excel/CSV.
     */
    public function exportUsers(Request $request)
    {
        // ✅ Authorize: Only admins can export
        $this->authorize('viewAny', User::class);

        // ✅ Validate input
        $validated = $request->validate([
            'format' => 'required|in:xlsx,csv',
            'role' => 'nullable|in:admin,editor,user',
            'date_from' => 'nullable|date',
            'date_to' => 'nullable|date|after_or_equal:date_from',
        ]);

        $filters = array_filter([
            'role' => $request->role,
            'date_from' => $request->date_from,
            'date_to' => $request->date_to,
        ]);

        $filename = 'users_' . now()->format('Y-m-d_His') . '.' . $validated['format'];

        // ✅ Log export action
        \Log::info('Users exported', [
            'user_id' => Auth::id(),
            'format' => $validated['format'],
            'filters' => $filters,
        ]);

        return Excel::download(new UsersExport($filters), $filename);
    }
}

