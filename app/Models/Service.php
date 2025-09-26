<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Service extends Model
{
    protected $fillable = [
        'title',
        'slug',
        'excerpt',
        'description',
        'body',
        'icon',
        'image',
        'price',
        'faq',
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
                // Primera decodificación
                $firstDecode = json_decode($value, true);
                
                // Si la primera decodificación devuelve un string, hacer una segunda decodificación
                if (is_string($firstDecode)) {
                    $secondDecode = json_decode($firstDecode, true);
                    return is_array($secondDecode) ? $secondDecode : [];
                }
                
                // Si la primera decodificación ya devolvió un array, usarlo
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
            $faq = $this->faq; // Esto usará el accessor personalizado
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
}
