<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Service;

/**
 * Provides a diagnostic Artisan routine to inspect service FAQ payloads and their decoded structure.
 * Useful during migrations or bug hunts when JSON casting issues surface in the services catalog.
 */
class DiagnoseServices extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:diagnose-services';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Diagnose services FAQ data issues';

    
    
    
    
    /**

    
    
    
     * Handle handle.

    
    
    
     *

    
    
    
     * @return void

    
    
    
     */
    
    
    
    
    
    
    
    public function handle()
    {
        $this->info('Diagnosing services data...');
        
        $services = Service::all();
        
        foreach ($services as $service) {
            $rawFaq = $service->getRawOriginal('faq');
            $this->line("ID: {$service->id}");
            $this->line("  Raw FAQ type: " . gettype($rawFaq));
            $this->line("  Raw FAQ value: " . substr($rawFaq ?? 'null', 0, 100) . '...');
            
            try {
                // Test the accessor directly
                $faqArray = $service->faq;
                $this->line("  FAQ array type: " . gettype($faqArray));
                $this->line("  FAQ array count: " . (is_array($faqArray) ? count($faqArray) : 'not array'));
                
                $faqCount = $service->faq_count;
                $this->line("  FAQ count accessor: {$faqCount}");
                
                // Test manual JSON decode
                $manualDecode = json_decode($rawFaq, true);
                $jsonError = json_last_error_msg();
                $this->line("  Manual decode result type: " . gettype($manualDecode));
                $this->line("  Manual decode value: " . (is_null($manualDecode) ? 'null' : json_encode($manualDecode)));
                $this->line("  Manual decode count: " . (is_array($manualDecode) ? count($manualDecode) : 'failed'));
                $this->line("  JSON error: {$jsonError}");
                
                // Test with JSON_UNESCAPED_UNICODE flag
                $manualDecodeUnescaped = json_decode($rawFaq, true, 512, JSON_UNESCAPED_UNICODE);
                $this->line("  Unescaped decode count: " . (is_array($manualDecodeUnescaped) ? count($manualDecodeUnescaped) : 'failed'));
                
            } catch (\Exception $e) {
                $this->error("  Error: " . $e->getMessage());
            }
            
            $this->line('');
        }
        
        return 0;
    }
}
