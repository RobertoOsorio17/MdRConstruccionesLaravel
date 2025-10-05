<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SearchHistory extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'query',
        'ip_address',
        'user_agent',
    ];

    protected $guarded = [
        'id',
        'created_at',
        'updated_at',
    ];

    /**
     * Get the user who performed the search.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
