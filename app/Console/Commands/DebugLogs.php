<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Log;

/**
 * Offers an interactive Artisan tool for tailing or clearing segmented application log files.
 * Supports targeted channels, configurable tail lengths, and a force-clear mode for on-call workflows.
 */
class DebugLogs extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'debug:logs 
                            {--tail=50 : Number of lines to tail from each log}
                            {--clear : Clear all logs}
                            {--auth : Show only auth logs}
                            {--blog : Show only blog logs}
                            {--debug : Show only debug logs}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Monitor and manage debug logs for the application';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $logPath = storage_path('logs');
        
        if ($this->option('clear')) {
            $this->clearLogs($logPath);
            return;
        }

        $tailLines = $this->option('tail');
        
        // Determine which logs to show
        $logTypes = [];
        if ($this->option('auth')) {
            $logTypes[] = 'auth';
        }
        if ($this->option('blog')) {
            $logTypes[] = 'blog';
        }
        if ($this->option('debug')) {
            $logTypes[] = 'debug';
        }
        
        // If no specific log type, show all
        if (empty($logTypes)) {
            $logTypes = ['auth', 'blog', 'debug', 'laravel'];
        }

        foreach ($logTypes as $logType) {
            $this->showLogTail($logPath, $logType, $tailLines);
        }
    }

    /**
     * Show tail of a specific log file
     */
    private function showLogTail($logPath, $logType, $lines)
    {
        $pattern = $logPath . "/{$logType}*.log";
        $files = glob($pattern);
        
        if (empty($files)) {
            $this->warn("No {$logType} log files found");
            return;
        }

        // Get the most recent file
        $latestFile = collect($files)->sortByDesc(function ($file) {
            return filemtime($file);
        })->first();

        if (!File::exists($latestFile)) {
            $this->warn("Log file {$latestFile} not found");
            return;
        }

        $this->info("=== {$logType} logs (last {$lines} lines) ===");
        $this->info("File: " . basename($latestFile));
        $this->line("");

        // Read last N lines
        $content = File::get($latestFile);
        $allLines = explode("\n", $content);
        $lastLines = array_slice($allLines, -$lines);
        
        foreach ($lastLines as $line) {
            if (trim($line)) {
                // Color code based on log level
                if (str_contains($line, '[ERROR]') || str_contains($line, 'ERROR')) {
                    $this->error($line);
                } elseif (str_contains($line, '[WARNING]') || str_contains($line, 'WARNING')) {
                    $this->warn($line);
                } elseif (str_contains($line, '[INFO]') || str_contains($line, 'INFO')) {
                    $this->info($line);
                } else {
                    $this->line($line);
                }
            }
        }
        
        $this->line("");
        $this->line("---");
        $this->line("");
    }

    /**
     * Clear all log files
     */
    private function clearLogs($logPath)
    {
        $this->info('Clearing all log files...');
        
        $patterns = [
            $logPath . '/laravel*.log',
            $logPath . '/auth*.log',
            $logPath . '/blog*.log',
            $logPath . '/debug*.log'
        ];
        
        $clearedCount = 0;
        foreach ($patterns as $pattern) {
            $files = glob($pattern);
            foreach ($files as $file) {
                if (File::exists($file)) {
                    File::put($file, '');
                    $clearedCount++;
                    $this->line("Cleared: " . basename($file));
                }
            }
        }
        
        Log::info('Debug logs cleared via command', [
            'files_cleared' => $clearedCount,
            'timestamp' => now()->toISOString()
        ]);
        
        $this->info("Successfully cleared {$clearedCount} log files");
    }
}
