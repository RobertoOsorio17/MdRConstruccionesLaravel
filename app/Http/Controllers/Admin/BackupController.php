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
     * Display backup management interface
     */
    public function index()
    {
        // ✅ Authorize
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
     * Create new backup
     */
    public function create(Request $request)
    {
        // ✅ Authorize
        if (!auth()->user()->hasPermission('system.backup')) {
            abort(403, 'Unauthorized action.');
        }

        // ✅ Validate
        $validated = $request->validate([
            'type' => 'required|in:full,database,files',
        ]);

        try {
            // Ensure backup directory exists
            $backupPath = storage_path('app/' . config('backup.backup.name'));
            if (!file_exists($backupPath)) {
                mkdir($backupPath, 0755, true);
            }

            // Run backup command
            $exitCode = match ($validated['type']) {
                'full' => Artisan::call('backup:run'),
                'database' => Artisan::call('backup:run', ['--only-db' => true]),
                'files' => Artisan::call('backup:run', ['--only-files' => true]),
            };

            // Get command output
            $output = Artisan::output();

            // ✅ Log backup creation
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
     * Download backup file
     */
    public function download($filename)
    {
        // ✅ Authorize
        if (!auth()->user()->hasPermission('system.backup')) {
            abort(403, 'Unauthorized action.');
        }

        // ✅ Validate filename to prevent directory traversal
        if (!preg_match('/^[a-zA-Z0-9_\-\.]+\.zip$/', $filename)) {
            abort(400, 'Invalid filename');
        }

        $disk = Storage::disk(config('backup.backup.destination.disks')[0] ?? 'local');
        $path = config('backup.backup.name') . '/' . $filename;

        if (!$disk->exists($path)) {
            abort(404, 'Backup file not found');
        }

        // ✅ Log download
        \Log::info('Backup downloaded', [
            'admin_id' => auth()->id(),
            'filename' => $filename,
        ]);

        return $disk->download($path);
    }

    /**
     * Delete backup file
     */
    public function destroy($filename)
    {
        // ✅ Authorize
        if (!auth()->user()->hasPermission('system.backup')) {
            abort(403, 'Unauthorized action.');
        }

        // ✅ Validate filename
        if (!preg_match('/^[a-zA-Z0-9_\-\.]+\.zip$/', $filename)) {
            abort(400, 'Invalid filename');
        }

        $disk = Storage::disk(config('backup.backup.destination.disks')[0] ?? 'local');
        $path = config('backup.backup.name') . '/' . $filename;

        if (!$disk->exists($path)) {
            abort(404, 'Backup file not found');
        }

        $disk->delete($path);

        // ✅ Log deletion
        \Log::info('Backup deleted', [
            'admin_id' => auth()->id(),
            'filename' => $filename,
        ]);

        return back()->with('success', 'Backup deleted successfully.');
    }

    /**
     * Clean old backups
     */
    public function clean()
    {
        // ✅ Authorize
        if (!auth()->user()->hasPermission('system.backup')) {
            abort(403, 'Unauthorized action.');
        }

        try {
            Artisan::call('backup:clean');

            // ✅ Log cleanup
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
     * Get list of backups
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

        // Sort by timestamp descending
        usort($backups, function ($a, $b) {
            return $b['timestamp'] - $a['timestamp'];
        });

        return $backups;
    }

    /**
     * Get backup statistics
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
     * Format bytes to human readable
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

