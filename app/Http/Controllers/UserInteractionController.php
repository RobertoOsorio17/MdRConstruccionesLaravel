<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Post;
use App\Models\UserInteraction;
use Illuminate\Http\JsonResponse;

/**
 * Centralizes lightweight engagement endpoints so users can like, bookmark, and track interactions with content.
 * Keeps counters synchronized and responses consistent for front-end widgets that reflect social activity.
 */
class UserInteractionController extends Controller
{
    /**
     * Toggle a like on the provided post.
     */
    public function toggleLike(Request $request, Post $post): JsonResponse
    {
        $user = $request->user();
        
        $isLiked = UserInteraction::toggle(
            $user->id, 
            $post, 
            UserInteraction::TYPE_LIKE
        );
        
        $likesCount = $post->likes()->count();
        
        return response()->json([
            'success' => true,
            'isLiked' => $isLiked,
            'likesCount' => $likesCount,
            'message' => $isLiked ? 'You like this post.' : 'You no longer like this post.'
        ]);
    }
    
    /**
     * Toggle a bookmark on the provided post.
     */
    public function toggleBookmark(Request $request, Post $post): JsonResponse
    {
        $user = $request->user();
        
        $isBookmarked = UserInteraction::toggle(
            $user->id, 
            $post, 
            UserInteraction::TYPE_BOOKMARK
        );
        
        $bookmarksCount = $post->bookmarks()->count();
        
        return response()->json([
            'success' => true,
            'isBookmarked' => $isBookmarked,
            'bookmarksCount' => $bookmarksCount,
            'message' => $isBookmarked ? 'Post saved to favorites.' : 'Post removed from favorites.'
        ]);
    }
    
    /**
     * Retrieve the current interaction status for the authenticated user.
     */
    public function getInteractionStatus(Request $request, Post $post): JsonResponse
    {
        $user = $request->user();
        
        if (!$user) {
            return response()->json([
                'isLiked' => false,
                'isBookmarked' => false,
                'likesCount' => $post->likes()->count(),
                'bookmarksCount' => $post->bookmarks()->count()
            ]);
        }
        
        return response()->json([
            'isLiked' => $post->isLikedBy($user),
            'isBookmarked' => $post->isBookmarkedBy($user),
            'likesCount' => $post->likes()->count(),
            'bookmarksCount' => $post->bookmarks()->count()
        ]);
    }
}
