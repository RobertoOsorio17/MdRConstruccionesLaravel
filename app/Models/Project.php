<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

/**
 * Represents portfolio projects showcased on the site, including metadata for scheduling, budget, and media galleries.
 * Supplies scopes for featured, published, and completed work to power front-end displays.
 */
class Project extends Model
{
    use SoftDeletes;
    protected $fillable = [
        'title',
        'slug',
        'summary',
        'body',
        'gallery',
        'location',
        'budget_estimate',
        'start_date',
        'end_date',
        'featured',
        'status',
        'views_count',
    ];

    protected $casts = [
        'gallery' => 'array',
        'budget_estimate' => 'decimal:2',
        'start_date' => 'date',
        'end_date' => 'date',
        'featured' => 'boolean',
        'views_count' => 'integer',
    ];

    /**
     * Scope a query to only include published projects.
     */
    public function scopePublished($query)
    {
        return $query->where('status', 'published');
    }

    /**
     * Scope a query to only include completed projects.
     */
    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    /**
     * Scope a query to only include featured projects.
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
     * Get the first image from gallery.
     */
    public function getCoverImageAttribute()
    {
        return $this->gallery && count($this->gallery) > 0 ? $this->gallery[0] : null;
    }

    /**
     * Get project duration in days.
     */
    public function getDurationInDaysAttribute()
    {
        if ($this->start_date && $this->end_date) {
            return $this->start_date->diffInDays($this->end_date);
        }
        return null;
    }

    /**
     * Get formatted budget estimate.
     */
    public function getFormattedBudgetAttribute()
    {
        if ($this->budget_estimate) {
            return number_format($this->budget_estimate, 0, ',', '.') . ' €'; // ✅ Fixed encoding
        }
        return 'Consultar';
    }

    /**
     * Increment the views count.
     */
    public function incrementViews()
    {
        $this->increment('views_count');
    }
}
