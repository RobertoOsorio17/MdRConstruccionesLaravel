<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;
use App\Services\BanAppealService;

class EnsureUserNotBanned
{
    /**
     * The ban appeal service instance.
     *
     * @var \App\Services\BanAppealService
     */
    protected $banAppealService;

    /**
     * Create a new middleware instance.
     *
     * @param \App\Services\BanAppealService $banAppealService
     * @return void
     */
    public function __construct(BanAppealService $banAppealService)
    {
        $this->banAppealService = $banAppealService;
    }

    /**
     * Handle an incoming request with enhanced ban appeal information.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = Auth::user();

        if ($user && method_exists($user, 'isBanned') && $user->isBanned()) {
            // Get ban appeal eligibility information
            $canAppeal = $this->banAppealService->canUserAppeal($user);

            // Get active ban information
            $activeBan = $user->currentBan();

            // Prepare ban information
            $banInfo = [
                'reason' => $activeBan->reason ?? 'No especificada',
                'banned_at' => $activeBan->banned_at?->format('d/m/Y H:i') ?? null,
                'expires_at' => $activeBan->expires_at?->format('d/m/Y H:i') ?? 'Permanente',
                'is_permanent' => $activeBan->is_permanent ?? false,
            ];

            // ✅ SECURITY: Generate signed URL with token if user can appeal
            $appealUrl = null;
            if ($canAppeal['can_appeal'] && $activeBan) {
                // Generate a unique token for this appeal URL (valid for 1 hour)
                $token = $activeBan->generateAppealUrlToken(60);

                // Generate signed URL with the token
                $appealUrl = \Illuminate\Support\Facades\URL::temporarySignedRoute(
                    'ban-appeal.create',
                    now()->addHour(),
                    [
                        'user' => $user->id,
                        'ban' => $activeBan->id,
                        'token' => $token,
                    ]
                );
            }

            // Prepare appeal information
            $appealInfo = [
                'can_appeal' => $canAppeal['can_appeal'],
                'reason' => $canAppeal['reason'] ?? null,
                'appeal_url' => $appealUrl,
            ];

            // If user has an existing appeal, include its information
            if (isset($canAppeal['appeal'])) {
                $appeal = $canAppeal['appeal'];
                $appealInfo['existing_appeal'] = [
                    'status' => $appeal->status,
                    'status_label' => $appeal->status_label ?? ucfirst($appeal->status),
                    'submitted_at' => $appeal->created_at->format('d/m/Y H:i'),
                    // ✅ SECURITY FIX: Use issueStatusToken() to get plain token for URL
                    'view_url' => route('ban-appeal.status', $appeal->issueStatusToken()),
                ];
            }

            // For API/JSON, return a structured error with appeal information
            return response()->json([
                'success' => false,
                'message' => 'Tu cuenta está baneada y no puede acceder a este recurso.',
                'error' => 'ACCOUNT_BANNED',
                'ban' => $banInfo,
                'appeal' => $appealInfo,
            ], 403);
        }

        return $next($request);
    }
}

