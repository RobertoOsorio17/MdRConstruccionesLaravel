<?php

/**
 * Migrate Ban Appeal Evidence from Public to Private Storage
 * 
 * This script moves existing ban appeal evidence files from the public disk
 * to the private disk to improve security.
 * 
 * Usage: php scripts/migrate-ban-appeal-evidence.php
 */

require __DIR__ . '/../vendor/autoload.php';

$app = require_once __DIR__ . '/../bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

echo "=== Ban Appeal Evidence Migration Script ===\n\n";

// Check if public disk has ban-appeals directory
$publicDisk = Storage::disk('public');
$privateDisk = Storage::disk('private');

if (!$publicDisk->exists('ban-appeals')) {
    echo "✓ No ban-appeals directory found in public storage. Nothing to migrate.\n";
    exit(0);
}

echo "Found ban-appeals directory in public storage.\n";
echo "Starting migration...\n\n";

$migratedCount = 0;
$errorCount = 0;
$skippedCount = 0;

// Get all files in ban-appeals directory recursively
$files = $publicDisk->allFiles('ban-appeals');

echo "Found " . count($files) . " files to migrate.\n\n";

foreach ($files as $file) {
    echo "Processing: {$file}\n";
    
    try {
        // Check if file already exists in private storage
        if ($privateDisk->exists($file)) {
            echo "  ⚠ File already exists in private storage. Skipping.\n";
            $skippedCount++;
            continue;
        }
        
        // Get file contents
        $contents = $publicDisk->get($file);
        
        // Create directory structure in private storage if needed
        $directory = dirname($file);
        if (!$privateDisk->exists($directory)) {
            $privateDisk->makeDirectory($directory);
        }
        
        // Write to private storage
        $privateDisk->put($file, $contents);
        
        // Verify the file was written correctly
        if (!$privateDisk->exists($file)) {
            throw new \Exception("Failed to verify file in private storage");
        }
        
        // Verify file size matches
        $publicSize = $publicDisk->size($file);
        $privateSize = $privateDisk->size($file);
        
        if ($publicSize !== $privateSize) {
            throw new \Exception("File size mismatch: public={$publicSize}, private={$privateSize}");
        }
        
        echo "  ✓ Migrated successfully\n";
        $migratedCount++;
        
        // Optional: Delete from public storage after successful migration
        // Uncomment the following line if you want to delete the original files
        // $publicDisk->delete($file);
        
    } catch (\Exception $e) {
        echo "  ✗ Error: " . $e->getMessage() . "\n";
        $errorCount++;
        
        Log::error('Failed to migrate ban appeal evidence', [
            'file' => $file,
            'error' => $e->getMessage()
        ]);
    }
    
    echo "\n";
}

echo "\n=== Migration Summary ===\n";
echo "Total files: " . count($files) . "\n";
echo "Migrated: {$migratedCount}\n";
echo "Skipped: {$skippedCount}\n";
echo "Errors: {$errorCount}\n\n";

if ($errorCount > 0) {
    echo "⚠ Some files failed to migrate. Check the logs for details.\n";
    exit(1);
}

echo "✓ Migration completed successfully!\n\n";

// Update database records if needed
echo "Checking database records...\n";

try {
    $appeals = DB::table('ban_appeals')
        ->whereNotNull('evidence_path')
        ->get();
    
    echo "Found " . $appeals->count() . " appeals with evidence.\n";
    
    $updatedCount = 0;
    foreach ($appeals as $appeal) {
        // Check if path starts with ban-appeals/ (already correct format)
        if (strpos($appeal->evidence_path, 'ban-appeals/') === 0) {
            // Path is already in correct format, no update needed
            continue;
        }
        
        // If path has a different format, you may need to update it
        // This depends on your specific database structure
        echo "  Appeal #{$appeal->id}: {$appeal->evidence_path}\n";
        $updatedCount++;
    }
    
    if ($updatedCount === 0) {
        echo "✓ All database records are already in correct format.\n";
    } else {
        echo "⚠ {$updatedCount} records may need manual review.\n";
    }
    
} catch (\Exception $e) {
    echo "✗ Error checking database: " . $e->getMessage() . "\n";
    Log::error('Failed to check ban appeal database records', [
        'error' => $e->getMessage()
    ]);
}

echo "\n=== Next Steps ===\n";
echo "1. Verify that all evidence files are accessible via the new signed URLs\n";
echo "2. Test the ban appeal submission and review process\n";
echo "3. Once verified, you can safely delete the files from public storage:\n";
echo "   rm -rf storage/app/public/ban-appeals/\n";
echo "4. Update the symbolic link if needed:\n";
echo "   php artisan storage:link\n\n";

echo "Migration script completed.\n";

