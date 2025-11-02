<?php

namespace App\Listeners;

use Illuminate\Auth\Events\Logout;
use App\Services\ImpersonationService;
use Illuminate\Support\Facades\Session;
/**
 * Class HandleImpersonationOnLogout.
 */

class HandleImpersonationOnLogout
{
    
    
    
    
    /**

    
    
    
     * Handle __construct.

    
    
    
     *

    
    
    
     * @param protected ImpersonationService $impersonationService The impersonationService.

    
    
    
     * @return void

    
    
    
     */
    
    
    
    
    
    
    
    public function __construct(
        protected ImpersonationService $impersonationService
    ) {}

    
    
    
    
    /**

    
    
    
     * Handle handle.

    
    
    
     *

    
    
    
     * @param Logout $event The event.

    
    
    
     * @return void

    
    
    
     */
    
    
    
    
    
    
    
    public function handle(Logout $event): void
    {
        // Check if there's an active impersonation session
        if ($this->impersonationService->isActive()) {
            // Terminate impersonation and restore admin session
            $this->impersonationService->terminate(request());

            // Prevent the actual logout since we're restoring the admin
            // Note: This won't prevent the logout event, but the admin will be logged back in
        }
    }
}
