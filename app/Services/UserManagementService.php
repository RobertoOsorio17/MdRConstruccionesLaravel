<?php

namespace App\Services;

use App\Models\User;
use App\Models\Role;
use App\Services\SecurityLogger;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
 * User Management Service
 * 
 * Handles all business logic related to user CRUD operations including creation,
 * updates, deletion, role management, and session handling.
 * 
 * @package App\Services
 */
class UserManagementService
{
    /**
     * Create a new user with the provided data.
     * 
     * Sanitizes input data, creates the user record, assigns roles, and handles
     * welcome email notifications if requested.
     *
     * @param array<string, mixed> $data User creation data including name, email, password, roles, etc.
     * @return User The newly created user instance.
     * 
     * @example
     * $service = new UserManagementService();
     * $user = $service->createUser([
     *     'name' => 'John Doe',
     *     'email' => 'john@example.com',
     *     'password' => 'SecurePass123!',
     *     'roles' => [1, 2],
     *     'send_welcome_email' => true
     * ]);
     */
    public function createUser(array $data): User
    {
        $userData = $this->sanitizeUserData($data);
        
        $user = User::create([
            'name' => $userData['name'],
            'email' => $userData['email'],
            'password' => Hash::make($data['password']),
            'bio' => $userData['bio'] ?? null,
            'website' => $userData['website'] ?? null,
            'location' => $userData['location'] ?? null,
            'email_verified_at' => now(), // Auto-verify admin-created users
        ]);

        // Assign primary role if provided
        if (!empty($data['role'])) {
            $user->assignRole($data['role']);
        }

        // Sync additional roles if provided
        if (!empty($data['roles'])) {
            $user->roles()->sync($data['roles']);
        }

        // TODO: Send welcome email if requested
        if ($data['send_welcome_email'] ?? false) {
            // Implement welcome email logic
        }

        return $user;
    }

    /**
     * Update an existing user with the provided data.
     * 
     * Sanitizes input data, updates user record, manages role changes, handles password updates,
     * and forces session logout if roles or password changed.
     *
     * @param User $user The user to update.
     * @param array<string, mixed> $data Update data including name, email, password, roles, etc.
     * @return array{user: User, roleChanged: bool, passwordChanged: bool} Updated user and change flags.
     * 
     * @example
     * $service = new UserManagementService();
     * $result = $service->updateUser($user, [
     *     'name' => 'Jane Doe',
     *     'email' => 'jane@example.com',
     *     'roles' => [2, 3]
     * ]);
     */
    public function updateUser(User $user, array $data): array
    {
        $userData = $this->sanitizeUserData($data);
        
        $updateData = [
            'name' => $userData['name'],
            'email' => $userData['email'],
            'bio' => $userData['bio'] ?? null,
            'website' => $userData['website'] ?? null,
            'location' => $userData['location'] ?? null,
        ];

        // Handle password update
        $passwordChanged = false;
        if (!empty($data['password'])) {
            $updateData['password'] = Hash::make($data['password']);
            $passwordChanged = true;
        }

        // Handle email verification toggle
        if (isset($data['email_verified'])) {
            $updateData['email_verified_at'] = $data['email_verified'] ? now() : null;
        }

        // Track role changes
        $originalRoles = $user->roles->pluck('id')->toArray();
        $roleChanged = false;

        $user->update($updateData);

        // Update primary role if provided
        if (!empty($data['role'])) {
            $user->syncRoles([$data['role']]);
            $roleChanged = true;
        }

        // Sync additional roles if provided
        if (isset($data['roles'])) {
            $newRoles = $data['roles'] ?? [];
            $user->roles()->sync($newRoles);

            // Check if roles actually changed
            if (array_diff($originalRoles, $newRoles) || array_diff($newRoles, $originalRoles)) {
                $roleChanged = true;
            }
        }

        // Force logout if roles or password changed
        if ($roleChanged || $passwordChanged) {
            $this->forceLogoutAllSessions($user, $roleChanged ? 'role_changed' : 'password_changed');
        }

        return [
            'user' => $user,
            'roleChanged' => $roleChanged,
            'passwordChanged' => $passwordChanged,
        ];
    }

    /**
     * Delete a user account.
     * 
     * Performs security checks to prevent deletion of super admins and self-deletion.
     *
     * @param User $user The user to delete.
     * @param User $admin The administrator performing the deletion.
     * @return bool True if deletion was successful.
     * 
     * @throws \Exception If user cannot be deleted due to security restrictions.
     */
    public function deleteUser(User $user, User $admin): bool
    {
        // Prevent self-deletion
        if ($user->id === $admin->id) {
            throw new \Exception('Cannot delete your own account.');
        }

        // Prevent deletion of super admins
        if ($user->role === 'super_admin' || $user->hasRole('super_admin')) {
            throw new \Exception('Cannot delete a super administrator account.');
        }

        // Require admin privileges to delete other admins
        if ($user->hasRole('admin') && !$admin->hasRole('admin')) {
            throw new \Exception('Insufficient permissions to delete administrator accounts.');
        }

        return $user->delete();
    }

    /**
     * Execute bulk actions on multiple users.
     * 
     * Supports delete, activate, deactivate, and assign_role actions.
     * Excludes the current user from bulk operations for safety.
     *
     * @param string $action The action to perform (delete, activate, deactivate, assign_role).
     * @param array<int> $userIds Array of user IDs to process.
     * @param User $admin The administrator performing the action.
     * @param int|null $roleId Role ID for assign_role action.
     * @return array{count: int, message: string, skipped: int} Result summary.
     * 
     * @example
     * $service = new UserManagementService();
     * $result = $service->bulkAction('activate', [1, 2, 3], $admin);
     * // Returns: ['count' => 3, 'message' => 'Activated 3 users', 'skipped' => 0]
     */
    public function bulkAction(string $action, array $userIds, User $admin, ?int $roleId = null): array
    {
        // Remove current user from the list
        $userIds = array_filter($userIds, fn($id) => $id != $admin->id);

        if (empty($userIds)) {
            return [
                'count' => 0,
                'message' => 'No users to process.',
                'skipped' => 0,
            ];
        }

        $count = 0;
        $skipped = 0;
        $message = '';

        switch ($action) {
            case 'delete':
                $count = User::whereIn('id', $userIds)
                    ->where('role', '!=', 'super_admin')
                    ->whereDoesntHave('roles', function ($q) {
                        $q->where('name', 'super_admin');
                    })
                    ->delete();
                $message = "Deleted {$count} users successfully.";
                break;

            case 'activate':
                $count = User::whereIn('id', $userIds)
                    ->whereNull('email_verified_at')
                    ->update(['email_verified_at' => now()]);
                $message = "Activated {$count} users successfully.";
                break;

            case 'deactivate':
                $count = User::whereIn('id', $userIds)
                    ->whereNotNull('email_verified_at')
                    ->update(['email_verified_at' => null]);
                $message = "Deactivated {$count} users successfully.";
                break;

            case 'assign_role':
                if (!$roleId) {
                    throw new \Exception('Role ID is required for assign_role action.');
                }

                $role = Role::findOrFail($roleId);
                $users = User::whereIn('id', $userIds)->get();

                foreach ($users as $user) {
                    // Skip super admins for security
                    if ($user->hasRole('super_admin') || $user->hasRole('super-admin') || $user->hasRole('superadmin')) {
                        $skipped++;
                        Log::warning('Attempted to change super-admin role via bulk action', [
                            'admin_id' => $admin->id,
                            'target_user_id' => $user->id,
                            'target_role' => $role->name,
                        ]);
                        continue;
                    }

                    $user->roles()->sync([$roleId]);
                    $count++;
                }

                $message = "Assigned role '{$role->display_name}' to {$count} users.";
                if ($skipped > 0) {
                    $message .= " ({$skipped} super-admins were skipped for security)";
                }
                break;

            default:
                throw new \Exception("Unsupported bulk action: {$action}");
        }

        return [
            'count' => $count,
            'message' => $message,
            'skipped' => $skipped,
        ];
    }

    /**
     * Sanitize user input data to prevent XSS attacks.
     * 
     * Strips HTML tags from text fields and sanitizes URLs.
     *
     * @param array<string, mixed> $data Raw user input data.
     * @return array<string, mixed> Sanitized data.
     */
    private function sanitizeUserData(array $data): array
    {
        return [
            'name' => strip_tags($data['name'] ?? ''),
            'email' => $data['email'] ?? '',
            'bio' => strip_tags($data['bio'] ?? ''),
            'website' => filter_var($data['website'] ?? '', FILTER_SANITIZE_URL),
            'location' => strip_tags($data['location'] ?? ''),
        ];
    }

    /**
     * Force logout all sessions for a user.
     * 
     * Deletes all session records for the user and logs the security action.
     *
     * @param User $user The user whose sessions should be terminated.
     * @param string $reason Reason for the forced logout.
     * @return void
     */
    private function forceLogoutAllSessions(User $user, string $reason): void
    {
        DB::table('sessions')
            ->where('user_id', $user->id)
            ->delete();

        SecurityLogger::logBulkOperation(
            'force_logout_privilege_change',
            1,
            auth()->user(),
            [
                'target_user_id' => $user->id,
                'target_user_email' => $user->email,
                'reason' => $reason,
            ]
        );
    }
}

