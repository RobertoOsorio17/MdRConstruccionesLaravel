<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class UserInteraction extends Model
{
    use HasFactory;
    
    protected $fillable = [
        'user_id',
        'interactable_type',
        'interactable_id',
        'type',
        'metadata'
    ];
    
    protected $casts = [
        'metadata' => 'array'
    ];
    
    // Tipos de interacción disponibles
    const TYPE_LIKE = 'like';
    const TYPE_BOOKMARK = 'bookmark';
    const TYPE_VIEW = 'view';
    const TYPE_SHARE = 'share';
    
    /**
     * Relación con el usuario
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
    
    /**
     * Relación polimórfica con el elemento interactuado
     */
    public function interactable(): MorphTo
    {
        return $this->morphTo();
    }
    
    /**
     * Scope para filtrar por tipo de interacción
     */
    public function scopeOfType($query, $type)
    {
        return $query->where('type', $type);
    }
    
    /**
     * Scope para likes
     */
    public function scopeLikes($query)
    {
        return $query->where('type', self::TYPE_LIKE);
    }
    
    /**
     * Scope para bookmarks
     */
    public function scopeBookmarks($query)
    {
        return $query->where('type', self::TYPE_BOOKMARK);
    }
    
    /**
     * Crear o eliminar una interacción
     */
    public static function toggle($userId, $interactable, $type)
    {
        $interaction = static::where([
            'user_id' => $userId,
            'interactable_type' => get_class($interactable),
            'interactable_id' => $interactable->id,
            'type' => $type
        ])->first();
        
        if ($interaction) {
            $interaction->delete();
            return false; // Eliminado
        } else {
            static::create([
                'user_id' => $userId,
                'interactable_type' => get_class($interactable),
                'interactable_id' => $interactable->id,
                'type' => $type
            ]);
            return true; // Creado
        }
    }
}
