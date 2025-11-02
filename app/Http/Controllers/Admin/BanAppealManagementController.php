<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ReviewBanAppealRequest;
use App\Models\BanAppeal;
use App\Services\BanAppealService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

/**
 * BanAppealManagementController
 *
 * Handles administrative operations for ban appeals including:
 * - Listing all appeals with filters
 * - Viewing appeal details
 * - Approving/rejecting appeals
 * - Requesting more information
 *
 * Follows SOLID principles with business logic delegated to BanAppealService.
 */
class BanAppealManagementController extends Controller
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
        $this->middleware(['auth', 'role:admin']);
        $this->middleware(\App\Http\Middleware\ValidateBanAppealAccess::class);
        $this->banAppealService = $banAppealService;
    }

    /**
     * Display a listing of ban appeals with enhanced security validation.
     *
     * Shows all appeals with filtering options (pending/approved/rejected/all).
     *
     * @param Request $request The HTTP request.
     * @return \Inertia\Response
     */
    public function index(Request $request)
    {
        try {
            // ✅ SECURITY: Validate status parameter
            $status = $request->get('status', 'pending');
            $allowedStatuses = ['all', 'pending', 'approved', 'rejected', 'more_info_requested'];

            if (!in_array($status, $allowedStatuses)) {
                $status = 'pending';
            }

            // ✅ SECURITY: Validate per_page parameter
            $perPage = (int) $request->get('per_page', 15);
            if ($perPage < 1 || $perPage > 100) {
                $perPage = 15;
            }

            // ✅ AUDIT: Log admin access
            Log::info('Admin accessed ban appeals list', [
                'admin_id' => auth()->id(),
                'admin_email' => auth()->user()->email,
                'status_filter' => $status,
                'per_page' => $perPage
            ]);

            // Build filters array
            $filters = [];
            if ($status !== 'all') {
                $filters['status'] = $status;
            }

            $appeals = $this->banAppealService->getAppeals($filters, $perPage);
            $statistics = $this->banAppealService->getAppealStatistics();

            return Inertia::render('Admin/BanAppeals/Index', [
                'appeals' => $appeals->through(fn($appeal) => [
                    'id' => $appeal->id,
                    // ✅ SECURITY: Show truncated token to prevent exposure in admin UI
                    'appeal_token' => $appeal->truncated_token,
                    'user' => [
                        'id' => $appeal->user->id,
                        'name' => $appeal->user->name,
                        'email' => $appeal->user->email,
                    ],
                    'ban' => [
                        'id' => $appeal->userBan->id,
                        'reason' => $appeal->userBan->reason,
                        'is_permanent' => $appeal->userBan->isPermanent(),
                    ],
                    'status' => $appeal->status,
                    'status_label' => $appeal->getStatusLabel(),
                    'status_color' => $appeal->getStatusColor(),
                    'reason' => substr($appeal->reason, 0, 150) . (strlen($appeal->reason) > 150 ? '...' : ''),
                    'has_evidence' => !is_null($appeal->evidence_path),
                    'created_at' => $appeal->created_at->format('d/m/Y H:i'),
                    'reviewed_at' => $appeal->reviewed_at ? $appeal->reviewed_at->format('d/m/Y H:i') : null,
                    'reviewed_by' => $appeal->reviewedBy->name ?? null,
                ]),
                'filters' => [
                    'status' => $status,
                    'per_page' => $perPage,
                ],
                'statistics' => $statistics,
                'allowedStatuses' => $allowedStatuses,
            ]);
        } catch (\Exception $e) {
            Log::error('Error loading ban appeals list', [
                'admin_id' => auth()->id(),
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return redirect()->route('admin.dashboard')
                ->with('error', 'Error al cargar la lista de apelaciones.');
        }
    }

    /**
     * Display the specified ban appeal.
     *
     * Shows full details of an appeal for review.
     *
     * @param BanAppeal $appeal The ban appeal to display.
     * @return \Inertia\Response
     */
    public function show(BanAppeal $appeal)
    {
        $appeal->load(['user', 'userBan.bannedBy', 'reviewedBy']);

        return Inertia::render('Admin/BanAppeals/Show', [
            'appeal' => [
                'id' => $appeal->id,
                'reason' => $appeal->reason,
                'status' => $appeal->status,
                'status_label' => $appeal->getStatusLabel(),
                'status_color' => $appeal->getStatusColor(),
                'admin_response' => $appeal->admin_response,
                'evidence_url' => $this->banAppealService->getEvidenceUrl($appeal, 120), // ✅ Use signed URL with 2h expiration for admins
                'ip_address' => $appeal->ip_address,
                'user_agent' => $appeal->user_agent,
                'created_at' => $appeal->created_at->format('d/m/Y H:i'),
                'reviewed_at' => $appeal->reviewed_at ? $appeal->reviewed_at->format('d/m/Y H:i') : null,
                'reviewed_by' => $appeal->reviewedBy ? [
                    'id' => $appeal->reviewedBy->id,
                    'name' => $appeal->reviewedBy->name,
                ] : null,
                'can_be_reviewed' => $appeal->canBeReviewed(),
            ],
            'user' => [
                'id' => $appeal->user->id,
                'name' => $appeal->user->name,
                'email' => $appeal->user->email,
                'created_at' => $appeal->user->created_at->format('d/m/Y H:i'),
            ],
            'ban' => [
                'id' => $appeal->userBan->id,
                'reason' => $appeal->userBan->reason,
                'banned_at' => $appeal->userBan->banned_at->format('d/m/Y H:i'),
                'expires_at' => $appeal->userBan->expires_at ? $appeal->userBan->expires_at->format('d/m/Y H:i') : 'Permanente',
                'is_permanent' => $appeal->userBan->isPermanent(),
                'is_active' => $appeal->userBan->isCurrentlyActive(),
                'banned_by' => $appeal->userBan->bannedBy ? [
                    'id' => $appeal->userBan->bannedBy->id,
                    'name' => $appeal->userBan->bannedBy->name,
                ] : null,
            ],
        ]);
    }

    /**
     * Approve a ban appeal with enhanced security validation.
     *
     * Approves the appeal and unbans the user.
     *
     * @param ReviewBanAppealRequest $request The validated request.
     * @param BanAppeal $appeal The appeal to approve.
     * @return \Illuminate\Http\RedirectResponse
     */
    public function approve(ReviewBanAppealRequest $request, BanAppeal $appeal)
    {
        try {
            $admin = auth()->user();

            // ✅ SECURITY: Verify admin has permission
            if (!$admin->hasRole('admin')) {
                abort(403, 'No tienes permisos para aprobar apelaciones.');
            }

            // ✅ SECURITY: Verify appeal can be reviewed
            if (!$appeal->canBeReviewed()) {
                return back()
                    ->with('error', 'Esta apelación ya ha sido revisada.');
            }

            // ✅ SECURITY: Verify appeal belongs to an active ban
            if (!$appeal->userBan || !$appeal->userBan->isCurrentlyActive()) {
                return back()
                    ->with('error', 'El baneo asociado a esta apelación no está activo.');
            }

            // ✅ AUDIT: Log approval attempt
            // ⚠️ SECURITY: appeal_token removed from logs to prevent unauthorized access
            Log::info('Admin attempting to approve ban appeal', [
                'appeal_id' => $appeal->id,
                'admin_id' => $admin->id,
                'admin_email' => $admin->email,
                'user_id' => $appeal->user_id,
                'user_email' => $appeal->user->email,
                'ban_id' => $appeal->user_ban_id
            ]);

            $this->banAppealService->reviewAppeal(
                $appeal,
                $admin,
                'approve',
                $request->input('response')
            );

            // ✅ AUDIT: Log successful approval
            Log::info('Ban appeal approved successfully', [
                'appeal_id' => $appeal->id,
                'admin_id' => $admin->id,
                'admin_name' => $admin->name,
                'user_id' => $appeal->user_id,
                'user_unbanned' => true
            ]);

            return redirect()->route('admin.ban-appeals.index')
                ->with('success', 'Apelación aprobada exitosamente. El usuario ha sido desbaneado y notificado por email.');
        } catch (\Exception $e) {
            Log::error('Failed to approve ban appeal', [
                'appeal_id' => $appeal->id,
                'admin_id' => auth()->id(),
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return back()
                ->with('error', 'Error al aprobar la apelación: ' . $e->getMessage());
        }
    }

    /**
     * Reject a ban appeal with enhanced security validation.
     *
     * Rejects the appeal and keeps the ban active.
     *
     * @param ReviewBanAppealRequest $request The validated request.
     * @param BanAppeal $appeal The appeal to reject.
     * @return \Illuminate\Http\RedirectResponse
     */
    public function reject(ReviewBanAppealRequest $request, BanAppeal $appeal)
    {
        try {
            $admin = auth()->user();

            // ✅ SECURITY: Verify admin has permission
            if (!$admin->hasRole('admin')) {
                abort(403, 'No tienes permisos para rechazar apelaciones.');
            }

            // ✅ SECURITY: Verify appeal can be reviewed
            if (!$appeal->canBeReviewed()) {
                return back()
                    ->with('error', 'Esta apelación ya ha sido revisada.');
            }

            // ✅ SECURITY: Verify response is provided
            $response = $request->input('response');
            if (empty($response)) {
                return back()
                    ->with('error', 'Debes proporcionar una razón para rechazar la apelación.');
            }

            // ✅ AUDIT: Log rejection attempt
            // ⚠️ SECURITY: appeal_token removed from logs to prevent unauthorized access
            Log::info('Admin attempting to reject ban appeal', [
                'appeal_id' => $appeal->id,
                'admin_id' => $admin->id,
                'admin_email' => $admin->email,
                'user_id' => $appeal->user_id,
                'user_email' => $appeal->user->email,
                'response_length' => strlen($response)
            ]);

            $this->banAppealService->reviewAppeal(
                $appeal,
                $admin,
                'reject',
                $response
            );

            // ✅ AUDIT: Log successful rejection
            Log::info('Ban appeal rejected successfully', [
                'appeal_id' => $appeal->id,
                'admin_id' => $admin->id,
                'admin_name' => $admin->name,
                'user_id' => $appeal->user_id,
                'ban_remains_active' => true
            ]);

            return redirect()->route('admin.ban-appeals.index')
                ->with('success', 'Apelación rechazada. El baneo se mantiene activo y el usuario ha sido notificado.');
        } catch (\Exception $e) {
            Log::error('Failed to reject ban appeal', [
                'appeal_id' => $appeal->id,
                'admin_id' => auth()->id(),
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return back()
                ->with('error', 'Error al rechazar la apelación: ' . $e->getMessage());
        }
    }

    /**
     * Request more information for a ban appeal.
     *
     * Requests additional information from the user before making a decision.
     *
     * @param ReviewBanAppealRequest $request The validated request.
     * @param BanAppeal $appeal The appeal to request info for.
     * @return \Illuminate\Http\RedirectResponse
     */
    public function requestInfo(ReviewBanAppealRequest $request, BanAppeal $appeal)
    {
        try {
            $admin = auth()->user();

            // ✅ SECURITY: Verify admin has permission
            if (!$admin->hasRole('admin')) {
                abort(403, 'No tienes permisos para solicitar información.');
            }

            // ✅ SECURITY: Verify appeal can be reviewed (prevents reopening finalized appeals)
            if (!$appeal->canBeReviewed()) {
                return back()
                    ->with('error', 'Esta apelación ya ha sido finalizada y no se puede solicitar más información.');
            }

            $response = $request->input('response');

            // Service will validate message length and sanitize
            $this->banAppealService->requestMoreInfo(
                $appeal,
                $admin,
                $response
            );

            Log::info('More information requested for ban appeal', [
                'appeal_id' => $appeal->id,
                'admin_id' => $admin->id,
                'admin_name' => $admin->name,
            ]);

            return redirect()->route('admin.ban-appeals.show', $appeal)
                ->with('success', 'Se ha solicitado más información al usuario.');
        } catch (\Exception $e) {
            Log::error('Failed to request more info for ban appeal', [
                'appeal_id' => $appeal->id,
                'admin_id' => auth()->id(),
                'error' => $e->getMessage(),
            ]);

            return back()
                ->with('error', 'Error al solicitar información: ' . $e->getMessage());
        }
    }
}