<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Models\UserFollow;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\ValidationException;

/**
 * Manages the social graph between users, exposing endpoints to follow, unfollow, and inspect relationships.
 * Enforces guardrails like self-follow prevention while returning up-to-date follower counts for UI feedback.
 */
class UserFollowController extends Controller
{
    /**
     * Toggle following status for the given user.
     */
    public function toggle(Request $request, User $user): JsonResponse
    {
        $follower = $request->user();
        
        // Prevent users from following themselves.
        if ($follower->id === $user->id) {
            throw ValidationException::withMessages([
                'error' => 'You cannot follow yourself.'
            ]);
        }
        
        $isFollowing = UserFollow::toggle($follower->id, $user->id);

        $followersCount = $user->followers()->count();
        
        return response()->json([
            'success' => true,
            'isFollowing' => $isFollowing,
            'followersCount' => $followersCount,
            'message' => $isFollowing
                ? "You are now following {$user->name}."
                : "You have unfollowed {$user->name}."
        ]);
    }
    
    /**
     * Retrieve the follow status between the authenticated user and target user.
     */
    public function getFollowStatus(Request $request, User $user): JsonResponse
    {
        $follower = $request->user();
        
        if (!$follower || $follower->id === $user->id) {
            return response()->json([
                'isFollowing' => false,
                'followersCount' => $user->followers()->count(),
                'followingCount' => $user->following()->count()
            ]);
        }
        
        return response()->json([
            'isFollowing' => $follower->isFollowing($user),
            'followersCount' => $user->followers()->count(),
            'followingCount' => $user->following()->count()
        ]);
    }
    
    /**
     * Retrieve a paginated list of followers for the target user.
     */
    public function followers(Request $request, User $user): JsonResponse
    {
        $followers = $user->followers()
            ->select('users.id', 'users.name', 'users.avatar')
            ->orderBy('user_follows.created_at', 'desc')
            ->paginate(20);
            
        return response()->json($followers);
    }
    
    /**
     * Retrieve a paginated list of profiles the target user follows.
     */
    public function following(Request $request, User $user): JsonResponse
    {
        $following = $user->following()
            ->select('users.id', 'users.name', 'users.avatar')
            ->orderBy('user_follows.created_at', 'desc')
            ->paginate(20);
            
        return response()->json($following);
    }
}
