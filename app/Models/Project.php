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

    
    
    
     * Handle scope published.

    
    
    
     *

    
    
    
     * @param mixed $query The query.

    
    
    
     * @return void

    
    
    
     */
    
    
    
    
    
    
    
    public function scopePublished($query)
    {
        return $query->where('status', 'published');
    }

    
    
    
    
    /**

    
    
    
     * Handle scope completed.

    
    
    
     *

    
    
    
     * @param mixed $query The query.

    
    
    
     * @return void

    
    
    
     */
    
    
    
    
    
    
    
    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
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

    
    
    
     * @return void

    
    
    
     */
    
    
    
    
    
    
    
    public function getRouteKeyName()
    {
        return 'slug';
    }

    
    
    
    
    /**

    
    
    
     * Get cover image attribute.

    
    
    
     *

    
    
    
     * @return void

    
    
    
     */
    
    
    
    
    
    
    
    public function getCoverImageAttribute()
    {
        return $this->gallery && count($this->gallery) > 0 ? $this->gallery[0] : null;
    }

    
    
    
    
    /**

    
    
    
     * Get duration in days attribute.

    
    
    
     *

    
    
    
     * @return void

    
    
    
     */
    
    
    
    
    
    
    
    public function getDurationInDaysAttribute()
    {
        if ($this->start_date && $this->end_date) {
            return $this->start_date->diffInDays($this->end_date);
        }
        return null;
    }

    
    
    
    
    /**

    
    
    
     * Get formatted budget attribute.

    
    
    
     *

    
    
    
     * @return void

    
    
    
     */
    
    
    
    
    
    
    
    public function getFormattedBudgetAttribute()
    {
        if ($this->budget_estimate) {
            return number_format($this->budget_estimate, 0, ',', '.') . ' €'; // ✅ Fixed encoding
        }
        return 'Consultar';
    }

    
    
    
    
    /**

    
    
    
     * Handle increment views.

    
    
    
     *

    
    
    
     * @return void

    
    
    
     */
    
    
    
    
    
    
    
    public function incrementViews()
    {
        $this->increment('views_count');
    }
}
