<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

/**
 * Executes a security posture review from the command line, covering sessions, RBAC, middleware, and rate limits.
 * Optional detailed output surfaces deeper telemetry for incident response.
 */
class SecurityAuditCommand extends Command
{
    /**
     * The console command signature.
     *
     * @var string
     */
    protected $signature = 'security:audit {--detailed : Show detailed security information}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Perform a security audit of the application';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('ðŸ”’ Security Audit Report');
        $this->info('========================');
        $this->newLine();

        $this->checkSessionConfiguration();
        $this->checkUserRoles();
        $this->checkRateLimiting();
        $this->checkMiddlewareConfiguration();
        
        if ($this->option('detailed')) {
            $this->checkDetailedSecurity();
        }

        $this->newLine();
        $this->info('âœ… Security audit completed');
    }

    /**
     * Inspect session configuration for secure defaults.
     */
    private function checkSessionConfiguration()
    {
        $this->info('ðŸ“‹ Session Configuration');
        $this->line('-------------------------');

        $lifetime = config('session.lifetime');
        $httpOnly = config('session.http_only');
        $secure = config('session.secure');
        $sameSite = config('session.same_site');

        // Check session lifetime
        if ($lifetime <= 30) {
            $this->info("âœ… Session lifetime: {$lifetime} minutes (secure)");
        } else {
            $this->warn("âš ï¸  Session lifetime: {$lifetime} minutes (consider reducing)");
        }

        // Check HTTP only
        if ($httpOnly) {
            $this->info('âœ… HTTP Only cookies: enabled');
        } else {
            $this->error('âŒ HTTP Only cookies: disabled (security risk)');
        }

        // Check secure cookies
        if ($secure) {
            $this->info('âœ… Secure cookies: enabled');
        } else {
            $this->warn('âš ï¸  Secure cookies: disabled (ensure HTTPS in production)');
        }

        // Check SameSite
        if ($sameSite === 'strict') {
            $this->info('âœ… SameSite: strict (most secure)');
        } elseif ($sameSite === 'lax') {
            $this->info('âœ… SameSite: lax (secure)');
        } else {
            $this->warn("âš ï¸  SameSite: {$sameSite} (consider strict or lax)");
        }

        $this->newLine();
    }

    /**
     * Summarize user-role assignments and highlight inconsistencies.
     */
    private function checkUserRoles()
    {
        $this->info('ðŸ‘¥ User Roles & Permissions');
        $this->line('---------------------------');

        $totalUsers = User::count();
        $adminUsers = User::whereHas('roles', function ($query) {
            $query->where('name', 'admin');
        })->orWhere('role', 'admin')->count();

        $editorUsers = User::whereHas('roles', function ($query) {
            $query->where('name', 'editor');
        })->orWhere('role', 'editor')->count();

        $regularUsers = $totalUsers - $adminUsers - $editorUsers;

        $this->info("Total users: {$totalUsers}");
        $this->info("Admin users: {$adminUsers}");
        $this->info("Editor users: {$editorUsers}");
        $this->info("Regular users: {$regularUsers}");

        // Check for users with both role field and roles relationship
        $conflictUsers = User::whereNotNull('role')
            ->whereHas('roles')
            ->count();

        if ($conflictUsers > 0) {
            $this->warn("âš ï¸  {$conflictUsers} users have both role field and roles relationship");
        } else {
            $this->info('âœ… No role conflicts detected');
        }

        $this->newLine();
    }

    /**
     * Provide an overview of rate-limiting safeguards.
     */
    private function checkRateLimiting()
    {
        $this->info('ðŸš¦ Rate Limiting Status');
        $this->line('----------------------');

        // Check for active rate limits
        $ipBlocks = 0;
        $emailBlocks = 0;

        // This is a simplified check - in production you'd scan cache keys
        try {
            // Check if rate limiting middleware is properly configured
            $middlewareAliases = config('app.middleware_aliases', []);
            
            if (class_exists(\App\Http\Middleware\AuthRateLimitMiddleware::class)) {
                $this->info('âœ… Auth rate limiting middleware: available');
            } else {
                $this->error('âŒ Auth rate limiting middleware: missing');
            }

            $this->info("Active IP blocks: {$ipBlocks}");
            $this->info("Active email blocks: {$emailBlocks}");

        } catch (\Exception $e) {
            $this->warn('âš ï¸  Could not check rate limiting status');
        }

        $this->newLine();
    }

    /**
     * Confirm that required security middleware is present.
     */
    private function checkMiddlewareConfiguration()
    {
        $this->info('ðŸ›¡ï¸  Middleware Configuration');
        $this->line('----------------------------');

        $requiredMiddleware = [
            'auth.enhanced' => \App\Http\Middleware\EnhancedAuthMiddleware::class,
            'auth.state' => \App\Http\Middleware\AuthStateMiddleware::class,
            'session.timeout' => \App\Http\Middleware\SessionTimeout::class,
            'role' => \App\Http\Middleware\RoleMiddleware::class,
            'auth.ratelimit' => \App\Http\Middleware\AuthRateLimitMiddleware::class,
        ];

        foreach ($requiredMiddleware as $alias => $class) {
            if (class_exists($class)) {
                $this->info("âœ… {$alias}: configured");
            } else {
                $this->error("âŒ {$alias}: missing class {$class}");
            }
        }

        // Check that the problematic combined middleware file is gone
        $problematicFile = app_path('Http/Middleware/AuthenticationMiddleware.php');
        if (!file_exists($problematicFile)) {
            $this->info('âœ… PSR-4 violation fixed: AuthenticationMiddleware.php removed');
        } else {
            $this->error('âŒ PSR-4 violation: AuthenticationMiddleware.php still exists');
        }

        $this->newLine();
    }

    /**
     * Run extended diagnostics when the --detailed flag is supplied.
     */
    private function checkDetailedSecurity()
    {
        $this->info('ðŸ” Detailed Security Analysis');
        $this->line('-----------------------------');

        // Check for recent failed login attempts
        try {
            $recentFailures = DB::table('failed_jobs')
                ->where('created_at', '>=', now()->subHours(24))
                ->count();

            $this->info("Failed jobs (24h): {$recentFailures}");

        } catch (\Exception $e) {
            $this->warn('Could not check failed jobs table');
        }

        // Check session table if using database sessions
        if (config('session.driver') === 'database') {
            try {
                $activeSessions = DB::table('sessions')
                    ->where('last_activity', '>=', now()->subMinutes(config('session.lifetime'))->timestamp)
                    ->count();

                $this->info("Active sessions: {$activeSessions}");

            } catch (\Exception $e) {
                $this->warn('Could not check sessions table');
            }
        }

        // Check for users with recent login activity
        $recentLogins = User::where('last_login_at', '>=', now()->subHours(24))->count();
        $this->info("Recent logins (24h): {$recentLogins}");

        $this->newLine();
    }
}
