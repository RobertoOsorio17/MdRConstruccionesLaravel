<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Auth\Concerns\DetectsNewDevices;
use App\Http\Controllers\Auth\Concerns\HandlesTwoFactorLogin;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Route;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Governs the lifecycle of user sessions, overseeing login rendering, authentication, and secure logout routines.
 * Integrates logging, policy enforcement, and multi-factor hooks to uphold platform security standards.
 */
class AuthenticatedSessionController extends Controller
{
    use HandlesTwoFactorLogin, DetectsNewDevices;

    
    
    
    
    /**

    
    
    
     * Show the form for creating a new resource.

    
    
    
     *

    
    
    
     * @return Response

    
    
    
     */
    
    
    
    
    
    
    
    public function create(): Response
    {
        Log::info('Login page accessed', [
            'ip' => request()->ip(),
            'user_agent_hash' => hash('sha256', substr(request()->userAgent() ?? 'unknown', 0, 100)),
            'timestamp' => now()->toISOString()
        ]);

        return Inertia::render('Auth/LoginNew', [
            'canResetPassword' => Route::has('password.request'),
            'status' => session('status'),
        ]);
    }

    
    
    
    
    /**

    
    
    
     * Store a newly created resource.

    
    
    
     *

    
    
    
     * @param LoginRequest $request The request.

    
    
    
     * @return RedirectResponse

    
    
    
     */
    
    
    
    
    
    
    
    public function store(LoginRequest $request): RedirectResponse
    {
        // ✅ FIXED: Don't log full email, use masked version
        Log::info('Login attempt started', [
            'email_hash' => hash('sha256', strtolower($request->email)),
            'ip' => $request->ip(),
            'user_agent_hash' => hash('sha256', substr($request->userAgent(), 0, 100)),
            'timestamp' => now()->toISOString()
        ]);

        try {
            // Verify credentials WITHOUT authenticating yet
            $credentials = $request->only('email', 'password');

            if (!Auth::validate($credentials)) {
                throw ValidationException::withMessages([
                    'email' => __('auth.failed'),
                ]);
            }

            // Get user without authenticating
            $user = \App\Models\User::where('email', $request->email)->first();
            if ($user->isBanned()) {
                $banStatus = $user->getBanStatus();
                $currentBan = $user->currentBan();

                // Log the banned login attempt
                Log::warning('Banned user attempted login', [
                    'user_id' => $user->id,
                    'email_hash' => hash('sha256', strtolower($user->email)),
                    'ban_reason' => $banStatus['reason'],
                    'ban_expires' => $banStatus['expires_at'],
                    'ip' => $request->ip(),
                    'timestamp' => now()->toISOString()
                ]);

                // User is not authenticated yet, so no need to logout
                // Just clear any session data and regenerate token
                $request->session()->invalidate();
                $request->session()->regenerateToken();

                // Check if user can appeal this ban
                $banAppealService = app(\App\Services\BanAppealService::class);
                $appealEligibility = $banAppealService->canUserAppeal($user);

                // ✅ SECURITY: Generate signed URL with token tracking (valid for 1 hour)
                $appealUrl = null;
                if ($appealEligibility['can_appeal']) {
                    // Generate a unique token for this appeal URL
                    $token = $currentBan->generateAppealUrlToken(60); // 60 minutes

                    // Generate signed URL with the token
                    $appealUrl = \Illuminate\Support\Facades\URL::temporarySignedRoute(
                        'ban-appeal.create',
                        now()->addHour(), // 1 hour expiration
                        [
                            'user' => $user->id,
                            'ban' => $currentBan->id,
                            'token' => $token, // Include token in URL
                        ]
                    );

                    Log::info('Generated new appeal URL with token', [
                        'user_id' => $user->id,
                        'ban_id' => $currentBan->id,
                        'token_expires_at' => $currentBan->appeal_url_expires_at->toISOString(),
                    ]);
                }

                // ✅ SECURITY: Throw ValidationException with bannedUser error for modal handling
                // Similar to requires2FA pattern
                throw ValidationException::withMessages([
                    'bannedUser' => 'true',
                    'banInfo' => json_encode([
                        'reason' => $banStatus['reason'] ?? 'No especificada',
                        'banned_at' => $currentBan->banned_at?->format('d/m/Y H:i') ?? null,
                        'expires_at' => $currentBan->expires_at?->format('d/m/Y H:i') ?? null,
                        'is_permanent' => $currentBan->isPermanent(),
                        'is_irrevocable' => $currentBan->isIrrevocable(),
                        'can_appeal' => $appealEligibility['can_appeal'],
                        'appeal_reason' => $appealEligibility['reason'] ?? null,
                        'has_existing_appeal' => $currentBan->hasAppeal(),
                        'existing_appeal_status' => $currentBan->hasAppeal() ? $currentBan->appeal->status : null,
                        'appeal_url' => $appealUrl, // ✅ Signed URL for appeal
                    ])
                ]);
            }

            // ✅ FIXED: Don't log email in success logs
            Log::info('Credentials verified successfully', [
                'user_id' => $user->id,
                'ip' => $request->ip(),
                'timestamp' => now()->toISOString()
            ]);

            // ✅ SECURITY FIX: Session regeneration moved to completeInteractiveLogin
            // to avoid CSRF token mismatch when 2FA modal is shown
            // Session will be regenerated AFTER 2FA verification or immediately if no 2FA

            return $this->completeInteractiveLogin(
                $request,
                $user,
                $request->boolean('remember')
            );

        } catch (\Exception $e) {
            // ✅ FIXED: Don't log email or session ID
            Log::error('Login failed', [
                'error' => class_basename($e),
                'ip' => $request->ip(),
                'user_agent_hash' => hash('sha256', substr($request->userAgent(), 0, 100)),
                'timestamp' => now()->toISOString()
            ]);

            throw $e;
        }
    }

    
    
    
    
    /**

    
    
    
     * Remove the specified resource.

    
    
    
     *

    
    
    
     * @param Request $request The request.

    
    
    
     * @return RedirectResponse

    
    
    
     */
    
    
    
    
    
    
    
    public function destroy(Request $request): RedirectResponse
    {
        $user = Auth::user();
        $userId = Auth::id();

        // ✅ FIXED: Don't log email or session IDs
        Log::info('Logout initiated', [
            'user_id' => $userId,
            'ip' => $request->ip(),
            'timestamp' => now()->toISOString()
        ]);

        // ✅ SECURITY FIX: Log logout event before logging out
        if ($user) {
            \App\Services\SecurityLogger::logLogout($user, 'user_initiated');
        }

        Auth::guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        // ✅ FIXED: Minimal logging
        Log::info('Logout completed', [
            'former_user_id' => $userId,
            'ip' => $request->ip(),
            'timestamp' => now()->toISOString()
        ]);

        return redirect('/');
    }
}
