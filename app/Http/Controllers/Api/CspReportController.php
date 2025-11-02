<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

/**
 * Controller para recibir reportes de violaciones de Content Security Policy (CSP)
 * 
 * Los navegadores envían reportes cuando se detecta una violación de CSP,
 * lo que ayuda a identificar problemas de seguridad y configuración.
 */
class CspReportController extends Controller
{
    /**
     * Recibe y procesa reportes de violaciones CSP
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function report(Request $request)
    {
        try {
            // Los reportes CSP vienen en formato JSON con content-type application/csp-report
            $report = $request->json()->all();
            
            // Validar que el reporte tenga la estructura esperada
            if (!isset($report['csp-report'])) {
                return response()->json(['status' => 'invalid'], 400);
            }
            
            $cspReport = $report['csp-report'];
            
            // Extraer información relevante del reporte
            $violationData = [
                'document_uri' => $cspReport['document-uri'] ?? 'unknown',
                'violated_directive' => $cspReport['violated-directive'] ?? 'unknown',
                'blocked_uri' => $cspReport['blocked-uri'] ?? 'unknown',
                'source_file' => $cspReport['source-file'] ?? null,
                'line_number' => $cspReport['line-number'] ?? null,
                'column_number' => $cspReport['column-number'] ?? null,
                'status_code' => $cspReport['status-code'] ?? null,
                'user_agent' => $request->userAgent(),
                'ip_address' => $request->ip(),
                'timestamp' => now()->toIso8601String(),
            ];
            
            // Filtrar reportes de desarrollo (localhost, Vite HMR, etc.)
            if ($this->shouldIgnoreReport($violationData)) {
                return response()->json(['status' => 'ignored'], 200);
            }
            
            // Log del reporte para análisis
            Log::channel('security')->warning('CSP Violation Detected', $violationData);
            
            // En producción, podrías enviar esto a un servicio de monitoreo
            // como Sentry, Bugsnag, etc.
            if (app()->environment('production')) {
                // TODO: Integrar con servicio de monitoreo (Sentry, etc.)
                // \Sentry\captureMessage('CSP Violation', ['extra' => $violationData]);
            }
            
            return response()->json(['status' => 'received'], 204);
            
        } catch (\Exception $e) {
            Log::error('Error processing CSP report', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            
            return response()->json(['status' => 'error'], 500);
        }
    }
    
    /**
     * Determina si un reporte debe ser ignorado
     * 
     * @param array $violationData
     * @return bool
     */
    private function shouldIgnoreReport(array $violationData): bool
    {
        $blockedUri = $violationData['blocked_uri'];
        $documentUri = $violationData['document_uri'];
        
        // Ignorar reportes de desarrollo
        $developmentPatterns = [
            'localhost',
            '127.0.0.1',
            '[::1]',
            'vite',
            'webpack',
            'hot-update',
        ];
        
        foreach ($developmentPatterns as $pattern) {
            if (
                str_contains($blockedUri, $pattern) ||
                str_contains($documentUri, $pattern)
            ) {
                return true;
            }
        }
        
        // Ignorar reportes de extensiones del navegador
        $browserExtensionPatterns = [
            'chrome-extension://',
            'moz-extension://',
            'safari-extension://',
            'edge-extension://',
        ];
        
        foreach ($browserExtensionPatterns as $pattern) {
            if (str_starts_with($blockedUri, $pattern)) {
                return true;
            }
        }
        
        // Ignorar reportes inline si es una directiva de estilo
        // (necesario para CSS-in-JS como MUI)
        if (
            str_contains($violationData['violated_directive'], 'style-src') &&
            $blockedUri === 'inline'
        ) {
            return true;
        }
        
        return false;
    }
}

