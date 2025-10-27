<?php

namespace App\Http\Controllers;

use App\Models\Comment;
use App\Models\Post;
use App\Models\User;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Collects metrics and content tailored to authenticated users, composing the personalized dashboard experience.
 *
 * Features:
 * - Overview: recent comments/saves, quick stats, and personalization.
 * - Admin view: system counts and recent activity shortcuts.
 * - Lists: saved posts, liked posts, following, liked comments (with filters/pagination).
 * - Preferences: lightweight settings endpoint for UI prototyping.
 */
class UserDashboardController extends Controller
{
    /**
     * Display user dashboard overview.
     *
     * @return Response|RedirectResponse Inertia response with personalized dashboard data or redirect for admins.
     */
    public function index(): Response|\Illuminate\Http\RedirectResponse
    {
        Log::info('Dashboard access attempt', [
            'user_id' => Auth::id(),
            'is_authenticated' => Auth::check(),
            'session_id' => session()->getId(),
            'ip' => request()->ip(),
            'user_agent' => request()->userAgent()
        ]);

        $user = Auth::user();

        if (!$user) {
            Log::warning('Dashboard access failed - No authenticated user', [
                'session_id' => session()->getId(),
                'ip' => request()->ip()
            ]);
            return redirect()->route('login')->with('error', 'Session expired. Please log in again.');
        }

        // ✅ FIX: Redirect admins/editors to their dedicated admin dashboard
        if ($user->hasRole('admin') || $user->hasRole('editor')) {
            Log::info('Admin/Editor redirected to admin dashboard', [
                'user_id' => $user->id,
                'role' => $user->role
            ]);
            return redirect()->route('admin.dashboard');
        }

        Log::info('Dashboard loading for user', [
            'user_id' => $user->id,
            'user_name' => $user->name,
            'user_email' => $user->email
        ]);
        
        try {
            // ✅ FIX: This dashboard is now for regular users only
            // Admins/editors are redirected to admin.dashboard above

            // Personal statistics for regular users
            $stats = [
                'comments_count' => $user->comments()->count(),
                'saved_posts_count' => $user->savedPosts()->count(),
                'following_count' => $user->following()->count(),
                'followers_count' => $user->followers()->count(),
            ];

            // Retrieve the authenticated user's recent comments
            $recentComments = $user->comments()
                ->with(['post:id,title,slug'])
                ->latest()
                ->take(5)
                ->get();

            $recentSavedPosts = $user->savedPosts()
                ->with(['author:id,name,avatar'])
                ->orderByPivot('created_at', 'desc')
                ->take(5)
                ->get();

            Log::debug('Dashboard stats calculated', $stats);

            Log::info('Dashboard data loaded successfully', [
                'user_id' => $user->id,
                'recent_comments_count' => $recentComments->count(),
                'recent_saved_posts_count' => $recentSavedPosts->count()
            ]);

            return Inertia::render('User/Dashboard', [
                'stats' => $stats,
                'recentComments' => $recentComments,
                'recentSavedPosts' => $recentSavedPosts,
            ]);
        } catch (\Exception $e) {
            Log::error('Dashboard loading failed', [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            session()->flash('error', 'Failed to load the dashboard. Please try again.');
            return redirect()->back();
        }
    }

    /**
     * Display user's comments management.
     */
    public function comments(Request $request): Response
    {
        $perPage = $request->get('per_page', 10);
        $search = $request->get('search');

        $commentsQuery = Auth::user()->comments()
            ->with(['post:id,title,slug'])
            ->latest();

        if ($search) {
            $commentsQuery->where('body', 'like', "%{$search}%");
        }

        $comments = $commentsQuery->paginate($perPage);

        return Inertia::render('User/Comments', [
            'comments' => $comments,
            'filters' => [
                'search' => $search,
                'per_page' => $perPage,
            ],
        ]);
    }

    /**
     * Display the user's saved posts.
     *
     * @param Request $request The current HTTP request instance.
     * @return Response Inertia response with saved posts and filters.
     */
    public function savedPosts(Request $request): Response
    {
        $perPage = $request->get('per_page', 12);
        $category = $request->get('category');
        $search = $request->get('search');

        $savedPostsQuery = Auth::user()->savedPosts()
            ->with(['author:id,name,avatar', 'categories:id,name,slug'])
            ->orderByPivot('created_at', 'desc');

        if ($category) {
            $savedPostsQuery->whereHas('categories', function ($query) use ($category) {
                $query->where('slug', $category);
            });
        }

        if ($search) {
            $savedPostsQuery->where(function ($query) use ($search) {
                $query->where('title', 'like', "%{$search}%")
                      ->orWhere('excerpt', 'like', "%{$search}%");
            });
        }

        $savedPosts = $savedPostsQuery->paginate($perPage);

        // Get available categories from saved posts
        $categories = Auth::user()->savedPosts()
            ->with('categories:id,name,slug')
            ->get()
            ->pluck('categories')
            ->flatten()
            ->unique('id')
            ->values();

        return Inertia::render('User/SavedPosts', [
            'savedPosts' => $savedPosts,
            'categories' => $categories,
            'filters' => [
                'category' => $category,
                'search' => $search,
                'per_page' => $perPage,
            ],
        ]);
    }

    /**
     * Display the user's following list.
     *
     * @param Request $request The current HTTP request instance.
     * @return Response Inertia response with following users and filters.
     */
    public function following(Request $request): Response
    {
        $perPage = $request->get('per_page', 12);
        $search = $request->get('search');

        $followingQuery = Auth::user()->following()
            ->select(['id', 'name', 'email', 'avatar', 'bio', 'profession'])
            ->withCount(['posts', 'followers']);

        if ($search) {
            $followingQuery->where(function ($query) use ($search) {
                $query->where('name', 'like', "%{$search}%")
                      ->orWhere('profession', 'like', "%{$search}%");
            });
        }

        $following = $followingQuery->paginate($perPage);

        return Inertia::render('User/Following', [
            'following' => $following,
            'filters' => [
                'search' => $search,
                'per_page' => $perPage,
            ],
        ]);
    }

    /**
     * Display the user preferences screen.
     *
     * @return Response Inertia response with user profile snapshot and default preferences.
     */
    public function preferences(): Response
    {
        $user = Auth::user();

        return Inertia::render('User/Preferences', [
            'user' => $user->only([
                'id', 'name', 'email', 'avatar', 'bio', 'profession',
                'location', 'website', 'phone', 'birth_date', 'gender',
                'social_links', 'profile_visibility', 'show_email'
            ]),
            'preferences' => [
                'email_notifications' => true,
                'browser_notifications' => false,
                'marketing_emails' => false,
                'comment_notifications' => true,
                'follow_notifications' => true,
            ],
        ]);
    }

    /**
     * Update user preferences.
     *
     * @param Request $request The current HTTP request instance.
     * @return \Illuminate\Http\RedirectResponse Redirect back with status.
     */
    public function updatePreferences(Request $request)
    {
        $request->validate([
            'email_notifications' => 'boolean',
            'browser_notifications' => 'boolean',
            'marketing_emails' => 'boolean',
            'comment_notifications' => 'boolean',
            'follow_notifications' => 'boolean',
        ]);

        // For now, we'll store preferences in session or cache
        // In a real app, you'd create a user_preferences table
        session(['user_preferences' => $request->all()]);

        return back()->with('success', 'Preferencias actualizadas correctamente');
    }

    /**
     * Display the user's liked posts.
     *
     * @param Request $request The current HTTP request instance.
     * @return Response Inertia response with liked posts and filters.
     */
    public function likedPosts(Request $request): Response
    {
        $perPage = $request->get('per_page', 12);
        $category = $request->get('category');
        $search = $request->get('search');

        $likedPostsQuery = Auth::user()->likedPosts()
            ->with(['author:id,name,avatar', 'categories:id,name,slug'])
            ->orderByPivot('created_at', 'desc');

        if ($category) {
            $likedPostsQuery->whereHas('categories', function ($query) use ($category) {
                $query->where('slug', $category);
            });
        }

        if ($search) {
            $likedPostsQuery->where(function ($query) use ($search) {
                $query->where('title', 'like', "%{$search}%")
                      ->orWhere('excerpt', 'like', "%{$search}%");
            });
        }

        $likedPosts = $likedPostsQuery->paginate($perPage);

        // Get available categories from liked posts
        $categories = Auth::user()->likedPosts()
            ->with('categories:id,name,slug')
            ->get()
            ->pluck('categories')
            ->flatten()
            ->unique('id')
            ->values();

        return Inertia::render('User/LikedPosts', [
            'likedPosts' => $likedPosts,
            'categories' => $categories,
            'filters' => [
                'category' => $category,
                'search' => $search,
                'per_page' => $perPage,
            ],
        ]);
    }

    /**
     * Display the user's bookmarks (alias for saved posts).
     *
     * @param Request $request The current HTTP request instance.
     * @return Response Inertia response with saved posts.
     */
    public function bookmarks(Request $request): Response
    {
        return $this->savedPosts($request);
    }

    /**
     * Display the user's liked comments.
     *
     * @param Request $request The current HTTP request instance.
     * @return Response Inertia response with liked comments and filters.
     */
    public function likedComments(Request $request): Response
    {
        $perPage = $request->get('per_page', 12);
        $search = $request->get('search');

        $likedCommentsQuery = Auth::user()->likedComments()
            ->with([
                'post:id,title,slug,excerpt,cover_image',
                'user:id,name,avatar',
                'parent:id,body,user_id',
                'parent.user:id,name'
            ])
            ->where('status', 'approved'); // Only show approved comments

        if ($search) {
            $likedCommentsQuery->where('body', 'like', "%{$search}%");
        }

        $likedComments = $likedCommentsQuery->paginate($perPage);

        return Inertia::render('User/LikedComments', [
            'likedComments' => $likedComments,
            'filters' => [
                'search' => $search,
                'per_page' => $perPage,
            ],
        ]);
    }

    /**
     * Remove a saved post.
     *
     * @param Post $post The post to remove from saved.
     * @return \Illuminate\Http\JsonResponse JSON response indicating success.
     */
    public function removeSavedPost(Post $post)
    {
        Auth::user()->savedPosts()->detach($post->id);

        return response()->json([
            'success' => true,
            'message' => 'Post eliminado de guardados'
        ]);
    }

    /**
     * Delete a comment.
     *
     * Uses soft delete to preserve conversation structure.
     *
     * @param Comment $comment The comment to delete.
     * @return \Illuminate\Http\JsonResponse JSON response indicating success or failure.
     */
    public function deleteComment(Comment $comment)
    {
        // Check if user owns the comment
        if ($comment->user_id !== Auth::id()) {
            return response()->json([
                'success' => false,
                'message' => 'No tienes permisos para eliminar este comentario'
            ], 403);
        }

        // Use soft delete to preserve conversation structure
        $comment->delete();

        return response()->json([
            'success' => true,
            'message' => 'Comentario eliminado correctamente'
        ]);
    }

    /**
     * Unfollow a user.
     *
     * @param User $user The user to unfollow.
     * @return \Illuminate\Http\JsonResponse JSON response indicating success.
     */
    public function unfollowUser(User $user)
    {
        Auth::user()->following()->detach($user->id);

        return response()->json([
            'success' => true,
            'message' => "Has dejado de seguir a {$user->name}"
        ]);
    }
}
