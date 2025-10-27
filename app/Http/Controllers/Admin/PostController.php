<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Post;
use App\Models\Category;
use App\Models\Tag;
use App\Models\User;
use App\Models\PostRevision;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;
use Carbon\Carbon;

/**
 * Directs editorial workflows for blog posts by orchestrating drafting, publishing, revision tracking, and taxonomy assignment.
 * Provides administrators with validation, media handling, and audit integrations essential for content governance.
 */
class PostController extends Controller
{
    /**
     * Display a listing of posts.
     */
    public function index(Request $request)
    {
        $query = Post::with(['author:id,name', 'categories:id,name,slug,color', 'tags:id,name,slug'])
            ->orderBy('created_at', 'desc');

        // Filter by post status.
        if ($request->has('status') && !empty($request->status)) {
            $query->where('status', $request->status);
        }

        // Filter by category selection.
        if ($request->has('category') && !empty($request->category)) {
            $query->whereHas('categories', function ($q) use ($request) {
                $q->where('id', $request->category);
            });
        }

        // Apply keyword search across title, excerpt, and content.
        if ($request->has('search') && !empty($request->search)) {
            $query->where(function ($q) use ($request) {
                $q->where('title', 'like', '%' . $request->search . '%')
                  ->orWhere('excerpt', 'like', '%' . $request->search . '%')
                  ->orWhere('content', 'like', '%' . $request->search . '%');
            });
        }

        $posts = $query->paginate(15)->through(function ($post) {
            return [
                'id' => $post->id,
                'title' => $post->title,
                'slug' => $post->slug,
                'excerpt' => $post->excerpt,
                'cover_image' => $post->cover_image,
                'status' => $post->status,
                'featured' => $post->featured,
                'published_at' => $post->published_at ? $post->published_at->format('d/m/Y H:i') : null,
                'views_count' => $post->views_count,
                'author' => $post->author,
                'categories' => $post->categories,
                'tags' => $post->tags,
                'created_at' => $post->created_at->format('d/m/Y H:i'),
                'updated_at' => $post->updated_at->format('d/m/Y H:i'),
            ];
        });

        // Retrieve categories and tags for filter dropdowns.
        $categories = Category::active()->ordered()->get(['id', 'name']);
        $tags = Tag::orderBy('name')->get(['id', 'name']);

        return Inertia::render('Admin/Posts/Index', [
            'posts' => $posts,
            'categories' => $categories,
            'tags' => $tags,
            'filters' => [
                'search' => $request->search,
                'status' => $request->status,
                'category' => $request->category,
            ],
            'stats' => [
                'total' => Post::count(),
                'published' => Post::where('status', 'published')->count(),
                'draft' => Post::where('status', 'draft')->count(),
                'scheduled' => Post::where('status', 'scheduled')->count(),
            ]
        ]);
    }

    /**
     * Show the form for creating a new post.
     */
    public function create()
    {
        $categories = Category::active()->ordered()->get(['id', 'name', 'slug', 'color']);
        $tags = Tag::orderBy('name')->get(['id', 'name', 'slug']);
        $authors = User::whereHas('roles', function ($query) {
            $query->whereIn('name', ['super_admin', 'admin', 'editor']);
        })->get(['id', 'name']);

        return Inertia::render('Admin/Posts/Create', [
            'categories' => $categories,
            'tags' => $tags,
            'authors' => $authors,
        ]);
    }

    /**
     * Store a newly created post.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:posts,slug',
            'excerpt' => 'required|string|max:500',
            'content' => 'required|string',
            'cover_image' => 'nullable|string',
            'status' => 'required|in:draft,published,scheduled',
            'featured' => 'boolean',
            'published_at' => 'nullable|date',
            'user_id' => 'nullable|exists:users,id',
            'categories' => 'array',
            'categories.*' => 'exists:categories,id',
            'tags' => 'array',
            'tags.*' => 'exists:tags,id',
            'seo_title' => 'nullable|string|max:255',
            'seo_description' => 'nullable|string|max:255',
        ]);

        // Auto-generate slug if not provided.
        if (empty($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['title']);
        }

        // Set author to the acting user when not explicitly assigned.
        if (empty($validated['user_id'])) {
            $validated['user_id'] = auth()->id();
        }

        // Handle scheduled publication dates.
        if ($validated['status'] === 'scheduled' && !$validated['published_at']) {
            $validated['published_at'] = now()->addHour();
        }

        // Ensure published posts have a publication timestamp.
        if ($validated['status'] === 'published' && !$validated['published_at']) {
            $validated['published_at'] = now();
        }

        // Fix: Generate slug if empty.
        if (empty($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['title']);
        }

        // Fix: Ensure slug uniqueness (moved outside unreachable branch).
        $originalSlug = $validated['slug'];
        $counter = 1;
        while (Post::where('slug', $validated['slug'])->exists()) {
            $validated['slug'] = $originalSlug . '-' . $counter;
            $counter++;
        }

        // Finalize the author attribution.
        $validated['user_id'] = $validated['user_id'] ?? \Illuminate\Support\Facades\Auth::id();

        // Normalize publication timestamps for the given status.
        if ($validated['status'] === 'published' && !$validated['published_at']) {
            $validated['published_at'] = now();
        } elseif ($validated['status'] !== 'published') {
            $validated['published_at'] = $validated['published_at'] ?? null;
        }

        // Fix: Wrap post creation and relationships in transaction.
        $post = \DB::transaction(function () use ($validated) {
            $post = Post::create($validated);

            // Attach categories and tags.
            if (!empty($validated['categories'])) {
                $post->categories()->attach($validated['categories']);
            }

            if (!empty($validated['tags'])) {
                $post->tags()->attach($validated['tags']);
            }

            return $post;
        });

        // Generate success message with post details
        $statusText = match($post->status) {
            'published' => 'publicada',
            'draft' => 'borrador',
            'scheduled' => 'programada',
            default => $post->status,
        };

        $truncatedTitle = \Illuminate\Support\Str::limit($post->title, 50);
        $message = sprintf(
            "La publicación '%s' ha sido creada exitosamente como %s",
            $truncatedTitle,
            $statusText
        );

        session()->flash('success', $message);
        return redirect()->route('admin.posts.index');
    }

    /**
     * Display the specified post.
     */
    public function show(Post $post)
    {
        $post->load(['author:id,name', 'categories:id,name,slug,color', 'tags:id,name,slug']);

        return Inertia::render('Admin/Posts/Show', [
            'post' => [
                'id' => $post->id,
                'title' => $post->title,
                'slug' => $post->slug,
                'excerpt' => $post->excerpt,
                'content' => $post->content,
                'cover_image' => $post->cover_image,
                'status' => $post->status,
                'featured' => $post->featured,
                'published_at' => $post->published_at ? $post->published_at->format('d/m/Y H:i') : null,
                'views_count' => $post->views_count,
                'author' => $post->author,
                'categories' => $post->categories,
                'tags' => $post->tags,
                'seo_title' => $post->seo_title,
                'seo_description' => $post->seo_description,
                'created_at' => $post->created_at->format('d/m/Y H:i'),
                'updated_at' => $post->updated_at->format('d/m/Y H:i'),
            ]
        ]);
    }

    /**
     * Show the form for editing the specified post.
     */
    public function edit(Post $post)
    {
        $post->load(['categories:id', 'tags:id']);

        $categories = Category::active()->ordered()->get(['id', 'name', 'slug', 'color']);
        $tags = Tag::orderBy('name')->get(['id', 'name', 'slug']);
        $authors = User::whereHas('roles', function ($query) {
            $query->whereIn('name', ['super_admin', 'admin', 'editor']);
        })->get(['id', 'name']);

        return Inertia::render('Admin/Posts/Edit', [
            'post' => [
                'id' => $post->id,
                'title' => $post->title,
                'slug' => $post->slug,
                'excerpt' => $post->excerpt,
                'content' => $post->content,
                'cover_image' => $post->cover_image,
                'status' => $post->status,
                'featured' => $post->featured,
                'published_at' => $post->published_at ? $post->published_at->format('Y-m-d\TH:i') : null,
                'user_id' => $post->user_id,
                'categories' => $post->categories->pluck('id'),
                'tags' => $post->tags->pluck('id'),
                'seo_title' => $post->seo_title,
                'seo_description' => $post->seo_description,
            ],
            'categories' => $categories,
            'tags' => $tags,
            'authors' => $authors,
        ]);
    }

    /**
     * Update the specified post.
     */
    public function update(Request $request, Post $post)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'slug' => ['nullable', 'string', 'max:255', Rule::unique('posts')->ignore($post->id)],
            'excerpt' => 'required|string|max:500',
            'content' => 'required|string',
            'cover_image' => 'nullable|string',
            'status' => 'required|in:draft,published,scheduled',
            'featured' => 'boolean',
            'published_at' => 'nullable|date',
            'user_id' => 'nullable|exists:users,id',
            'categories' => 'array',
            'categories.*' => 'exists:categories,id',
            'tags' => 'array',
            'tags.*' => 'exists:tags,id',
            'seo_title' => 'nullable|string|max:255',
            'seo_description' => 'nullable|string|max:255',
        ]);

        // Generate slug if not provided
        if (empty($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['title']);
            
            // Ensure uniqueness
            $originalSlug = $validated['slug'];
            $counter = 1;
            while (Post::where('slug', $validated['slug'])->where('id', '!=', $post->id)->exists()) {
                $validated['slug'] = $originalSlug . '-' . $counter;
                $counter++;
            }
        }

        // Handle published_at.
        if ($validated['status'] === 'published' && !$post->published_at && !$validated['published_at']) {
            $validated['published_at'] = now();
        } elseif ($validated['status'] !== 'published' && $post->status === 'published') {
            // Don't change published_at if moving from published to another status
        }

        $post->update($validated);

        // Sync categories and tags
        $post->categories()->sync($validated['categories'] ?? []);
        $post->tags()->sync($validated['tags'] ?? []);

        // Generate success message with post details
        $truncatedTitle = \Illuminate\Support\Str::limit($post->title, 50);
        $message = sprintf(
            "La publicaciÃ³n '%s' ha sido actualizada exitosamente",
            $truncatedTitle
        );

        return redirect()->route('admin.posts.index')
            ->with('success', $message);
    }

    /**
     * Remove the specified post.
     */
    public function destroy(Post $post)
    {
        // Delete cover image if it exists.
        if ($post->cover_image && Storage::exists($post->cover_image)) {
            Storage::delete($post->cover_image);
        }

        $post->delete();

        return redirect()->route('admin.posts.index')
            ->with('success', 'Post deleted successfully.');
    }

    /**
     * Toggle featured status
     */
    public function toggleFeatured(Post $post)
    {
        $post->update(['featured' => !$post->featured]);

        return response()->json([
            'success' => true,
            'featured' => $post->featured,
            'message' => $post->featured ? 'Post marked as featured.' : 'Post removed from featured.',
        ]);
    }

    /**
     * Change post status
     */
    public function changeStatus(Request $request, Post $post)
    {
        $validated = $request->validate([
            'status' => 'required|in:draft,published,scheduled',
            'published_at' => 'nullable|date',
        ]);

        if ($validated['status'] === 'published' && !$post->published_at && empty($validated['published_at'])) {
            $validated['published_at'] = now();
        }

        $incomingPublishedAt = $validated['published_at'] ?? null;
        if ($incomingPublishedAt) {
            $incomingPublishedAt = Carbon::parse($incomingPublishedAt)->toDateTimeString();
            $validated['published_at'] = $incomingPublishedAt;
        }

        $currentPublishedAt = $post->published_at ? $post->published_at->toDateTimeString() : null;
        if ($post->status === $validated['status'] && $incomingPublishedAt === $currentPublishedAt) {
            return response()->json([
                'success' => true,
                'status' => $post->status,
                'message' => 'El post ya se encuentra en el estado solicitado.',
            ]);
        }

        $revision = null;
        $attributeChanges = false;

        DB::transaction(function () use (&$revision, &$attributeChanges, $post, $validated) {
            $revision = $post->captureRevision('Estado anterior al cambio de estado');

            $post->update($validated);

            $attributeChanges = $post->wasChanged(['status', 'published_at']);
        });

        if (!$attributeChanges && $revision) {
            $revision->delete();
        }

        $post->refresh();

        return response()->json([
            'success' => true,
            'status' => $post->status,
            'message' => 'Post status updated.',
        ]);
    }

    public function revisions(Post $post)
    {
        $revisions = $post->revisions()
            ->with('author:id,name')
            ->latest()
            ->get()
            ->map(function (PostRevision $revision) {
                return [
                    'id' => $revision->id,
                    'summary' => $revision->summary,
                    'author' => $revision->author?->name,
                    'created_at' => $revision->created_at->toIso8601String(),
                    'data' => $revision->data,
                ];
            });

        return response()->json([
            'revisions' => $revisions,
        ]);
    }

    public function restoreRevision(Request $request, Post $post, PostRevision $revision)
    {
        if ($revision->post_id !== $post->id) {
            abort(404);
        }

        $revisionData = $revision->data ?? [];

        if (empty($revisionData)) {
            return redirect()
                ->route('admin.posts.edit', $post->slug)
                ->with('error', 'La revisión seleccionada no contiene datos válidos para restaurar.');
        }

        $syncCategories = collect($revisionData['categories'] ?? [])
            ->filter()
            ->map(fn ($id) => (int) $id)
            ->values()
            ->all();

        $syncTags = collect($revisionData['tags'] ?? [])
            ->filter()
            ->map(fn ($id) => (int) $id)
            ->values()
            ->all();

        $payload = array_merge([
            'title' => $post->title,
            'slug' => $post->slug,
            'excerpt' => $post->excerpt,
            'content' => $post->content,
            'cover_image' => $post->cover_image,
            'status' => $post->status,
            'featured' => $post->featured,
            'published_at' => $post->published_at ? $post->published_at->toDateTimeString() : null,
            'seo_title' => $post->seo_title,
            'seo_description' => $post->seo_description,
            'user_id' => $post->user_id,
        ], Arr::only($revisionData, [
            'title',
            'slug',
            'excerpt',
            'content',
            'cover_image',
            'status',
            'featured',
            'published_at',
            'seo_title',
            'seo_description',
            'user_id',
        ]));

        if (!empty($payload['published_at'])) {
            $payload['published_at'] = Carbon::parse($payload['published_at'])->toDateTimeString();
        }

        $payload['slug'] = $this->ensureUniqueSlug($payload['slug'] ?? $post->slug, $post->id);
        $payload['featured'] = (bool) ($payload['featured'] ?? false);

        $existingCategories = $post->categories()->pluck('id')->sort()->values()->all();
        $existingTags = $post->tags()->pluck('id')->sort()->values()->all();

        $revisionSnapshot = null;
        $attributeChanges = false;
        $categoriesChanged = false;
        $tagsChanged = false;

        DB::transaction(function () use (&$revisionSnapshot, &$attributeChanges, &$categoriesChanged, &$tagsChanged, $post, $payload, $syncCategories, $syncTags, $revision, $existingCategories, $existingTags) {
            $revisionSnapshot = $post->captureRevision('Estado anterior a restaurar la revisión #' . $revision->id);

            $post->update($payload);
            $post->categories()->sync($syncCategories);
            $post->tags()->sync($syncTags);

            $attributeChanges = $post->wasChanged([
                'title',
                'slug',
                'excerpt',
                'content',
                'cover_image',
                'status',
                'featured',
                'published_at',
                'seo_title',
                'seo_description',
                'user_id',
            ]);

            $newCategories = $post->categories()->pluck('id')->sort()->values()->all();
            $newTags = $post->tags()->pluck('id')->sort()->values()->all();

            $categoriesChanged = $existingCategories !== $newCategories;
            $tagsChanged = $existingTags !== $newTags;
        });

        if (!$attributeChanges && !$categoriesChanged && !$tagsChanged && $revisionSnapshot) {
            $revisionSnapshot->delete();
        }

        return redirect()->route('admin.posts.edit', $post->slug)
            ->with('success', 'La revisión seleccionada fue restaurada correctamente.');
    }

    /**
     * Duplicate post
     */
    public function duplicate(Post $post)
    {
        $newPost = $post->replicate();
        $newPost->title = $post->title . ' (Copy)';
        $newPost->slug = $post->slug . '-copy-' . time();
        $newPost->status = 'draft';
        $newPost->featured = false;
        $newPost->published_at = null;
        $newPost->views_count = 0;
        $newPost->user_id = \Illuminate\Support\Facades\Auth::id();
        $newPost->save();

        // Copy relationships
        $newPost->categories()->attach($post->categories->pluck('id'));
        $newPost->tags()->attach($post->tags->pluck('id'));

        return redirect()->route('admin.posts.edit', $newPost)
            ->with('success', 'Post duplicated successfully.');
    }

    /**
     * Bulk actions for posts.
     */
    public function bulkAction(Request $request)
    {
        // âœ… Authorize bulk action capability
        $this->authorize('bulkAction', Post::class);

        $request->validate([
            'action' => 'required|in:delete,publish,draft,feature,unfeature',
            'posts' => 'required|array|max:100', // âœ… Limit to 100 posts
            'posts.*' => 'exists:posts,id'
        ]);

        try {
            // âœ… Get posts as collection to verify authorization for each
            $posts = Post::whereIn('id', $request->posts)->get();

            // âœ… Verify authorization for each post individually
            foreach ($posts as $post) {
                switch ($request->action) {
                    case 'delete':
                        $this->authorize('delete', $post);
                        break;
                    case 'publish':
                        $this->authorize('publish', $post);
                        break;
                    case 'draft':
                        $this->authorize('update', $post);
                        break;
                    case 'feature':
                    case 'unfeature':
                        $this->authorize('feature', $post);
                        break;
                }
            }

            // âœ… Execute action only after all authorizations pass
            $count = 0;
            foreach ($posts as $post) {
                switch ($request->action) {
                    case 'delete':
                        $post->delete();
                        $count++;
                        break;
                    case 'publish':
                        $post->update([
                            'status' => 'published',
                            'published_at' => now()
                        ]);
                        $count++;
                        break;
                    case 'draft':
                        $post->update(['status' => 'draft']);
                        $count++;
                        break;
                    case 'feature':
                        $post->update(['featured' => true]);
                        $count++;
                        break;
                    case 'unfeature':
                        $post->update(['featured' => false]);
                        $count++;
                        break;
                }
            }

            $message = "{$count} post(s) processed successfully.";

            return response()->json([
                'success' => true,
                'message' => $message
            ]);
        } catch (\Illuminate\Auth\Access\AuthorizationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'You do not have permission to perform this action on one or more posts.',
            ], 403);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Bulk action failed: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get post analytics.
     */
    public function analytics()
    {
        try {
            $stats = [
                'total_posts' => Post::count(),
                'published_posts' => Post::where('status', 'published')->count(),
                'draft_posts' => Post::where('status', 'draft')->count(),
                'scheduled_posts' => Post::where('status', 'scheduled')->count(),
                'featured_posts' => Post::where('featured', true)->count(),
                'total_views' => Post::sum('views_count'),
                'avg_views_per_post' => round(Post::avg('views_count'), 2),
                'posts_this_month' => Post::whereMonth('created_at', now()->month)->count(),
                'posts_last_month' => Post::whereMonth('created_at', now()->subMonth()->month)->count(),
            ];

            $topPosts = Post::orderBy('views_count', 'desc')
                ->limit(10)
                ->get(['id', 'title', 'views_count', 'published_at']);

            $recentPosts = Post::orderBy('created_at', 'desc')
                ->limit(10)
                ->with(['author:id,name'])
                ->get(['id', 'title', 'status', 'created_at', 'user_id']);

            $categoryStats = Category::withCount('posts')
                ->orderBy('posts_count', 'desc')
                ->limit(10)
                ->get(['id', 'name', 'posts_count']);

            return response()->json([
                'stats' => $stats,
                'top_posts' => $topPosts,
                'recent_posts' => $recentPosts,
                'category_stats' => $categoryStats
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to load analytics: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Export posts to Excel/CSV using Laravel Excel.
     */
    public function export(Request $request)
    {
        $filters = [
            'search' => $request->get('search'),
            'status' => $request->get('status'),
            'category_id' => $request->get('category'),
            'featured' => $request->get('featured'),
        ];

        $format = $request->get('format', 'xlsx'); // xlsx, csv
        $filename = 'posts_' . now()->format('Y-m-d_H-i-s');

        try {
            return \Maatwebsite\Excel\Facades\Excel::download(
                new \App\Exports\PostsExport($filters),
                $filename . '.' . $format
            );
        } catch (\Exception $e) {
            \Log::error('Post export failed', [
                'user_id' => auth()->id(),
                'error' => $e->getMessage(),
            ]);

            return back()->with('error', 'Error al exportar posts: ' . $e->getMessage());
        }
    }
    private function ensureUniqueSlug(?string $slug, ?int $ignoreId = null): string
    {
        $slug = $slug ?: Str::slug(Str::random(8));
        $baseSlug = $slug;
        $counter = 1;

        while (
            Post::where('slug', $slug)
                ->when($ignoreId, fn ($query) => $query->where('id', '!=', $ignoreId))
                ->exists()
        ) {
            $slug = $baseSlug . '-' . $counter;
            $counter++;
        }

        return $slug;
    }

}
