<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * Stores client testimonials with moderation status, rating metadata, and presentation helpers.
 * Drives social proof components across marketing pages and supports featured curation.
 */
class Testimonial extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id',
        'client_name',
        'client_position',
        'client_company',
        'client_photo',
        'content',
        'rating',
        'project_type',
        'location',
        'project_budget',
        'project_duration',
        'images',
        'featured',
        'is_active',
        'status',
        'sort_order',
    ];

    protected $guarded = [
        'id',
        'approved_at',
        'approved_by',
        'created_at',
        'updated_at',
        'deleted_at',
    ];

    protected $casts = [
        'rating' => 'integer',
        'project_budget' => 'decimal:2',
        'project_duration' => 'integer',
        'images' => 'array',
        'featured' => 'boolean',
        'is_active' => 'boolean',
        'sort_order' => 'integer',
        'approved_at' => 'datetime',
    ];

    /**
     * User who submitted the testimonial
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * User who approved the testimonial
     */
    public function approvedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    /**
     * Scope: Active testimonials
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope: Approved testimonials
     */
    public function scopeApproved($query)
    {
        return $query->where('status', 'approved');
    }

    /**
     * Scope: Featured testimonials
     */
    public function scopeFeatured($query)
    {
        return $query->where('featured', true);
    }

    /**
     * Scope: Pending testimonials
     */
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    /**
     * Scope: Order by sort order
     */
    public function scopeOrdered($query)
    {
        return $query->orderBy('sort_order')->orderByDesc('created_at');
    }

    /**
     * Get client initials for avatar
     */
    public function getClientInitialsAttribute(): string
    {
        $words = explode(' ', $this->client_name);
        if (count($words) >= 2) {
            return strtoupper(substr($words[0], 0, 1) . substr($words[1], 0, 1));
        }
        return strtoupper(substr($this->client_name, 0, 2));
    }

    /**
     * Get star rating as array
     */
    public function getStarsAttribute(): array
    {
        return array_fill(0, $this->rating, true);
    }

    /**
     * Approve testimonial
     */
    public function approve(User $approver): void
    {
        $this->update([
            'status' => 'approved',
            'approved_at' => now(),
            'approved_by' => $approver->id,
        ]);
    }

    /**
     * Reject testimonial
     */
    public function reject(): void
    {
        $this->update([
            'status' => 'rejected',
        ]);
    }
}
