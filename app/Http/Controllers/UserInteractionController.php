<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Post;
use App\Models\UserInteraction;
use Illuminate\Http\JsonResponse;

/**
 * Centralizes lightweight engagement endpoints so users can like, bookmark, and track interactions with content.
 *
 * Features:
 * - Toggle like and bookmark interactions with consistent JSON replies.
 * - Small status endpoint for frontend hydration.
 * - Keeps counters synchronized using model relationships.
 */
class UserInteractionController extends Controller
{
    /**
     * Toggle a like on the provided post.
     *
     * @param Request $request The current HTTP request instance.
     * @param Post $post The post being liked or unliked.
     * @return JsonResponse JSON response with like status and counts.
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
     *
     * @param Request $request The current HTTP request instance.
     * @param Post $post The post being bookmarked or unbookmarked.
     * @return JsonResponse JSON response with bookmark status and counts.
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
     *
     * @param Request $request The current HTTP request instance.
     * @param Post $post The post to check status against.
     * @return JsonResponse JSON response with status and counts.
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
