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
 * Mixes editorial insights, engagement summaries, and administrative fallbacks to keep members informed.
 */
class UserDashboardController extends Controller
{
    /**
     * Display user dashboard overview.
     */
    public function index(): Response
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

        Log::info('Dashboard loading for user', [
            'user_id' => $user->id,
            'user_name' => $user->name,
            'user_email' => $user->email
        ]);
        
        try {
            // Determine whether the current user has administrative privileges.
            $isAdmin = $user->role === 'admin' || $user->is_admin || false;
            
            if ($isAdmin) {
                // System statistics shown to administrators.
                $stats = [
                    'total_posts' => Post::count(),
                    'total_users' => User::count(),
                    'total_comments' => Comment::count(),
                    'total_categories' => \App\Models\Category::count(),
                    'posts' => [
                        'total' => Post::count(),
                        'published' => Post::where('status', 'published')->count(),
                        'draft' => Post::where('status', 'draft')->count(),
                        'featured' => Post::where('featured', true)->count(),
                    ],
                    'users' => [
                        'total' => User::count(),
                        'active' => User::whereNotNull('email_verified_at')->count(),
                        'admins' => User::where('role', 'admin')->count(),
                    ],
                    'comments' => [
                        'total' => Comment::count(),
                        'approved' => Comment::where('status', 'approved')->count(),
                        'pending' => Comment::where('status', 'pending')->count(),
                    ],
                    'categories' => [
                        'total' => \App\Models\Category::count(),
                        'active' => \App\Models\Category::where('is_active', true)->count(),
                    ],
                    'performance' => [
                        'score' => 98,
                        'trends' => [
                            'posts' => 15,
                            'users' => 8,
                            'comments' => -3,
                            'performance' => 2
                        ]
                    ]
                ];
                
                // Recent activity timeline for administrators.
                $recentComments = Comment::with(['post:id,title,slug', 'user:id,name'])
                    ->latest()
                    ->take(5)
                    ->get();
                    
                $recentSavedPosts = Post::with(['author:id,name,avatar', 'categories:id,name,color'])
                    ->orderBy('created_at', 'desc')
                    ->take(5)
                    ->get();
                    
            } else {
                // Personal statistics for regular users.
                $stats = [
                    'comments_count' => $user->comments()->count(),
                    'saved_posts_count' => $user->savedPosts()->count(),
                    'following_count' => $user->following()->count(),
                    'followers_count' => $user->followers()->count(),
                ];

                // Retrieve the authenticated user's recent comments.
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
            }

            Log::debug('Dashboard stats calculated', $stats);

            Log::info('Dashboard data loaded successfully', [
                'user_id' => $user->id,
                'is_admin' => $isAdmin,
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
            $commentsQuery->where('content', 'like', "%{$search}%");
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
     * Display user's saved posts
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
     * Display user's following list
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
     * Display user preferences
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
     * Update user preferences
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
     * Display user's liked posts
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
     * Display user's bookmarks (alias for saved posts)
     */
    public function bookmarks(Request $request): Response
    {
        return $this->savedPosts($request);
    }

    /**
     * Display user's liked comments
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
     * Remove a saved post
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
     * Delete a comment
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

        $comment->delete();

        return response()->json([
            'success' => true,
            'message' => 'Comentario eliminado correctamente'
        ]);
    }

    /**
     * Unfollow a user
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
