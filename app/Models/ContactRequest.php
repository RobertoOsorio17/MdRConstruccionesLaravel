<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ContactRequest extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'name',
        'email',
        'phone',
        'preferred_contact',
        'contact_time',
        'service',
        'message',
        'attachments',
        'status',
        'read_at',
        'responded_at',
        'responded_by',
        'admin_notes',
        'ip_address',
        'user_agent',
    ];

    protected $guarded = [
        'id',
        'created_at',
        'updated_at',
        'deleted_at',
    ];

    protected $casts = [
        'attachments' => 'array',
        'read_at' => 'datetime',
        'responded_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    /**
     * Usuario que respondió la solicitud
     */
    public function respondedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'responded_by');
    }

    /**
     * Marcar como leída
     */
    public function markAsRead(): void
    {
        $this->update([
            'status' => 'read',
            'read_at' => now(),
        ]);
    }

    /**
     * Marcar como respondida
     */
    public function markAsResponded(int $userId): void
    {
        $this->update([
            'status' => 'responded',
            'responded_at' => now(),
            'responded_by' => $userId,
        ]);
    }

    /**
     * Marcar como archivada
     */
    public function archive(): void
    {
        $this->update([
            'status' => 'archived',
        ]);
    }

    /**
     * Scope para solicitudes nuevas
     */
    public function scopeNew($query)
    {
        return $query->where('status', 'new');
    }

    /**
     * Scope para solicitudes leídas
     */
    public function scopeRead($query)
    {
        return $query->where('status', 'read');
    }

    /**
     * Scope para solicitudes respondidas
     */
    public function scopeResponded($query)
    {
        return $query->where('status', 'responded');
    }

    /**
     * Scope para solicitudes archivadas
     */
    public function scopeArchived($query)
    {
        return $query->where('status', 'archived');
    }

    /**
     * Scope para búsqueda
     */
    public function scopeSearch($query, $search)
    {
        return $query->where(function ($q) use ($search) {
            $q->where('name', 'like', "%{$search}%")
              ->orWhere('email', 'like', "%{$search}%")
              ->orWhere('phone', 'like', "%{$search}%")
              ->orWhere('message', 'like', "%{$search}%");
        });
    }

    /**
     * Verificar si está leída
     */
    public function isRead(): bool
    {
        return $this->status !== 'new';
    }

    /**
     * Verificar si está respondida
     */
    public function isResponded(): bool
    {
        return $this->status === 'responded';
    }

    /**
     * Get all attachments for this contact request.
     */
    public function attachments(): HasMany
    {
        return $this->hasMany(ContactRequestAttachment::class);
    }
}
