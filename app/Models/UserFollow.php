<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Builder;

/**
 * Models follower relationships between users, enabling social graph queries and toggling logic.
 * Provides scopes to fetch followers/following lists and prevents self-following operations.
 */
class UserFollow extends Model
{
    use HasFactory;
    
    protected $fillable = [
        'follower_id',
        'following_id',
        'followed_at'
    ];
    
    protected $dates = [
        'followed_at'
    ];
    
    /**
     * RelaciÃƒÆ’Ã‚Â³n con el usuario que sigue (follower)
     */
    public function follower(): BelongsTo
    {
        return $this->belongsTo(User::class, 'follower_id');
    }
    
    /**
     * RelaciÃƒÆ’Ã‚Â³n con el usuario seguido (following)
     */
    public function following(): BelongsTo
    {
        return $this->belongsTo(User::class, 'following_id');
    }
    
    /**
     * Scope para obtener seguidores de un usuario
     */
    public function scopeFollowersOf(Builder $query, $userId)
    {
        return $query->where('following_id', $userId);
    }
    
    /**
     * Scope para obtener usuarios seguidos por alguien
     */
    public function scopeFollowingOf(Builder $query, $userId)
    {
        return $query->where('follower_id', $userId);
    }
    
    /**
     * Alternar seguimiento entre dos usuarios
     */
    public static function toggle($followerId, $followingId)
    {
        // Evitar que un usuario se siga a sÃƒÆ’Ã‚Â­ mismo
        if ($followerId == $followingId) {
            return false;
        }
        
        $follow = static::where([
            'follower_id' => $followerId,
            'following_id' => $followingId
        ])->first();
        
        if ($follow) {
            $follow->delete();
            return false; // Dejado de seguir
        } else {
            static::create([
                'follower_id' => $followerId,
                'following_id' => $followingId,
                'followed_at' => now()
            ]);
            return true; // Ahora siguiendo
        }
    }
}
