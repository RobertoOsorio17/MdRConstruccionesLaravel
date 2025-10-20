<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * Represents user-generated comments with moderation workflows, edit history, and interaction metadata.
 * Includes helpers for policy enforcement, reply hierarchies, and status management across the blog.
 */
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
        'device_fingerprint', // ✅ FIXED: Added for device tracking
        'edited_at',
        'edit_reason',
        'edit_count',
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
        'device_fingerprint', // ✅ FIXED: Added for protection
        'spam_score',
    ];

    protected $casts = [
        'post_id' => 'integer',
        'user_id' => 'integer',
        'parent_id' => 'integer',
        'edited_at' => 'datetime',
        'edit_count' => 'integer',
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

    /**
     * Get the edit history for this comment.
     */
    public function edits(): HasMany
    {
        return $this->hasMany(CommentEdit::class);
    }

    /**
     * Check if the comment can be edited by the given user.
     * Users can edit their own comments within 24 hours.
     * Admins can always edit.
     *
     * @param User $user The user attempting to edit
     * @return bool
     */
    public function canBeEditedBy(User $user): bool
    {
        // Admins can always edit
        if ($user->hasRole('admin') || $user->hasRole('moderator')) {
            return true;
        }

        // User must be the author
        if ($user->id !== $this->user_id) {
            return false;
        }

        // Must be within 24 hours of creation
        return $this->created_at->diffInHours(now()) < 24;
    }

    /**
     * Check if the comment has been edited.
     *
     * @return bool
     */
    public function isEdited(): bool
    {
        return $this->edited_at !== null;
    }

    /**
     * Get formatted edit timestamp.
     *
     * @return string|null
     */
    public function getEditedAtFormattedAttribute(): ?string
    {
        if (!$this->edited_at) {
            return null;
        }

        return $this->edited_at->locale('es')->isoFormat('D [de] MMMM [de] YYYY, HH:mm');
    }

    /**
     * Get human-readable time since last edit.
     *
     * @return string|null
     */
    public function getEditedAtHumanAttribute(): ?string
    {
        if (!$this->edited_at) {
            return null;
        }

        return $this->edited_at->locale('es')->diffForHumans();
    }

    /**
     * Check if the user has reached the edit limit.
     * Regular users: 5 edits maximum
     * Admins: unlimited
     *
     * @param User $user
     * @return bool
     */
    public function hasReachedEditLimit(User $user): bool
    {
        // Admins have no limit
        if ($user->hasRole('admin') || $user->hasRole('moderator')) {
            return false;
        }

        // Regular users limited to 5 edits
        return $this->edit_count >= 5;
    }

    /**
     * Capture the current state before editing.
     * Similar to Post::captureRevision()
     *
     * @param string|null $reason
     * @return CommentEdit
     */
    public function captureEdit(string $originalContent, string $newContent, User $user, ?string $reason = null): CommentEdit
    {
        return CommentEdit::create([
            'comment_id' => $this->id,
            'user_id' => $user->id,
            'original_content' => $originalContent,
            'new_content' => $newContent,
            'edit_reason' => $reason,
            'edited_at' => now(),
        ]);
    }

    /**
     * Check if the comment is soft-deleted.
     *
     * @return bool
     */
    public function isDeleted(): bool
    {
        return $this->trashed();
    }

    /**
     * Get the display content for the comment.
     * Returns placeholder text if comment is deleted, otherwise returns the body.
     *
     * @return string
     */
    public function getDisplayContent(): string
    {
        if ($this->isDeleted()) {
            return '[Comentario eliminado]';
        }

        return $this->body;
    }

    /**
     * Get the display author name for the comment.
     * Returns placeholder if comment is deleted, otherwise returns the author name.
     *
     * @return string
     */
    public function getDisplayAuthorName(): string
    {
        if ($this->isDeleted()) {
            return 'Usuario eliminado';
        }

        return $this->user ? $this->user->name : $this->author_name;
    }
}
