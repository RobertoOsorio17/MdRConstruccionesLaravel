<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Illuminate\Support\Str;
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
     * Handle the incoming request.
     */
    public function handle(Request $request, \Closure $next): \Symfony\Component\HttpFoundation\Response
    {
        // Register the URL resolver with Inertia before processing
        \Inertia\Inertia::resolveUrlUsing($this->urlResolver());

        // Check for any output before response (helps catch BOM issues)
        if (ob_get_length() > 0) {
            \Log::warning('Output detected before Inertia response', [
                'output_length' => ob_get_length(),
                'route' => $request->route()?->getName(),
                'url' => $request->fullUrl()
            ]);
            ob_clean();
        }

        return parent::handle($request, $next);
    }

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Provide a deterministic relative URL for every Inertia response.
     */
    public function urlResolver()
    {
        return function (Request $request): string {
            $relative = $request->getRequestUri() ?: '/';

            if ($relative === '' || $relative === false) {
                $relative = '/';
            }

            if (! Str::startsWith($relative, '/')) {
                $relative = '/'.$relative;
            }

            return $relative;
        };
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
            'isAuthenticated' => !! $auth,
            'isGuest' => ! $auth,
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
                'is_email_verified' => ! is_null($auth->email_verified_at),
            ] : null,
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
                                    'display_name' => $permission->display_name,
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
                            'level' => $role->level,
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
            'csrf_token' => csrf_token(),
            'flash' => [
                'success' => $request->session()->get('success'),
                'error' => $request->session()->get('error'),
                'warning' => $request->session()->get('warning'),
                'info' => $request->session()->get('info'),
            ],
        ];
    }
}
