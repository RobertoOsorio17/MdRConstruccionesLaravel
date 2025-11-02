<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Stores historical revisions of posts, including snapshot data and the author responsible for changes.
 * Enables rollback and audit capabilities within the editorial workflow.
 */
class PostRevision extends Model
{
    use HasFactory;

    protected $fillable = [
        'post_id',
        'user_id',
        'summary',
        'data',
    ];

    protected $casts = [
        'data' => 'array',
    ];


    


    

    

    

    /**


    

    

    

     * Handle post.


    

    

    

     *


    

    

    

     * @return BelongsTo


    

    

    

     */

    

    

    

    

    

    

    

    public function post(): BelongsTo
    {
        return $this->belongsTo(Post::class);
    }


    


    

    

    

    /**


    

    

    

     * Handle author.


    

    

    

     *


    

    

    

     * @return BelongsTo


    

    

    

     */

    

    

    

    

    

    

    

    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
