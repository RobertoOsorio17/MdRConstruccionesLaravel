<?php

namespace App\Http\Controllers;

use App\Http\Requests\SubmitBanAppealRequest;
use App\Models\BanAppeal;
use App\Services\BanAppealService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

/**
 * BanAppealController
 *
 * Handles ban appeal operations for regular users including:
 * - Viewing appeal form
 * - Submitting new appeals
 * - Checking appeal status
 *
 * Follows SOLID principles with business logic delegated to BanAppealService.
 */
class BanAppealController extends Controller
{
    /**
     * The ban appeal service instance.
     *
     * @var BanAppealService
     */
    protected $banAppealService;

    /**
     * Create a new controller instance.
     *
     * @param BanAppealService $banAppealService The ban appeal service.
     */
    public function __construct(BanAppealService $banAppealService)
    {
        // ✅ SECURITY: No auth middleware - uses signed URLs instead
        // create() and store() routes are protected by 'signed' middleware in routes/web.php
        // index() route has 'auth' middleware applied directly in routes/web.php
        $this->banAppealService = $banAppealService;
    }

    /**
     * Show the ban appeal form with enhanced security validation.
     *
     * Displays the form for users to submit a ban appeal.
     * Checks if user is eligible to appeal.
     * Uses signed URL parameters instead of authentication.
     *
     * @param \Illuminate\Http\Request $request
     * @return \Inertia\Response|\Illuminate\Http\RedirectResponse
     */
    public function create(Request $request)
    {
        try {
            // ✅ SECURITY: Get user, ban, and token from signed URL parameters
            $userId = $request->query('user');
            $banId = $request->query('ban');
            $token = $request->query('token');

            if (!$userId || !$banId || !$token) {
                Log::warning('Ban appeal access attempt with missing parameters', [
                    'has_user' => !empty($userId),
                    'has_ban' => !empty($banId),
                    'has_token' => !empty($token),
                    'ip' => $request->ip(),
                ]);

                return redirect()->route('login')
                    ->with('error', 'Enlace de apelación inválido o expirado.');
            }

            $user = \App\Models\User::find($userId);
            $ban = \App\Models\UserBan::find($banId);

            // ✅ SECURITY: Verify user exists
            if (!$user) {
                return redirect()->route('login')
                    ->with('error', 'Usuario no encontrado.');
            }

            // ✅ SECURITY: Verify ban exists and belongs to user
            if (!$ban || $ban->user_id !== $user->id) {
                Log::warning('Ban appeal access attempt with mismatched user/ban', [
                    'user_id' => $userId,
                    'ban_id' => $banId,
                    'ban_user_id' => $ban?->user_id,
                    'ip' => $request->ip(),
                ]);

                return redirect()->route('login')
                    ->with('error', 'Baneo no encontrado o no pertenece a este usuario.');
            }

            // ✅ SECURITY: Verify token is valid and not expired
            if (!$ban->isAppealUrlTokenValid($token)) {
                Log::warning('Ban appeal access attempt with invalid/expired token', [
                    'user_id' => $user->id,
                    'ban_id' => $ban->id,
                    'token_expired' => $ban->appeal_url_expires_at?->isPast() ?? true,
                    'has_token' => !empty($ban->appeal_url_token),
                    'ip' => $request->ip(),
                ]);

                return redirect()->route('login')
                    ->with('error', 'Este enlace de apelación ha expirado. Por favor, intenta iniciar sesión de nuevo para obtener un nuevo enlace.');
            }

            // ✅ SECURITY: Verify ban is active
            if (!$ban->isCurrentlyActive()) {
                return redirect()->route('login')
                    ->with('error', 'Este baneo ya no está activo.');
            }

            // ✅ SECURITY: Check if user can appeal
            $canAppeal = $this->banAppealService->canUserAppeal($user);

            if (!$canAppeal['can_appeal']) {
                Log::warning('User attempted to access ban appeal form but is not eligible', [
                    'user_id' => $user->id,
                    'reason' => $canAppeal['reason']
                ]);

                return redirect()->route('login')
                    ->with('error', $canAppeal['reason']);
            }

            // ✅ AUDIT: Log form access
            Log::info('User accessed ban appeal form via signed URL', [
                'user_id' => $user->id,
                'ban_id' => $ban->id,
                'ip' => $request->ip()
            ]);

            return Inertia::render('BanAppeal/Create', [
                'ban' => [
                    'id' => $ban->id,
                    'reason' => $ban->reason,
                    'banned_at' => $ban->banned_at->format('d/m/Y H:i'),
                    'expires_at' => $ban->expires_at ? $ban->expires_at->format('d/m/Y H:i') : 'Permanente',
                    'is_permanent' => $ban->isPermanent(),
                    'banned_by' => $ban->bannedBy->name ?? 'Sistema',
                    'admin_notes' => $ban->admin_notes,
                ],
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                ],
                'maxFileSize' => 5 * 1024 * 1024, // 5MB in bytes
                'allowedFileTypes' => ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
                'minReasonLength' => 50,
                'maxReasonLength' => 2000,
            ]);
        } catch (\Exception $e) {
            Log::error('Error displaying ban appeal form', [
                'user_id' => $userId ?? null,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return redirect()->route('login')
                ->with('error', 'Error al cargar el formulario de apelación. Por favor, intenta de nuevo.');
        }
    }

    /**
     * Store a new ban appeal with enhanced security and validation.
     *
     * Processes the appeal submission with evidence upload.
     * Uses signed URL parameters instead of authentication.
     *
     * @param SubmitBanAppealRequest $request The validated appeal request.
     * @return \Illuminate\Http\RedirectResponse
     */
    public function store(SubmitBanAppealRequest $request)
    {
        try {
            // ✅ SECURITY: Get user, ban, and token from signed URL parameters
            $userId = $request->query('user');
            $banId = $request->query('ban');
            $token = $request->query('token');

            if (!$userId || !$banId || !$token) {
                return redirect()->route('login')
                    ->with('error', 'Enlace de apelación inválido o expirado.');
            }

            $user = \App\Models\User::find($userId);
            $ban = \App\Models\UserBan::find($banId);

            // ✅ SECURITY: Verify user and ban exist and match
            if (!$user || !$ban || $ban->user_id !== $user->id) {
                return redirect()->route('login')
                    ->with('error', 'Datos de apelación inválidos.');
            }

            // ✅ SECURITY: Verify token is valid and not expired
            if (!$ban->isAppealUrlTokenValid($token)) {
                Log::warning('Ban appeal submission attempt with invalid/expired token', [
                    'user_id' => $user->id,
                    'ban_id' => $ban->id,
                    'ip' => $request->ip(),
                ]);

                return redirect()->route('login')
                    ->with('error', 'Este enlace de apelación ha expirado. Por favor, intenta iniciar sesión de nuevo.');
            }

            // ✅ SECURITY: Double-check user can still appeal (prevent race conditions)
            $canAppeal = $this->banAppealService->canUserAppeal($user);
            if (!$canAppeal['can_appeal']) {
                return redirect()->route('login')
                    ->with('error', $canAppeal['reason']);
            }

            // ✅ SECURITY: Validate CSRF token (Laravel does this automatically, but log it)
            Log::info('Processing ban appeal submission via signed URL', [
                'user_id' => $user->id,
                'ban_id' => $ban->id,
                'ip' => $request->ip(),
                'has_evidence' => $request->hasFile('evidence')
            ]);

            // Submit the appeal
            $appeal = $this->banAppealService->submitAppeal($user, $request->validated());

            // ✅ SECURITY: Invalidate the appeal URL token after successful submission
            // This prevents reusing the same URL to submit multiple appeals
            $ban->invalidateAppealUrlToken();

            // ✅ AUDIT: Log successful submission
            // ⚠️ SECURITY: appeal_token removed from logs to prevent unauthorized access
            Log::info('Ban appeal submitted successfully', [
                'appeal_id' => $appeal->id,
                'user_id' => $user->id,
                'user_email' => $user->email,
                'ban_id' => $appeal->user_ban_id,
                'has_evidence' => !is_null($appeal->evidence_path),
                'ip' => $appeal->ip_address,
                'url_token_invalidated' => true,
            ]);

            // ✅ SECURITY: Use plain token for redirect (only available once after creation)
            $plainToken = $appeal->plainTokenTemp;

            if (!$plainToken) {
                // Fallback: if plain token is not available, redirect to home
                Log::error('Plain token not available after appeal creation', [
                    'appeal_id' => $appeal->id,
                ]);
                return redirect()->route('home')
                    ->with('success', 'Tu apelación ha sido enviada exitosamente. Recibirás una notificación por email cuando sea revisada.');
            }

            return redirect()->route('ban-appeal.status', $plainToken)
                ->with('success', 'Tu apelación ha sido enviada exitosamente. Recibirás una notificación por email cuando sea revisada.');
        } catch (\Exception $e) {
            Log::error('Failed to submit ban appeal', [
                'user_id' => auth()->id(),
                'error' => $e->getMessage(),
            ]);

            return back()
                ->withErrors(['error' => 'Error al enviar la apelación: ' . $e->getMessage()])
                ->withInput();
        }
    }

    /**
     * Show the status of a ban appeal.
     *
     * Displays the current status and details of an appeal using its token.
     *
     * @param Request $request The HTTP request.
     * @param string $token The appeal token.
     * @return \Inertia\Response|\Illuminate\Http\RedirectResponse
     */
    public function status(Request $request, string $token)
    {
        // ✅ SECURITY: Validate token format (prevent injection attacks)
        if (!preg_match('/^[a-zA-Z0-9]{64}$/', $token)) {
            Log::warning('Invalid ban appeal token format', [
                'token_length' => strlen($token),
                'ip' => $request->ip()
            ]);
            return redirect()->route('home')
                ->with('error', 'Token de apelación inválido.');
        }

        $appeal = $this->banAppealService->getAppealByToken($token);

        if (!$appeal) {
            // ✅ SECURITY: Log failed token lookups (potential brute force)
            Log::warning('Ban appeal token not found', [
                'token_prefix' => substr($token, 0, 8) . '...',
                'ip' => $request->ip(),
                'user_agent' => substr($request->userAgent() ?? '', 0, 100)
            ]);
            return redirect()->route('home')
                ->with('error', 'Apelación no encontrada.');
        }

        // ✅ SECURITY: Verify user owns this appeal
        // Allow access via token (for banned users) or authenticated session
        if (auth()->check() && $appeal->user_id !== auth()->id()) {
            Log::warning('Unauthorized ban appeal access attempt', [
                'appeal_id' => $appeal->id,
                'appeal_user_id' => $appeal->user_id,
                'accessing_user_id' => auth()->id(),
                'ip' => $request->ip()
            ]);
            abort(403, 'No tienes permiso para ver esta apelación.');
        }

        // ✅ AUDIT: Log successful access
        Log::info('Ban appeal status viewed', [
            'appeal_id' => $appeal->id,
            'user_id' => $appeal->user_id,
            'viewer_id' => auth()->id(),
            'ip' => $request->ip()
        ]);

        return Inertia::render('BanAppeal/Status', [
            'appeal' => [
                'id' => $appeal->id,
                'reason' => $appeal->reason,
                'status' => $appeal->status,
                'status_label' => $appeal->getStatusLabel(),
                'status_color' => $appeal->getStatusColor(),
                'admin_response' => $appeal->admin_response,
                'evidence_url' => $this->banAppealService->getEvidenceUrl($appeal), // ✅ Use signed URL
                'created_at' => $appeal->created_at->format('d/m/Y H:i'),
                'reviewed_at' => $appeal->reviewed_at ? $appeal->reviewed_at->format('d/m/Y H:i') : null,
                'reviewed_by_name' => $appeal->reviewedBy->name ?? null, // ✅ Changed from reviewed_by
            ],
            'ban' => [
                'reason' => $appeal->userBan->reason,
                'banned_at' => $appeal->userBan->banned_at->format('d/m/Y H:i'),
                'expires_at' => $appeal->userBan->expires_at ? $appeal->userBan->expires_at->format('d/m/Y H:i') : 'Permanente',
                'is_permanent' => $appeal->userBan->isPermanent(),
                'is_active' => $appeal->userBan->isCurrentlyActive(), // ✅ Added is_active
                'banned_by' => $appeal->userBan->bannedBy->name ?? 'Sistema',
            ],
        ]);
    }

    /**
     * Serve evidence file with signed URL validation.
     *
     * ✅ SECURITY FIX: Now validates Laravel's signed URL which includes expires
     * in the signature, preventing timestamp manipulation attacks.
     *
     * @param Request $request The HTTP request.
     * @param BanAppeal $appeal The appeal.
     * @return \Symfony\Component\HttpFoundation\StreamedResponse|\Illuminate\Http\RedirectResponse
     */
    public function evidence(Request $request, BanAppeal $appeal)
    {
        // ✅ SECURITY: Validate Laravel's signed URL (includes expires in signature)
        // This prevents manipulation of the expires parameter
        if (!$request->hasValidSignature()) {
            Log::warning('Invalid evidence URL signature', [
                'appeal_id' => $appeal->id,
                'ip' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ]);
            abort(403, 'URL inválida o expirada.');
        }

        // ✅ SECURITY: Verify evidence exists
        if (!$appeal->evidence_path || !Storage::disk('private')->exists($appeal->evidence_path)) {
            abort(404, 'Evidencia no encontrada.');
        }

        // ✅ AUDIT: Log evidence access
        Log::info('Ban appeal evidence accessed', [
            'appeal_id' => $appeal->id,
            'user_id' => $appeal->user_id,
            'ip' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        // Serve the file
        return Storage::disk('private')->response($appeal->evidence_path);
    }
}
