<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;
use App\Models\MLPostVector;

/**
 * Encapsulates blog posts with editorial metadata, relationships, and rich helper methods for engagement features.
 * Supports moderation, recommendations, and analytics via scopes, accessors, and administrative utilities.
 */
class Post extends Model
{
    use HasFactory, SoftDeletes;
    protected $fillable = [
        'title',
        'slug',
        'excerpt',
        'content',
        'cover_image',
        'published_at',
        'seo_title',
        'seo_description',
        // REMOVED: 'user_id' - Use setAuthor() method instead for security
        'status',
        'featured',
    ];

    // âœ… Protected fields that should NOT be mass-assignable
    protected $guarded = [
        'id',
        'views_count', // âœ… CRITICAL: Prevent manipulation of view counts
        'user_id', // ✅ SECURITY FIX: Prevent post ownership manipulation
        'created_at',
        'updated_at',
    ];

    /**
     * Fields that should only be updated by administrators or the system
     */
    protected $adminOnlyFields = [
        'user_id',
        'status',
        'views_count',
        'featured',
    ];

    protected $casts = [
        'published_at' => 'datetime',
        'featured' => 'boolean',
        'views_count' => 'integer',
        'reading_time' => 'integer',
    ];

    /**
     * Boot the model and register event listeners
     */
    protected static function booted(): void
    {
        // Automatically calculate reading time when content changes
        static::saving(function ($post) {
            if ($post->isDirty('content')) {
                $readingTimeService = app(\App\Services\ReadingTimeService::class);
                $post->reading_time = $readingTimeService->calculate($post->content);
            }
        });
    }

    
    
    
    
    /**

    
    
    
     * Handle author.

    
    
    
     *

    
    
    
     * @return BelongsTo

    
    
    
     */
    
    
    
    
    
    
    
    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    
    
    
    
    /**

    
    
    
     * Handle categories.

    
    
    
     *

    
    
    
     * @return BelongsToMany

    
    
    
     */
    
    
    
    
    
    
    
    public function categories(): BelongsToMany
    {
        return $this->belongsToMany(Category::class, 'post_category')
                    ->withTimestamps();
    }

    
    
    
    
    /**

    
    
    
     * Handle tags.

    
    
    
     *

    
    
    
     * @return BelongsToMany

    
    
    
     */
    
    
    
    
    
    
    
    public function tags(): BelongsToMany
    {
        return $this->belongsToMany(Tag::class, 'post_tag')
                    ->withTimestamps();
    }

    
    
    
    
    /**

    
    
    
     * Handle comments.

    
    
    
     *

    
    
    
     * @return HasMany

    
    
    
     */
    
    
    
    
    
    
    
    public function comments(): HasMany
    {
        return $this->hasMany(Comment::class);
    }

    
    
    
    
    /**

    
    
    
     * Handle approved comments.

    
    
    
     *

    
    
    
     * @return HasMany

    
    
    
     */
    
    
    
    
    
    
    
    public function approvedComments(): HasMany
    {
        return $this->hasMany(Comment::class)->where('status', 'approved');
    }
    
    
    
    
    
    /**

    
    
    
     * Handle interactions.

    
    
    
     *

    
    
    
     * @return void

    
    
    
     */
    
    
    
    
    
    
    
    public function interactions()
    {
        return $this->morphMany(UserInteraction::class, 'interactable');
    }
    
    
    
    
    
    /**

    
    
    
     * Handle likes.

    
    
    
     *

    
    
    
     * @return void

    
    
    
     */
    
    
    
    
    
    
    
    public function likes()
    {
        return $this->morphMany(UserInteraction::class, 'interactable')
                    ->where('type', UserInteraction::TYPE_LIKE);
    }
    
    
    
    
    
    /**

    
    
    
     * Handle bookmarks.

    
    
    
     *

    
    
    
     * @return void

    
    
    
     */
    
    
    
    
    
    
    
    public function bookmarks()
    {
        return $this->morphMany(UserInteraction::class, 'interactable')
                    ->where('type', UserInteraction::TYPE_BOOKMARK);
    }
    
    
    
    
    
    /**

    
    
    
     * Handle liked by users.

    
    
    
     *

    
    
    
     * @return void

    
    
    
     */
    
    
    
    
    
    
    
    public function likedByUsers()
    {
        return $this->morphToMany(User::class, 'interactable', 'user_interactions')
                    ->wherePivot('type', UserInteraction::TYPE_LIKE);
    }
    
    
    
    
    
    /**

    
    
    
     * Handle bookmarked by users.

    
    
    
     *

    
    
    
     * @return void

    
    
    
     */
    
    
    
    
    
    
    
    public function bookmarkedByUsers()
    {
        return $this->morphToMany(User::class, 'interactable', 'user_interactions')
                    ->wherePivot('type', UserInteraction::TYPE_BOOKMARK);
    }
    
    
    
    
    
    /**

    
    
    
     * Get likes count attribute.

    
    
    
     *

    
    
    
     * @return void

    
    
    
     */
    
    
    
    
    
    
    
    public function getLikesCountAttribute()
    {
        return $this->likes()->count();
    }
    
    
    
    
    
    /**

    
    
    
     * Get bookmarks count attribute.

    
    
    
     *

    
    
    
     * @return void

    
    
    
     */
    
    
    
    
    
    
    
    public function getBookmarksCountAttribute()
    {
        return $this->bookmarks()->count();
    }

    
    
    
    
    /**

    
    
    
     * Handle ml vector.

    
    
    
     *

    
    
    
     * @return HasOne

    
    
    
     */
    
    
    
    
    
    
    
    public function mlVector(): HasOne
    {
        return $this->hasOne(MLPostVector::class);
    }

    
    
    
    
    /**

    
    
    
     * Determine whether liked by.

    
    
    
     *

    
    
    
     * @param ?User $user The user.

    
    
    
     * @return bool

    
    
    
     */
    
    
    
    
    
    
    
    public function isLikedBy(?User $user): bool
    {
        if (!$user) return false;

        return $this->likes()->where('user_id', $user->id)->exists();
    }

    
    
    
    
    /**

    
    
    
     * Determine whether bookmarked by.

    
    
    
     *

    
    
    
     * @param ?User $user The user.

    
    
    
     * @return bool

    
    
    
     */
    
    
    
    
    
    
    
    public function isBookmarkedBy(?User $user): bool
    {
        if (!$user) return false;

        return $this->bookmarks()->where('user_id', $user->id)->exists();
    }

    
    
    
    
    /**

    
    
    
     * Handle scope published.

    
    
    
     *

    
    
    
     * @param mixed $query The query.

    
    
    
     * @return void

    
    
    
     */
    
    
    
    
    
    
    
    public function scopePublished($query)
    {
        return $query->where('status', 'published')
                    ->where('published_at', '<=', now());
    }

    
    
    
    
    /**

    
    
    
     * Set author.

    
    
    
     *

    
    
    
     * @param User $author The author.

    
    
    
     * @param User $admin The admin.

    
    
    
     * @return bool

    
    
    
     */
    
    
    
    
    
    
    
    public function setAuthor(User $author, User $admin): bool
    {
        if (!$admin->hasRole('admin') && !$admin->hasRole('editor')) {
            throw new \Exception('Only administrators and editors can set post authors.');
        }

        $this->user_id = $author->id;
        return $this->save();
    }

    
    
    
    
    /**

    
    
    
     * Handle scope featured.

    
    
    
     *

    
    
    
     * @param mixed $query The query.

    
    
    
     * @return void

    
    
    
     */
    
    
    
    
    
    
    
    public function scopeFeatured($query)
    {
        return $query->where('featured', true);
    }

    
    
    
    
    /**

    
    
    
     * Get route key name.

    
    
    
     *

    
    
    
     * @return string

    
    
    
     */
    
    
    
    
    
    
    
    public function getRouteKeyName(): string
    {
        return 'slug';
    }

    
    
    
    
    /**

    
    
    
     * Get seo title attribute.

    
    
    
     *

    
    
    
     * @param mixed $value The value.

    
    
    
     * @return string

    
    
    
     */
    
    
    
    
    
    
    
    public function getSeoTitleAttribute($value): string
    {
        return $value ?: $this->title;
    }

    
    
    
    
    /**

    
    
    
     * Get seo description attribute.

    
    
    
     *

    
    
    
     * @param mixed $value The value.

    
    
    
     * @return string

    
    
    
     */
    
    
    
    
    
    
    
    public function getSeoDescriptionAttribute($value): string
    {
        $excerpt = $this->excerpt ?? '';
        return $value ?: Str::limit(strip_tags($excerpt), 160);
    }

    
    
    
    
    /**

    
    
    
     * Handle increment views.

    
    
    
     *

    
    
    
     * @return void

    
    
    
     */
    
    
    
    
    
    
    
    public function incrementViews(): void
    {
        $this->increment('views_count');
    }

    
    
    
    
    /**

    
    
    
     * Handle capture revision.

    
    
    
     *

    
    
    
     * @param ?string $summary The summary.

    
    
    
     * @return PostRevision

    
    
    
     */
    
    
    
    
    
    
    
    public function captureRevision(?string $summary = null): PostRevision
    {
        return PostRevision::create([
            'post_id' => $this->id,
            'user_id' => auth()->id(),
            'summary' => $summary ?? 'Revisión automática',
            'data' => [
                'title' => $this->title,
                'slug' => $this->slug,
                'excerpt' => $this->excerpt,
                'content' => $this->content,
                'cover_image' => $this->cover_image,
                'status' => $this->status,
                'featured' => $this->featured,
                'published_at' => $this->published_at?->toDateTimeString(),
                'seo_title' => $this->seo_title,
                'seo_description' => $this->seo_description,
                'user_id' => $this->user_id,
                'categories' => $this->categories->pluck('id')->toArray(),
                'tags' => $this->tags->pluck('id')->toArray(),
            ],
        ]);
    }

    
    
    
    
    /**

    
    
    
     * Get reading time attribute.

    
    
    
     *

    
    
    
     * @return void

    
    
    
     */
    
    
    
    
    
    
    
    public function getReadingTimeAttribute()
    {
        $content = $this->content ?? '';
        $wordCount = str_word_count(strip_tags($content));
        $readingTime = ceil($wordCount / 200); // Promedio 200 palabras por minuto
        return max(1, $readingTime);
    }

    
    
    
    
    /**

    
    
    
     * Get related posts.

    
    
    
     *

    
    
    
     * @param int $limit The limit.

    
    
    
     * @return void

    
    
    
     */
    
    
    
    
    
    
    
    public function getRelatedPosts(int $limit = 3)
    {
        $categoryIds = $this->categories->pluck('id');
        $tagIds = $this->tags->pluck('id');

        $query = static::published()
            ->where('id', '!=', $this->id);

        // Only add relationship filters if we have categories or tags
        if ($categoryIds->isNotEmpty() || $tagIds->isNotEmpty()) {
            $query->where(function ($q) use ($categoryIds, $tagIds) {
                if ($categoryIds->isNotEmpty()) {
                    $q->whereHas('categories', function ($categoryQuery) use ($categoryIds) {
                        $categoryQuery->whereIn('categories.id', $categoryIds);
                    });
                }
                if ($tagIds->isNotEmpty()) {
                    $q->orWhereHas('tags', function ($tagQuery) use ($tagIds) {
                        $tagQuery->whereIn('tags.id', $tagIds);
                    });
                }
            });
        }

        return $query
            ->withCount(['likes', 'bookmarks', 'comments'])
            ->with(['author:id,name,avatar', 'categories:id,name,slug', 'tags:id,name,slug,color'])
            ->orderByDesc('published_at')
            ->limit($limit)
            ->get();
    }
    
    
    
    
    
    /**

    
    
    
     * Get suggested posts.

    
    
    
     *

    
    
    
     * @param mixed $limit The limit.

    
    
    
     * @return void

    
    
    
     */
    
    
    
    
    
    
    
    public function getSuggestedPosts($limit = 4)
    {
        $categoryIds = $this->categories->pluck('id');
        $tagIds = $this->tags->pluck('id');
        
        // Posts con mayor relevancia por categorÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â­as y etiquetas compartidas
        if ($categoryIds->isEmpty() && $tagIds->isEmpty()) {
            // Si no hay categorÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â­as ni etiquetas, usar posts populares directamente
            return static::published()
                ->where('id', '!=', $this->id)
                ->with(['author:id,name,avatar', 'categories:id,name,slug', 'tags:id,name,slug,color'])
                ->withCount(['likes', 'bookmarks', 'approvedComments'])
                ->orderByDesc('views_count')
                ->orderByDesc('published_at')
                ->limit($limit)
                ->get();
        }
        
        // Construir la query de relevancia de forma segura usando parÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¡metros
        $query = static::published()
            ->where('id', '!=', $this->id)
            ->select('posts.*');

        // Construir la query de relevancia usando parÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¡metros seguros
        $relevanceQuery = '(posts.views_count / 100) + (posts.featured * 1)';
        $bindings = [];

        if ($categoryIds->isNotEmpty()) {
            $categoryPlaceholders = str_repeat('?,', count($categoryIds) - 1) . '?';
            $relevanceQuery .= " + (SELECT COUNT(*) FROM post_category pc WHERE pc.post_id = posts.id AND pc.category_id IN ({$categoryPlaceholders})) * 3";
            $bindings = array_merge($bindings, $categoryIds->toArray());
        }

        if ($tagIds->isNotEmpty()) {
            $tagPlaceholders = str_repeat('?,', count($tagIds) - 1) . '?';
            $relevanceQuery .= " + (SELECT COUNT(*) FROM post_tag pt WHERE pt.post_id = posts.id AND pt.tag_id IN ({$tagPlaceholders})) * 2";
            $bindings = array_merge($bindings, $tagIds->toArray());
        }

        $posts = $query
            ->selectRaw("({$relevanceQuery}) as relevance_score", $bindings)
            ->having('relevance_score', '>', 0)
            ->with(['author:id,name,avatar', 'categories:id,name,slug', 'tags:id,name,slug,color'])
            ->withCount(['likes', 'bookmarks', 'approvedComments'])
            ->orderByDesc('relevance_score')
            ->orderByDesc('published_at')
            ->limit($limit)
            ->get();
            
        // Si no hay suficientes posts relacionados, completar con posts populares
        if ($posts->count() < $limit) {
            $remainingLimit = $limit - $posts->count();
            $excludeIds = $posts->pluck('id')->push($this->id);
            
            $popularPosts = static::published()
                ->whereNotIn('id', $excludeIds)
                ->with(['author:id,name,avatar', 'categories:id,name,slug', 'tags:id,name,slug,color'])
                ->withCount(['likes', 'bookmarks', 'approvedComments'])
                ->orderByDesc('views_count')
                ->orderByDesc('published_at')
                ->limit($remainingLimit)
                ->get();
                
            $posts = $posts->merge($popularPosts);
        }
        
        return $posts;
    }

    
    
    
    
    /**

    
    
    
     * Get formatted excerpt attribute.

    
    
    
     *

    
    
    
     * @return void

    
    
    
     */
    
    
    
    
    
    
    
    public function getFormattedExcerptAttribute()
    {
        if ($this->excerpt) {
            return $this->excerpt;
        }

        return Str::limit(strip_tags($this->content), 150);
    }

    
    
    
    
    /**

    
    
    
     * Handle update status.

    
    
    
     *

    
    
    
     * @param string $status The status.

    
    
    
     * @param User $admin The admin.

    
    
    
     * @return bool

    
    
    
     */
    
    
    
    
    
    
    
    public function updateStatus(string $status, User $admin): bool
    {
        if (!$admin->hasRole('admin') && !$admin->hasRole('editor')) {
            throw new \Exception('Only administrators and editors can update post status.');
        }

        $validStatuses = ['draft', 'published', 'archived'];
        if (!in_array($status, $validStatuses)) {
            throw new \Exception('Invalid post status.');
        }

        return $this->update(['status' => $status]);
    }

    
    
    
    
    /**

    
    
    
     * Handle toggle featured.

    
    
    
     *

    
    
    
     * @param User $admin The admin.

    
    
    
     * @return bool

    
    
    
     */
    
    
    
    
    
    
    
    public function toggleFeatured(User $admin): bool
    {
        if (!$admin->hasRole('admin') && !$admin->hasRole('editor')) {
            throw new \Exception('Only administrators and editors can feature posts.');
        }

        return $this->update(['featured' => !$this->featured]);
    }


}


