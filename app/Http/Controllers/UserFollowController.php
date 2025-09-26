<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Models\UserFollow;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\ValidationException;

class UserFollowController extends Controller
{
    /**
     * Toggle seguimiento de un usuario
     */
    public function toggle(Request $request, User $user): JsonResponse
    {
        $follower = $request->user();
        
        // Evitar que un usuario se siga a sí mismo
        if ($follower->id === $user->id) {
            throw ValidationException::withMessages([
                'error' => 'No puedes seguirte a ti mismo'
            ]);
        }
        
        $isFollowing = UserFollow::toggle($follower->id, $user->id);
        
        $followersCount = $user->followers()->count();
        
        return response()->json([
            'success' => true,
            'isFollowing' => $isFollowing,
            'followersCount' => $followersCount,
            'message' => $isFollowing 
                ? "Ahora sigues a {$user->name}" 
                : "Has dejado de seguir a {$user->name}"
        ]);
    }
    
    /**
     * Obtener el estado de seguimiento entre dos usuarios
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
     * Obtener la lista de seguidores de un usuario
     */
    public function followers(Request $request, User $user): JsonResponse
    {
        $followers = $user->followers()
            ->select('users.id', 'users.name', 'users.avatar')
            ->withPivot('followed_at')
            ->orderBy('pivot_followed_at', 'desc')
            ->paginate(20);
            
        return response()->json($followers);
    }
    
    /**
     * Obtener la lista de usuarios seguidos por un usuario
     */
    public function following(Request $request, User $user): JsonResponse
    {
        $following = $user->following()
            ->select('users.id', 'users.name', 'users.avatar')
            ->withPivot('followed_at')
            ->orderBy('pivot_followed_at', 'desc')
            ->paginate(20);
            
        return response()->json($following);
    }
}
