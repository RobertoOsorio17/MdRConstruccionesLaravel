<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreUserRequest;
use App\Http\Requests\Admin\UpdateUserRequest;
use App\Http\Requests\Admin\BanUserRequest;
use App\Http\Requests\Admin\BulkActionRequest;
use App\Models\User;
use App\Models\UserBan;
use App\Models\Role;
use App\Models\Comment;
use App\Services\UserManagementService;
use App\Services\UserBanService;
use App\Services\UserStatisticsService;
use App\Services\UserCommentService;
use App\Services\UserVerificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

/**
 * User Management Controller
 *
 * Orchestrates comprehensive administrative control over user accounts, role assignments,
 * and disciplinary actions. Delivers filtered insights, credential tooling, and ban management
 * so staff can safeguard community integrity.
 *
 * This controller delegates business logic to specialized service classes following SOLID principles:
 * - UserManagementService: Handles user CRUD operations
 * - UserBanService: Manages user bans and IP restrictions
 * - UserStatisticsService: Calculates user and dashboard statistics
 * - UserCommentService: Manages user comments and moderation
 * - UserVerificationService: Handles user verification workflows
 *
 * @package App\Http\Controllers\Admin
 */
class UserManagementController extends Controller
{
    /**
     * User management service instance.
     *
     * @var UserManagementService
     */
    protected UserManagementService $userManagementService;

    /**
     * User ban service instance.
     *
     * @var UserBanService
     */
    protected UserBanService $userBanService;

    /**
     * User statistics service instance.
     *
     * @var UserStatisticsService
     */
    protected UserStatisticsService $userStatisticsService;

    /**
     * User comment service instance.
     *
     * @var UserCommentService
     */
    protected UserCommentService $userCommentService;

    /**
     * User verification service instance.
     *
     * @var UserVerificationService
     */
    protected UserVerificationService $userVerificationService;

    /**
     * Create a new controller instance.
     *
     * Injects all required service dependencies for user management operations.
     *
     * @param UserManagementService $userManagementService User CRUD service.
     * @param UserBanService $userBanService Ban management service.
     * @param UserStatisticsService $userStatisticsService Statistics calculation service.
     * @param UserCommentService $userCommentService Comment management service.
     * @param UserVerificationService $userVerificationService Verification service.
     */
    public function __construct(
        UserManagementService $userManagementService,
        UserBanService $userBanService,
        UserStatisticsService $userStatisticsService,
        UserCommentService $userCommentService,
        UserVerificationService $userVerificationService
    ) {
        $this->userManagementService = $userManagementService;
        $this->userBanService = $userBanService;
        $this->userStatisticsService = $userStatisticsService;
        $this->userCommentService = $userCommentService;
        $this->userVerificationService = $userVerificationService;
    }
    /**
     * Display a filtered and paginated list of users for the admin panel.
     *
     * Supports keyword search, role constraints, ban status filtering, date ranges,
     * and configurable sorting so administrators can audit user activity efficiently.
     *
     * @param Request $request The current HTTP request with filter parameters.
     * @return \Inertia\Response Inertia response containing the user listing data.
     */
    public function index(Request $request)
    {
        // Build query with eager loading to prevent N+1 queries
        $query = User::with(['roles', 'bans' => function ($q) {
            $q->active()->with('bannedBy:id,name');
        }]);

        // Apply search filter
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        // Apply role filter
        if ($request->filled('role')) {
            if ($request->role === 'simple_role') {
                $query->whereHas('roles');
            } else {
                $query->whereHas('roles', function ($q) use ($request) {
                    $q->where('name', $request->role);
                });
            }
        }

        // Apply ban status filter
        if ($request->filled('ban_status')) {
            if ($request->ban_status === 'active') {
                $query->whereDoesntHave('bans', function ($q) {
                    $q->where('is_active', true);
                });
            } elseif ($request->ban_status === 'banned') {
                $query->whereHas('bans', function ($q) {
                    $q->where('is_active', true);
                });
            }
        }

        // Apply email verification status filter
        if ($request->filled('status')) {
            if ($request->status === 'active') {
                $query->whereNotNull('email_verified_at');
            } elseif ($request->status === 'inactive') {
                $query->whereNull('email_verified_at');
            }
        }

        // Apply date range filters
        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        // Apply sorting with security whitelist
        $sortField = $request->get('sort', 'created_at');
        $sortDirection = $request->get('direction', 'desc');
        $allowedSorts = ['name', 'email', 'role', 'created_at', 'last_login_at'];
        $allowedDirections = ['asc', 'desc'];

        if (in_array($sortField, $allowedSorts) && in_array(strtolower($sortDirection), $allowedDirections)) {
            $query->orderBy($sortField, $sortDirection);
        } else {
            $query->orderBy('created_at', 'desc');
        }

        // Paginate results
        $perPage = $request->get('per_page', 15);
        $perPage = in_array($perPage, [10, 15, 25, 50]) ? $perPage : 15;
        $users = $query->paginate($perPage)->withQueryString();

        // Transform user data for frontend
        $users->getCollection()->transform(function ($user) {
            $banStatus = $user->getBanStatus();
            $activeBan = $user->bans->first();

            return [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'roles' => $user->roles->pluck('name'),
                'avatar' => $user->getAvatarUrl(),
                'email_verified_at' => $user->email_verified_at,
                'last_login_at' => $user->last_login_at,
                'created_at' => $user->created_at,
                'ban_status' => $banStatus,
                'is_banned' => $banStatus['is_banned'],
                'status' => $banStatus['is_banned'] ? 'banned' : 'active',
                'is_online' => $user->last_login_at && $user->last_login_at->diffInMinutes(now()) < 15,
                'ban_details' => $activeBan ? [
                    'id' => $activeBan->id,
                    'reason' => $activeBan->reason,
                    'expires_at' => $activeBan->expires_at,
                    'ip_ban' => $activeBan->ip_ban,
                    'admin_notes' => $activeBan->admin_notes,
                    'banned_by' => $activeBan->bannedBy ? $activeBan->bannedBy->name : 'Sistema',
                    'created_at' => $activeBan->created_at,
                ] : null,
            ];
        });

        // Get dashboard statistics using service
        $stats = $this->userStatisticsService->getOptimizedDashboardStatistics();

        // Get available roles for filtering
        $roles = Role::all(['id', 'name', 'display_name']);

        return Inertia::render('Admin/UserManagement', [
            'users' => $users,
            'stats' => $stats,
            'roles' => $roles,
            'filters' => $request->only(['search', 'role', 'status', 'date_from', 'date_to', 'sort', 'direction']),
        ]);
    }

    /**
     * Show the form for creating a new user within the admin area.
     *
     * @return \Inertia\Response Inertia response containing the creation form data.
     */
    public function create()
    {
        $roles = Role::all(['id', 'name', 'display_name']);

        return Inertia::render('Admin/UserCreate', [
            'roles' => $roles,
        ]);
    }

    /**
     * Store a newly created user account and optional role assignments.
     *
     * Uses StoreUserRequest for validation and UserManagementService for business logic.
     *
     * @param StoreUserRequest $request The validated request payload describing the new user.
     * @return \Illuminate\Http\RedirectResponse Redirect response after persisting the user.
     *
     * @throws \Illuminate\Auth\Access\AuthorizationException If user lacks admin privileges.
     */
    public function store(StoreUserRequest $request)
    {
        try {
            // Security check: prevent non-admins from creating admin accounts
            if ($request->role === 'admin' && !auth()->user()->hasRole('admin')) {
                abort(403, 'No tienes permisos para crear usuarios administradores.');
            }

            $this->guardAdminRoleAssignment($request->input('roles', []));

            // Delegate user creation to service
            $user = $this->userManagementService->createUser($request->validated());

            session()->flash('success', 'Usuario creado exitosamente.');
            return redirect()->route('admin.users.index');
        } catch (\Exception $e) {
            Log::error('Failed to create user', [
                'error' => $e->getMessage(),
                'admin_id' => auth()->id(),
                'request_data' => $request->except(['password', 'password_confirmation'])
            ]);

            session()->flash('error', 'Error al crear el usuario: ' . $e->getMessage());
            return back()->withInput();
        }
    }


    /**
     * Display detailed account information for a specific user.
     *
     * Uses UserStatisticsService and UserCommentService to gather user metrics.
     *
     * @param User $user The user model to inspect within the admin panel.
     * @return \Inertia\Response Inertia response with expanded user details.
     */
    public function show(User $user)
    {
        $user->load(['roles', 'verifiedBy:id,name']);

        // Get user statistics from service
        $userStats = $this->userStatisticsService->getUserStatistics($user);

        // Get comment statistics from service
        $commentStats = $this->userStatisticsService->getCommentStatistics($user);

        // Retrieve recent administrative activity if audit logs are present
        $recentActivity = [];
        if (class_exists('App\Models\AdminAuditLog')) {
            $recentActivity = \App\Models\AdminAuditLog::where('user_id', $user->id)
                ->latest()
                ->limit(10)
                ->get(['action', 'description', 'created_at']);
        }

        return Inertia::render('Admin/UserShow', [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'roles' => $user->roles,
                'avatar' => $user->getAvatarUrl(),
                'bio' => $user->bio,
                'website' => $user->website,
                'location' => $user->location,
                'email_verified_at' => $user->email_verified_at,
                'last_login_at' => $user->last_login_at,
                'created_at' => $user->created_at,
                'updated_at' => $user->updated_at,
                'is_verified' => $user->is_verified,
                'verified_at' => $user->verified_at,
                'verification_notes' => $user->verification_notes,
                'verified_by' => $user->verifiedBy,
            ],
            'stats' => $userStats,
            'commentStats' => $commentStats,
            'recent_activity' => $recentActivity,
        ]);
    }

    
    /**
     * Show the admin edit form for the specified user.
     *
     * @param User $user The user being edited.
     * @return \Inertia\Response Inertia response containing editable user data.
     */
    public function edit(User $user)
    {
        $user->load(['roles']);
        $roles = Role::all(['id', 'name', 'display_name']);

        return Inertia::render('Admin/UserEdit', [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'roles' => $user->roles->pluck('id'),
                'bio' => $user->bio,
                'website' => $user->website,
                'location' => $user->location,
                'email_verified_at' => $user->email_verified_at,
            ],
            'roles' => $roles,
        ]);
    }

    
    /**
     * Update an existing user account with new profile details and role assignments.
     *
     * Uses UpdateUserRequest for validation and UserManagementService for business logic.
     * Enforces security checks to prevent self-modification and unauthorized admin changes.
     *
     * @param UpdateUserRequest $request The validated request payload with updated user data.
     * @param User $user The user model instance to update.
     * @return \Illuminate\Http\RedirectResponse Redirect response after updating the user.
     *
     * @throws \Illuminate\Auth\Access\AuthorizationException If user lacks admin privileges.
     */
    public function update(UpdateUserRequest $request, User $user)
    {
        try {
            // Security check: prevent administrators from modifying their own record here.
            if ($user->id === auth()->id()) {
                return back()->withErrors(['error' => 'No puedes editar tu propia cuenta desde el panel de administración.']);
            }

            // Security check: restrict admin role updates to existing admins.
            if (($user->hasRole('admin') || $request->role === 'admin') && !auth()->user()->hasRole('admin')) {
                abort(403, 'No tienes permisos para modificar usuarios administradores.');
            }

            $this->guardAdminRoleAssignment($request->input('roles', []));

            // Delegate user update to service
            $result = $this->userManagementService->updateUser($user, $request->validated());

            $message = 'Usuario actualizado exitosamente.';
            if ($result['role_changed'] || $result['password_changed']) {
                $message .= ' Se han cerrado todas sus sesiones activas.';
            }

            return redirect()->route('admin.users.index')->with('success', $message);
        } catch (\Exception $e) {
            Log::error('Failed to update user', [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
                'admin_id' => auth()->id(),
                'request_data' => $request->except(['password', 'password_confirmation'])
            ]);

            return back()->withErrors(['error' => 'Error al actualizar el usuario: ' . $e->getMessage()])->withInput();
        }
    }

    /**
     * Permanently delete the specified user account.
     *
     * Uses UserManagementService for business logic and enforces security checks
     * to prevent self-deletion and unauthorized admin deletions.
     *
     * @param User $user The user model instance to delete.
     * @return \Illuminate\Http\RedirectResponse Redirect response after deleting the user.
     *
     * @throws \Illuminate\Auth\Access\AuthorizationException If user lacks admin privileges.
     */
    public function destroy(User $user)
    {
        try {
            // Security check: do not allow deletion of the acting administrator.
            if ($user->id === auth()->id()) {
                return back()->with('error', 'No puedes eliminar tu propia cuenta.');
            }

            // Security check: require admin privileges to delete other admin users.
            if ($user->hasRole('admin') && !auth()->user()->hasRole('admin')) {
                abort(403, 'No tienes permisos para eliminar usuarios administradores.');
            }

            // Delegate user deletion to service
            $userName = $user->name;
            $this->userManagementService->deleteUser($user, auth()->user());

            return redirect()->route('admin.users.index')
                ->with('success', "Usuario '{$userName}' eliminado exitosamente.");
        } catch (\Exception $e) {
            Log::error('Failed to delete user', [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
                'admin_id' => auth()->id()
            ]);

            return back()->with('error', 'Error al eliminar el usuario: ' . $e->getMessage());
        }
    }

    /**
     * Execute a bulk administrative action against multiple users.
     *
     * Uses BulkActionRequest for validation and UserManagementService for business logic.
     * Supports delete, activate, deactivate, and assign_role actions.
     *
     * @param BulkActionRequest $request The validated request describing the bulk action and targets.
     * @return \Illuminate\Http\RedirectResponse Redirect response confirming the bulk operation.
     */
    public function bulkAction(BulkActionRequest $request)
    {
        try {
            $userIds = $request->user_ids;
            $currentUserId = auth()->id();

            // Remove the acting administrator to avoid self-modification during bulk work.
            $userIds = array_filter($userIds, fn($id) => $id != $currentUserId);

            if (empty($userIds)) {
                return back()->with('error', 'No se pueden realizar acciones en lote en tu propia cuenta.');
            }

            // Guard admin role assignment if applicable
            if ($request->action === 'assign_role') {
                $this->guardAdminRoleAssignment([], $request->role_id);
            }

            // Delegate bulk action to service
            $result = $this->userManagementService->bulkAction(
                $request->action,
                $userIds,
                auth()->user(),
                $request->role_id
            );

            return redirect()->route('admin.users.index')->with('success', $result['message']);
        } catch (\Exception $e) {
            Log::error('Failed to execute bulk action', [
                'action' => $request->action,
                'user_ids' => $request->user_ids,
                'error' => $e->getMessage(),
                'admin_id' => auth()->id()
            ]);

            return back()->with('error', 'Error al ejecutar la acción en lote: ' . $e->getMessage());
        }
    }

    /**
     * Export user data based on the current filter selection using Laravel Excel.
     *
     * @param Request $request The request containing export filters.
     * @return \Symfony\Component\HttpFoundation\BinaryFileResponse Excel file download.
     */
    public function export(Request $request)
    {
        $filters = [
            'search' => $request->get('search'),
            'role' => $request->get('role'),
            'status' => $request->get('status'),
        ];

        $format = $request->get('format', 'xlsx'); // xlsx, csv
        $filename = 'usuarios_' . now()->format('Y-m-d_H-i-s');

        try {
            return \Maatwebsite\Excel\Facades\Excel::download(
                new \App\Exports\UsersExport($filters),
                $filename . '.' . $format
            );
        } catch (\Exception $e) {
            \Log::error('User export failed', [
                'user_id' => auth()->id(),
                'error' => $e->getMessage(),
            ]);

            return back()->with('error', 'Error al exportar usuarios: ' . $e->getMessage());
        }
    }

    /**
     * Legacy export method - keeping for backwards compatibility.
     * @deprecated Use export() method instead.
     */
    private function legacyExport($query)
    {
        $users = $query->get();

        $csvData = [];
        $csvData[] = ['ID', 'Nombre', 'Email', 'Rol', 'Estado', 'Fecha de Registro', 'ÃƒÆ’Ã†â€™Ãƒâ€¦Ã‚Â¡ltimo Login'];

        foreach ($users as $user) {
            $csvData[] = [
                $user->id,
                $user->name,
                $user->email,
                $user->role ?: $user->roles->pluck('name')->join(', '),
                $user->email_verified_at ? 'Activo' : 'Inactivo',
                $user->created_at->format('Y-m-d H:i:s'),
                $user->last_login_at ? $user->last_login_at->format('Y-m-d H:i:s') : 'Nunca',
            ];
        }

        $filename = 'usuarios_' . now()->format('Y-m-d_H-i-s') . '.csv';

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ];

        $callback = function () use ($csvData) {
            $file = fopen('php://output', 'w');
            foreach ($csvData as $row) {
                fputcsv($file, $row);
            }
            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }



    /**
     * Ban a user for a configurable duration and reason.
     *
     * Uses BanUserRequest for validation and UserBanService for business logic.
     *
     * @param BanUserRequest $request The validated request containing ban configuration.
     * @param User $user The user being banned.
     * @return \Illuminate\Http\RedirectResponse Redirect response indicating the ban result.
     *
     * @throws ValidationException If user is already banned or ban creation fails.
     */
    public function banUser(BanUserRequest $request, User $user)
    {
        try {
            // Security check: prevent administrators from banning themselves
            if ($user->id === auth()->id()) {
                throw ValidationException::withMessages(['error' => 'You cannot ban yourself.']);
            }

            // Check if user is already banned
            if ($user->isBanned()) {
                return back()->withErrors(['error' => 'User is already banned.']);
            }

            // Delegate ban creation to service
            $this->userBanService->banUser($user, $request->validated(), auth()->user());

            session()->flash('success', 'User has been banned successfully.');
            return redirect()->back();
        } catch (ValidationException $e) {
            throw $e;
        } catch (\Exception $e) {
            Log::error('Failed to ban user', [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
                'admin_id' => auth()->id()
            ]);

            throw ValidationException::withMessages([
                'error' => 'Failed to ban user: ' . $e->getMessage()
            ]);
        }
    }

    /**
     * Modify an existing ban for a user.
     *
     * Uses BanUserRequest for validation and UserBanService for business logic.
     *
     * @param BanUserRequest $request The validated request containing updated ban configuration.
     * @param User $user The user whose ban is being modified.
     * @return \Illuminate\Http\RedirectResponse Redirect response indicating the modification result.
     */
    public function modifyBan(BanUserRequest $request, User $user)
    {
        try {
            // Check if user has an active ban
            if (!$user->isBanned()) {
                return back()->withErrors(['error' => 'User is not currently banned.']);
            }

            // Delegate ban modification to service
            $this->userBanService->modifyBan($user, $request->validated(), auth()->user());

            return back()->with('success', 'Ban has been modified successfully.');
        } catch (\Exception $e) {
            Log::error('Failed to modify ban', [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
                'admin_id' => auth()->id()
            ]);

            return back()->withErrors(['error' => 'Failed to modify ban: ' . $e->getMessage()]);
        }
    }


    /**
     * Remove any active bans from the specified user.
     *
     * Uses UserBanService for business logic.
     *
     * @param User $user The user whose ban is being lifted.
     * @return \Illuminate\Http\RedirectResponse Redirect response summarizing the action.
     */
    public function unbanUser(User $user)
    {
        // Security check: only administrators may lift bans
        if (!auth()->user()->hasRole('admin')) {
            return back()->withErrors(['error' => 'Unauthorized action.']);
        }

        // Ensure the target account currently has an active ban record
        if (!$user->isBanned()) {
            return back()->withErrors(['error' => 'User is not currently banned.']);
        }

        // Delegate unban to service
        $this->userBanService->unbanUser($user, auth()->user());

        session()->flash('success', 'User has been unbanned successfully.');
        return redirect()->back();
    }

    /**
     * Retrieve the full ban history for a given user.
     *
     * Uses UserBanService for business logic.
     *
     * @param User $user The user whose ban history is requested.
     * @return \Illuminate\Http\JsonResponse JSON response listing ban records.
     */
    public function getBanHistory(User $user)
    {
        // Security check: restrict ban history access to administrators
        if (!auth()->user()->hasRole('admin')) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        // Delegate to service
        $bans = $this->userBanService->getBanHistory($user);

        return response()->json(['bans' => $bans]);
    }

    /**
     * Retrieve a paginated set of user comments with search and filters.
     *
     * Uses UserCommentService for business logic.
     *
     * @param Request $request The current HTTP request containing filter inputs.
     * @param User $user The user whose comments are being retrieved.
     * @return \Illuminate\Http\JsonResponse JSON response containing paginated comments.
     */
    public function getUserComments(Request $request, User $user)
    {
        // Security check: restrict comment visibility to administrators
        if (!auth()->user()->hasRole('admin')) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        // Build filters from request
        $filters = [
            'search' => $request->get('search'),
            'status' => $request->get('status'),
            'date_from' => $request->get('date_from'),
            'date_to' => $request->get('date_to'),
            'sort' => $request->get('sort', 'created_at'),
            'direction' => $request->get('direction', 'desc'),
        ];

        $perPage = $request->get('per_page', 10);
        $perPage = in_array($perPage, [5, 10, 15, 25]) ? $perPage : 10;

        // Delegate to service
        $comments = $this->userCommentService->getUserComments($user, $filters, $perPage);

        return response()->json([
            'success' => true,
            'comments' => $comments,
        ]);
    }

    /**
     * Update the moderation status of a user's comment.
     *
     * Uses UserCommentService for business logic.
     *
     * @param Request $request The request containing the new status.
     * @param User $user The comment author.
     * @param int $commentId The identifier of the comment being updated.
     * @return \Illuminate\Http\JsonResponse JSON response indicating the outcome.
     */
    public function updateCommentStatus(Request $request, User $user, $commentId)
    {
        // Security check: only administrators may adjust comment statuses
        if (!auth()->user()->hasRole('admin')) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $request->validate([
            'status' => 'required|in:approved,pending,rejected,spam'
        ]);

        try {
            // Delegate to service
            $this->userCommentService->updateCommentStatus(
                $user,
                $commentId,
                $request->status,
                auth()->user()
            );

            return response()->noContent();
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 400);
        }
    }

    /**
     * Delete a comment and its replies from user management.
     */
    /**
     * Delete a specific comment created by the given user.
     *
     * @param User $user The author of the comment.
     * @param int $commentId The identifier of the comment being removed.
     * @return \Illuminate\Http\RedirectResponse Redirect response with the deletion result.
     */
    /**
     * Delete a specific comment from a user's comment history.
     *
     * Uses UserCommentService for business logic and enforces admin-only access.
     *
     * @param User $user The user who owns the comment.
     * @param int $commentId The ID of the comment to delete.
     * @return \Illuminate\Http\RedirectResponse Redirect response after deleting the comment.
     */
    public function deleteComment(User $user, $commentId)
    {
        try {
            // Security check: only administrators can remove comments.
            if (!auth()->user()->hasRole('admin')) {
                return back()->withErrors(['error' => 'No tienes permisos para eliminar comentarios.']);
            }

            // Delegate comment deletion to service
            $this->userCommentService->deleteComment($user, $commentId, auth()->user());

            return back()->with('success', 'Comentario eliminado exitosamente.');
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return back()->withErrors(['error' => 'El comentario no existe o no pertenece a este usuario.']);
        } catch (\Exception $e) {
            Log::error('Failed to delete comment', [
                'comment_id' => $commentId,
                'user_id' => $user->id,
                'error' => $e->getMessage(),
                'admin_id' => auth()->id()
            ]);

            return back()->withErrors(['error' => 'Error al eliminar comentario. Por favor, inténtalo de nuevo.']);
        }
    }

    /**
     * Execute bulk moderation actions against a user's comments.
     *
     * Uses UserCommentService for business logic and enforces admin-only access.
     * Supports approve, reject, delete, and mark_spam actions.
     *
     * @param Request $request The request containing action details.
     * @param User $user The user whose comments are targeted.
     * @return \Illuminate\Http\JsonResponse JSON response reporting the bulk results.
     */
    public function bulkCommentActions(Request $request, User $user)
    {
        try {
            // Security check: only administrators may run bulk comment operations.
            if (!auth()->user()->hasRole('admin')) {
                return response()->json(['error' => 'Unauthorized'], 403);
            }

            $request->validate([
                'action' => 'required|in:approve,reject,delete,mark_spam',
                'comment_ids' => 'required|array|min:1',
                'comment_ids.*' => 'integer|exists:comments,id',
            ]);

            // Delegate bulk comment action to service
            $processedCount = $this->userCommentService->bulkCommentActions(
                $user,
                $request->action,
                $request->comment_ids,
                auth()->user()
            );

            return response()->noContent();
        } catch (\Exception $e) {
            Log::error('Failed to execute bulk comment action', [
                'action' => $request->action,
                'user_id' => $user->id,
                'comment_ids' => $request->comment_ids,
                'error' => $e->getMessage(),
                'admin_id' => auth()->id()
            ]);

            return response()->json(['error' => 'Error al ejecutar la acción en lote'], 500);
        }
    }

    /**
     * Ensure the current user is allowed to assign the requested roles.
     *
     * @param array<int, mixed> $roles A set of role identifiers requested for assignment.
     * @param int|null $singleRoleId Optional single role identifier when assigning one role.
     * @return void
     */
    private function guardAdminRoleAssignment($roles = [], ?int $singleRoleId = null): void
    {
        $actingUser = auth()->user();

        if (!$actingUser) {
            abort(403, 'No autenticado');
        }

        $roleIds = collect();

        if (!is_null($roles)) {
            $roleIds = $roleIds->merge(is_array($roles) ? $roles : [$roles]);
        }

        if (!is_null($singleRoleId)) {
            $roleIds->push($singleRoleId);
        }

        $roleIds = $roleIds->filter(function ($id) {
            return !is_null($id) && $id !== '';
        })->map(fn ($id) => (int) $id)->unique();

        if ($roleIds->isEmpty()) {
            return;
        }

        $assigningRestrictedRole = Role::whereIn('id', $roleIds)
            ->whereIn('name', ['admin', 'super_admin'])
            ->exists();

        if ($assigningRestrictedRole && !$actingUser->hasRole('admin')) {
            abort(403, 'No tienes permisos para asignar roles de administrador.');
        }
    }

    /**
     * Mark a user account as verified and log the action.
     *
     * Uses UserVerificationService for business logic and enforces admin-only access.
     *
     * @param Request $request The request containing optional verification metadata.
     * @param User $user The user being verified.
     * @return \Illuminate\Http\RedirectResponse Redirect response reflecting verification outcome.
     */
    public function verifyUser(Request $request, User $user)
    {
        try {
            // Security check: only administrators may verify accounts.
            if (!auth()->user()->hasRole('admin')) {
                return back()->withErrors(['error' => 'No tienes permisos para verificar usuarios.']);
            }

            // Prevent administrators from verifying their own accounts here.
            if ($user->id === auth()->id()) {
                return back()->withErrors(['error' => 'No puedes verificarte a ti mismo.']);
            }

            $request->validate([
                'verification_notes' => 'nullable|string|max:1000',
            ]);

            // Delegate verification to service
            $this->userVerificationService->verifyUser($user, auth()->user(), $request->verification_notes);

            return back()->with('success', "Usuario {$user->name} verificado exitosamente.");
        } catch (\Exception $e) {
            Log::error('Failed to verify user', [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
                'admin_id' => auth()->id()
            ]);

            return back()->withErrors(['error' => 'Error al verificar el usuario. Inténtalo de nuevo.']);
        }
    }

    /**
     * Remove verification from a user account and log the change.
     *
     * Uses UserVerificationService for business logic and enforces admin-only access.
     *
     * @param Request $request The request containing optional notes.
     * @param User $user The user being unverified.
     * @return \Illuminate\Http\RedirectResponse Redirect response reflecting unverification outcome.
     */
    public function unverifyUser(Request $request, User $user)
    {
        try {
            // Security check: only administrators may remove verification.
            if (!auth()->user()->hasRole('admin')) {
                return back()->withErrors(['error' => 'No tienes permisos para desverificar usuarios.']);
            }

            // Prevent administrators from modifying their own verification flag here.
            if ($user->id === auth()->id()) {
                return back()->withErrors(['error' => 'No puedes desverificarte a ti mismo.']);
            }

            $request->validate([
                'verification_notes' => 'nullable|string|max:1000',
            ]);

            // Delegate unverification to service
            $this->userVerificationService->unverifyUser($user, auth()->user(), $request->verification_notes);

            return back()->with('success', "Verificación de {$user->name} removida exitosamente.");
        } catch (\Exception $e) {
            Log::error('Failed to unverify user', [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
                'admin_id' => auth()->id()
            ]);

            return back()->withErrors(['error' => 'Error al desverificar el usuario. Inténtalo de nuevo.']);
        }
    }
}









