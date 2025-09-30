<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

/**
 * Customize the shared Inertia props for the application.
 */
class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $auth = $request->user();
        $authData = [
            'isAuthenticated' => !!$auth,
            'isGuest' => !$auth,
            'user' => $auth ? [
                'id' => $auth->id,
                'name' => $auth->name,
                'email' => $auth->email,
                'avatar' => $auth->avatar,
                'avatar_url' => $auth->avatar_url ?? null,
                'role' => $auth->role,
                'bio' => $auth->bio,
                'profession' => $auth->profession,
                'profile_visibility' => $auth->profile_visibility,
                'initials' => $auth->initials ?? null,
                'profile_completeness' => $auth->profile_completeness ?? 0,
                'email_verified_at' => $auth->email_verified_at,
                'is_email_verified' => !is_null($auth->email_verified_at),
            ] : null
        ];

        // Enrich with statistics and permissions when authenticated.
        if ($auth) {
            try {
                $authData['user']['stats'] = [
                    'comments_count' => method_exists($auth, 'comments') ? $auth->comments()->count() : 0,
                    'saved_posts_count' => method_exists($auth, 'savedPosts') ? $auth->savedPosts()->count() : 0,
                    'following_count' => method_exists($auth, 'following') ? $auth->following()->count() : 0,
                    'followers_count' => method_exists($auth, 'followers') ? $auth->followers()->count() : 0,
                ];

                // Append permissions for role-based accounts.
                if (method_exists($auth, 'roles') && $auth->roles()->exists()) {
                    $permissions = $auth->roles()
                        ->with('permissions')
                        ->get()
                        ->flatMap(function ($role) {
                            return $role->permissions->map(function ($permission) {
                                return [
                                    'id' => $permission->id,
                                    'name' => $permission->name,
                                    'module' => $permission->module,
                                    'action' => $permission->action,
                                    'display_name' => $permission->display_name
                                ];
                            });
                        })
                        ->unique('name')
                        ->values()
                        ->toArray();

                    $authData['user']['permissions'] = $permissions;

                    // Include the assigned roles.
                    $authData['user']['roles'] = $auth->roles()->get()->map(function ($role) {
                        return [
                            'id' => $role->id,
                            'name' => $role->name,
                            'display_name' => $role->display_name,
                            'color' => $role->color,
                            'level' => $role->level
                        ];
                    })->toArray();
                }
            } catch (\Exception $e) {
                // Default statistics when enrichment fails.
                $authData['user']['stats'] = [
                    'comments_count' => 0,
                    'saved_posts_count' => 0,
                    'following_count' => 0,
                    'followers_count' => 0,
                ];
            }
        }

        return [
            ...parent::share($request),
            'auth' => $authData,
        ];
    }
}
