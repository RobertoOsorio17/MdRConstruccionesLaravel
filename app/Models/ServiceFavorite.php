<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Pivot model tracking which users have favorited specific services.
 * Enables quick lookups of favoriting relationships for personalization and analytics.
 */
class ServiceFavorite extends Model
{
    protected $table = 'user_service_favorites';

    protected $fillable = [
        'user_id',
        'service_id',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    
    
    
    
    /**

    
    
    
     * Handle user.

    
    
    
     *

    
    
    
     * @return BelongsTo

    
    
    
     */
    
    
    
    
    
    
    
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    
    
    
    
    /**

    
    
    
     * Handle service.

    
    
    
     *

    
    
    
     * @return BelongsTo

    
    
    
     */
    
    
    
    
    
    
    
    public function service(): BelongsTo
    {
        return $this->belongsTo(Service::class);
    }
}
