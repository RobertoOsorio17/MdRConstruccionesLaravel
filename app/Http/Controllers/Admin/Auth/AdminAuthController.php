<?php

namespace App\Http\Controllers\Admin\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Providers\RouteServiceProvider;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;
use Carbon\Carbon;

class AdminAuthController extends Controller
{
    /**
     * Display the admin login view.
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
     */
    public function store(LoginRequest $request): RedirectResponse
    {
        // Enhanced rate limiting for admin login
        $key = 'admin-login:' . $request->ip();
        
        if (RateLimiter::tooManyAttempts($key, 5)) {
            $seconds = RateLimiter::availableIn($key);
            
            Log::warning('Admin login rate limit exceeded', [
                'ip' => $request->ip(),
                'email' => $request->email,
                'user_agent' => $request->userAgent(),
                'available_in' => $seconds
            ]);
            
            throw ValidationException::withMessages([
                'email' => trans('auth.throttle', [
                    'seconds' => $seconds,
                    'minutes' => ceil($seconds / 60),
                ]),
            ]);
        }

        // Validate credentials
        $credentials = $request->only('email', 'password');
        
        if (!Auth::attempt($credentials, $request->boolean('remember'))) {
            RateLimiter::hit($key);
            
            Log::warning('Failed admin login attempt', [
                'ip' => $request->ip(),
                'email' => $request->email,
                'user_agent' => $request->userAgent(),
                'timestamp' => now()
            ]);
            
            throw ValidationException::withMessages([
                'email' => trans('auth.failed'),
            ]);
        }

        // Check if user has admin privileges
        $user = Auth::user();
        
        if (!$user->hasRole(['admin', 'editor'])) {
            Auth::logout();
            
            Log::warning('Non-admin user attempted admin login', [
                'user_id' => $user->id,
                'email' => $user->email,
                'ip' => $request->ip(),
                'user_agent' => $request->userAgent()
            ]);
            
            throw ValidationException::withMessages([
                'email' => 'No tienes permisos para acceder al panel de administración.',
            ]);
        }

        // Check if user is banned
        if ($user->is_banned) {
            Auth::logout();
            
            Log::warning('Banned user attempted admin login', [
                'user_id' => $user->id,
                'email' => $user->email,
                'ip' => $request->ip(),
                'ban_reason' => $user->ban_reason
            ]);
            
            throw ValidationException::withMessages([
                'email' => 'Tu cuenta ha sido suspendida. Contacta al administrador.',
            ]);
        }

        // Clear rate limiting on successful login
        RateLimiter::clear($key);
        
        // Update last login timestamp
        $user->update([
            'last_login_at' => Carbon::now(),
            'last_login_ip' => $request->ip()
        ]);

        // Regenerate session for security
        $request->session()->regenerate();

        // Log successful admin login
        Log::info('Successful admin login', [
            'user_id' => $user->id,
            'email' => $user->email,
            'role' => $user->roles->pluck('name')->first(),
            'ip' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'timestamp' => now()
        ]);

        // Create audit log entry
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

        return redirect()->intended(route('admin.dashboard'));
    }

    /**
     * Destroy an authenticated admin session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $user = Auth::user();
        
        // Log admin logout
        if ($user) {
            Log::info('Admin logout', [
                'user_id' => $user->id,
                'email' => $user->email,
                'ip' => $request->ip(),
                'timestamp' => now()
            ]);

            // Create audit log entry
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

    /**
     * Check admin session status
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
     * Extend admin session
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

        // Regenerate session to extend lifetime
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
     * Get admin login statistics
     */
    public function loginStats(Request $request)
    {
        $user = Auth::user();
        
        if (!$user || !$user->hasRole(['admin', 'editor'])) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        // Get recent login attempts (last 24 hours)
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
                'rate_limit_window' => 60
            ]
        ]);
    }
}
