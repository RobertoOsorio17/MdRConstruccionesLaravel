<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;

class AuthenticatedSessionController extends Controller
{
    /**
     * Display the login view.
     */
    public function create(): Response
    {
        Log::info('Login page accessed', [
            'ip' => request()->ip(),
            'user_agent' => request()->userAgent(),
            'session_id' => session()->getId(),
            'timestamp' => now()->toISOString()
        ]);

        return Inertia::render('Auth/LoginMUI', [
            'canResetPassword' => Route::has('password.request'),
            'status' => session('status'),
        ]);
    }

    /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request): RedirectResponse
    {
        Log::info('Login attempt started', [
            'email' => $request->email,
            'ip' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'session_id' => session()->getId(),
            'timestamp' => now()->toISOString()
        ]);

        try {
            $request->authenticate();

            // Check if user is banned after authentication
            $user = Auth::user();
            if ($user->isBanned()) {
                $banStatus = $user->getBanStatus();

                // Log the banned login attempt
                Log::warning('Banned user attempted login', [
                    'user_id' => $user->id,
                    'user_email' => $user->email,
                    'ban_reason' => $banStatus['reason'],
                    'ban_expires' => $banStatus['expires_at'],
                    'ip' => $request->ip(),
                    'timestamp' => now()->toISOString()
                ]);

                // Logout the user immediately
                Auth::logout();
                $request->session()->invalidate();
                $request->session()->regenerateToken();

                // Redirect back to login with error message
                $errorMessage = 'Tu cuenta ha sido suspendida.';
                if ($banStatus['reason']) {
                    $errorMessage .= ' Motivo: ' . $banStatus['reason'];
                }
                if ($banStatus['expires_at']) {
                    $errorMessage .= ' La suspensiÃƒÆ’Ã‚Â³n expira el: ' . $banStatus['expires_at'];
                } else {
                    $errorMessage .= ' Esta suspensiÃƒÆ’Ã‚Â³n es permanente.';
                }

                return redirect()->route('login')->withErrors([
                    'email' => $errorMessage
                ]);
            }

            Log::info('Authentication successful', [
                'user_id' => Auth::id(),
                'user_email' => Auth::user()->email,
                'ip' => $request->ip(),
                'session_id' => session()->getId(),
                'previous_login' => Auth::user()->last_login_at,
                'timestamp' => now()->toISOString()
            ]);

            // Enhanced session security: regenerate session ID and token
            $oldSessionId = session()->getId();
            $request->session()->regenerate();
            $request->session()->regenerateToken();

            // Initialize session activity tracking
            session(['last_activity' => time()]);

            // Update last_login_at and IP immediately upon successful login
            $user->forceFill([
                'last_login_at' => now(),
                'last_login_ip' => $request->ip()
            ])->save();

            Log::info('Secure session regenerated after login', [
                'user_id' => Auth::id(),
                'user_email' => $user->email,
                'old_session_id' => $oldSessionId,
                'new_session_id' => session()->getId(),
                'last_login_updated' => now()->toISOString(),
                'login_ip' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'timestamp' => now()->toISOString()
            ]);

            // Redirect based on user permissions
            if ($user && $user->hasPermission('dashboard.access')) {
                return redirect()->intended(route('dashboard', absolute: false));
            } else {
                return redirect()->intended(route('user.dashboard', absolute: false));
            }
            
        } catch (\Exception $e) {
            Log::error('Login failed', [
                'email' => $request->email,
                'error' => $e->getMessage(),
                'ip' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'session_id' => session()->getId(),
                'timestamp' => now()->toISOString()
            ]);
            
            throw $e;
        }
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $userId = Auth::id();
        $userEmail = Auth::user()?->email;
        
        Log::info('Logout initiated', [
            'user_id' => $userId,
            'user_email' => $userEmail,
            'ip' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'session_id' => session()->getId(),
            'timestamp' => now()->toISOString()
        ]);

        Auth::guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();
        
        Log::info('Logout completed', [
            'former_user_id' => $userId,
            'former_user_email' => $userEmail,
            'ip' => $request->ip(),
            'new_session_id' => session()->getId(),
            'timestamp' => now()->toISOString()
        ]);

        return redirect('/');
    }
}
