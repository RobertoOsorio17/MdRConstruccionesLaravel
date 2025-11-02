<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Spatie\Backup\BackupDestination\BackupDestination;
use Spatie\Backup\Tasks\Monitor\BackupDestinationStatusFactory;

/**
 * Manages the lifecycle of system backups so administrators can trigger, inspect, and retrieve protected archives.
 * Integrates with monitoring utilities to surface backup health insights and to support manual recovery workflows.
 */
class BackupController extends Controller
{
    
    
    
    
    /**

    
    
    
     * Handle __construct.

    
    
    
     *

    
    
    
     * @return void

    
    
    
     */
    
    
    
    
    
    
    
    public function __construct()
    {
        $this->middleware(function ($request, $next) {
            $user = $request->user();

            /**
             * Check if user is admin (support both role column and roles relationship).
             */
            $isAdmin = $user->role === 'admin' ||
                       $user->roles->contains('name', 'admin');

            if (!$isAdmin) {
                abort(403, 'This action is unauthorized. Only administrators can manage backups.');
            }

            return $next($request);
        });
    }

    
    
    
    
    /**

    
    
    
     * Display a listing of the resource.

    
    
    
     *

    
    
    
     * @return void

    
    
    
     */
    
    
    
    
    
    
    
    public function index()
    {
        /**
         * Authorize.
         */
        if (!auth()->user()->hasPermission('system.backup')) {
            abort(403, 'Unauthorized action.');
        }

        $backups = $this->getBackups();
        $stats = $this->getBackupStats();

        return Inertia::render('Admin/Backup/Index', [
            'backups' => $backups,
            'stats' => $stats,
        ]);
    }

    
    
    
    
    /**

    
    
    
     * Show the form for creating a new resource.

    
    
    
     *

    
    
    
     * @param Request $request The request.

    
    
    
     * @return void

    
    
    
     */
    
    
    
    
    
    
    
    public function create(Request $request)
    {
        /**
         * Authorize.
         */
        if (!auth()->user()->hasPermission('system.backup')) {
            abort(403, 'Unauthorized action.');
        }

        /**
         * Validate.
         */
        $validated = $request->validate([
            'type' => 'required|in:full,database,files',
        ]);

        try {
            /**
             * Ensure backup directory exists.
             */
            $backupPath = storage_path('app/' . config('backup.backup.name'));
            if (!file_exists($backupPath)) {
                mkdir($backupPath, 0755, true);
            }

            /**
             * Run backup command.
             */
            $exitCode = match ($validated['type']) {
                'full' => Artisan::call('backup:run'),
                'database' => Artisan::call('backup:run', ['--only-db' => true]),
                'files' => Artisan::call('backup:run', ['--only-files' => true]),
            };

            /**
             * Get command output.
             */
            $output = Artisan::output();

            /**
             * Log backup creation.
             */
            \Log::info('Backup command executed', [
                'admin_id' => auth()->id(),
                'type' => $validated['type'],
                'exit_code' => $exitCode,
                'output' => $output,
            ]);

            return back()->with('success', 'Backup process initiated successfully! Check the backup list in a few moments.');
        } catch (\Exception $e) {
            \Log::error('Backup creation failed', [
                'admin_id' => auth()->id(),
                'type' => $validated['type'],
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return back()->withErrors(['backup' => 'Failed to create backup: ' . $e->getMessage()]);
        }
    }

    
    
    
    
    /**

    
    
    
     * Handle download.

    
    
    
     *

    
    
    
     * @param mixed $filename The filename.

    
    
    
     * @return void

    
    
    
     */
    
    
    
    
    
    
    
    public function download($filename)
    {
        /**
         * Authorize.
         */
        if (!auth()->user()->hasPermission('system.backup')) {
            abort(403, 'Unauthorized action.');
        }

        /**
         * Validate filename to prevent directory traversal.
         */
        if (!preg_match('/^[a-zA-Z0-9_\-\.]+\.zip$/', $filename)) {
            abort(400, 'Invalid filename');
        }

        $disk = Storage::disk(config('backup.backup.destination.disks')[0] ?? 'local');
        $path = config('backup.backup.name') . '/' . $filename;

        if (!$disk->exists($path)) {
            abort(404, 'Backup file not found');
        }

        /**
         * Log download.
         */
        \Log::info('Backup downloaded', [
            'admin_id' => auth()->id(),
            'filename' => $filename,
        ]);

        return $disk->download($path);
    }

    
    
    
    
    /**

    
    
    
     * Remove the specified resource.

    
    
    
     *

    
    
    
     * @param mixed $filename The filename.

    
    
    
     * @return void

    
    
    
     */
    
    
    
    
    
    
    
    public function destroy($filename)
    {
        /**
         * Authorize.
         */
        if (!auth()->user()->hasPermission('system.backup')) {
            abort(403, 'Unauthorized action.');
        }

        /**
         * Validate filename.
         */
        if (!preg_match('/^[a-zA-Z0-9_\-\.]+\.zip$/', $filename)) {
            abort(400, 'Invalid filename');
        }

        $disk = Storage::disk(config('backup.backup.destination.disks')[0] ?? 'local');
        $path = config('backup.backup.name') . '/' . $filename;

        if (!$disk->exists($path)) {
            abort(404, 'Backup file not found');
        }

        $disk->delete($path);

        /**
         * Log deletion.
         */
        \Log::info('Backup deleted', [
            'admin_id' => auth()->id(),
            'filename' => $filename,
        ]);

        return back()->with('success', 'Backup deleted successfully.');
    }

    
    
    
    
    /**

    
    
    
     * Handle clean.

    
    
    
     *

    
    
    
     * @return void

    
    
    
     */
    
    
    
    
    
    
    
    public function clean()
    {
        /**
         * Authorize.
         */
        if (!auth()->user()->hasPermission('system.backup')) {
            abort(403, 'Unauthorized action.');
        }

        try {
            Artisan::call('backup:clean');

            /**
             * Log cleanup.
             */
            \Log::info('Backup cleanup executed', [
                'admin_id' => auth()->id(),
            ]);

            return back()->with('success', 'Old backups cleaned successfully.');
        } catch (\Exception $e) {
            \Log::error('Backup cleanup failed', [
                'admin_id' => auth()->id(),
                'error' => $e->getMessage(),
            ]);

            return back()->withErrors(['backup' => 'Failed to clean backups: ' . $e->getMessage()]);
        }
    }

    
    
    
    
    /**

    
    
    
     * Get backups.

    
    
    
     *

    
    
    
     * @return array

    
    
    
     */
    
    
    
    
    
    
    
    private function getBackups(): array
    {
        $disk = Storage::disk(config('backup.backup.destination.disks')[0] ?? 'local');
        $backupPath = config('backup.backup.name');

        if (!$disk->exists($backupPath)) {
            return [];
        }

        $files = $disk->files($backupPath);
        $backups = [];

        foreach ($files as $file) {
            if (pathinfo($file, PATHINFO_EXTENSION) === 'zip') {
                $backups[] = [
                    'name' => basename($file),
                    'path' => $file,
                    'size' => $this->formatBytes($disk->size($file)),
                    'size_bytes' => $disk->size($file),
                    'date' => date('Y-m-d H:i:s', $disk->lastModified($file)),
                    'timestamp' => $disk->lastModified($file),
                ];
            }
        }

        /**
         * Sort by timestamp descending.
         */
        usort($backups, function ($a, $b) {
            return $b['timestamp'] - $a['timestamp'];
        });

        return $backups;
    }

    
    
    
    
    /**

    
    
    
     * Get backup stats.

    
    
    
     *

    
    
    
     * @return array

    
    
    
     */
    
    
    
    
    
    
    
    private function getBackupStats(): array
    {
        $backups = $this->getBackups();
        
        $totalSize = array_reduce($backups, function ($carry, $backup) {
            return $carry + $backup['size_bytes'];
        }, 0);

        $newestBackup = !empty($backups) ? $backups[0] : null;
        $oldestBackup = !empty($backups) ? end($backups) : null;

        return [
            'total_backups' => count($backups),
            'total_size' => $this->formatBytes($totalSize),
            'total_size_bytes' => $totalSize,
            'newest_backup' => $newestBackup,
            'oldest_backup' => $oldestBackup,
            'disk_name' => config('backup.backup.destination.disks')[0] ?? 'local',
        ];
    }

    
    
    
    
    /**

    
    
    
     * Handle format bytes.

    
    
    
     *

    
    
    
     * @param mixed $bytes The bytes.

    
    
    
     * @param mixed $precision The precision.

    
    
    
     * @return string

    
    
    
     */
    
    
    
    
    
    
    
    private function formatBytes($bytes, $precision = 2): string
    {
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];

        for ($i = 0; $bytes > 1024 && $i < count($units) - 1; $i++) {
            $bytes /= 1024;
        }

        return round($bytes, $precision) . ' ' . $units[$i];
    }
}

