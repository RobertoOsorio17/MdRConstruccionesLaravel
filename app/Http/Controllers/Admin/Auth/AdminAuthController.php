<?php

namespace App\Http\Controllers\Admin\Auth;

use App\Http\Controllers\Auth\Concerns\HandlesTwoFactorLogin;
use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Manages administrator authentication by combining hardened login policies, authorization checks, and auditing hooks.
 * Protects the control panel through rate limiting, role validation, ban enforcement, and session lifecycle management.
 */
class AdminAuthController extends Controller
{
    use HandlesTwoFactorLogin;

    /**
     * Display the admin login view.
     *
     * @return Response Inertia response rendering the admin login form.
     */
    public function create(): Response
    {
        return Inertia::render('Admin/Auth/Login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => session('status'),
        ]);
    }

    /**
     * Handle an incoming admin authentication request.
     *
     * @param LoginRequest $request The validated login request instance.
     * @return RedirectResponse Redirect response targeting the intended admin area.
     */
    public function store(LoginRequest $request): RedirectResponse
    {
        // Enhanced rate limiting for admin login (IP + email hash).
        $emailHash = hash('sha256', strtolower($request->email));
        $ipKey = 'admin-login:' . $request->ip() . ':' . $emailHash;
        $emailKey = 'admin-login-email:' . $emailHash;

        Log::info('Admin login attempt started', [
            'email_hash' => $emailHash,
            'ip' => $request->ip(),
            'user_agent_hash' => hash('sha256', substr($request->userAgent(), 0, 100)),
            'timestamp' => now()->toISOString()
        ]);

        // ✅ SECURITY FIX: Stricter rate limiting for admin login
        // IP-based: 5 attempts per 15 minutes (was 5 per minute)
        // Email-based: 10 attempts per 15 minutes with progressive lockout (was 12 per minute)
        $ipExceeded = RateLimiter::tooManyAttempts($ipKey, 5);
        $emailAttempts = RateLimiter::attempts($emailKey);
        $emailMaxAttempts = $this->getEmailMaxAttempts($emailAttempts);
        $emailExceeded = RateLimiter::tooManyAttempts($emailKey, $emailMaxAttempts);

        if ($ipExceeded || $emailExceeded) {
            $seconds = max(
                RateLimiter::availableIn($ipKey),
                RateLimiter::availableIn($emailKey)
            );

            Log::warning('Admin login rate limit exceeded', [
                'ip' => $request->ip(),
                'email_hash' => $emailHash,
                'user_agent_hash' => hash('sha256', substr($request->userAgent(), 0, 100)),
                'available_in' => $seconds
            ]);
            
            throw ValidationException::withMessages([
                'email' => trans('auth.throttle', [
                    'seconds' => $seconds,
                    'minutes' => ceil($seconds / 60),
                ]),
            ]);
        }

        // ✅ SECURITY: Check if account is locked
        $lockoutService = app(\App\Services\AccountLockoutService::class);
        if ($lockoutService->isAccountLocked($request->email)) {
            $remainingSeconds = $lockoutService->getRemainingLockoutTime($request->email);
            $remainingMinutes = ceil($remainingSeconds / 60);

            Log::warning('Admin login attempt on locked account', [
                'email_hash' => $emailHash,
                'ip' => $request->ip(),
                'remaining_minutes' => $remainingMinutes
            ]);

            throw ValidationException::withMessages([
                'email' => "Tu cuenta ha sido bloqueada temporalmente debido a múltiples intentos fallidos. Intenta de nuevo en {$remainingMinutes} minutos.",
            ]);
        }

        $credentials = $request->only('email', 'password');

        if (!Auth::validate($credentials)) {
            // ✅ SECURITY FIX: IP-based 15 minutes decay (increased from 1 minute)
            RateLimiter::hit($ipKey, 900);

            // ✅ SECURITY FIX: Email-based progressive decay
            RateLimiter::hit($emailKey, $this->emailDecaySeconds());

            // ✅ SECURITY: Record failed attempt for account lockout
            $lockoutService->recordFailedAttempt($request->email, $request->ip());

            Log::warning('Failed admin login attempt', [
                'ip' => $request->ip(),
                'email_hash' => $emailHash,
                'user_agent_hash' => hash('sha256', substr($request->userAgent(), 0, 100)),
                'timestamp' => now()->toISOString()
            ]);

            throw ValidationException::withMessages([
                'email' => trans('auth.failed'),
            ]);
        }

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            RateLimiter::hit($key);
            throw ValidationException::withMessages([
                'email' => trans('auth.failed'),
            ]);
        }
        
        if (!$user->hasRole(['admin', 'editor'])) {
            Log::warning('Non-admin user attempted admin login', [
                'user_id' => $user->id,
                'email_hash' => hash('sha256', strtolower($user->email)),
                'ip' => $request->ip(),
                'user_agent_hash' => hash('sha256', substr($request->userAgent(), 0, 100))
            ]);
            
            throw ValidationException::withMessages([
                'email' => 'No tienes permisos para acceder al panel de administración.',
            ]);
        }

        // Check if the user is banned from the platform.
        if ($user->isBanned()) {
            $banStatus = $user->getBanStatus();

            Log::warning('Banned user attempted admin login', [
                'user_id' => $user->id,
                'email_hash' => hash('sha256', strtolower($user->email)),
                'ip' => $request->ip(),
                'ban_reason' => $banStatus['reason'] ?? null,
                'ban_expires_at' => $banStatus['expires_at'] ?? null,
            ]);
            
            throw ValidationException::withMessages([
                'email' => 'Tu cuenta ha sido suspendida. Contacta al administrador.',
            ]);
        }

        // Clear rate limiting on successful credential check.
        RateLimiter::clear($ipKey);
        RateLimiter::clear($emailKey);

        // ✅ SECURITY: Clear failed attempts and unlock account on successful login
        $lockoutService = app(\App\Services\AccountLockoutService::class);
        $lockoutService->clearFailedAttempts($request->email);

        $response = $this->completeInteractiveLogin(
            $request,
            $user,
            $request->boolean('remember'),
            route('admin.dashboard', absolute: false),
            'redirect'
        );

        if (Auth::id() === $user->id) {
            $request->session()->put('login_ip', $request->ip());
            $request->session()->put('login_user_agent', $request->userAgent());
            $request->session()->put('last_activity', now()->timestamp);

            if (!config('admin.allow_concurrent_sessions', false)) {
                cache()->put("user_session_{$user->id}", $request->session()->getId(), now()->addHours(8));
            }

            Log::info('Successful admin login', [
                'user_id' => $user->id,
                'email_hash' => hash('sha256', strtolower($user->email)),
                'role' => $user->roles->pluck('name')->first(),
                'ip' => $request->ip(),
                'user_agent_hash' => hash('sha256', substr($request->userAgent(), 0, 100)),
                'timestamp' => now()->toISOString()
            ]);

            if (class_exists(\App\Models\AuditLog::class)) {
                \App\Models\AuditLog::create([
                    'user_id' => $user->id,
                    'action' => 'admin_login',
                    'description' => 'Admin user logged in',
                    'ip_address' => $request->ip(),
                    'user_agent' => $request->userAgent(),
                    'metadata' => [
                        'role' => $user->roles->pluck('name')->first(),
                        'remember' => $request->boolean('remember')
                    ]
                ]);
            }
        }

        return $response;
    }

    /**
     * Destroy an authenticated admin session.
     *
     * @param Request $request The current HTTP request instance.
     * @return RedirectResponse Redirect response back to the admin login screen.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $user = Auth::user();

        // Log the administrator's logout action.
        if ($user) {
            Log::info('Admin logout', [
                'user_id' => $user->id,
                'email_hash' => hash('sha256', strtolower($user->email)),
                'ip' => $request->ip(),
                'timestamp' => now()
            ]);

            // Create the matching audit log entry when the model exists.
            if (class_exists(\App\Models\AuditLog::class)) {
                \App\Models\AuditLog::create([
                    'user_id' => $user->id,
                    'action' => 'admin_logout',
                    'description' => 'Admin user logged out',
                    'ip_address' => $request->ip(),
                    'user_agent' => $request->userAgent()
                ]);
            }
        }

        Auth::guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/admin/login');
    }

    private function adminEmailDecaySeconds(string $emailKey): int
    {
        $attempts = RateLimiter::attempts($emailKey);

        return match (true) {
            $attempts >= 20 => 7200,  // 2 hours for aggressive abuse
            $attempts >= 15 => 3600,
            $attempts >= 10 => 1800,
            $attempts >= 6 => 900,
            default => 300,
        };
    }

    /**
     * Check the current admin session status.
     *
     * @param Request $request The current HTTP request instance.
     * @return \Illuminate\Http\JsonResponse JSON response describing session and user data.
     */
    public function status(Request $request)
    {
        $user = Auth::user();
        
        if (!$user || !$user->hasRole(['admin', 'editor'])) {
            return response()->json([
                'authenticated' => false,
                'message' => 'No authenticated admin user'
            ], 401);
        }

        return response()->json([
            'authenticated' => true,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->roles->pluck('name')->first(),
                'last_login_at' => $user->last_login_at?->format('Y-m-d H:i:s'),
                'is_verified' => $user->is_verified
            ],
            'session' => [
                'expires_at' => $request->session()->get('_token') ? 
                    now()->addMinutes(config('session.lifetime'))->format('Y-m-d H:i:s') : null,
                'last_activity' => now()->format('Y-m-d H:i:s')
            ]
        ]);
    }

    /**
     * Extend the admin session lifetime by regenerating the session.
     *
     * @param Request $request The current HTTP request instance.
     * @return \Illuminate\Http\JsonResponse JSON response containing the new expiry timestamp.
     */
    public function extendSession(Request $request)
    {
        $user = Auth::user();
        
        if (!$user || !$user->hasRole(['admin', 'editor'])) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 401);
        }

        // Regenerate the session to extend its lifetime.
        $request->session()->regenerate();
        
        Log::info('Admin session extended', [
            'user_id' => $user->id,
            'ip' => $request->ip(),
            'timestamp' => now()
        ]);

        return response()->json([
            'success' => true,
            'expires_at' => now()->addMinutes(config('session.lifetime'))->format('Y-m-d H:i:s')
        ]);
    }

    /**
     * Provide recent admin login statistics and security context.
     *
     * @param Request $request The current HTTP request instance.
     * @return \Illuminate\Http\JsonResponse JSON response with session and security insights.
     */
    public function loginStats(Request $request)
    {
        $user = Auth::user();
        
        if (!$user || !$user->hasRole(['admin', 'editor'])) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        // Gather recent login attempts within the last 24 hours.
        $recentAttempts = collect();
        
        if (class_exists(\App\Models\AuditLog::class)) {
            $recentAttempts = \App\Models\AuditLog::where('action', 'admin_login')
                ->where('created_at', '>=', now()->subDay())
                ->orderBy('created_at', 'desc')
                ->limit(10)
                ->get();
        }

        return response()->json([
            'current_session' => [
                'user' => $user->only(['id', 'name', 'email']),
                'role' => $user->roles->pluck('name')->first(),
                'login_time' => $user->last_login_at?->format('Y-m-d H:i:s'),
                'ip_address' => $user->last_login_ip
            ],
            'recent_attempts' => $recentAttempts->map(function ($log) {
                return [
                    'user_id' => $log->user_id,
                    'timestamp' => $log->created_at->format('Y-m-d H:i:s'),
                    'ip_address' => $log->ip_address,
                    'success' => true // Only successful logins are logged
                ];
            }),
            'security_info' => [
                'session_timeout' => config('session.lifetime'),
                'rate_limit' => 5,
                'rate_limit_window' => 900 // ✅ Updated to 15 minutes (was 60 seconds)
            ]
        ]);
    }

    /**
     * Get progressive decay time based on number of failed attempts.
     * ✅ SECURITY: Progressive lockout with increasing delays
     */
    protected function emailDecaySeconds(): int
    {
        $emailKey = 'admin_login:email:' . hash('sha256', strtolower(request()->email ?? ''));
        $attempts = RateLimiter::attempts($emailKey);

        return match (true) {
            $attempts >= 15 => 3600, // 60 minutes lockout for persistent abuse
            $attempts >= 10 => 1800, // 30 minutes after 10 failures
            $attempts >= 6 => 900,   // 15 minutes after 6 failures
            default => 900,          // 15 minutes default
        };
    }

    /**
     * Get maximum allowed attempts based on current attempt count.
     * ✅ SECURITY: Progressive reduction of allowed attempts
     */
    protected function getEmailMaxAttempts(int $currentAttempts): int
    {
        return match (true) {
            $currentAttempts >= 10 => 1,  // Only 1 more attempt after 10 failures
            $currentAttempts >= 6 => 3,   // Only 3 more attempts after 6 failures
            default => 10,                // 10 attempts in first window (15 minutes)
        };
    }
}
