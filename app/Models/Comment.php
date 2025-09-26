<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Comment extends Model
{
    protected $fillable = [
        'post_id',
        'user_id',
        'parent_id',
        'body',
        'status',
        'author_name',
        'author_email',
        'ip_address',
        'user_agent',
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
}
