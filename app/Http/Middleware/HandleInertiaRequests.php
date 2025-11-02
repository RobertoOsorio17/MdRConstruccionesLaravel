<?php

namespace App\Http\Middleware;

use App\Helpers\VersionHelper;
use App\Models\AdminSetting;
use App\Services\ImpersonationService;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Middleware;

/**
 * Apply handle inertia middleware logic.
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

        // ⚡ PERFORMANCE: Eager load relationships to avoid N+1 queries
        if ($auth) {
            $auth->loadMissing(['roles.permissions']);
        }

        $authData = [
            'isAuthenticated' => !! $auth,
            'isGuest' => ! $auth,
            'user' => $auth ? $this->getUserData($auth) : null,
        ];

        // Get impersonation context
        $impersonationService = app(ImpersonationService::class);
        $impersonationContext = $impersonationService->isActive()
            ? $impersonationService->getSanitizedContext()
            : null;

        return [
            ...parent::share($request),
            'auth' => $authData,
            'csrf_token' => csrf_token(),
            'flash' => [
                'success' => $request->session()->get('success'),
                'error' => $request->session()->get('error'),
                'warning' => $request->session()->get('warning'),
                'info' => $request->session()->get('info'),
                '2fa_warning' => $request->session()->get('2fa_warning'),
                'impersonation_warning' => $request->session()->get('impersonation_warning'),
            ],
            'settings' => $this->getPublicSettings(),
            'security' => [
                'enable_2fa' => AdminSetting::getCachedValue('enable_2fa', false, 300),
                'user_has_2fa' => $auth ? !is_null($auth->two_factor_secret) : false,
            ],
            'impersonation' => $impersonationContext,
            'version' => VersionHelper::toArray(),
        ];
    }

    /**
     * Get user data with caching to avoid repeated queries.
     *
     * @param \App\Models\User $auth
     * @return array
     */
    protected function getUserData($auth): array
    {
        // ⚡ PERFORMANCE: Cache user data for 5 minutes to avoid repeated queries
        $cacheKey = 'user_data_' . $auth->id . '_' . $auth->updated_at->timestamp;

        return \Cache::remember($cacheKey, 300, function () use ($auth) {
            $userData = [
                'id' => $auth->id,
                'name' => $auth->name,
                'email' => $auth->email,
                'avatar' => $auth->avatar,
                'avatar_url' => $auth->avatar_url ?? null,
                'bio' => $auth->bio,
                'profession' => $auth->profession,
                'profile_visibility' => $auth->profile_visibility,
                'initials' => $auth->initials ?? null,
                'profile_completeness' => $auth->profile_completeness ?? 0,
                'email_verified_at' => $auth->email_verified_at,
                'is_email_verified' => ! is_null($auth->email_verified_at),
            ];

            // ⚡ PERFORMANCE: Get roles from eager-loaded relationship
            $rolesCollection = $auth->roles;
            if ($rolesCollection->isNotEmpty()) {
                $userData['roles'] = $rolesCollection->map(function ($role) {
                    return [
                        'id' => $role->id,
                        'name' => $role->name,
                        'display_name' => $role->display_name,
                        'color' => $role->color,
                        'level' => $role->level,
                    ];
                })->toArray();

                $userData['role'] = $rolesCollection->first()->name;

                // ⚡ PERFORMANCE: Get permissions from eager-loaded relationship
                $userData['permissions'] = $rolesCollection
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
            } elseif ($auth->role) {
                // ✅ FALLBACK: If no roles in relationship but has role field
                $userData['roles'] = [[
                    'name' => $auth->role,
                    'display_name' => ucfirst($auth->role),
                ]];
                $userData['role'] = $auth->role;
            } else {
                $userData['roles'] = [];
                $userData['role'] = null;
            }

            // ⚡ PERFORMANCE: Use withCount() instead of count() queries
            try {
                $auth->loadCount(['comments', 'savedPosts', 'following', 'followers']);

                $userData['stats'] = [
                    'comments_count' => $auth->comments_count ?? 0,
                    'saved_posts_count' => $auth->saved_posts_count ?? 0,
                    'following_count' => $auth->following_count ?? 0,
                    'followers_count' => $auth->followers_count ?? 0,
                ];
            } catch (\Exception $e) {
                $userData['stats'] = [
                    'comments_count' => 0,
                    'saved_posts_count' => 0,
                    'following_count' => 0,
                    'followers_count' => 0,
                ];
            }

            return $userData;
        });
    }

    /**
     * Get public settings to share with frontend.
     *
     * ⚡ PERFORMANCE: Load all settings at once instead of 30+ individual queries
     */
    protected function getPublicSettings(): array
    {
        try {
            // ⚡ PERFORMANCE: Get all settings with a single query
            $settings = AdminSetting::getAllCached(3600);

            $defaults = [
                'site_name' => config('app.name'),
                'site_tagline' => '',
                'site_logo' => null,
                'site_favicon' => null,
                'timezone' => 'UTC',
                'date_format' => 'Y-m-d',
                'time_format' => 'H:i',
                'locale' => 'es',
                'seo_title' => '',
                'seo_description' => '',
                'seo_keywords' => '',
                'og_image' => null,
                'company_name' => '',
                'company_phone' => '',
                'company_email' => '',
                'company_address' => '',
                'social_facebook' => '',
                'social_twitter' => '',
                'social_instagram' => '',
                'social_linkedin' => '',
                'social_youtube' => '',
                'blog_enabled' => true,
                'blog_posts_per_page' => 12,
                'blog_allow_comments' => true,
            ];

            // Merge settings with defaults
            return array_merge($defaults, array_intersect_key($settings, $defaults));
        } catch (\Exception $e) {
            // Return defaults if settings table doesn't exist yet
            return [
                'site_name' => config('app.name'),
                'timezone' => 'UTC',
                'locale' => 'es',
                'blog_enabled' => true,
            ];
        }
    }
}
