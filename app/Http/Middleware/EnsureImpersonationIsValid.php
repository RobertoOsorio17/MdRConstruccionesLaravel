<?php

namespace App\Http\Middleware;

use App\Services\ImpersonationService;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureImpersonationIsValid
{
    /**
     * The impersonation service instance.
     *
     * @var ImpersonationService
     */
    protected $impersonationService;

    /**
     * Create a new middleware instance.
     *
     * @param ImpersonationService $impersonationService
     */
    public function __construct(ImpersonationService $impersonationService)
    {
        $this->impersonationService = $impersonationService;
    }

    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Check if there's an active impersonation session
        if ($this->impersonationService->isActive()) {
            // Check if the session has expired
            if ($this->impersonationService->hasExpired()) {
                // Terminate the impersonation session
                $this->impersonationService->terminate($request);

                // Handle JSON/AJAX requests differently
                if ($request->expectsJson() || $request->wantsJson()) {
                    return response()->json([
                        'message' => 'Tu sesión de impersonación ha expirado.',
                        'expired' => true,
                        'redirect' => route('admin.dashboard'),
                    ], 440); // 440 Login Time-out (unofficial but widely used)
                }

                // Set flash message for regular requests
                $request->session()->flash('impersonation_warning', 'Your impersonation session has expired and you have been logged back into your administrator account.');
                $request->session()->flash('warning', 'Impersonation session expired.');

                // Redirect to admin dashboard
                return redirect()->route('admin.dashboard');
            }

            // Add Cache-Control headers to prevent caching during impersonation
            $response = $next($request);

            if ($response instanceof Response) {
                $response->headers->set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
                $response->headers->set('Pragma', 'no-cache');
                $response->headers->set('Expires', 'Sat, 01 Jan 2000 00:00:00 GMT');
            }

            return $response;
        }

        return $next($request);
    }
}

