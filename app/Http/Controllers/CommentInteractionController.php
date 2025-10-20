<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use App\Models\Comment;
use App\Models\CommentInteraction;
use App\Models\CommentReport;

/**
 * Coordinates like, dislike, and report interactions on comments for authenticated and guest users.
 * Applies authorization, toggling logic, and analytics updates to keep engagement signals accurate.
 */
class CommentInteractionController extends Controller
{
    use AuthorizesRequests;
    /**
     * Store a like interaction for a comment.
     */
    public function like(Request $request, Comment $comment): JsonResponse
    {
        // ✅ Authorize the action using policy
        $this->authorize('like', $comment);

        $user = Auth::user();

        // Check whether an interaction of the same type already exists.
        $existingInteraction = CommentInteraction::where('user_id', $user->id)
            ->where('comment_id', $comment->id)
            ->where('type', 'like')
            ->first();
            
        if ($existingInteraction) {
            // Toggle off the interaction when it already exists.
            $existingInteraction->delete();
            $message = 'Like removed.';
            $liked = false;
        } else {
            // Remove any existing dislike before saving the like.
            CommentInteraction::where('user_id', $user->id)
                ->where('comment_id', $comment->id)
                ->where('type', 'dislike')
                ->delete();
                
            // Record the new like interaction.
            CommentInteraction::create([
                'user_id' => $user->id,
                'comment_id' => $comment->id,
                'type' => 'like'
            ]);
            
            $message = 'Comment marked as helpful.';
            $liked = true;
        }
        
        // Retrieve the latest interaction counters.
        $likeCount = $comment->likeCount();
        $dislikeCount = $comment->dislikeCount();
        
        return response()->json([
            'success' => true,
            'message' => $message,
            'liked' => $liked,
            'likeCount' => $likeCount,
            'dislikeCount' => $dislikeCount
        ]);
    }
    
    /**
     * Store a dislike interaction for a comment.
     */
    public function dislike(Request $request, Comment $comment): JsonResponse
    {
        // ✅ Authorize the action using policy (same rules as like)
        $this->authorize('like', $comment);

        $user = Auth::user();

        // Check whether an interaction of the same type already exists.
        $existingInteraction = CommentInteraction::where('user_id', $user->id)
            ->where('comment_id', $comment->id)
            ->where('type', 'dislike')
            ->first();
            
        if ($existingInteraction) {
            // Toggle off the interaction when it already exists.
            $existingInteraction->delete();
            $message = 'Dislike removed.';
            $disliked = false;
        } else {
            // Remove any existing like before saving the dislike.
            CommentInteraction::where('user_id', $user->id)
                ->where('comment_id', $comment->id)
                ->where('type', 'like')
                ->delete();
                
            // Record the new dislike interaction.
            CommentInteraction::create([
                'user_id' => $user->id,
                'comment_id' => $comment->id,
                'type' => 'dislike'
            ]);
            
            $message = 'Comment marked as not helpful.';
            $disliked = true;
        }
        
        // Retrieve the latest interaction counters.
        $likeCount = $comment->likeCount();
        $dislikeCount = $comment->dislikeCount();
        
        return response()->json([
            'success' => true,
            'message' => $message,
            'disliked' => $disliked,
            'likeCount' => $likeCount,
            'dislikeCount' => $dislikeCount
        ]);
    }
    
    /**
     * Report a comment.
     */
    public function report(Request $request, Comment $comment): JsonResponse
    {
        $request->validate([
            'reason' => 'required|string|max:500',
            'category' => 'nullable|string|in:spam,harassment,hate_speech,inappropriate,misinformation,off_topic,other',
            'description' => 'nullable|string|max:1000'
        ]);
        
        $user = Auth::user();
        $ipAddress = $request->ip();
        $userAgent = $request->userAgent();
        
        // Check whether the same user or IP address has already reported this comment.
        $existingReportQuery = CommentReport::where('comment_id', $comment->id);
        
        if ($user) {
            // Authenticated user: constrain by the authenticated user identifier.
            $existingReportQuery->where('user_id', $user->id);
        } else {
            // Guest user: limit repeated reports from the same IP within the last 24 hours.
            $existingReportQuery->where('ip_address', $ipAddress)
                               ->where('created_at', '>', now()->subDay());
        }
        
        $existingReport = $existingReportQuery->first();
            
        if ($existingReport) {
            $message = $user 
                ? 'You have already reported this comment.'
                : 'This comment was already reported from this location within the last 24 hours.';
                
            return response()->json([
                'success' => false,
                'message' => $message
            ], 400);
        }
        
        // Persist the new report entry.
        CommentReport::create([
            'user_id' => $user?->id,
            'comment_id' => $comment->id,
            'reason' => $request->reason,
            'category' => $request->category ?? 'other',
            'description' => $request->description,
            'ip_address' => $ipAddress,
            'user_agent' => $userAgent,
            'is_guest_report' => !$user
        ]);
        
        $successMessage = $user 
            ? 'Comment reported successfully. Our team will review it shortly.'
            : 'Comment reported successfully. Remember that false reports can result in your IP being blocked.';
        
        return response()->json([
            'success' => true,
            'message' => $successMessage
        ]);
    }
}





