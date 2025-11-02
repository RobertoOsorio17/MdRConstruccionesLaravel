<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AdminAuditLog;
use App\Models\User;
use App\Services\ImpersonationService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\UnauthorizedException;
use Inertia\Inertia;
/**

 * Controller for UserImpersonationController.

 */


class UserImpersonationController extends Controller
{
    /**
     * The impersonation service instance.
     *
     * @var ImpersonationService
     */
    protected $impersonationService;

    
    
    
    
    /**

    
    
    
     * Handle __construct.

    
    
    
     *

    
    
    
     * @param ImpersonationService $impersonationService The impersonationService.

    
    
    
     * @return void

    
    
    
     */
    
    
    
    
    
    
    
    public function __construct(ImpersonationService $impersonationService)
    {
        $this->impersonationService = $impersonationService;

        /**
         * Ensure only admins can access this controller.
         */
        $this->middleware(function ($request, $next) {
            $user = $request->user();

            /**
             * Check if user is admin (support both role column and roles relationship).
             */
            $isAdmin = $user->role === 'admin' ||
                       $user->roles->contains('name', 'admin');

            if (!$isAdmin) {
                abort(403, 'This action is unauthorized. Only administrators can impersonate users.');
            }

            return $next($request);
        });
    }

    
    
    
    
    /**

    
    
    
     * Store a newly created resource.

    
    
    
     *

    
    
    
     * @param User $user The user.

    
    
    
     * @param Request $request The request.

    
    
    
     * @return RedirectResponse

    
    
    
     */
    
    
    
    
    
    
    
    public function store(User $user, Request $request): RedirectResponse
    {
        try {
            $admin = Auth::user();

            /**
             * Check authorization using policy first (provides basic checks).
             * The service will provide more detailed error messages.
             */
            if (!Gate::allows('impersonate-user', $user)) {
                // Provide specific error messages based on the reason
                if ($user->isBanned()) {
                    $banInfo = $user->currentBan();
                    $banType = $banInfo && $banInfo->is_permanent ? 'permanentemente' : 'temporalmente';
                    throw new UnauthorizedException("No puedes impersonar a usuarios suspendidos. Este usuario está {$banType} suspendido. Debes levantar la suspensión antes de poder impersonarlo.");
                }

                if ($user->hasRole('admin') || $user->hasRole('super-admin')) {
                    throw new UnauthorizedException('No puedes impersonar a otros administradores. Solo se pueden impersonar usuarios con rol de usuario o editor.');
                }

                if ($admin->id === $user->id) {
                    throw new UnauthorizedException('No puedes impersonarte a ti mismo.');
                }

                throw new UnauthorizedException('No tienes autorización para impersonar a este usuario.');
            }

            /**
             * Begin impersonation (will perform additional validation).
             */
            $this->impersonationService->begin($admin, $user);

            /**
             * Log the action in admin audit log.
             */
            AdminAuditLog::create([
                'user_id' => $admin->id,
                'action' => 'impersonation.start',
                'description' => "Started impersonating user: {$user->name} ({$user->email})",
                'severity' => 'critical',
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'metadata' => [
                    'target_id' => $user->id,
                    'target_email' => $user->email,
                    'target_name' => $user->name,
                    'session_token_hash' => substr($this->impersonationService->context()['session_token'], 0, 8),
                ],
            ]);

            /**
             * Redirect to user's dashboard.
             */
            return redirect()->route('dashboard')
                ->with('success', "You are now viewing the application as {$user->name}.");

        } catch (UnauthorizedException $e) {
            return redirect()->back()
                ->with('error', $e->getMessage());
        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'An error occurred while trying to impersonate this user. Please try again.');
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
        $context = $this->impersonationService->context();

        if (!$context) {
            return redirect()->route('admin.dashboard')
                ->with('warning', 'No active impersonation session found.');
        }

        /**
         * Get details before terminating.
         */
        $targetUser = User::find($context['target_id']);
        $impersonatorId = $context['impersonator_id'];
        $startedAt = \Carbon\Carbon::parse($context['started_at']);
        $durationSeconds = now()->diffInSeconds($startedAt);

        /**
         * Prepare fallback values in case user was deleted.
         */
        $targetName = $targetUser ? $targetUser->name : 'Deleted User';
        $targetEmail = $targetUser ? $targetUser->email : 'unknown@deleted.user';
        $targetId = $targetUser ? $targetUser->id : $context['target_id'];

        /**
         * Terminate impersonation.
         */
        $this->impersonationService->terminate($request);

        /**
         * Log the action.
         */
        AdminAuditLog::create([
            'user_id' => $impersonatorId,
            'action' => 'impersonation.stop',
            'description' => "Stopped impersonating user: {$targetName} ({$targetEmail})",
            'severity' => 'info',
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'metadata' => [
                'target_id' => $targetId,
                'target_email' => $targetEmail,
                'target_name' => $targetName,
                'duration_seconds' => $durationSeconds,
                'session_token_hash' => substr($context['session_token'], 0, 8),
                'user_was_deleted' => !$targetUser,
            ],
        ]);

        return redirect()->route('admin.dashboard')
            ->with('success', 'You have returned to your administrator account.');
    }

    
    
    
    
    /**

    
    
    
     * Handle heartbeat.

    
    
    
     *

    
    
    
     * @param Request $request The request.

    
    
    
     * @return void

    
    
    
     */
    
    
    
    
    
    
    
    public function heartbeat(Request $request)
    {
        if (!$this->impersonationService->isActive()) {
            return response()->json([
                'active' => false,
                'message' => 'No active impersonation session.',
            ], 404);
        }

        $context = $this->impersonationService->context();

        return response()->json([
            'active' => true,
            'expires_at' => $context['expires_at'],
            'time_remaining_seconds' => now()->diffInSeconds(\Carbon\Carbon::parse($context['expires_at'])),
        ]);
    }

    
    
    
    
    /**

    
    
    
     * Display a listing of the resource.

    
    
    
     *

    
    
    
     * @return void

    
    
    
     */
    
    
    
    
    
    
    
    public function index()
    {
        $sessions = $this->impersonationService->getActiveSessions();

        return inertia('Admin/ImpersonationSessions', [
            'sessions' => $sessions->map(function ($session) {
                return [
                    'id' => $session->id,
                    'impersonator' => [
                        'id' => $session->impersonator->id,
                        'name' => $session->impersonator->name,
                        'email' => $session->impersonator->email,
                    ],
                    'target' => [
                        'id' => $session->target->id,
                        'name' => $session->target->name,
                        'email' => $session->target->email,
                    ],
                    'started_at' => $session->started_at->toISOString(),
                    'started_at_human' => $session->started_at->diffForHumans(),
                    'duration_minutes' => $session->started_at->diffInMinutes(now()),
                    'ip_address' => $session->ip_address,
                    'user_agent' => $session->user_agent,
                ];
            }),
        ]);
    }

    
    
    
    
    /**

    
    
    
     * Handle api index.

    
    
    
     *

    
    
    
     * @return void

    
    
    
     */
    
    
    
    
    
    
    
    public function apiIndex()
    {
        $sessions = $this->impersonationService->getActiveSessions();

        return response()->json([
            'success' => true,
            'sessions' => $sessions->map(function ($session) {
                return [
                    'id' => $session->id,
                    'impersonator' => [
                        'id' => $session->impersonator->id,
                        'name' => $session->impersonator->name,
                        'email' => $session->impersonator->email,
                    ],
                    'target' => [
                        'id' => $session->target->id,
                        'name' => $session->target->name,
                        'email' => $session->target->email,
                    ],
                    'started_at' => $session->started_at->toISOString(),
                    'duration_minutes' => $session->started_at->diffInMinutes(now()),
                    'ip_address' => $session->ip_address,
                ];
            }),
            'total' => $sessions->count(),
        ]);
    }

    
    
    
    
    /**

    
    
    
     * Handle force terminate.

    
    
    
     *

    
    
    
     * @param int $sessionId The sessionId.

    
    
    
     * @return void

    
    
    
     */
    
    
    
    
    
    
    
    public function forceTerminate(int $sessionId)
    {
        $success = $this->impersonationService->terminateSessionById($sessionId, 'admin_terminated');

        if (!$success) {
            return response()->json([
                'success' => false,
                'message' => 'Session not found or already terminated.',
            ], 404);
        }

        /**
         * Log the action.
         */
        AdminAuditLog::create([
            'user_id' => Auth::id(),
            'action' => 'impersonation.force_terminate',
            'description' => "Force terminated impersonation session #{$sessionId}",
            'severity' => 'warning',
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
            'metadata' => [
                'session_id' => $sessionId,
            ],
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Impersonation session terminated successfully.',
        ]);
    }
}

