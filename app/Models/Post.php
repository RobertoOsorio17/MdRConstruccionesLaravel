<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

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
        'user_id', // Allow setting user_id (will be validated by policies)
        'status',
        'featured',
    ];

    // âœ… Protected fields that should NOT be mass-assignable
    protected $guarded = [
        'id',
        'views_count', // âœ… CRITICAL: Prevent manipulation of view counts
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
     * Get the author of the post.
     */
    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * Get the categories for the post.
     */
    public function categories(): BelongsToMany
    {
        return $this->belongsToMany(Category::class, 'post_category')
                    ->withTimestamps();
    }

    /**
     * Get the tags for the post.
     */
    public function tags(): BelongsToMany
    {
        return $this->belongsToMany(Tag::class, 'post_tag')
                    ->withTimestamps();
    }

    /**
     * Get the comments for the post.
     */
    public function comments(): HasMany
    {
        return $this->hasMany(Comment::class);
    }

    /**
     * Get approved comments for the post.
     */
    public function approvedComments(): HasMany
    {
        return $this->hasMany(Comment::class)->where('status', 'approved');
    }
    
    /**
     * Todas las interacciones del post (likes, bookmarks, etc.)
     */
    public function interactions()
    {
        return $this->morphMany(UserInteraction::class, 'interactable');
    }
    
    /**
     * Likes del post
     */
    public function likes()
    {
        return $this->morphMany(UserInteraction::class, 'interactable')
                    ->where('type', UserInteraction::TYPE_LIKE);
    }
    
    /**
     * Bookmarks del post
     */
    public function bookmarks()
    {
        return $this->morphMany(UserInteraction::class, 'interactable')
                    ->where('type', UserInteraction::TYPE_BOOKMARK);
    }
    
    /**
     * Usuarios que han dado like al post
     */
    public function likedByUsers()
    {
        return $this->morphToMany(User::class, 'interactable', 'user_interactions')
                    ->wherePivot('type', UserInteraction::TYPE_LIKE);
    }
    
    /**
     * Usuarios que han guardado el post
     */
    public function bookmarkedByUsers()
    {
        return $this->morphToMany(User::class, 'interactable', 'user_interactions')
                    ->wherePivot('type', UserInteraction::TYPE_BOOKMARK);
    }
    
    /**
     * Contar likes
     */
    public function getLikesCountAttribute()
    {
        return $this->likes()->count();
    }
    
    /**
     * Contar bookmarks
     */
    public function getBookmarksCountAttribute()
    {
        return $this->bookmarks()->count();
    }
    
    /**
     * Verificar si un usuario ha dado like al post
     */
    public function isLikedBy($user)
    {
        if (!$user) return false;
        
        return $this->likes()->where('user_id', $user->id)->exists();
    }
    
    /**
     * Verificar si un usuario ha guardado el post
     */
    public function isBookmarkedBy($user)
    {
        if (!$user) return false;
        
        return $this->bookmarks()->where('user_id', $user->id)->exists();
    }

    /**
     * Scope a query to only include published posts.
     */
    public function scopePublished($query)
    {
        return $query->where('status', 'published')
                    ->where('published_at', '<=', now());
    }

    /**
     * Scope a query to only include featured posts.
     */
    public function scopeFeatured($query)
    {
        return $query->where('featured', true);
    }

    /**
     * Get the route key for the model.
     */
    public function getRouteKeyName()
    {
        return 'slug';
    }

    /**
     * Get the SEO title or fall back to title.
     */
    public function getSeoTitleAttribute($value)
    {
        return $value ?: $this->title;
    }

    /**
     * Get the SEO description or fall back to excerpt.
     */
    public function getSeoDescriptionAttribute($value)
    {
        return $value ?: Str::limit(strip_tags($this->excerpt), 160);
    }

    /**
     * Increment the views count.
     */
    public function incrementViews()
    {
        $this->increment('views_count');
    }

    /**
     * Obtener el tiempo estimado de lectura en minutos
     */
    public function getReadingTimeAttribute()
    {
        $wordCount = str_word_count(strip_tags($this->content));
        $readingTime = ceil($wordCount / 200); // Promedio 200 palabras por minuto
        return max(1, $readingTime);
    }

    /**
     * Obtener posts relacionados/sugeridos basados en categorÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â­as y etiquetas
     */
    public function getRelatedPosts($limit = 3)
    {
        $categoryIds = $this->categories->pluck('id');
        $tagIds = $this->tags->pluck('id');
        
        return static::published()
            ->where('id', '!=', $this->id)
            ->where(function ($query) use ($categoryIds, $tagIds) {
                if ($categoryIds->isNotEmpty()) {
                    $query->whereHas('categories', function ($q) use ($categoryIds) {
                        $q->whereIn('categories.id', $categoryIds);
                    });
                }
                if ($tagIds->isNotEmpty()) {
                    $query->orWhereHas('tags', function ($q) use ($tagIds) {
                        $q->whereIn('tags.id', $tagIds);
                    });
                }
            })
            ->withCount(['likes', 'bookmarks', 'comments'])
            ->with(['author:id,name,avatar', 'categories:id,name,slug', 'tags:id,name,slug,color'])
            ->orderByDesc('published_at')
            ->limit($limit)
            ->get();
    }
    
    /**
     * Obtener posts sugeridos inteligentes basados en mÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Âºltiples factores
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
     * Obtener el extracto formateado
     */
    public function getFormattedExcerptAttribute()
    {
        if ($this->excerpt) {
            return $this->excerpt;
        }

        return Str::limit(strip_tags($this->content), 150);
    }

    /**
     * Administrative method to set post author
     */
    public function setAuthor(User $author, User $admin): bool
    {
        if (!$admin->hasRole('admin') && !$admin->hasRole('editor')) {
            throw new \Exception('Only administrators and editors can set post authors.');
        }

        return $this->update(['user_id' => $author->id]);
    }

    /**
     * Administrative method to update post status
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
     * Administrative method to feature/unfeature post
     */
    public function toggleFeatured(User $admin): bool
    {
        if (!$admin->hasRole('admin') && !$admin->hasRole('editor')) {
            throw new \Exception('Only administrators and editors can feature posts.');
        }

        return $this->update(['featured' => !$this->featured]);
    }


}


