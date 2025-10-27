<?php

namespace App\Listeners;

use Illuminate\Auth\Events\Logout;
use App\Services\ImpersonationService;
use Illuminate\Support\Facades\Session;

class HandleImpersonationOnLogout
{
    /**
     * Create the event listener.
     */
    public function __construct(
        protected ImpersonationService $impersonationService
    ) {}

    /**
     * Handle the event.
     *
     * If the user logs out while impersonating, terminate the impersonation
     * and restore the original admin session instead of logging out completely.
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
