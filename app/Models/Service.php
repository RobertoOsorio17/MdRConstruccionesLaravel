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

    
    
    
     * Get faq attribute.

    
    
    
     *

    
    
    
     * @param mixed $value The value.

    
    
    
     * @return void

    
    
    
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

    
    
    
     * Handle scope active.

    
    
    
     *

    
    
    
     * @param mixed $query The query.

    
    
    
     * @return void

    
    
    
     */
    
    
    
    
    
    
    
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
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

    
    
    
     * Handle scope ordered.

    
    
    
     *

    
    
    
     * @param mixed $query The query.

    
    
    
     * @return void

    
    
    
     */
    
    
    
    
    
    
    
    public function scopeOrdered($query)
    {
        return $query->orderBy('sort_order');
    }

    
    
    
    
    /**

    
    
    
     * Get route key name.

    
    
    
     *

    
    
    
     * @return void

    
    
    
     */
    
    
    
    
    
    
    
    public function getRouteKeyName()
    {
        return 'slug';
    }

    
    
    
    
    /**

    
    
    
     * Get faq count attribute.

    
    
    
     *

    
    
    
     * @return void

    
    
    
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

    
    
    
     * Handle favorited by users.

    
    
    
     *

    
    
    
     * @return void

    
    
    
     */
    
    
    
    
    
    
    
    public function favoritedByUsers()
    {
        return $this->belongsToMany(User::class, 'user_service_favorites')
                    ->withTimestamps()
                    ->orderBy('user_service_favorites.created_at', 'desc');
    }

    
    
    
    
    /**

    
    
    
     * Handle service favorites.

    
    
    
     *

    
    
    
     * @return void

    
    
    
     */
    
    
    
    
    
    
    
    public function serviceFavorites()
    {
        return $this->hasMany(ServiceFavorite::class);
    }

    
    
    
    
    /**

    
    
    
     * Handle favorites.

    
    
    
     *

    
    
    
     * @return void

    
    
    
     */
    
    
    
    
    
    
    
    public function favorites()
    {
        return $this->hasMany(ServiceFavorite::class);
    }

    
    
    
    
    /**

    
    
    
     * Get favorites count attribute.

    
    
    
     *

    
    
    
     * @return void

    
    
    
     */
    
    
    
    
    
    
    
    public function getFavoritesCountAttribute()
    {
        return $this->serviceFavorites()->count();
    }

    
    
    
    
    /**

    
    
    
     * Determine whether favorited by.

    
    
    
     *

    
    
    
     * @param User $user The user.

    
    
    
     * @return bool

    
    
    
     */
    
    
    
    
    
    
    
    public function isFavoritedBy(User $user): bool
    {
        return $this->favoritedByUsers()->where('user_id', $user->id)->exists();
    }

    
    
    
    
    /**

    
    
    
     * Handle category.

    
    
    
     *

    
    
    
     * @return void

    
    
    
     */
    
    
    
    
    
    
    
    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    
    
    
    
    /**

    
    
    
     * Handle reviews.

    
    
    
     *

    
    
    
     * @return void

    
    
    
     */
    
    
    
    
    
    
    
    public function reviews()
    {
        return $this->morphMany(Review::class, 'reviewable');
    }

    
    
    
    
    /**

    
    
    
     * Handle approved reviews.

    
    
    
     *

    
    
    
     * @return void

    
    
    
     */
    
    
    
    
    
    
    
    public function approvedReviews()
    {
        return $this->morphMany(Review::class, 'reviewable')
            ->where('status', 'approved')
            ->latest();
    }

    
    
    
    
    /**

    
    
    
     * Get average rating attribute.

    
    
    
     *

    
    
    
     * @return void

    
    
    
     */
    
    
    
    
    
    
    
    public function getAverageRatingAttribute()
    {
        return $this->approvedReviews()->avg('rating') ?? 0;
    }

    
    
    
    
    /**

    
    
    
     * Get reviews count attribute.

    
    
    
     *

    
    
    
     * @return void

    
    
    
     */
    
    
    
    
    
    
    
    public function getReviewsCountAttribute()
    {
        return $this->approvedReviews()->count();
    }

    
    
    
    
    /**

    
    
    
     * Get rating distribution attribute.

    
    
    
     *

    
    
    
     * @return void

    
    
    
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
