<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Post;
use App\Models\UserInteraction;
use Illuminate\Http\JsonResponse;

class UserInteractionController extends Controller
{
    /**
     * Toggle like en un post
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
            'message' => $isLiked ? 'Te gusta este post' : 'Ya no te gusta este post'
        ]);
    }
    
    /**
     * Toggle bookmark en un post
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
            'message' => $isBookmarked ? 'Post guardado en favoritos' : 'Post eliminado de favoritos'
        ]);
    }
    
    /**
     * Obtener el estado de interacciones de un usuario con un post
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
