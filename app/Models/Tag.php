<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Support\Str;

/**
 * Represents content tags used for categorizing posts and enhancing discovery.
 * Automatically generates slugs and exposes helpers for search and published post counts.
 */
class Tag extends Model
{
    protected $fillable = [
        'name',
        'slug', 
        'color',
    ];

    protected static function boot()
    {
        parent::boot();
        
        static::creating(function ($tag) {
            if (empty($tag->slug)) {
                $tag->slug = Str::slug($tag->name);
            }
        });
    }

    /**
     * Posts que tienen esta etiqueta
     */
    public function posts(): BelongsToMany
    {
        return $this->belongsToMany(Post::class, 'post_tag')
                    ->withTimestamps();
    }

    /**
     * Obtener la ruta de la etiqueta
     */
    public function getRouteKeyName()
    {
        return 'slug';
    }

    /**
     * Scope para buscar etiquetas por nombre
     */
    public function scopeSearch($query, $search)
    {
        return $query->where('name', 'like', '%' . $search . '%');
    }

    /**
     * Obtener el conteo de posts
     */
    public function getPostsCountAttribute()
    {
        return $this->posts()->published()->count();
    }
}
