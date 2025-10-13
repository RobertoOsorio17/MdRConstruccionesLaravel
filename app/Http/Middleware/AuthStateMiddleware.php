<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

/**
 * Apply auth state middleware logic.
 */
class AuthStateMiddleware
{
    /**
     * Handle an incoming request.
     *
     * This middleware attaches authentication details to each Inertia response.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        // Only enrich Inertia responses.
        if ($request->inertia()) {
            $user = Auth::user();
            
            Log::debug('AuthState middleware processing', [
                'route' => $request->route()?->getName(),
                'is_authenticated' => Auth::check(),
                'user_id' => $user?->id,
                'user_email' => $user?->email,
                'session_id' => session()->getId(),
                'has_user_object' => !is_null($user)
            ]);
            
            // Basic user information payload.
            $authData = [
                'isAuthenticated' => Auth::check(),
                'isGuest' => Auth::guest(),
                'user' => $user ? [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'avatar' => $user->avatar,
                    'avatar_url' => $user->avatar_url ?? null,
                    'role' => $user->role,
                    'bio' => $user->bio,
                    'profession' => $user->profession,
                    'profile_visibility' => $user->profile_visibility,
                    'initials' => $user->initials ?? null,
                    'profile_completeness' => $user->profile_completeness ?? 0,
                    'email_verified_at' => $user->email_verified_at,
                    'is_email_verified' => !is_null($user->email_verified_at),
                ] : null
            ];

            // Enrich with statistics when the user is authenticated.
            if ($user) {
                try {
                    $authData['user']['stats'] = [
                        'comments_count' => method_exists($user, 'comments') ? $user->comments()->count() : 0,
                        'saved_posts_count' => method_exists($user, 'savedPosts') ? $user->savedPosts()->count() : 0,
                        'following_count' => method_exists($user, 'following') ? $user->following()->count() : 0,
                        'followers_count' => method_exists($user, 'followers') ? $user->followers()->count() : 0,
                    ];
                    
                    Log::debug('User stats calculated', [
                        'user_id' => $user->id,
                        'stats' => $authData['user']['stats']
                    ]);

                    // Inject permissions for role-based accounts.
                    if (method_exists($user, 'roles') && $user->roles()->exists()) {
                        $permissions = $user->roles()
                            ->with('permissions')
                            ->get()
                            ->flatMap(function ($role) {
                                return $role->permissions->pluck('name');
                            })
                            ->unique()
                            ->values()
                            ->toArray();
                            
                        $authData['user']['permissions'] = $permissions;
                        
                        Log::debug('User permissions loaded', [
                            'user_id' => $user->id,
                            'permissions_count' => count($permissions),
                            'permissions' => $permissions
                        ]);
                    }
                } catch (\Exception $e) {
                    Log::error('Error loading user stats or permissions', [
                        'user_id' => $user->id,
                        'error' => $e->getMessage(),
                        'trace' => $e->getTraceAsString()
                    ]);
                    
                    // Use default values when enrichment fails.
                    $authData['user']['stats'] = [
                        'comments_count' => 0,
                        'saved_posts_count' => 0,
                        'following_count' => 0,
                        'followers_count' => 0,
                    ];
                }
            }

            // Share the auth payload with Inertia.
            inertia()->share('auth', $authData);
            
            Log::debug('Auth data shared with Inertia', [
                'route' => $request->route()?->getName(),
                'auth_data_keys' => array_keys($authData),
                'user_data_keys' => $authData['user'] ? array_keys($authData['user']) : [],
                'session_id' => session()->getId()
            ]);
        }

        return $response;
    }
}
