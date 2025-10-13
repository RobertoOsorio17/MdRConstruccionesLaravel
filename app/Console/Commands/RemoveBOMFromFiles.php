<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;

class RemoveBOMFromFiles extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'ml:remove-bom {--dry-run : Show files with BOM without modifying them}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Remove UTF-8 BOM from PHP files';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $dryRun = $this->option('dry-run');
        
        $this->info('Scanning for PHP files with UTF-8 BOM...');
        
        $directories = [
            app_path(),
            base_path('routes'),
            base_path('config'),
            base_path('database'),
        ];
        
        $filesWithBOM = [];
        $filesFixed = [];
        
        foreach ($directories as $directory) {
            $files = File::allFiles($directory);
            
            foreach ($files as $file) {
                if ($file->getExtension() !== 'php') {
                    continue;
                }
                
                $content = file_get_contents($file->getPathname());
                
                // Check for UTF-8 BOM (EF BB BF)
                if (substr($content, 0, 3) === "\xEF\xBB\xBF") {
                    $filesWithBOM[] = $file->getPathname();
                    
                    if (!$dryRun) {
                        // Remove BOM
                        $cleanContent = substr($content, 3);
                        file_put_contents($file->getPathname(), $cleanContent);
                        $filesFixed[] = $file->getPathname();
                        $this->line("✓ Fixed: {$file->getRelativePathname()}");
                    } else {
                        $this->line("⚠ Found BOM: {$file->getRelativePathname()}");
                    }
                }
            }
        }
        
        $this->newLine();
        
        if (empty($filesWithBOM)) {
            $this->info('✓ No files with BOM found!');
            return 0;
        }
        
        if ($dryRun) {
            $this->warn("Found " . count($filesWithBOM) . " file(s) with BOM:");
            foreach ($filesWithBOM as $file) {
                $this->line("  - " . str_replace(base_path(), '', $file));
            }
            $this->newLine();
            $this->info('Run without --dry-run to fix these files.');
        } else {
            $this->info("✓ Fixed " . count($filesFixed) . " file(s)!");
            $this->newLine();
            $this->warn('Please restart your Laravel server for changes to take effect:');
            $this->line('  php artisan serve');
        }
        
        return 0;
    }
}

