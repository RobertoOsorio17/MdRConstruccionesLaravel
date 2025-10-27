<?php

namespace App\Http\Middleware;

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
        $authData = [
            'isAuthenticated' => !! $auth,
            'isGuest' => ! $auth,
            'user' => $auth ? [
                'id' => $auth->id,
                'name' => $auth->name,
                'email' => $auth->email,
                'avatar' => $auth->avatar,
                'avatar_url' => $auth->avatar_url ?? null,
                // ✅ FIXED: getRoleNames() returns Collection, convert to array
                'roles' => $auth->roles->pluck('name')->toArray(),
                'role' => $auth->roles->first()?->name, // ✅ Primary role for backward compatibility
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
        ];
    }

    /**
     * Get public settings to share with frontend.
     */
    protected function getPublicSettings(): array
    {
        try {
            return [
                // General Settings
                'site_name' => AdminSetting::getCachedValue('site_name', config('app.name'), 3600),
                'site_tagline' => AdminSetting::getCachedValue('site_tagline', '', 3600),
                'site_logo' => AdminSetting::getCachedValue('site_logo', null, 3600),
                'site_favicon' => AdminSetting::getCachedValue('site_favicon', null, 3600),
                'timezone' => AdminSetting::getCachedValue('timezone', 'UTC', 3600),
                'date_format' => AdminSetting::getCachedValue('date_format', 'Y-m-d', 3600),
                'time_format' => AdminSetting::getCachedValue('time_format', 'H:i', 3600),
                'locale' => AdminSetting::getCachedValue('locale', 'es', 3600),

                // SEO Settings
                'seo_title' => AdminSetting::getCachedValue('seo_title', '', 3600),
                'seo_description' => AdminSetting::getCachedValue('seo_description', '', 3600),
                'seo_keywords' => AdminSetting::getCachedValue('seo_keywords', '', 3600),
                'og_image' => AdminSetting::getCachedValue('og_image', null, 3600),

                // Company Information
                'company_name' => AdminSetting::getCachedValue('company_name', '', 3600),
                'company_phone' => AdminSetting::getCachedValue('company_phone', '', 3600),
                'company_email' => AdminSetting::getCachedValue('company_email', '', 3600),
                'company_address' => AdminSetting::getCachedValue('company_address', '', 3600),

                // Social Media
                'social_facebook' => AdminSetting::getCachedValue('social_facebook', '', 3600),
                'social_twitter' => AdminSetting::getCachedValue('social_twitter', '', 3600),
                'social_instagram' => AdminSetting::getCachedValue('social_instagram', '', 3600),
                'social_linkedin' => AdminSetting::getCachedValue('social_linkedin', '', 3600),
                'social_youtube' => AdminSetting::getCachedValue('social_youtube', '', 3600),

                // Blog Settings
                'blog_enabled' => AdminSetting::getCachedValue('blog_enabled', true, 300),
                'blog_posts_per_page' => AdminSetting::getCachedValue('blog_posts_per_page', 12, 300),
                'blog_allow_comments' => AdminSetting::getCachedValue('blog_allow_comments', true, 300),
            ];
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
