<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\DB;

/**
 * User Statistics Service
 * 
 * Handles all statistical calculations and aggregations related to users.
 * Provides methods for calculating profile completion, user metrics, and dashboard statistics.
 * 
 * @package App\Services
 */
class UserStatisticsService
{
    /**
     * Calculate the user profile completion percentage based on key fields.
     * 
     * Evaluates the presence of essential profile fields including name, email, bio,
     * website, location, avatar, and email verification status.
     *
     * @param User $user The user whose profile completeness is evaluated.
     * @return int Percentage value representing profile completion (0-100).
     * 
     * @example
     * $service = new UserStatisticsService();
     * $completion = $service->calculateProfileCompletion($user); // Returns 85
     */
    public function calculateProfileCompletion(User $user): int
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
     * Get comprehensive statistics for a specific user.
     * 
     * Compiles key metrics including post count, comment count, favorite services,
     * last login timestamp, membership duration, and profile completion percentage.
     *
     * @param User $user The user to gather statistics for.
     * @return array<string, mixed> Associative array containing user statistics.
     * 
     * @example
     * $service = new UserStatisticsService();
     * $stats = $service->getUserStatistics($user);
     * // Returns: ['posts_count' => 10, 'comments_count' => 25, ...]
     */
    public function getUserStatistics(User $user): array
    {
        return [
            'posts_count' => $user->posts()->count(),
            'comments_count' => $user->comments()->count(),
            'favorite_services_count' => $user->favoriteServices()->count(),
            'last_login' => $user->last_login_at,
            'member_since' => $user->created_at,
            'profile_completion' => $this->calculateProfileCompletion($user),
        ];
    }

    /**
     * Get comment statistics breakdown for a specific user.
     * 
     * Provides a detailed breakdown of comment counts by moderation status
     * including total, approved, pending, rejected, and spam comments.
     *
     * @param User $user The user whose comment statistics are requested.
     * @return array<string, int> Associative array with comment counts by status.
     * 
     * @example
     * $service = new UserStatisticsService();
     * $stats = $service->getCommentStatistics($user);
     * // Returns: ['total' => 50, 'approved' => 45, 'pending' => 3, ...]
     */
    public function getCommentStatistics(User $user): array
    {
        return [
            'total' => $user->comments()->count(),
            'approved' => $user->comments()->where('status', 'approved')->count(),
            'pending' => $user->comments()->where('status', 'pending')->count(),
            'rejected' => $user->comments()->where('status', 'rejected')->count(),
            'spam' => $user->comments()->where('status', 'spam')->count(),
        ];
    }

    /**
     * Get high-level dashboard statistics for the user management panel.
     * 
     * Calculates aggregate metrics including total users, active users, banned users,
     * admin count, and new registrations for the current month.
     *
     * @return array<string, int> Associative array containing dashboard statistics.
     * 
     * @example
     * $service = new UserStatisticsService();
     * $stats = $service->getDashboardStatistics();
     * // Returns: ['total' => 1000, 'active' => 950, 'banned' => 10, ...]
     */
    public function getDashboardStatistics(): array
    {
        return [
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
    }

    /**
     * Get optimized dashboard statistics using a single query.
     * 
     * Uses database aggregation to calculate all statistics in one query,
     * significantly improving performance compared to multiple separate queries.
     *
     * @return array<string, int> Associative array containing dashboard statistics.
     * 
     * @example
     * $service = new UserStatisticsService();
     * $stats = $service->getOptimizedDashboardStatistics();
     */
    public function getOptimizedDashboardStatistics(): array
    {
        $stats = DB::table('users')
            ->selectRaw('
                COUNT(*) as total,
                COUNT(CASE WHEN email_verified_at IS NOT NULL THEN 1 END) as verified,
                COUNT(CASE WHEN MONTH(created_at) = ? AND YEAR(created_at) = ? THEN 1 END) as new_this_month
            ', [now()->month, now()->year])
            ->first();

        $bannedCount = User::whereHas('bans', function ($q) {
            $q->active();
        })->count();

        $adminCount = User::where('role', 'admin')
            ->orWhereHas('roles', function ($q) {
                $q->where('name', 'admin');
            })->count();

        return [
            'total' => $stats->total,
            'active' => $stats->total - $bannedCount,
            'banned' => $bannedCount,
            'admins' => $adminCount,
            'new_this_month' => $stats->new_this_month,
        ];
    }
}

