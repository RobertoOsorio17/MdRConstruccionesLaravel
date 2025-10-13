<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Captures a snapshot of a comment revision, preserving original content and editor context.
 * Enables transparent edit histories and auditability for collaborative moderation.
 */
class CommentEdit extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'comment_id',
        'user_id',
        'original_content',
        'new_content',
        'edit_reason',
        'edited_at',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'edited_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the comment that was edited.
     *
     * @return BelongsTo
     */
    public function comment(): BelongsTo
    {
        return $this->belongsTo(Comment::class);
    }

    /**
     * Get the user who made the edit.
     *
     * @return BelongsTo
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the editor's name (for display purposes).
     *
     * @return string
     */
    public function getEditorNameAttribute(): string
    {
        return $this->user ? $this->user->name : 'Unknown User';
    }

    /**
     * Get formatted edit timestamp.
     *
     * @return string
     */
    public function getFormattedEditedAtAttribute(): string
    {
        return $this->edited_at->locale('es')->isoFormat('D [de] MMMM [de] YYYY, HH:mm');
    }

    /**
     * Check if this edit has a reason provided.
     *
     * @return bool
     */
    public function hasReason(): bool
    {
        return !empty($this->edit_reason);
    }
}

