<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Comment extends Model
{
    use HasFactory, SoftDeletes;
    protected $fillable = [
        'post_id',
        'parent_id',
        'body',
        'author_name',
        'author_email',
        'user_id', // Allow setting (will be validated)
        'status', // Allow setting (will be validated by policies)
        'ip_address',
        'user_agent',
    ];

    // ✅ Protected fields that should NOT be mass-assignable
    protected $guarded = [
        'id',
        'spam_score', // ✅ CRITICAL: Prevent manipulation of spam scores
        'created_at',
        'updated_at',
    ];

    /**
     * Fields that should only be updated by administrators or the system
     */
    protected $adminOnlyFields = [
        'user_id',
        'status',
        'ip_address',
        'user_agent',
        'spam_score',
    ];

    protected $casts = [
        'post_id' => 'integer',
        'user_id' => 'integer',
        'parent_id' => 'integer',
    ];

    /**
     * Get the post that owns the comment.
     */
    public function post(): BelongsTo
    {
        return $this->belongsTo(Post::class);
    }

    /**
     * Get the user that owns the comment.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the parent comment.
     */
    public function parent(): BelongsTo
    {
        return $this->belongsTo(Comment::class, 'parent_id');
    }

    /**
     * Get the replies to this comment.
     */
    public function replies(): HasMany
    {
        return $this->hasMany(Comment::class, 'parent_id');
    }

    /**
     * Get approved replies to this comment.
     */
    public function approvedReplies(): HasMany
    {
        return $this->hasMany(Comment::class, 'parent_id')
                   ->where('status', 'approved');
    }

    /**
     * Scope a query to only include approved comments.
     */
    public function scopeApproved($query)
    {
        return $query->where('status', 'approved');
    }

    /**
     * Scope a query to only include pending comments.
     */
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    /**
     * Scope a query to only include top-level comments.
     */
    public function scopeTopLevel($query)
    {
        return $query->whereNull('parent_id');
    }

    /**
     * Get the author name (user name or guest name).
     */
    public function getAuthorNameAttribute($value)
    {
        return $this->user ? $this->user->name : $value;
    }

    /**
     * Check if this is a guest comment.
     */
    public function isGuest()
    {
        return is_null($this->user_id);
    }

    /**
     * Get the interactions for this comment.
     */
    public function interactions(): HasMany
    {
        return $this->hasMany(CommentInteraction::class);
    }

    /**
     * Get the reports for this comment.
     */
    public function reports(): HasMany
    {
        return $this->hasMany(CommentReport::class);
    }

    /**
     * Get the like count for this comment.
     */
    public function likeCount()
    {
        return $this->interactions()->where('type', 'like')->count();
    }

    /**
     * Get the dislike count for this comment.
     */
    public function dislikeCount()
    {
        return $this->interactions()->where('type', 'dislike')->count();
    }

    /**
     * Get likes for this comment.
     */
    public function likes()
    {
        return $this->interactions()->where('type', 'like');
    }

    /**
     * Get dislikes for this comment.
     */
    public function dislikes()
    {
        return $this->interactions()->where('type', 'dislike');
    }

    /**
     * Check if a user has liked this comment.
     */
    public function isLikedBy($user)
    {
        if (!$user) return false;

        return $this->interactions()
                    ->where('user_id', $user->id)
                    ->where('type', 'like')
                    ->exists();
    }

    /**
     * Check if a user has disliked this comment.
     */
    public function isDislikedBy($user)
    {
        if (!$user) return false;

        return $this->interactions()
                    ->where('user_id', $user->id)
                    ->where('type', 'dislike')
                    ->exists();
    }

    /**
     * Administrative method to set comment author
     */
    public function setAuthor(User $author, User $admin): bool
    {
        if (!$admin->hasRole('admin') && !$admin->hasRole('moderator')) {
            throw new \Exception('Only administrators and moderators can set comment authors.');
        }

        return $this->update(['user_id' => $author->id]);
    }

    /**
     * Administrative method to moderate comment
     */
    public function moderate(string $status, User $admin): bool
    {
        if (!$admin->hasRole('admin') && !$admin->hasRole('moderator')) {
            throw new \Exception('Only administrators and moderators can moderate comments.');
        }

        $validStatuses = ['pending', 'approved', 'rejected', 'spam'];
        if (!in_array($status, $validStatuses)) {
            throw new \Exception('Invalid comment status.');
        }

        $this->status = $status;
        return $this->save();
    }

    /**
     * System method to set tracking information
     */
    public function setTrackingInfo(string $ipAddress, string $userAgent): bool
    {
        return $this->update([
            'ip_address' => $ipAddress,
            'user_agent' => $userAgent,
        ]);
    }
}
