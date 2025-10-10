<?php

namespace App\Http\Controllers;

use App\Models\AdminSetting;
use App\Models\Post;
use App\Models\Category;
use App\Models\Tag;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

/**
 * Powers the public blog experience by providing rich listing and detail endpoints with personalization features.
 * Combines editorial metadata, filtering, and logging so readers can discover relevant articles efficiently.
 */
class PostController extends Controller
{
    /**
     * Display enhanced blog index with advanced search and filtering.
     */
    public function enhancedIndex(Request $request)
    {
        Log::info('Enhanced blog index accessed', [
            'user_id' => Auth::id(),
            'ip' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'filters' => $request->only(['search', 'category', 'tag', 'tags', 'sortBy', 'sortOrder', 'featured']),
            'session_id' => session()->getId(),
            'timestamp' => now()->toISOString()
        ]);

        try {
            $user = Auth::user();

            $query = Post::published()
                ->select(['id', 'title', 'slug', 'excerpt', 'cover_image', 'published_at', 'views_count', 'featured', 'user_id', 'reading_time'])
                ->with([
                    'author:id,name,avatar',
                    'categories:id,name,slug,color',
                    'tags:id,name,slug,color'
                ])
                // ✅ FIXED N+1: Eager load counts to avoid queries in transform loop
                ->withCount(['likes', 'bookmarks', 'approvedComments']);

            Log::debug('Initial query setup', [
                'base_query_count' => Post::published()->count(),
                'total_posts_count' => Post::count(),
                'published_posts_count' => Post::where('status', 'published')->count()
            ]);

        // Enhanced search functionality with SQL injection protection
        if ($request->has('search') && !empty($request->search)) {
            // ✅ FIXED: Sanitize search term to prevent SQL injection
            $searchTerm = trim($request->search);
            // Escape special LIKE characters
            $searchTerm = str_replace(['%', '_'], ['\%', '\_'], $searchTerm);
            // Limit length to prevent DoS
            $searchTerm = substr($searchTerm, 0, 100);

            $query->where(function ($q) use ($searchTerm) {
                $q->where('title', 'like', "%{$searchTerm}%")
                  ->orWhere('excerpt', 'like', "%{$searchTerm}%")
                  ->orWhere('content', 'like', "%{$searchTerm}%")
                  ->orWhereHas('categories', function ($catQuery) use ($searchTerm) {
                      $catQuery->where('name', 'like', "%{$searchTerm}%");
                  })
                  ->orWhereHas('tags', function ($tagQuery) use ($searchTerm) {
                      $tagQuery->where('name', 'like', "%{$searchTerm}%");
                  });
            });
        }

        // Filter by category
        if ($request->has('category') && !empty($request->category)) {
            $query->whereHas('categories', function ($q) use ($request) {
                $q->where('slug', $request->category);
            });
        }

        // Filter by tag
        if ($request->has('tag') && !empty($request->tag)) {
            $query->whereHas('tags', function ($q) use ($request) {
                $q->where('slug', $request->tag);
            });
        }

        // Filter by multiple tags
        if ($request->has('tags') && is_array($request->tags) && !empty($request->tags)) {
            $tagIds = collect($request->tags)->pluck('id')->filter();
            if ($tagIds->isNotEmpty()) {
                $query->whereHas('tags', function ($q) use ($tagIds) {
                    $q->whereIn('tags.id', $tagIds);
                });
            }
        }

        // Filter by featured posts
        if ($request->has('featured') && $request->featured) {
            $query->where('featured', true);
        }

        // Enhanced sorting options
        $sortBy = $request->get('sortBy', 'published_at');
        $sortOrder = $request->get('sortOrder', 'desc');
        $allowedSortBy = ['published_at', 'views_count', 'likes_count', 'title'];
        $allowedSortOrder = ['asc', 'desc'];
        $sortBy = in_array($sortBy, $allowedSortBy, true) ? $sortBy : 'published_at';
        $sortOrder = in_array(strtolower($sortOrder), $allowedSortOrder, true) ? strtolower($sortOrder) : 'desc';
        
        switch ($sortBy) {
            case 'views_count':
                $query->orderBy('views_count', $sortOrder);
                break;
            case 'title':
                $query->orderBy('title', $sortOrder);
                break;
            case 'likes_count':
                $query->withCount('likes')->orderBy('likes_count', $sortOrder);
                break;
            case 'published_at':
            default:
                $query->orderBy('published_at', $sortOrder);
                break;
        }

        // Secondary sort for consistency
        if ($sortBy !== 'published_at') {
            $query->orderBy('published_at', 'desc');
        }

        // Handle per_page parameter with validation
        // Get posts per page from settings
        $defaultPerPage = AdminSetting::getCachedValue('blog_posts_per_page', 12, 300);
        $perPage = $request->input('per_page', $defaultPerPage);
        $perPage = in_array($perPage, [6, 12, 18, 24, 36]) ? $perPage : $defaultPerPage;

        $posts = $query->paginate($perPage)->withQueryString();

        Log::debug('Posts query executed', [
            'user_id' => Auth::id(),
            'total_found' => $posts->total(),
            'current_page' => $posts->currentPage(),
            'per_page' => $posts->perPage(),
            'has_filters' => $request->hasAny(['search', 'category', 'tag', 'tags', 'featured'])
        ]);

        // ✅ FIXED N+1: Load user interactions in bulk before transform
        $userInteractions = [];
        if ($user) {
            $postIds = $posts->pluck('id');
            $userInteractions = [
                'likes' => \App\Models\UserInteraction::where('user_id', $user->id)
                    ->where('interactable_type', 'App\\Models\\Post')
                    ->whereIn('interactable_id', $postIds)
                    ->where('type', 'like')
                    ->pluck('interactable_id')
                    ->toArray(),
                'bookmarks' => \App\Models\UserInteraction::where('user_id', $user->id)
                    ->where('interactable_type', 'App\\Models\\Post')
                    ->whereIn('interactable_id', $postIds)
                    ->where('type', 'bookmark')
                    ->pluck('interactable_id')
                    ->toArray(),
            ];
        }

        // Transform posts data (optimized - no content loading, no N+1 queries)
        $posts->getCollection()->transform(function ($post) use ($user, $userInteractions) {
            return [
                'id' => $post->id,
                'title' => $post->title,
                'slug' => $post->slug,
                'excerpt' => $post->excerpt,
                'cover_image' => $post->cover_image,
                'published_at' => $post->published_at,
                'views_count' => $post->views_count,
                'featured' => $post->featured,
                'author' => $post->author,
                'categories' => $post->categories,
                'tags' => $post->tags,
                'reading_time' => $post->reading_time ?? 5, // Default fallback
                // ✅ FIXED N+1: Use pre-loaded interaction data
                'is_liked' => $user ? in_array($post->id, $userInteractions['likes']) : false,
                'is_bookmarked' => $user ? in_array($post->id, $userInteractions['bookmarks']) : false,
                // ✅ FIXED N+1: Use eager-loaded counts
                'likes_count' => $post->likes_count ?? 0,
                'bookmarks_count' => $post->bookmarks_count ?? 0,
                'comments_count' => $post->approved_comments_count ?? 0,
            ];
        });

        // Get featured posts (optimized)
        $featuredPosts = [];
        if (!$request->hasAny(['search', 'category', 'tag', 'tags', 'featured', 'sortBy'])) {
            $featuredPostsCollection = Post::published()
                ->select(['id', 'title', 'slug', 'excerpt', 'cover_image', 'published_at', 'views_count', 'user_id'])
                ->where('featured', true)
                ->with(['author:id,name,avatar,is_verified', 'categories:id,name,slug,color', 'tags:id,name,slug,color'])
                // ✅ FIXED N+1: Eager load counts
                ->withCount(['likes', 'bookmarks'])
                ->orderBy('published_at', 'desc')
                ->limit(4) // Increased for trending section
                ->get();

            // ✅ FIXED N+1: Load user interactions in bulk for featured posts
            $featuredUserInteractions = [];
            if ($user && $featuredPostsCollection->isNotEmpty()) {
                $featuredPostIds = $featuredPostsCollection->pluck('id');
                $featuredUserInteractions = [
                    'likes' => \App\Models\UserInteraction::where('user_id', $user->id)
                        ->where('interactable_type', 'App\\Models\\Post')
                        ->whereIn('interactable_id', $featuredPostIds)
                        ->where('type', 'like')
                        ->pluck('interactable_id')
                        ->toArray(),
                    'bookmarks' => \App\Models\UserInteraction::where('user_id', $user->id)
                        ->where('interactable_type', 'App\\Models\\Post')
                        ->whereIn('interactable_id', $featuredPostIds)
                        ->where('type', 'bookmark')
                        ->pluck('interactable_id')
                        ->toArray(),
                ];
            }

            $featuredPosts = $featuredPostsCollection->map(function ($post) use ($user, $featuredUserInteractions) {
                return [
                    'id' => $post->id,
                    'title' => $post->title,
                    'slug' => $post->slug,
                    'excerpt' => $post->excerpt,
                    'cover_image' => $post->cover_image,
                    'published_at' => $post->published_at,
                    'views_count' => $post->views_count,
                    'author' => $post->author,
                    'categories' => $post->categories,
                    'tags' => $post->tags,
                    'reading_time' => 5, // Default for featured posts
                    // ✅ FIXED N+1: Use pre-loaded interaction data
                    'is_liked' => $user ? in_array($post->id, $featuredUserInteractions['likes']) : false,
                    'is_bookmarked' => $user ? in_array($post->id, $featuredUserInteractions['bookmarks']) : false,
                    // ✅ FIXED N+1: Use eager-loaded counts
                    'likes_count' => $post->likes_count ?? 0,
                    'bookmarks_count' => $post->bookmarks_count ?? 0,
                ];
            });
        }

        // Get all active categories with post counts
        $categories = Category::active()
            ->orderBy('sort_order')
            ->withCount(['posts as posts_count' => function ($query) {
                $query->published();
            }])
            ->having('posts_count', '>', 0)
            ->get(['id', 'name', 'slug', 'color']);

        // Get popular tags for advanced filtering
        $tags = Tag::has('posts')
            ->withCount(['posts' => function ($query) {
                $query->published();
            }])
            ->orderByDesc('posts_count')
            ->limit(50)
            ->get(['id', 'name', 'slug', 'color']);

        return Inertia::render('Blog/PerfectBlogIndex', [
            'posts' => $posts,
            'featured_posts' => $featuredPosts,
            'categories' => $categories,
            'tags' => $tags,
            'filters' => [
                'search' => $request->search,
                'category' => $request->category,
                'tag' => $request->tag,
                'tags' => $request->tags,
                'sortBy' => $sortBy,
                'sortOrder' => $sortOrder,
                'featured' => $request->boolean('featured'),
            ],
        ]);

        } catch (\Exception $e) {
            Log::error('Enhanced blog index failed', [
                'user_id' => Auth::id(),
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'filters' => $request->only(['search', 'category', 'tag', 'tags', 'sortBy', 'sortOrder', 'featured'])
            ]);
            
            // Return basic posts in case of error
            // Get posts per page from settings
            $defaultPerPage = AdminSetting::getCachedValue('blog_posts_per_page', 12, 300);

            $basicPosts = Post::published()
                ->with(['author:id,name,avatar,is_verified', 'categories:id,name,slug,color'])
                ->latest()
                ->paginate($defaultPerPage);
                
            return Inertia::render('Blog/PerfectBlogIndex', [
                'posts' => $basicPosts,
                'featured_posts' => [],
                'categories' => [],
                'tags' => [],
                'filters' => [],
                'error' => 'Failed to load the blog. Displaying basic content.'
            ]);
        }
    }

    /**
     * Display a listing of blog posts.
     */
    public function index(Request $request)
    {
        $query = Post::published()
            ->with(['author:id,name,is_verified', 'categories:id,name,slug,color']);

        // Filter by tag
        if ($request->has('tag') && !empty($request->tag)) {
            $query->whereHas('tags', function ($q) use ($request) {
                $q->where('slug', $request->tag);
            });
        }

        // Search functionality with SQL injection protection
        if ($request->has('search') && !empty($request->search)) {
            // ✅ FIXED: Sanitize search term
            $searchTerm = trim($request->search);
            $searchTerm = str_replace(['%', '_'], ['\%', '\_'], $searchTerm);
            $searchTerm = substr($searchTerm, 0, 100);

            $query->where(function ($q) use ($searchTerm) {
                $q->where('title', 'like', "%{$searchTerm}%")
                  ->orWhere('excerpt', 'like', "%{$searchTerm}%")
                  ->orWhere('content', 'like', "%{$searchTerm}%");
            });
        }

        // Get posts per page from settings
        $defaultPerPage = AdminSetting::getCachedValue('blog_posts_per_page', 12, 300);

        $posts = $query->orderBy('featured', 'desc')
            ->orderBy('published_at', 'desc')
            ->paginate($defaultPerPage)
            ->through(function ($post) {
                return [
                    'id' => $post->id,
                    'title' => $post->title,
                    'slug' => $post->slug,
                    'excerpt' => $post->excerpt,
                    'cover_image' => $post->cover_image,
                    'published_at' => $post->published_at->format('d M Y'),
                    'views_count' => $post->views_count,
                    'featured' => $post->featured,
                    'author' => $post->author,
                    'categories' => $post->categories,
                    'tags' => $post->tags,
                    'likes_count' => $post->likes_count ?? 0,
                    'bookmarks_count' => $post->bookmarks_count ?? 0,
                    'comments_count' => $post->approved_comments_count ?? 0,
                    'reading_time' => $this->calculateReadingTime($post->content),
                ];
            });

        // Get featured posts for hero section
        $featuredPosts = Post::published()
            ->featured()
            ->with(['author:id,name,avatar,is_verified', 'categories:id,name,slug,color', 'tags:id,name,slug,color'])
            ->withCount(['likes', 'bookmarks', 'approvedComments'])
            ->limit(3)
            ->get()
            ->map(function ($post) {
                return [
                    'id' => $post->id,
                    'title' => $post->title,
                    'slug' => $post->slug,
                    'excerpt' => $post->excerpt,
                    'cover_image' => $post->cover_image,
                    'published_at' => $post->published_at->format('d M Y'),
                    'author' => $post->author,
                    'categories' => $post->categories,
                    'tags' => $post->tags,
                    'likes_count' => $post->likes_count ?? 0,
                    'comments_count' => $post->approved_comments_count ?? 0,
                ];
            });

        // Get all categories for filter
        $categories = Category::active()
            ->orderBy('sort_order')
            ->withCount(['posts as posts_count' => function ($query) {
                $query->published();
            }])
            ->get(['id', 'name', 'slug', 'color']);

        // Get popular tags for filter
        $tags = Tag::has('posts')
            ->withCount(['posts' => function ($query) {
                $query->published();
            }])
            ->orderByDesc('posts_count')
            ->limit(20)
            ->get(['id', 'name', 'slug', 'color']);

        return Inertia::render('Blog/Index', [
            'posts' => $posts,
            'featured_posts' => $featuredPosts,
            'categories' => $categories,
            'tags' => $tags,
            'filters' => [
                'search' => $request->search,
                'category' => $request->category,
                'tag' => $request->tag,
            ],
        ]);
    }

    /**
     * Display the specified blog post.
     */
    public function show(Post $post)
    {
        // Check if post is published
        if ($post->status !== 'published' || $post->published_at > now()) {
            abort(404);
        }

        // Increment views
        $post->incrementViews();

        // Load relationships
        $post->load([
            'author:id,name,avatar,bio,profession,is_verified',
            'categories:id,name,slug,color',
            'tags:id,name,slug,color',
            'comments' => function ($query) {
                $query->approved()
                      ->topLevel()
                      ->with('user:id,name,avatar,is_verified')
                      ->with(['replies' => function ($q) {
                          $q->approved()->with('user:id,name,avatar,is_verified');
                      }])
                      ->orderBy('created_at', 'desc');
            }
        ]);
        
        // Load interaction counts
        $post->loadCount(['likes', 'bookmarks', 'approvedComments']);

        // Get suggested posts using the new intelligent algorithm
        $suggestedPosts = $post->getSuggestedPosts(8) // Increase count to provide more options for guests
            ->map(function ($suggestedPost) {
                return [
                    'id' => $suggestedPost->id,
                    'title' => $suggestedPost->title,
                    'slug' => $suggestedPost->slug,
                    'excerpt' => $suggestedPost->excerpt,
                    'cover_image' => $suggestedPost->cover_image,
                    'published_at' => $suggestedPost->published_at->format('d M Y'),
                    'author' => $suggestedPost->author,
                    'categories' => $suggestedPost->categories,
                    'tags' => $suggestedPost->tags,
                    'likes_count' => $suggestedPost->likes_count ?? 0,
                    'comments_count' => $suggestedPost->approved_comments_count ?? 0,
                    'views_count' => $suggestedPost->views_count ?? 0,
                    'reading_time' => $this->calculateReadingTime($suggestedPost->content ?? ''),
                    'relevance_score' => $suggestedPost->relevance_score ?? 0, // Para mostrar relevancia
                ];
            });

        return Inertia::render('Blog/Show', [
            'post' => [
                'id' => $post->id,
                'title' => $post->title,
                'slug' => $post->slug,
                'content' => $post->content,
                'excerpt' => $post->excerpt,
                'cover_image' => $post->cover_image,
                'published_at' => $post->published_at ? $post->published_at->format('d M Y') : null,
                'views_count' => $post->views_count,
                'author' => $post->author,
                'categories' => $post->categories,
                'tags' => $post->tags,
                'comments' => $post->comments,
                'likes_count' => $post->likes_count ?? 0,
                'bookmarks_count' => $post->bookmarks_count ?? 0,
                'comments_count' => $post->approved_comments_count ?? 0,
                'reading_time' => $this->calculateReadingTime($post->content),
                'created_at' => $post->created_at->format('d/m/Y'),
            ],
            'suggestedPosts' => $suggestedPosts,
            'seo' => [
                'title' => $post->seo_title,
                'description' => $post->seo_description,
                'image' => $post->cover_image,
            ],
        ]);
    }

    /**
     * Calculate reading time for content.
     */
    private function calculateReadingTime($content)
    {
        $wordCount = str_word_count(strip_tags($content));
        $wordsPerMinute = 200; // Average reading speed
        $minutes = ceil($wordCount / $wordsPerMinute);
        
        return $minutes . ' min de lectura';
    }

    /**
     * Get personalized suggested posts for guests based on their local storage data
     */
    public function getGuestRecommendations(Request $request)
    {
        $currentPostId = $request->input('current_post_id');
        $visitedPosts = $request->input('visited_posts', []);
        $limit = min($request->input('limit', 6), 10); // Max 10 posts

        // If no history is available, fall back to the standard algorithm
        if (empty($visitedPosts)) {
            $currentPost = Post::find($currentPostId);
            if (!$currentPost) {
                return response()->json(['posts' => []]);
            }

            $suggested = $currentPost->getSuggestedPosts($limit);
        } else {
            // Custom algorithm based on the guest history
            $suggested = $this->getPersonalizedRecommendations($currentPostId, $visitedPosts, $limit);
        }

        $formattedPosts = $suggested->map(function ($suggestedPost) {
            return [
                'id' => $suggestedPost->id,
                'title' => $suggestedPost->title,
                'slug' => $suggestedPost->slug,
                'excerpt' => $suggestedPost->excerpt,
                'cover_image' => $suggestedPost->cover_image,
                'published_at' => $suggestedPost->published_at->format('d M Y'),
                'author' => $suggestedPost->author,
                'categories' => $suggestedPost->categories,
                'tags' => $suggestedPost->tags,
                'likes_count' => $suggestedPost->likes_count ?? 0,
                'comments_count' => $suggestedPost->approved_comments_count ?? 0,
                'views_count' => $suggestedPost->views_count ?? 0,
                'reading_time' => $this->calculateReadingTime($suggestedPost->content ?? ''),
                'recommendation_score' => $suggestedPost->recommendation_score ?? 0,
            ];
        });

        return response()->json(['posts' => $formattedPosts]);
    }

    /**
     * Get personalized recommendations based on guest's visit history
     */
    private function getPersonalizedRecommendations($currentPostId, $visitedPosts, $limit)
    {
        // Extract IDs of posts that have already been read
        $readPostIds = array_map('intval', array_keys($visitedPosts)); // Cast to integers
        $readPostIds[] = intval($currentPostId); // Incluir el post actual
        
        // Extract the most visited categories and tags with time-based weighting
        $categoryWeights = [];
        $tagWeights = [];
        $totalTime = 0;
        $totalVisits = 0;

        foreach ($visitedPosts as $visitedPost) {
            $timeWeight = min($visitedPost['averageTimeSpent'] / 60000, 5); // Max 5 minutos
            $visitWeight = min($visitedPost['visits'], 3); // Max 3 visitas
            $combinedWeight = $timeWeight * $visitWeight;
            
            $totalTime += $visitedPost['totalTimeSpent'];
            $totalVisits += $visitedPost['visits'];

            // Weight categories
            foreach ($visitedPost['categories'] as $category) {
                $categoryWeights[$category['id']] = ($categoryWeights[$category['id']] ?? 0) + $combinedWeight;
            }

            // Weight tags
            foreach ($visitedPost['tags'] as $tag) {
                $tagWeights[$tag['id']] = ($tagWeights[$tag['id']] ?? 0) + $combinedWeight;
            }
        }

        // Build the query excluding already read posts initially
        $query = Post::published()
            ->whereNotIn('id', $readPostIds)
            ->with(['author:id,name,avatar,is_verified', 'categories:id,name,slug', 'tags:id,name,slug,color'])
            ->withCount(['likes', 'bookmarks', 'approvedComments']);

        // ✅ FIXED: Limit query to prevent loading thousands of posts
        // We fetch 2x the limit to have enough posts for scoring and filtering
        $unreadPosts = $query->limit($limit * 2)->get();

        // If there are not enough unread posts, include a few read ones with a penalty
        $posts = $unreadPosts;
        if ($unreadPosts->count() < $limit) {
            $remainingLimit = $limit - $unreadPosts->count();
            
            // Fetch read posts that were very engaging (time > 2 minutes or multiple visits)
            $interestingReadIds = [];
            foreach ($visitedPosts as $id => $visitedPost) {
                if ($visitedPost['averageTimeSpent'] > 120000 || $visitedPost['visits'] > 1) {
                    $interestingReadIds[] = intval($id); // Convertir a entero
                }
            }
            
            if (!empty($interestingReadIds)) {
                $readPosts = Post::published()
                    ->whereIn('id', $interestingReadIds)
                    ->with(['author:id,name,avatar,is_verified', 'categories:id,name,slug', 'tags:id,name,slug,color'])
                    ->withCount(['likes', 'bookmarks', 'approvedComments'])
                    ->limit($remainingLimit)
                    ->get();
                    
                $posts = $unreadPosts->merge($readPosts);
            }
        }

        // Calculate a recommendation score for each post
        $scoredPosts = $posts->map(function ($post) use ($categoryWeights, $tagWeights, $readPostIds) {
            $score = 0;
            $isRead = in_array($post->id, $readPostIds);
            
            // Penalty for already-read posts (significantly reduce the score)
            $readPenalty = $isRead ? 0.2 : 1.0; // Previously read posts keep only 20% of the score
            
            // Base score driven by popularity
            $score += ($post->views_count ?? 0) * 0.01 * $readPenalty;
            $score += ($post->likes_count ?? 0) * 0.5 * $readPenalty;
            $score += ($post->featured ? 2 : 0) * $readPenalty;
            
            // Score contribution from visited categories
            foreach ($post->categories as $category) {
                $score += ($categoryWeights[$category->id] ?? 0) * 3 * $readPenalty;
            }
            
            // Score contribution from visited tags
            foreach ($post->tags as $tag) {
                $score += ($tagWeights[$tag->id] ?? 0) * 2 * $readPenalty;
            }
            
            $post->recommendation_score = $score;
            $post->is_read = $isRead;
            $post->read_penalty = $readPenalty;
            
            return $post;
        });

        // Sort by priority: unread first, then by score
        return $scoredPosts
            ->sort(function ($a, $b) {
                // Prioritize unread posts
                if ($a->is_read !== $b->is_read) {
                    return $a->is_read ? 1 : -1;
                }
                // Then sort by score
                return $b->recommendation_score <=> $a->recommendation_score;
            })
            ->take($limit);
    }
}

