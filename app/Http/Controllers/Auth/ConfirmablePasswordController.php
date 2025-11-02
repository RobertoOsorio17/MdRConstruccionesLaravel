<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Oversees password confirmation flows that gate sensitive account operations behind re-authentication.
 * Couples Fortify's verification logic with rate limiting and logging to reinforce session security before critical changes execute.
 */
class ConfirmablePasswordController extends Controller
{
    
    
    
    
    /**

    
    
    
     * Display the specified resource.

    
    
    
     *

    
    
    
     * @return Response

    
    
    
     */
    
    
    
    
    
    
    
    public function show(): Response
    {
        return Inertia::render('Auth/ConfirmPassword');
    }

    
    
    
    
    /**

    
    
    
     * Store a newly created resource.

    
    
    
     *

    
    
    
     * @param Request $request The request.

    
    
    
     * @return RedirectResponse

    
    
    
     */
    
    
    
    
    
    
    
    public function store(Request $request): RedirectResponse
    {
        $user = $request->user();

        // Rate limiting for password confirmation attempts
        $key = 'password-confirm:' . $user->id . ':' . $request->ip();

        if (RateLimiter::tooManyAttempts($key, 5)) {
            $seconds = RateLimiter::availableIn($key);

            Log::warning('Password confirmation rate limit exceeded', [
                'user_id' => $user->id,
                'user_email' => $user->email,
                'ip' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'available_in_seconds' => $seconds,
                'timestamp' => now()->toISOString()
            ]);

            throw ValidationException::withMessages([
                'password' => "Demasiados intentos. Intenta de nuevo en " . ceil($seconds / 60) . " minutos.",
            ]);
        }

        // Validate password
        if (! Auth::guard('web')->validate([
            'email' => $user->email,
            'password' => $request->password,
        ])) {
            // Record failed attempt
            RateLimiter::hit($key, 300); // 5 minutes decay

            Log::warning('Password confirmation failed', [
                'user_id' => $user->id,
                'user_email' => $user->email,
                'ip' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'timestamp' => now()->toISOString()
            ]);

            throw ValidationException::withMessages([
                'password' => __('auth.password'),
            ]);
        }

        // Clear rate limiting on successful confirmation
        RateLimiter::clear($key);

        // Regenerate session for security
        $request->session()->regenerate();
        $request->session()->put('auth.password_confirmed_at', time());

        // Log successful password confirmation
        Log::info('Password confirmation successful', [
            'user_id' => $user->id,
            'user_email' => $user->email,
            'user_roles' => $this->getUserRoles($user),
            'ip' => $request->ip(),
            'intended_url' => session('url.intended'),
            'timestamp' => now()->toISOString()
        ]);

        // Secure role-based redirect logic
        $intendedUrl = session('url.intended');

        // Validate intended URL is safe for user's role
        if ($intendedUrl && $this->isUrlSafeForUser($intendedUrl, $user)) {
            return redirect()->intended();
        }

        // Default role-based redirect
        if ($user->hasPermission('dashboard.access')) {
            return redirect()->route('dashboard', absolute: false);
        } else {
            return redirect()->route('user.dashboard', absolute: false);
        }
    }

    
    
    
    
    /**

    
    
    
     * Determine whether url safe for user.

    
    
    
     *

    
    
    
     * @param string $url The url.

    
    
    
     * @param mixed $user The user.

    
    
    
     * @return bool

    
    
    
     */
    
    
    
    
    
    
    
    private function isUrlSafeForUser(string $url, $user): bool
    {
        // Admin/editor URLs should only be accessible to admin/editor users
        if (str_contains($url, '/admin') && !$user->hasRole(['admin', 'editor'])) {
            Log::warning('User attempted to access admin URL after password confirmation', [
                'user_id' => $user->id,
                'user_roles' => $this->getUserRoles($user),
                'intended_url' => $url,
                'timestamp' => now()->toISOString()
            ]);
            return false;
        }

        return true;
    }

    
    
    
    
    /**

    
    
    
     * Get user roles.

    
    
    
     *

    
    
    
     * @param mixed $user The user.

    
    
    
     * @return array

    
    
    
     */
    
    
    
    
    
    
    
    private function getUserRoles($user): array
    {
        $userRoles = [];

        if (method_exists($user, 'roles') && $user->roles()->exists()) {
            $userRoles = $user->roles->pluck('name')->toArray();
        }

        if (empty($userRoles) && !empty($user->role)) {
            $userRoles = [$user->role];
        }

        return array_unique($userRoles);
    }
}
