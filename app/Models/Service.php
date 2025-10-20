<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * Represents public-facing service offerings with rich metadata, relationships, and engagement metrics.
 * Exposes scopes for active/featured listings and accessor logic for FAQs, reviews, and favorites.
 */
class Service extends Model
{
    use SoftDeletes;
    protected $fillable = [
        'title',
        'slug',
        'excerpt',
        'description',
        'body',
        'icon',
        'image',
        'featured_image',
        'video_url',
        'price',
        'faq',
        'metrics',
        'benefits',
        'process_steps',
        'guarantees',
        'certifications',
        'gallery',
        'cta_primary_text',
        'cta_secondary_text',
        'sort_order',
        'is_active',
        'featured',
        'status',
        'views_count',
        'category_id',
    ];

    protected $casts = [
        'sort_order' => 'integer',
        'is_active' => 'boolean',
        'featured' => 'boolean',
        'views_count' => 'integer',
        'price' => 'decimal:2',
        'metrics' => 'array',
        'benefits' => 'array',
        'faq' => 'array',
        'process_steps' => 'array',
        'guarantees' => 'array',
        'certifications' => 'array',
        'gallery' => 'array',
    ];

    /**
     * Get the faq attribute and handle double-encoded JSON.
     */
    public function getFaqAttribute($value)
    {
        if (is_null($value) || $value === '') {
            return [];
        }
        
        // Si ya es un array, devolverlo directamente
        if (is_array($value)) {
            return $value;
        }
        
        if (is_string($value)) {
            try {
                // Primera decodificaciÃƒÆ’Ã‚Â³n
                $firstDecode = json_decode($value, true);
                
                // Si la primera decodificaciÃƒÆ’Ã‚Â³n devuelve un string, hacer una segunda decodificaciÃƒÆ’Ã‚Â³n
                if (is_string($firstDecode)) {
                    $secondDecode = json_decode($firstDecode, true);
                    return is_array($secondDecode) ? $secondDecode : [];
                }
                
                // Si la primera decodificaciÃƒÆ’Ã‚Â³n ya devolviÃƒÆ’Ã‚Â³ un array, usarlo
                return is_array($firstDecode) ? $firstDecode : [];
                
            } catch (\Exception $e) {
                return [];
            }
        }
        
        return [];
    }

    /**
     * Scope a query to only include active services.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope a query to only include featured services.
     */
    public function scopeFeatured($query)
    {
        return $query->where('featured', true);
    }

    /**
     * Scope a query to order services by sort_order.
     */
    public function scopeOrdered($query)
    {
        return $query->orderBy('sort_order');
    }

    /**
     * Get the route key for the model.
     */
    public function getRouteKeyName()
    {
        return 'slug';
    }

    /**
     * Get FAQ count.
     */
    public function getFaqCountAttribute()
    {
        try {
            $faq = $this->faq; // Esto usarÃƒÆ’Ã‚Â¡ el accessor personalizado
            if (is_array($faq)) {
                return count($faq);
            }
            if (is_string($faq)) {
                $decoded = json_decode($faq, true);
                return is_array($decoded) ? count($decoded) : 0;
            }
            return 0;
        } catch (\Exception $e) {
            \Log::warning('Error getting FAQ count for service ' . $this->id . ': ' . $e->getMessage());
            return 0;
        }
    }

    /**
     * Get users who have favorited this service.
     */
    public function favoritedByUsers()
    {
        return $this->belongsToMany(User::class, 'user_service_favorites')
                    ->withTimestamps()
                    ->orderBy('user_service_favorites.created_at', 'desc');
    }

    /**
     * Get the service favorites (pivot model).
     */
    public function serviceFavorites()
    {
        return $this->hasMany(ServiceFavorite::class);
    }

    /**
     * Alias for serviceFavorites for easier access.
     */
    public function favorites()
    {
        return $this->hasMany(ServiceFavorite::class);
    }

    /**
     * Get the count of users who have favorited this service.
     */
    public function getFavoritesCountAttribute()
    {
        return $this->serviceFavorites()->count();
    }

    /**
     * Check if a specific user has favorited this service.
     */
    public function isFavoritedBy(User $user): bool
    {
        return $this->favoritedByUsers()->where('user_id', $user->id)->exists();
    }

    /**
     * Get the category that owns the service.
     */
    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    /**
     * Get all reviews for the service.
     */
    public function reviews()
    {
        return $this->morphMany(Review::class, 'reviewable');
    }

    /**
     * Get approved reviews only.
     */
    public function approvedReviews()
    {
        return $this->morphMany(Review::class, 'reviewable')
            ->where('status', 'approved')
            ->latest();
    }

    /**
     * Get average rating.
     */
    public function getAverageRatingAttribute()
    {
        return $this->approvedReviews()->avg('rating') ?? 0;
    }

    /**
     * Get total reviews count.
     */
    public function getReviewsCountAttribute()
    {
        return $this->approvedReviews()->count();
    }

    /**
     * Get rating distribution (count per star).
     */
    public function getRatingDistributionAttribute()
    {
        $distribution = [];
        for ($i = 1; $i <= 5; $i++) {
            $distribution[$i] = $this->approvedReviews()->where('rating', $i)->count();
        }
        return $distribution;
    }
}
