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
use Inertia\Inertia;
use Carbon\Carbon;

class UserManagementController extends Controller
{
    /**
     * Display a listing of users with filtering and search
     */
    public function index(Request $request)
    {
        $query = User::with(['roles', 'bans' => function ($q) {
            $q->active()->with('bannedBy:id,name');
        }]);

        // Search functionality
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        // Role filter
        if ($request->filled('role')) {
            if ($request->role === 'simple_role') {
                $query->where('role', '!=', null);
            } else {
                $query->whereHas('roles', function ($q) use ($request) {
                    $q->where('name', $request->role);
                });
            }
        }

        // Ban status filter
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

        // Legacy status filter (for email verification)
        if ($request->filled('status')) {
            if ($request->status === 'active') {
                $query->whereNotNull('email_verified_at');
            } elseif ($request->status === 'inactive') {
                $query->whereNull('email_verified_at');
            }
        }

        // Date range filter
        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        // Sorting
        $sortField = $request->get('sort', 'created_at');
        $sortDirection = $request->get('direction', 'desc');

        $allowedSorts = ['name', 'email', 'role', 'created_at', 'last_login_at'];
        if (in_array($sortField, $allowedSorts)) {
            $query->orderBy($sortField, $sortDirection);
        }

        // Pagination
        $perPage = $request->get('per_page', 15);
        $perPage = in_array($perPage, [10, 15, 25, 50]) ? $perPage : 15;
        $users = $query->paginate($perPage)->withQueryString();

        // Transform users data
        $users->getCollection()->transform(function ($user) {
            $banStatus = $user->getBanStatus();
            $activeBan = $user->bans->first(); // Get the active ban (already filtered by the query)

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

        // Get statistics
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
            'new_this_month' => User::whereMonth('created_at', now()->month)->count(),
        ];

        // Get available roles
        $roles = Role::all(['id', 'name', 'display_name']);

        return Inertia::render('Admin/UserManagement', [
            'users' => $users,
            'stats' => $stats,
            'roles' => $roles,
            'filters' => $request->only(['search', 'role', 'status', 'date_from', 'date_to', 'sort', 'direction']),
        ]);
    }

    /**
     * Show the form for creating a new user
     */
    public function create()
    {
        $roles = Role::all(['id', 'name', 'display_name']);

        return Inertia::render('Admin/UserCreate', [
            'roles' => $roles,
        ]);
    }

    /**
     * Store a newly created user
     */
    public function store(Request $request)
    {
        // Security: Only admin can create admin users
        if ($request->role === 'admin' && !auth()->user()->hasRole('admin')) {
            abort(403, 'No tienes permisos para crear usuarios administradores.');
        }

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255|regex:/^[a-zA-ZÃ€-Ã¿\s]+$/',
            'email' => 'required|string|email|max:255|unique:users|regex:/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/',
            'password' => 'required|string|min:8|confirmed|regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/',
            'role' => 'nullable|string|in:admin,editor,user',
            'roles' => 'nullable|array|max:3',
            'roles.*' => 'exists:roles,id',
            'bio' => 'nullable|string|max:1000',
            'website' => 'nullable|url|max:255',
            'location' => 'nullable|string|max:255',
            'send_welcome_email' => 'boolean',
        ], [
            'name.regex' => 'El nombre solo puede contener letras y espacios.',
            'email.regex' => 'El formato del email no es vÃ¡lido.',
            'password.regex' => 'La contraseÃ±a debe contener al menos: 1 mayÃºscula, 1 minÃºscula, 1 nÃºmero y 1 carÃ¡cter especial.',
            'roles.max' => 'Un usuario no puede tener mÃ¡s de 3 roles.',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        $this->guardAdminRoleAssignment($request->input('roles', []));

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => $request->role,
            'bio' => $request->bio,
            'website' => $request->website,
            'location' => $request->location,
            'email_verified_at' => now(), // Auto-verify admin created users
        ]);

        // Assign roles if provided
        if ($request->filled('roles')) {
            $user->roles()->sync($request->roles);
        }

        // Send welcome email if requested
        if ($request->send_welcome_email) {
            // TODO: Implement welcome email
        }

        return redirect()->route('admin.users.index')
            ->with('success', 'Usuario creado exitosamente.');
    }

    /**
     * Display the specified user
     */
    public function show(User $user)
    {
        $user->load(['roles', 'verifiedBy:id,name']);

        // Get user statistics
        $userStats = [
            'posts_count' => $user->posts()->count(),
            'comments_count' => $user->comments()->count(),
            'favorite_services_count' => $user->favoriteServices()->count(),
            'last_login' => $user->last_login_at,
            'member_since' => $user->created_at,
            'profile_completion' => $this->calculateProfileCompletion($user),
        ];

        // Get detailed comment statistics
        $commentStats = [
            'total' => $user->comments()->count(),
            'approved' => $user->comments()->where('status', 'approved')->count(),
            'pending' => $user->comments()->where('status', 'pending')->count(),
            'rejected' => $user->comments()->where('status', 'rejected')->count(),
            'spam' => $user->comments()->where('status', 'spam')->count(),
        ];

        // Get recent activity (if audit logs exist)
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
     * Show the form for editing the specified user
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
     * Update the specified user
     */
    public function update(Request $request, User $user)
    {
        // Security: Prevent editing own account through admin panel
        if ($user->id === auth()->id()) {
            return back()->withErrors(['error' => 'No puedes editar tu propia cuenta desde el panel de administraciÃ³n.']);
        }

        // Security: Only admin can modify admin users or assign admin role
        if (($user->hasRole('admin') || $request->role === 'admin') && !auth()->user()->hasRole('admin')) {
            abort(403, 'No tienes permisos para modificar usuarios administradores.');
        }

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255|regex:/^[a-zA-ZÃ€-Ã¿\s]+$/',
            'email' => ['required', 'string', 'email', 'max:255', 'regex:/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/', Rule::unique('users')->ignore($user->id)],
            'password' => 'nullable|string|min:8|confirmed|regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/',
            'role' => 'nullable|string|in:admin,editor,user',
            'roles' => 'nullable|array|max:3',
            'roles.*' => 'exists:roles,id',
            'bio' => 'nullable|string|max:1000',
            'website' => 'nullable|url|max:255',
            'location' => 'nullable|string|max:255',
            'email_verified' => 'boolean',
        ], [
            'name.regex' => 'El nombre solo puede contener letras y espacios.',
            'email.regex' => 'El formato del email no es vÃ¡lido.',
            'password.regex' => 'La contraseÃ±a debe contener al menos: 1 mayÃºscula, 1 minÃºscula, 1 nÃºmero y 1 carÃ¡cter especial.',
            'roles.max' => 'Un usuario no puede tener mÃ¡s de 3 roles.',
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
            'role' => $request->role,
            'bio' => $request->bio,
            'website' => $request->website,
            'location' => $request->location,
        ];

        // Update password if provided
        if ($request->filled('password')) {
            $updateData['password'] = Hash::make($request->password);
        }

        // Handle email verification status
        if ($request->has('email_verified')) {
            $updateData['email_verified_at'] = $request->email_verified ? now() : null;
        }

        // Remove is_active from update data as we use ban system instead
        unset($updateData['is_active']);

        $user->update($updateData);

        // Sync roles if provided
        if ($request->has('roles')) {
            $user->roles()->sync($request->roles ?? []);
        }

        return redirect()->route('admin.users.index')
            ->with('success', 'Usuario actualizado exitosamente.');
    }

    /**
     * Remove the specified user
     */
    public function destroy(User $user)
    {
        // Security: Prevent deletion of current user
        if ($user->id === auth()->id()) {
            return back()->with('error', 'No puedes eliminar tu propia cuenta.');
        }

        // Security: Only admin can delete admin users
        if ($user->hasRole('admin') && !auth()->user()->hasRole('admin')) {
            abort(403, 'No tienes permisos para eliminar usuarios administradores.');
        }

        // Prevent deletion of super admin (if exists)
        if ($user->role === 'super_admin' || $user->hasRole('super_admin')) {
            return back()->with('error', 'No se puede eliminar una cuenta de super administrador.');
        }

        $userName = $user->name;
        $user->delete();

        return redirect()->route('admin.users.index')
            ->with('success', "Usuario '{$userName}' eliminado exitosamente.");
    }

    /**
     * Bulk actions for multiple users
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

        // Remove current user from bulk actions
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
                $users = User::whereIn('id', $userIds)->get();
                foreach ($users as $user) {
                    $user->roles()->sync([$request->role_id]);
                }
                $count = $users->count();
                $message = "Se asignó el rol '{$role->display_name}' a {$count} usuarios.";
                $message = "Se asignó el rol '{$role->display_name}' a {$count} usuarios.";
                break;
        }

        return redirect()->route('admin.users.index')->with('success', $message);
    }

    /**
     * Export users data
     */
    public function export(Request $request)
    {
        $query = User::with(['roles']);

        // Apply same filters as index
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        if ($request->filled('role')) {
            if ($request->role === 'simple_role') {
                $query->where('role', '!=', null);
            } else {
                $query->whereHas('roles', function ($q) use ($request) {
                    $q->where('name', $request->role);
                });
            }
        }

        $users = $query->get();

        $csvData = [];
        $csvData[] = ['ID', 'Nombre', 'Email', 'Rol', 'Estado', 'Fecha de Registro', 'Ãšltimo Login'];

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
     * Calculate user profile completion percentage
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
     * Ban a user
     */
    public function banUser(Request $request, User $user)
    {
        \Log::info('Ban user request started', [
            'user_id' => $user->id,
            'banned_by' => auth()->id(),
            'request_data' => $request->all()
        ]);

        // Security: Prevent self-banning
        if ($user->id === auth()->id()) {
            \Log::warning('Self-ban attempt blocked', ['user_id' => $user->id]);
            return back()->withErrors(['error' => 'You cannot ban yourself.']);
        }

        // Security: Only admins can ban users
        if (!auth()->user()->hasRole('admin')) {
            \Log::warning('Unauthorized ban attempt', ['user_id' => auth()->id(), 'target_user' => $user->id]);
            return back()->withErrors(['error' => 'Unauthorized action.']);
        }

        // Validate request
        $validator = Validator::make($request->all(), [
            'reason' => 'required|string|max:1000',
            'duration' => 'nullable|string|in:1_hour,1_day,1_week,1_month,3_months,6_months,1_year,permanent',
            'ip_ban' => 'nullable|boolean',
            'admin_notes' => 'nullable|string|max:1000',
        ]);

        if ($validator->fails()) {
            \Log::error('Ban validation failed', ['errors' => $validator->errors()->toArray()]);
            return back()->withErrors($validator->errors());
        }

        // Check if user is already banned
        if ($user->isBanned()) {
            \Log::warning('User already banned', ['user_id' => $user->id]);
            return back()->withErrors(['error' => 'User is already banned.']);
        }

        // Calculate expiration date
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

        // Create ban record
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

            return back()->with('success', 'User has been banned successfully.');
        } catch (\Exception $e) {
            \Log::error('Failed to create ban record', [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return back()->withErrors(['error' => 'Failed to ban user: ' . $e->getMessage()]);
        }
    }

    /**
     * Unban a user
     */
    public function unbanUser(User $user)
    {
        // Security: Only admins can unban users
        if (!auth()->user()->hasRole('admin')) {
            return back()->withErrors(['error' => 'Unauthorized action.']);
        }

        // Check if user is banned
        if (!$user->isBanned()) {
            return back()->withErrors(['error' => 'User is not currently banned.']);
        }

        // Deactivate current active ban
        $user->bans()->active()->update(['is_active' => false]);

        return back()->with('success', 'User has been unbanned successfully.');
    }

    /**
     * Get ban history for a user
     */
    public function getBanHistory(User $user)
    {
        // Security: Only admins can view ban history
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
     * Get user comments with pagination and filtering
     */
    public function getUserComments(Request $request, User $user)
    {
        // Security: Only admins can view user comments
        if (!auth()->user()->hasRole('admin')) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $query = $user->comments()->with(['post:id,title,slug']);

        // Search functionality
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('body', 'like', "%{$search}%")
                  ->orWhereHas('post', function ($postQuery) use ($search) {
                      $postQuery->where('title', 'like', "%{$search}%");
                  });
            });
        }

        // Status filter
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Date range filter
        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        // Sorting
        $sortField = $request->get('sort', 'created_at');
        $sortDirection = $request->get('direction', 'desc');

        $allowedSorts = ['created_at', 'status', 'body'];
        if (in_array($sortField, $allowedSorts)) {
            $query->orderBy($sortField, $sortDirection);
        }

        // Pagination
        $perPage = $request->get('per_page', 10);
        $perPage = in_array($perPage, [5, 10, 15, 25]) ? $perPage : 10;

        $comments = $query->paginate($perPage)->withQueryString();

        // Transform comments data
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
     * Update comment status from user management
     */
    public function updateCommentStatus(Request $request, User $user, $commentId)
    {
        // Security: Only admins can update comment status
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
     * Delete comment from user management
     */
    public function deleteComment(User $user, $commentId)
    {
        try {
            // Security: Only admins can delete comments
            if (!auth()->user()->hasRole('admin')) {
                return back()->withErrors(['error' => 'No tienes permisos para eliminar comentarios.']);
            }

            // Log the attempt to delete comment
            \Log::info('Attempting to delete comment', [
                'comment_id' => $commentId,
                'user_id' => $user->id,
                'admin_id' => auth()->id(),
            ]);

            // Find the comment and verify it belongs to the specified user
            $comment = $user->comments()->findOrFail($commentId);

            // Verify the comment actually belongs to this user (extra security)
            if ($comment->user_id !== $user->id) {
                \Log::warning('Attempt to delete comment that does not belong to user', [
                    'comment_id' => $commentId,
                    'comment_user_id' => $comment->user_id,
                    'expected_user_id' => $user->id,
                    'admin_id' => auth()->id(),
                ]);
                return back()->withErrors(['error' => 'Este comentario no pertenece al usuario especificado.']);
            }

            // Delete all replies first (if any exist)
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

            return back()->withErrors(['error' => 'Error al eliminar comentario. Por favor, intÃ©ntalo de nuevo.']);
        }
    }

    /**
     * Bulk actions for user comments
     */
    public function bulkCommentActions(Request $request, User $user)
    {
        // Security: Only admins can perform bulk actions
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

         = collect();

        if (!is_null()) {
             = ->merge(is_array() ?  : []);
        }

        if (!is_null()) {
            ->push();
        }

         = ->filter(function () {
            return !is_null() &&  -ne '';
        }).map({ param() [int] }).unique();

        if (->isEmpty()) {
            return;
        }

         = Role::whereIn('id', )
            ->whereIn('name', ['admin', 'super_admin'])
            ->exists();

        if ( && !->hasRole('admin')) {
            abort(403, 'No tienes permisos para asignar roles de administrador.');
        }
    }

    /**
     * Verify a user
     */
    public function verifyUser(Request $request, User $user)
    {
        // Check if current user is admin
        if (!auth()->user()->hasRole('admin')) {
            return back()->withErrors(['error' => 'No tienes permisos para verificar usuarios.']);
        }

        // Prevent self-verification
        if ($user->id === auth()->id()) {
            return back()->withErrors(['error' => 'No puedes verificarte a ti mismo.']);
        }

        $request->validate([
            'verification_notes' => 'nullable|string|max:1000',
        ]);

        try {
            $success = $user->verify(auth()->user(), $request->verification_notes);

            if ($success) {
                // Log the verification action
                \Log::info('User verified', [
                    'user_id' => $user->id,
                    'user_email' => $user->email,
                    'verified_by' => auth()->id(),
                    'verification_notes' => $request->verification_notes,
                    'timestamp' => now()->toISOString()
                ]);

                return back()->with('success', "Usuario {$user->name} verificado exitosamente.");
            } else {
                return back()->withErrors(['error' => 'Error al verificar el usuario. IntÃ©ntalo de nuevo.']);
            }
        } catch (\Exception $e) {
            \Log::error('Error verifying user', [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
                'verified_by' => auth()->id()
            ]);

            return back()->withErrors(['error' => 'Error al verificar el usuario. IntÃ©ntalo de nuevo.']);
        }
    }

    /**
     * Unverify a user
     */
    public function unverifyUser(Request $request, User $user)
    {
        // Check if current user is admin
        if (!auth()->user()->hasRole('admin')) {
            return back()->withErrors(['error' => 'No tienes permisos para desverificar usuarios.']);
        }

        // Prevent self-unverification
        if ($user->id === auth()->id()) {
            return back()->withErrors(['error' => 'No puedes desverificarte a ti mismo.']);
        }

        $request->validate([
            'verification_notes' => 'nullable|string|max:1000',
        ]);

        try {
            $success = $user->unverify(auth()->user(), $request->verification_notes);

            if ($success) {
                // Log the unverification action
                \Log::info('User unverified', [
                    'user_id' => $user->id,
                    'user_email' => $user->email,
                    'unverified_by' => auth()->id(),
                    'verification_notes' => $request->verification_notes,
                    'timestamp' => now()->toISOString()
                ]);

                return back()->with('success', "VerificaciÃ³n de {$user->name} removida exitosamente.");
            } else {
                return back()->withErrors(['error' => 'Error al desverificar el usuario. IntÃ©ntalo de nuevo.']);
            }
        } catch (\Exception $e) {
            \Log::error('Error unverifying user', [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
                'unverified_by' => auth()->id()
            ]);

            return back()->withErrors(['error' => 'Error al desverificar el usuario. IntÃ©ntalo de nuevo.']);
        }
    }
}

















