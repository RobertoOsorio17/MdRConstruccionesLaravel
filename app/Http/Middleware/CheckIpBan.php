<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Models\IpBan;

/**
 * Apply check ip middleware logic.
 */
class CheckIpBan
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $ip = $request->ip();
        
        if (IpBan::isIpBanned($ip)) {
            // Si es una peticiÃƒÆ’Ã‚Â³n AJAX, devolver JSON
            if ($request->expectsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Tu direcciÃƒÆ’Ã‚Â³n IP ha sido bloqueada por violar nuestros tÃƒÆ’Ã‚Â©rminos de uso. Si crees que esto es un error, contacta con el administrador.',
                    'error' => 'IP_BANNED'
                ], 403);
            }
            
            // Para peticiones normales, mostrar pÃƒÆ’Ã‚Â¡gina de error
            abort(403, 'Tu direcciÃƒÆ’Ã‚Â³n IP ha sido bloqueada.');
        }
        
        return $next($request);
    }
}
