<?php

namespace App\Traits;

use Illuminate\Support\Str;

/**
 * Trait GeneratesUniqueSlug
 * 
 * Provides a reusable method for generating unique slugs across different models.
 * Eliminates code duplication in controllers that need to create unique slugs.
 * 
 * @package App\Traits
 */
trait GeneratesUniqueSlug
{
    
    
    
    
    /**

    
    
    
     * Handle generate unique slug.

    
    
    
     *

    
    
    
     * @param string $title The title.

    
    
    
     * @param string $modelClass The modelClass.

    
    
    
     * @param ?int $ignoreId The ignoreId.

    
    
    
     * @return string

    
    
    
     */
    
    
    
    
    
    
    
    protected function generateUniqueSlug(string $title, string $modelClass, ?int $ignoreId = null): string
    {
        $baseSlug = Str::slug($title);
        $slug = $baseSlug;
        $counter = 1;
        
        $query = $modelClass::where('slug', $slug);
        
        // Exclude current record when updating
        if ($ignoreId !== null) {
            $query->where('id', '!=', $ignoreId);
        }
        
        // Keep incrementing counter until we find a unique slug
        while ($query->exists()) {
            $slug = $baseSlug . '-' . $counter;
            $counter++;
            
            // Reset query for next iteration
            $query = $modelClass::where('slug', $slug);
            if ($ignoreId !== null) {
                $query->where('id', '!=', $ignoreId);
            }
        }
        
        return $slug;
    }
}


