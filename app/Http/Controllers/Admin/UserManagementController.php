<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\UserBan;
use App\Models\Role;
use App\Models\Comment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Carbon\Carbon;

/**
 * Orchestrates comprehensive administrative control over user accounts, role assignments, and disciplinary actions.
 * Delivers filtered insights, credential tooling, and ban management so staff can safeguard community integrity.
 */
class UserManagementController extends Controller
{
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
        $query = User::with(['roles', 'bans' => function ($q) {
            $q->active()->with('bannedBy:id,name');
        }]);

        // Apply basic search matching against name and email fields.
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        // Filter by a primary role slug or ensure any custom role assignments.
        if ($request->filled('role')) {
            if ($request->role === 'simple_role') {
                // ✅ FIXED: Use whereNotNull instead of != null (SQL always false)
                // Note: 'role' column doesn't exist - this should filter users WITH roles
                $query->whereHas('roles');
            } else {
                $query->whereHas('roles', function ($q) use ($request) {
                    $q->where('name', $request->role);
                });
            }
        }

        // Filter the set based on current ban status requirements.
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

        // Filter users by legacy email verification status.
        if ($request->filled('status')) {
            if ($request->status === 'active') {
                $query->whereNotNull('email_verified_at');
            } elseif ($request->status === 'inactive') {
                $query->whereNull('email_verified_at');
            }
        }

        // Constrain results by creation date where a range is supplied.
        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        // Apply configurable sorting while guarding against unsupported fields.
        $sortField = $request->get('sort', 'created_at');
        $sortDirection = $request->get('direction', 'desc');

        // ✅ SECURITY: Whitelist both field and direction to prevent SQL injection
        $allowedSorts = ['name', 'email', 'role', 'created_at', 'last_login_at'];
        $allowedDirections = ['asc', 'desc'];

        if (in_array($sortField, $allowedSorts) && in_array(strtolower($sortDirection), $allowedDirections)) {
            $query->orderBy($sortField, $sortDirection);
        } else {
            // Default safe sorting
            $query->orderBy('created_at', 'desc');
        }

        // Resolve the pagination size, enforcing the supported page sizes.
        $perPage = $request->get('per_page', 15);
        $perPage = in_array($perPage, [10, 15, 25, 50]) ? $perPage : 15;
        $users = $query->paginate($perPage)->withQueryString();

        // Map the paginated collection into a transport-friendly structure.
        $users->getCollection()->transform(function ($user) {
            $banStatus = $user->getBanStatus();
            $activeBan = $user->bans->first(); // Get the active ban (already filtered by the query).

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

        // Gather high-level statistics for dashboard summary cards.
        $stats = [
            'total' => User::count(),
            'active' => User::whereDoesntHave('bans', function ($q) {
                $q->active();
            })->count(),
            'banned' => User::whereHas('bans', function ($q) {
                $q->active();
            })->count(),
            'admins' => User::where('role', 'admin')->orWhereHas('roles', function ($q) {
                $q->where('name', 'admin');
            })->count(),
            'new_this_month' => User::whereMonth('created_at', now()->month)
                ->whereYear('created_at', now()->year)
                ->count(),
        ];

        // Include the available roles so admins can filter or assign them.
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
     * @param Request $request The validated request payload describing the new user.
     * @return \Illuminate\Http\RedirectResponse Redirect response after persisting the user.
     */
    public function store(Request $request)
    {
        // Security check: stop non-admins from creating administrative accounts.
        if ($request->role === 'admin' && !auth()->user()->hasRole('admin')) {
            abort(403, 'No tienes permisos para crear usuarios administradores.');
        }

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255|regex:/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/',
            // ✅ FIXED: Use email:rfc,dns instead of regex for better international email support
            'email' => 'required|string|email:rfc,dns|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed|regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/',
            'role' => 'nullable|string|in:admin,editor,user',
            'roles' => 'nullable|array|max:3',
            'roles.*' => 'exists:roles,id',
            'bio' => 'nullable|string|max:1000',
            'website' => 'nullable|url|max:255',
            'location' => 'nullable|string|max:255',
            'send_welcome_email' => 'boolean',
        ], [
            'name.regex' => 'El nombre solo puede contener letras y espacios.',
            'email.email' => 'El formato del email no es válido.',
            'email.dns' => 'El dominio del email no existe.',
            'password.regex' => 'La contraseña debe contener al menos: 1 mayúscula, 1 minúscula, 1 número y 1 carácter especial.',
            'roles.max' => 'Un usuario no puede tener más de 3 roles.',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        $this->guardAdminRoleAssignment($request->input('roles', []));

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'bio' => $request->bio,
            'website' => $request->website,
            'location' => $request->location,
            'email_verified_at' => now(), // Auto-verify admin-created users.
        ]);

        // Assign role using Spatie method (role is in $guarded)
        if ($request->filled('role')) {
            $user->assignRole($request->role);
        }

        // Assign any additional selected roles once the account has been created.
        if ($request->filled('roles')) {
            $user->roles()->sync($request->roles);
        }

        // Send a welcome email when requested (queued for future implementation).
        if ($request->send_welcome_email) {
            // TODO: Implement welcome email.
        }

        session()->flash('success', 'Usuario creado exitosamente.');
        return redirect()->route('admin.users.index');
    }

    /**
     * Display the specified user together with engagement metrics.
     */
    /**
     * Display detailed account information for a specific user.
     *
     * @param User $user The user model to inspect within the admin panel.
     * @return \Inertia\Response Inertia response with expanded user details.
     */
    public function show(User $user)
    {
        $user->load(['roles', 'verifiedBy:id,name']);

        // Compile key metrics that describe the user's activity.
        $userStats = [
            'posts_count' => $user->posts()->count(),
            'comments_count' => $user->comments()->count(),
            'favorite_services_count' => $user->favoriteServices()->count(),
            'last_login' => $user->last_login_at,
            'member_since' => $user->created_at,
            'profile_completion' => $this->calculateProfileCompletion($user),
        ];

        // Provide a breakdown of comment moderation states for the user.
        $commentStats = [
            'total' => $user->comments()->count(),
            'approved' => $user->comments()->where('status', 'approved')->count(),
            'pending' => $user->comments()->where('status', 'pending')->count(),
            'rejected' => $user->comments()->where('status', 'rejected')->count(),
            'spam' => $user->comments()->where('status', 'spam')->count(),
        ];

        // Retrieve recent administrative activity if audit logs are present.
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
     * Show the form for editing the specified user profile and roles.
     */
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
     * Update the specified user profile, credentials, and role assignments.
     */
    /**
     * Persist administrative updates to the specified user record.
     *
     * @param Request $request The validated admin update request.
     * @param User $user The user model being updated.
     * @return \Illuminate\Http\RedirectResponse Redirect response after applying changes.
     */
    public function update(Request $request, User $user)
    {
        // Security check: prevent administrators from modifying their own record here.
        if ($user->id === auth()->id()) {
            return back()->withErrors(['error' => 'No puedes editar tu propia cuenta desde el panel de administraciÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â³n.']);
        }

        // Security check: restrict admin role updates to existing admins.
        if (($user->hasRole('admin') || $request->role === 'admin') && !auth()->user()->hasRole('admin')) {
            abort(403, 'No tienes permisos para modificar usuarios administradores.');
        }

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255|regex:/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/',
            'email' => ['required', 'string', 'email', 'max:255', 'regex:/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/', Rule::unique('users')->ignore($user->id)],
            'password' => 'nullable|string|min:8|confirmed|regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/',
            'role' => 'nullable|string|in:admin,editor,user',
            'roles' => 'nullable|array|max:3',
            'roles.*' => 'exists:roles,id',
            'bio' => 'nullable|string|max:1000',
            'website' => 'nullable|url|max:255',
            'location' => 'nullable|string|max:255',
            'email_verified' => 'boolean',
        ], [
            'name.regex' => 'El nombre solo puede contener letras y espacios.',
            'email.regex' => 'El formato del email no es válido.',
            'password.regex' => 'La contraseña debe contener al menos: 1 mayúscula, 1 minúscula, 1 número y 1 carácter especial.',
            'roles.max' => 'Un usuario no puede tener más de 3 roles.',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        if ($request->filled('roles')) {
            $this->guardAdminRoleAssignment($request->roles);
        }

        $updateData = [
            'name' => $request->name,
            'email' => $request->email,
            'bio' => $request->bio,
            'website' => $request->website,
            'location' => $request->location,
        ];

        // Update the password when a new credential has been supplied.
        if ($request->filled('password')) {
            $updateData['password'] = Hash::make($request->password);
        }

        // Toggle email verification status when explicitly requested.
        if ($request->has('email_verified')) {
            $updateData['email_verified_at'] = $request->email_verified ? now() : null;
        }

        // Remove the obsolete is_active flag because bans control activation.
        unset($updateData['is_active']);

        $user->update($updateData);

        // Update role using Spatie method (role is in $guarded)
        if ($request->filled('role')) {
            // Remove all current roles and assign the new one
            $user->syncRoles([$request->role]);
        }

        // Sync any additional role selections after the profile details are updated.
        if ($request->has('roles')) {
            $user->roles()->sync($request->roles ?? []);
        }

        return redirect()->route('admin.users.index')
            ->with('success', 'Usuario actualizado exitosamente.');
    }

    /**
     * Remove the specified user when permitted.
     */
    /**
     * Permanently delete the specified user account.
     *
     * @param User $user The user slated for deletion.
     * @return \Illuminate\Http\RedirectResponse Redirect response summarizing the result.
     */
    public function destroy(User $user)
    {
        // Security check: do not allow deletion of the acting administrator.
        if ($user->id === auth()->id()) {
            return back()->with('error', 'No puedes eliminar tu propia cuenta.');
        }

        // Security check: require admin privileges to delete other admin users.
        if ($user->hasRole('admin') && !auth()->user()->hasRole('admin')) {
            abort(403, 'No tienes permisos para eliminar usuarios administradores.');
        }

        // Safeguard accounts flagged as super administrators from deletion.
        if ($user->role === 'super_admin' || $user->hasRole('super_admin')) {
            return back()->with('error', 'No se puede eliminar una cuenta de super administrador.');
        }

        $userName = $user->name;
        $user->delete();

        return redirect()->route('admin.users.index')
            ->with('success', "Usuario '{$userName}' eliminado exitosamente.");
    }

    /**
     * Execute bulk administrative actions against multiple users.
     */
    /**
     * Execute a bulk administrative action against multiple users.
     *
     * @param Request $request The request describing the bulk action and targets.
     * @return \Illuminate\Http\RedirectResponse Redirect response confirming the bulk operation.
     */
    public function bulkAction(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'action' => 'required|string|in:delete,activate,deactivate,assign_role',
            'user_ids' => 'required|array|min:1',
            'user_ids.*' => 'exists:users,id',
            'role_id' => 'required_if:action,assign_role|exists:roles,id',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator);
        }

        $userIds = $request->user_ids;
        $currentUserId = auth()->id();

        // Remove the acting administrator to avoid self-modification during bulk work.
        $userIds = array_filter($userIds, fn($id) => $id != $currentUserId);

        if (empty($userIds)) {
            return back()->with('error', 'No se pueden realizar acciones en lote en tu propia cuenta.');
        }

        $count = 0;

        switch ($request->action) {
            case 'delete':
                $count = User::whereIn('id', $userIds)
                    ->where('role', '!=', 'super_admin')
                    ->whereDoesntHave('roles', function ($q) {
                        $q->where('name', 'super_admin');
                    })
                    ->delete();
                $message = "Se eliminaron {$count} usuarios exitosamente.";
                break;

            case 'activate':
                $count = User::whereIn('id', $userIds)
                    ->whereNull('email_verified_at')
                    ->update(['email_verified_at' => now()]);
                $message = "Se activaron {$count} usuarios exitosamente.";
                break;

            case 'deactivate':
                $count = User::whereIn('id', $userIds)
                    ->whereNotNull('email_verified_at')
                    ->update(['email_verified_at' => null]);
                $message = "Se desactivaron {$count} usuarios exitosamente.";
                break;

            case 'assign_role':
                $this->guardAdminRoleAssignment([], $request->role_id);
                // ✅ FIXED: Load role before accessing display_name
                $role = \Spatie\Permission\Models\Role::findOrFail($request->role_id);
                $users = User::whereIn('id', $userIds)->get();
                foreach ($users as $user) {
                    $user->roles()->sync([$request->role_id]);
                }
                $count = $users->count();
                $message = "Se asignÃƒÆ’Ã‚Â³ el rol '{$role->display_name}' a {$count} usuarios.";
                $message = "Se asignÃƒÆ’Ã‚Â³ el rol '{$role->display_name}' a {$count} usuarios.";
                break;
        }

        return redirect()->route('admin.users.index')->with('success', $message);
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
     * Calculate the user profile completion percentage based on key fields.
     *
     * @param User $user The user whose profile completeness is evaluated.
     * @return int Percentage value representing profile completion.
     */
    private function calculateProfileCompletion(User $user): int
    {
        $fields = ['name', 'email', 'bio', 'website', 'location', 'avatar'];
        $completed = 0;

        foreach ($fields as $field) {
            if (!empty($user->$field)) {
                $completed++;
            }
        }

        if ($user->email_verified_at) {
            $completed++;
        }

        return round(($completed / (count($fields) + 1)) * 100);
    }

    /**
     * Ban a user for a configurable duration and reason.
     *
     * @param Request $request The request containing ban configuration.
     * @param User $user The user being banned.
     * @return \Illuminate\Http\RedirectResponse Redirect response indicating the ban result.
     */
    public function banUser(Request $request, User $user)
    {
        \Log::info('Ban user request started', [
            'user_id' => $user->id,
            'banned_by' => auth()->id(),
            'request_data' => $request->all()
        ]);

        // Security check: prevent administrators from banning themselves.
        if ($user->id === auth()->id()) {
            \Log::warning('Self-ban attempt blocked', ['user_id' => $user->id]);
            throw ValidationException::withMessages(['error' => 'You cannot ban yourself.']);
        }

        // Security check: require administrative privileges for ban actions.
        if (!auth()->user()->hasRole('admin')) {
            \Log::warning('Unauthorized ban attempt', ['user_id' => auth()->id(), 'target_user' => $user->id]);
            throw \Illuminate\Validation\ValidationException::withMessages([
                'error' => 'Unauthorized action.'
            ]);
        }

        // Validate the incoming ban request data.
        $validator = Validator::make($request->all(), [
            'reason' => 'required|string|max:1000',
            'duration' => 'nullable|string|in:1_hour,1_day,1_week,1_month,3_months,6_months,1_year,permanent',
            'ip_ban' => 'nullable|boolean',
            'admin_notes' => 'nullable|string|max:1000',
        ]);

        if ($validator->fails()) {
            \Log::error('Ban validation failed', ['errors' => $validator->errors()->toArray()]);
            throw \Illuminate\Validation\ValidationException::withMessages($validator->errors()->toArray());
        }

        // Abort if the target user already has an active ban.
        if ($user->isBanned()) {
            \Log::warning('User already banned', ['user_id' => $user->id]);
            return back()->withErrors(['error' => 'User is already banned.']);
        }

        // Calculate the ban expiration timestamp from the provided duration.
        $expiresAt = null;
        if ($request->duration && $request->duration !== 'permanent') {
            $expiresAt = match($request->duration) {
                '1_hour' => now()->addHour(),
                '1_day' => now()->addDay(),
                '1_week' => now()->addWeek(),
                '1_month' => now()->addMonth(),
                '3_months' => now()->addMonths(3),
                '6_months' => now()->addMonths(6),
                '1_year' => now()->addYear(),
                default => null,
            };
        }

        // Create a ban record while logging the administrative action.
        try {
            $ban = UserBan::create([
                'user_id' => $user->id,
                'banned_by' => auth()->id(),
                'reason' => $request->reason,
                'banned_at' => now(),
                'expires_at' => $expiresAt,
                'is_active' => true,
            ]);

            \Log::info('User banned successfully', [
                'ban_id' => $ban->id,
                'user_id' => $user->id,
                'banned_by' => auth()->id(),
                'expires_at' => $expiresAt
            ]);

            session()->flash('success', 'User has been banned successfully.');
            return redirect()->back();
        } catch (\Exception $e) {
            \Log::error('Failed to create ban record', [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            throw \Illuminate\Validation\ValidationException::withMessages([
                'error' => 'Failed to ban user: ' . $e->getMessage()
            ]);
        }
    }

    /**
     * Modify an existing ban for a user.
     *
     * @param Request $request The request containing updated ban configuration.
     * @param User $user The user whose ban is being modified.
     * @return \Illuminate\Http\RedirectResponse Redirect response indicating the modification result.
     */
    public function modifyBan(Request $request, User $user)
    {
        \Log::info('Modify ban request started', [
            'user_id' => $user->id,
            'modified_by' => auth()->id(),
            'request_data' => $request->all()
        ]);

        // Security check: require administrative privileges.
        if (!auth()->user()->hasRole('admin')) {
            \Log::warning('Unauthorized modify ban attempt', ['user_id' => auth()->id(), 'target_user' => $user->id]);
            return back()->withErrors(['error' => 'Unauthorized action.']);
        }

        // Check if user has an active ban
        if (!$user->isBanned()) {
            \Log::warning('Attempted to modify non-existent ban', ['user_id' => $user->id]);
            return back()->withErrors(['error' => 'User is not currently banned.']);
        }

        // Validate the incoming modification request data.
        $validator = Validator::make($request->all(), [
            'reason' => 'required|string|max:1000',
            'duration' => 'nullable|string|in:1_hour,1_day,1_week,1_month,3_months,6_months,1_year,permanent',
            'ip_ban' => 'nullable|boolean',
            'admin_notes' => 'nullable|string|max:1000',
        ]);

        if ($validator->fails()) {
            \Log::error('Modify ban validation failed', ['errors' => $validator->errors()->toArray()]);
            return back()->withErrors($validator->errors());
        }

        // Calculate the new ban expiration timestamp.
        $expiresAt = null;
        if ($request->duration && $request->duration !== 'permanent') {
            $expiresAt = match($request->duration) {
                '1_hour' => now()->addHour(),
                '1_day' => now()->addDay(),
                '1_week' => now()->addWeek(),
                '1_month' => now()->addMonth(),
                '3_months' => now()->addMonths(3),
                '6_months' => now()->addMonths(6),
                '1_year' => now()->addYear(),
                default => null,
            };
        }

        // Update the active ban record.
        try {
            $ban = UserBan::where('user_id', $user->id)
                ->where('is_active', true)
                ->first();

            if (!$ban) {
                \Log::error('Active ban not found for user', ['user_id' => $user->id]);
                return back()->withErrors(['error' => 'Active ban record not found.']);
            }

            $ban->update([
                'reason' => $request->reason,
                'expires_at' => $expiresAt,
                'admin_notes' => $request->admin_notes,
            ]);

            \Log::info('Ban modified successfully', [
                'ban_id' => $ban->id,
                'user_id' => $user->id,
                'modified_by' => auth()->id(),
                'new_expires_at' => $expiresAt
            ]);

            return back()->with('success', 'Ban has been modified successfully.');
        } catch (\Exception $e) {
            \Log::error('Failed to modify ban record', [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return back()->withErrors(['error' => 'Failed to modify ban: ' . $e->getMessage()]);
        }
    }

    /**
     * Remove the active ban from a user account.
     */
    /**
     * Remove any active bans from the specified user.
     *
     * @param User $user The user whose ban is being lifted.
     * @return \Illuminate\Http\RedirectResponse Redirect response summarizing the action.
     */
    public function unbanUser(User $user)
    {
        // Security check: only administrators may lift bans.
        if (!auth()->user()->hasRole('admin')) {
            return back()->withErrors(['error' => 'Unauthorized action.']);
        }

        // Ensure the target account currently has an active ban record.
        if (!$user->isBanned()) {
            return back()->withErrors(['error' => 'User is not currently banned.']);
        }

        // Deactivate the active ban entries instead of deleting their history.
        $user->bans()->active()->update(['is_active' => false]);

        session()->flash('success', 'User has been unbanned successfully.');
        return redirect()->back();
    }

    /**
     * Retrieve the complete ban history for a user.
     */
    /**
     * Retrieve the full ban history for a given user.
     *
     * @param User $user The user whose ban history is requested.
     * @return \Illuminate\Http\JsonResponse JSON response listing ban records.
     */
    public function getBanHistory(User $user)
    {
        // Security check: restrict ban history access to administrators.
        if (!auth()->user()->hasRole('admin')) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $bans = $user->bans()
            ->with('bannedBy:id,name')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($ban) {
                return [
                    'id' => $ban->id,
                    'reason' => $ban->reason,
                    'banned_at' => $ban->banned_at,
                    'expires_at' => $ban->expires_at,
                    'is_active' => $ban->is_active,
                    'is_permanent' => $ban->isPermanent(),
                    'remaining_time' => $ban->getRemainingTime(),
                    'banned_by' => $ban->bannedBy->name ?? 'System',
                ];
            });

        return response()->json(['bans' => $bans]);
    }

    /**
     * Retrieve a paginated set of user comments with search and filters.
     *
     * @param Request $request The current HTTP request containing filter inputs.
     * @param User $user The user whose comments are being retrieved.
     * @return \Illuminate\Http\JsonResponse JSON response containing paginated comments.
     */
    public function getUserComments(Request $request, User $user)
    {
        // Security check: restrict comment visibility to administrators.
        if (!auth()->user()->hasRole('admin')) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $query = $user->comments()->with(['post:id,title,slug']);

        // Apply full-text search against comment content and related post title.
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('body', 'like', "%{$search}%")
                  ->orWhereHas('post', function ($postQuery) use ($search) {
                      $postQuery->where('title', 'like', "%{$search}%");
                  });
            });
        }

        // Apply a moderation status filter when provided.
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Restrict results to a specific creation date range.
        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        // Sort by an allowed column and direction.
        $sortField = $request->get('sort', 'created_at');
        $sortDirection = $request->get('direction', 'desc');

        $allowedSorts = ['created_at', 'status', 'body'];
        if (in_array($sortField, $allowedSorts)) {
            $query->orderBy($sortField, $sortDirection);
        }

        // Resolve the pagination size while enforcing the permitted options.
        $perPage = $request->get('per_page', 10);
        $perPage = in_array($perPage, [5, 10, 15, 25]) ? $perPage : 10;

        $comments = $query->paginate($perPage)->withQueryString();

        // Normalize the comment payload for front-end consumption.
        $comments->getCollection()->transform(function ($comment) {
            return [
                'id' => $comment->id,
                'body' => $comment->body,
                'status' => $comment->status,
                'created_at' => $comment->created_at,
                'updated_at' => $comment->updated_at,
                'post' => $comment->post ? [
                    'id' => $comment->post->id,
                    'title' => $comment->post->title,
                    'slug' => $comment->post->slug,
                ] : null,
                'author_name' => $comment->author_name,
                'author_email' => $comment->author_email,
                'is_guest' => $comment->isGuest(),
                'reports_count' => $comment->reports()->count(),
                'interactions_count' => $comment->interactions()->count(),
            ];
        });

        return response()->json([
            'success' => true,
            'comments' => $comments,
        ]);
    }

    /**
     * Update a comment status from the user management interface.
     */
    /**
     * Update the moderation status of a user's comment.
     *
     * @param Request $request The request containing the new status.
     * @param User $user The comment author.
     * @param int $commentId The identifier of the comment being updated.
     * @return \Illuminate\Http\JsonResponse JSON response indicating the outcome.
     */
    public function updateCommentStatus(Request $request, User $user, $commentId)
    {
        // Security check: only administrators may adjust comment statuses.
        if (!auth()->user()->hasRole('admin')) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $request->validate([
            'status' => 'required|in:approved,pending,rejected,spam'
        ]);

        $comment = $user->comments()->findOrFail($commentId);
        $comment->update(['status' => $request->status]);

        \Log::info('Comment status updated from user management', [
            'comment_id' => $comment->id,
            'user_id' => $user->id,
            'old_status' => $comment->getOriginal('status'),
            'new_status' => $request->status,
            'updated_by' => auth()->id(),
        ]);

        return response()->noContent();
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
    public function deleteComment(User $user, $commentId)
    {
        try {
            // Security check: only administrators can remove comments.
            if (!auth()->user()->hasRole('admin')) {
                return back()->withErrors(['error' => 'No tienes permisos para eliminar comentarios.']);
            }

            // Log the attempted comment deletion for auditing.
            \Log::info('Attempting to delete comment', [
                'comment_id' => $commentId,
                'user_id' => $user->id,
                'admin_id' => auth()->id(),
            ]);

            // Locate the comment and ensure it belongs to the selected user.
            $comment = $user->comments()->findOrFail($commentId);

            // Double-check the comment ownership for defense in depth.
            if ($comment->user_id !== $user->id) {
                \Log::warning('Attempt to delete comment that does not belong to user', [
                    'comment_id' => $commentId,
                    'comment_user_id' => $comment->user_id,
                    'expected_user_id' => $user->id,
                    'admin_id' => auth()->id(),
                ]);
                return back()->withErrors(['error' => 'Este comentario no pertenece al usuario especificado.']);
            }

            // Remove nested replies to maintain referential integrity.
            if ($comment->replies()->exists()) {
                $repliesCount = $comment->replies()->count();
                $comment->replies()->delete();
                \Log::info('Deleted comment replies', [
                    'comment_id' => $commentId,
                    'replies_deleted' => $repliesCount,
                ]);
            }

            $comment->delete();

            \Log::info('Comment deleted successfully from user management', [
                'comment_id' => $commentId,
                'user_id' => $user->id,
                'user_name' => $user->name,
                'deleted_by' => auth()->id(),
                'admin_name' => auth()->user()->name,
            ]);

            return back()->with('success', 'Comentario eliminado exitosamente.');
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            \Log::warning('Comment not found for deletion', [
                'comment_id' => $commentId,
                'user_id' => $user->id,
                'admin_id' => auth()->id(),
            ]);
            return back()->withErrors(['error' => 'El comentario no existe o no pertenece a este usuario.']);
        } catch (\Exception $e) {
            \Log::error('Error deleting comment from user management', [
                'comment_id' => $commentId,
                'user_id' => $user->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return back()->withErrors(['error' => 'Error al eliminar comentario. Por favor, intÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â©ntalo de nuevo.']);
        }
    }

    /**
     * Execute bulk moderation actions on user comments.
     */
    /**
     * Execute bulk moderation actions against a user's comments.
     *
     * @param Request $request The request containing action details.
     * @param User $user The user whose comments are targeted.
     * @return \Illuminate\Http\JsonResponse JSON response reporting the bulk results.
     */
    public function bulkCommentActions(Request $request, User $user)
    {
        // Security check: only administrators may run bulk comment operations.
        if (!auth()->user()->hasRole('admin')) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $request->validate([
            'action' => 'required|in:approve,reject,delete,mark_spam',
            'comment_ids' => 'required|array|min:1',
            'comment_ids.*' => 'integer|exists:comments,id',
        ]);

        $comments = $user->comments()->whereIn('id', $request->comment_ids)->get();
        $processedCount = 0;

        foreach ($comments as $comment) {
            switch ($request->action) {
                case 'approve':
                    $comment->update(['status' => 'approved']);
                    $processedCount++;
                    break;
                case 'reject':
                    $comment->update(['status' => 'rejected']);
                    $processedCount++;
                    break;
                case 'mark_spam':
                    $comment->update(['status' => 'spam']);
                    $processedCount++;
                    break;
                case 'delete':
                    $comment->replies()->delete();
                    $comment->delete();
                    $processedCount++;
                    break;
            }
        }

        \Log::info('Bulk comment action performed from user management', [
            'action' => $request->action,
            'user_id' => $user->id,
            'comment_ids' => $request->comment_ids,
            'processed_count' => $processedCount,
            'performed_by' => auth()->id(),
        ]);

        return response()->noContent();
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
     * @param Request $request The request containing optional verification metadata.
     * @param User $user The user being verified.
     * @return \Illuminate\Http\RedirectResponse Redirect response reflecting verification outcome.
     */
    public function verifyUser(Request $request, User $user)
    {
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

        try {
            $success = $user->verify(auth()->user(), $request->verification_notes);

            if ($success) {
                // Log the verification action for auditing purposes.
                \Log::info('User verified', [
                    'user_id' => $user->id,
                    'user_email' => $user->email,
                    'verified_by' => auth()->id(),
                    'verification_notes' => $request->verification_notes,
                    'timestamp' => now()->toISOString()
                ]);

                return back()->with('success', "Usuario {$user->name} verificado exitosamente.");
            } else {
                return back()->withErrors(['error' => 'Error al verificar el usuario. IntÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â©ntalo de nuevo.']);
            }
        } catch (\Exception $e) {
            \Log::error('Error verifying user', [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
                'verified_by' => auth()->id()
            ]);

            return back()->withErrors(['error' => 'Error al verificar el usuario. IntÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â©ntalo de nuevo.']);
        }
    }

    /**
     * Remove verification from a user account and log the change.
     *
     * @param Request $request The request containing optional notes.
     * @param User $user The user being unverified.
     * @return \Illuminate\Http\RedirectResponse Redirect response reflecting unverification outcome.
     */
    public function unverifyUser(Request $request, User $user)
    {
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

        try {
            $success = $user->unverify(auth()->user(), $request->verification_notes);

            if ($success) {
                // Log the unverification action for auditing purposes.
                \Log::info('User unverified', [
                    'user_id' => $user->id,
                    'user_email' => $user->email,
                    'unverified_by' => auth()->id(),
                    'verification_notes' => $request->verification_notes,
                    'timestamp' => now()->toISOString()
                ]);

                return back()->with('success', "VerificaciÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â³n de {$user->name} removida exitosamente.");
            } else {
                return back()->withErrors(['error' => 'Error al desverificar el usuario. IntÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â©ntalo de nuevo.']);
            }
        } catch (\Exception $e) {
            \Log::error('Error unverifying user', [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
                'unverified_by' => auth()->id()
            ]);

            return back()->withErrors(['error' => 'Error al desverificar el usuario. IntÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â©ntalo de nuevo.']);
        }
    }
}
















