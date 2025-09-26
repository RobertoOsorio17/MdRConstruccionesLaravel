<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Models\IpBan;

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
            // Si es una petición AJAX, devolver JSON
            if ($request->expectsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Tu dirección IP ha sido bloqueada por violar nuestros términos de uso. Si crees que esto es un error, contacta con el administrador.',
                    'error' => 'IP_BANNED'
                ], 403);
            }
            
            // Para peticiones normales, mostrar página de error
            abort(403, 'Tu dirección IP ha sido bloqueada.');
        }
        
        return $next($request);
    }
}
