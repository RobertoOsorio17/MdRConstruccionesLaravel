<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

/**
 * BanAppeal Model
 *
 * Represents a user's appeal against an account ban. Each ban can only be appealed once.
 * Includes security features like unique tokens and tracks the full appeal lifecycle
 * from submission through admin review to final decision.
 *
 * @property int $id
 * @property int $user_id
 * @property int $user_ban_id
 * @property string $reason
 * @property string|null $evidence_path
 * @property string $status
 * @property string|null $admin_response
 * @property int|null $reviewed_by
 * @property \Carbon\Carbon|null $reviewed_at
 * @property string $appeal_token
 * @property string|null $ip_address
 * @property string|null $user_agent
 * @property bool $terms_accepted
 * @property \Carbon\Carbon $created_at
 * @property \Carbon\Carbon $updated_at
 */
class BanAppeal extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'user_ban_id',
        'reason',
        'evidence_path',
        'status',
        'admin_response',
        'reviewed_by',
        'reviewed_at',
        'appeal_token',
        'appeal_token_rotated_at',
        'ip_address',
        'user_agent',
        'terms_accepted',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'reviewed_at' => 'datetime',
        'appeal_token_rotated_at' => 'datetime',
        'terms_accepted' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'appeal_token',
    ];

    /**
     * Temporary storage for plain token (not saved to database).
     *
     * @var string|null
     */
    public $plainTokenTemp = null;

    /**
     * Boot the model and set up event listeners.
     *
     * ✅ SECURITY FIX: Tokens are now hashed before storage to prevent exposure
     * in database dumps, logs, or XSS attacks in admin panel.
     */
    protected static function boot()
    {
        parent::boot();

        // Automatically generate unique token when creating appeal
        static::creating(function ($appeal) {
            if (empty($appeal->appeal_token)) {
                // Generate random token
                $plainToken = Str::random(64);

                // Store hashed version in database
                $appeal->appeal_token = hash('sha256', $plainToken);
                $appeal->appeal_token_rotated_at = now();

                // Store plain token temporarily (public property, not saved to DB)
                $appeal->plainTokenTemp = $plainToken;
            }
        });
    }

    /**
     * Verify if a given plain token matches the stored hash.
     *
     * @param string $plainToken
     * @return bool
     */
    public function verifyAppealToken(string $plainToken): bool
    {
        return hash_equals($this->appeal_token, hash('sha256', $plainToken));
    }

    /**
     * Find an appeal by its plain token.
     *
     * @param string $plainToken
     * @return static|null
     */
    public static function findByToken(string $plainToken): ?self
    {
        $hashedToken = hash('sha256', $plainToken);
        return static::where('appeal_token', $hashedToken)->first();
    }

    /**
     * Get a truncated version of the token for display in admin UI.
     *
     * @return string
     */
    public function getTruncatedTokenAttribute(): string
    {
        return substr($this->appeal_token, 0, 8) . '...' . substr($this->appeal_token, -8);
    }

    /**
     * Generate a temporary plain token for status URL.
     *
     * This creates a new plain token that can be used in status URLs
     * without exposing the original hashed token.
     *
     * ✅ SECURITY FIX: Generates a fresh plain token for status URLs
     * instead of using the hashed appeal_token which would fail verification.
     *
     * @return string Plain token for status URL
     */
    public function issueStatusToken(): string
    {
        // If we have the plain token from creation, use it
        if ($this->plainTokenTemp) {
            return $this->plainTokenTemp;
        }

        // Otherwise, generate a new temporary token and update the database
        $plainToken = Str::random(64);

        // Update the hashed token in database
        $this->appeal_token = hash('sha256', $plainToken);
        $this->appeal_token_rotated_at = now();
        $this->save();

        return $plainToken;
    }

    /**
     * Get the user who submitted the appeal.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * Get the ban being appealed.
     */
    public function userBan(): BelongsTo
    {
        return $this->belongsTo(UserBan::class, 'user_ban_id');
    }

    /**
     * Get the administrator who reviewed the appeal.
     */
    public function reviewedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    /**
     * Scope to get only pending appeals.
     */
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    /**
     * Scope to get only approved appeals.
     */
    public function scopeApproved($query)
    {
        return $query->where('status', 'approved');
    }

    /**
     * Scope to get only rejected appeals.
     */
    public function scopeRejected($query)
    {
        return $query->where('status', 'rejected');
    }

    /**
     * Scope to get appeals awaiting more information.
     */
    public function scopeAwaitingInfo($query)
    {
        return $query->where('status', 'more_info_requested');
    }

    /**
     * Scope to get reviewed appeals (approved or rejected).
     */
    public function scopeReviewed($query)
    {
        return $query->whereIn('status', ['approved', 'rejected']);
    }

    /**
     * Check if the appeal is pending review.
     */
    public function isPending(): bool
    {
        return $this->status === 'pending';
    }

    /**
     * Check if the appeal has been approved.
     */
    public function isApproved(): bool
    {
        return $this->status === 'approved';
    }

    /**
     * Check if the appeal has been rejected.
     */
    public function isRejected(): bool
    {
        return $this->status === 'rejected';
    }

    /**
     * Check if more information has been requested.
     */
    public function isAwaitingInfo(): bool
    {
        return $this->status === 'more_info_requested';
    }

    /**
     * Check if the appeal can be reviewed (is pending or awaiting info).
     */
    public function canBeReviewed(): bool
    {
        return in_array($this->status, ['pending', 'more_info_requested']);
    }

    /**
     * Check if the appeal has been reviewed.
     */
    public function isReviewed(): bool
    {
        return in_array($this->status, ['approved', 'rejected']);
    }

    /**
     * Get the status label for display.
     */
    public function getStatusLabel(): string
    {
        return match($this->status) {
            'pending' => 'Pendiente',
            'approved' => 'Aprobada',
            'rejected' => 'Rechazada',
            'more_info_requested' => 'Información Solicitada',
            default => 'Desconocido',
        };
    }

    /**
     * Get the status color for UI display.
     */
    public function getStatusColor(): string
    {
        return match($this->status) {
            'pending' => 'yellow',
            'approved' => 'green',
            'rejected' => 'red',
            'more_info_requested' => 'blue',
            default => 'gray',
        };
    }
}
