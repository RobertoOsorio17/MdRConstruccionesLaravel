<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

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
     * Get the user that owns the favorite.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the service that is favorited.
     */
    public function service(): BelongsTo
    {
        return $this->belongsTo(Service::class);
    }
}
