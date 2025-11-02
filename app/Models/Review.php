<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * Represents customer reviews for services or projects, including moderation workflow metadata.
 * Supports polymorphic associations and approval tracking for trust and marketing surfaces.
 */
class Review extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id',
        'reviewable_type',
        'reviewable_id',
        'rating',
        'comment',
        'status',
        'photos',
        'ip_address',
        'user_agent',
    ];

    // ✅ Protected fields that should NOT be mass-assignable
    protected $guarded = [
        'id',
        'approved_at',
        'approved_by',
        'created_at',
        'updated_at',
    ];

    protected $casts = [
        'photos' => 'array',
        'rating' => 'integer',
        'approved_at' => 'datetime',
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

    
    
    
     * Handle reviewable.

    
    
    
     *

    
    
    
     * @return MorphTo

    
    
    
     */
    
    
    
    
    
    
    
    public function reviewable(): MorphTo
    {
        return $this->morphTo();
    }

    
    
    
    
    /**

    
    
    
     * Handle approved by.

    
    
    
     *

    
    
    
     * @return BelongsTo

    
    
    
     */
    
    
    
    
    
    
    
    public function approvedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    
    
    
    
    /**

    
    
    
     * Handle scope approved.

    
    
    
     *

    
    
    
     * @param mixed $query The query.

    
    
    
     * @return void

    
    
    
     */
    
    
    
    
    
    
    
    public function scopeApproved($query)
    {
        return $query->where('status', 'approved');
    }

    
    
    
    
    /**

    
    
    
     * Handle scope pending.

    
    
    
     *

    
    
    
     * @param mixed $query The query.

    
    
    
     * @return void

    
    
    
     */
    
    
    
    
    
    
    
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    
    
    
    
    /**

    
    
    
     * Handle scope by rating.

    
    
    
     *

    
    
    
     * @param mixed $query The query.

    
    
    
     * @param int $rating The rating.

    
    
    
     * @return void

    
    
    
     */
    
    
    
    
    
    
    
    public function scopeByRating($query, int $rating)
    {
        return $query->where('rating', $rating);
    }

    
    
    
    
    /**

    
    
    
     * Determine whether approved.

    
    
    
     *

    
    
    
     * @return bool

    
    
    
     */
    
    
    
    
    
    
    
    public function isApproved(): bool
    {
        return $this->status === 'approved';
    }

    
    
    
    
    /**

    
    
    
     * Determine whether pending.

    
    
    
     *

    
    
    
     * @return bool

    
    
    
     */
    
    
    
    
    
    
    
    public function isPending(): bool
    {
        return $this->status === 'pending';
    }

    
    
    
    
    /**

    
    
    
     * Handle approve.

    
    
    
     *

    
    
    
     * @param int $approvedBy The approvedBy.

    
    
    
     * @return void

    
    
    
     */
    
    
    
    
    
    
    
    public function approve(int $approvedBy): void
    {
        $this->update([
            'status' => 'approved',
            'approved_at' => now(),
            'approved_by' => $approvedBy,
        ]);
    }

    
    
    
    
    /**

    
    
    
     * Handle reject.

    
    
    
     *

    
    
    
     * @return void

    
    
    
     */
    
    
    
    
    
    
    
    public function reject(): void
    {
        $this->update(['status' => 'rejected']);
    }
}
