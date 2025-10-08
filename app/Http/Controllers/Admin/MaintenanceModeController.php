<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AdminSetting;
use App\Events\MaintenanceModeToggled;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;

/**
 * Governs maintenance mode behavior by exposing endpoints to toggle, schedule, and communicate downtime across the platform.
 * Consolidates whitelist management, announcement messaging, and preview capabilities to give administrators predictable maintenance controls.
 */
class MaintenanceModeController extends Controller
{
    /**
     * Toggle maintenance mode on or off.
     *
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\RedirectResponse
     */
    public function toggle(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'enabled' => 'required|boolean',
            'message' => 'required_if:enabled,true|string|max:1000',
        ], [
            'enabled.required' => 'El estado es requerido.',
            'enabled.boolean' => 'El estado debe ser verdadero o falso.',
            'message.required_if' => 'El mensaje es requerido cuando el modo mantenimiento está activo.',
            'message.max' => 'El mensaje no debe superar 1000 caracteres.',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator);
        }

        $enabled = $request->input('enabled');
        $message = $request->input('message');

        // Update maintenance mode setting
        AdminSetting::setValueWithHistory(
            'maintenance_mode',
            $enabled,
            $enabled ? 'Enabled via admin panel' : 'Disabled via admin panel'
        );

        // Update message if provided
        if ($message) {
            AdminSetting::setValueWithHistory(
                'maintenance_message',
                $message,
                'Updated via admin panel'
            );
        }

        // Fire event
        event(new MaintenanceModeToggled(
            enabled: $enabled,
            message: $message,
            user: auth()->user()
        ));

        $successMessage = $enabled 
            ? '🔧 Modo mantenimiento activado correctamente.' 
            : '✅ Modo mantenimiento desactivado correctamente.';

        session()->flash('success', $successMessage);
        return back();
    }

    /**
     * Schedule a maintenance window.
     *
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\RedirectResponse
     */
    public function schedule(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'start_at' => 'required|date|after:now',
            'end_at' => 'required|date|after:start_at',
            'message' => 'required|string|max:1000',
        ], [
            'start_at.required' => 'La fecha de inicio es requerida.',
            'start_at.date' => 'La fecha de inicio debe ser una fecha válida.',
            'start_at.after' => 'La fecha de inicio debe ser futura.',
            'end_at.required' => 'La fecha de fin es requerida.',
            'end_at.date' => 'La fecha de fin debe ser una fecha válida.',
            'end_at.after' => 'La fecha de fin debe ser posterior a la fecha de inicio.',
            'message.required' => 'El mensaje es requerido.',
            'message.max' => 'El mensaje no debe superar 1000 caracteres.',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator);
        }

        $startAt = $request->input('start_at');
        $endAt = $request->input('end_at');
        $message = $request->input('message');

        // Update settings
        AdminSetting::setValueWithHistory('maintenance_mode', true, 'Scheduled maintenance');
        AdminSetting::setValueWithHistory('maintenance_start_at', $startAt, 'Scheduled via admin panel');
        AdminSetting::setValueWithHistory('maintenance_end_at', $endAt, 'Scheduled via admin panel');
        AdminSetting::setValueWithHistory('maintenance_message', $message, 'Scheduled via admin panel');

        // Fire event
        event(new MaintenanceModeToggled(
            enabled: true,
            message: $message,
            user: auth()->user(),
            startAt: $startAt,
            endAt: $endAt
        ));

        session()->flash('success', '📅 Mantenimiento programado correctamente.');
        return back();
    }

    /**
     * Preview the maintenance page.
     *
     * @return \Illuminate\View\View
     */
    public function preview()
    {
        $message = AdminSetting::getValue(
            'maintenance_message',
            'Estamos realizando mejoras en nuestro sitio. Volveremos pronto.'
        );
        
        $showCountdown = AdminSetting::getValue('maintenance_show_countdown', true);
        $endAt = AdminSetting::getValue('maintenance_end_at', null);
        $siteName = AdminSetting::getValue('site_name', 'MDR Construcciones');

        return view('maintenance', [
            'message' => $message,
            'show_countdown' => $showCountdown,
            'end_at' => $endAt,
            'site_name' => $siteName,
            'preview' => true,
        ]);
    }

    /**
     * Add an IP address to the whitelist.
     *
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\RedirectResponse
     */
    public function addIp(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'ip' => 'required|ip',
        ], [
            'ip.required' => 'La dirección IP es requerida.',
            'ip.ip' => 'Debe ser una dirección IP válida.',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator);
        }

        $ip = $request->input('ip');
        $allowedIps = AdminSetting::getValue('maintenance_allowed_ips', []);

        if (is_string($allowedIps)) {
            $allowedIps = json_decode($allowedIps, true) ?? [];
        }

        if (in_array($ip, $allowedIps)) {
            return back()->withErrors(['ip' => 'Esta IP ya está en la lista.']);
        }

        $allowedIps[] = $ip;

        AdminSetting::setValueWithHistory(
            'maintenance_allowed_ips',
            $allowedIps,
            "Added IP {$ip} via admin panel"
        );

        session()->flash('success', "✅ IP {$ip} agregada a la lista permitida.");
        return back();
    }

    /**
     * Remove an IP address from the whitelist.
     *
     * @param string $ip
     * @return \Illuminate\Http\RedirectResponse
     */
    public function removeIp(string $ip)
    {
        $allowedIps = AdminSetting::getValue('maintenance_allowed_ips', []);

        if (is_string($allowedIps)) {
            $allowedIps = json_decode($allowedIps, true) ?? [];
        }

        $key = array_search($ip, $allowedIps);
        
        if ($key === false) {
            return back()->withErrors(['ip' => 'Esta IP no está en la lista.']);
        }

        unset($allowedIps[$key]);
        $allowedIps = array_values($allowedIps); // Re-index array

        AdminSetting::setValueWithHistory(
            'maintenance_allowed_ips',
            $allowedIps,
            "Removed IP {$ip} via admin panel"
        );

        session()->flash('success', "🗑️ IP {$ip} eliminada de la lista permitida.");
        return back();
    }

    /**
     * Get current maintenance mode status (API endpoint).
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function status()
    {
        $enabled = AdminSetting::getValue('maintenance_mode', false);
        $message = AdminSetting::getValue('maintenance_message', '');
        $allowedIps = AdminSetting::getValue('maintenance_allowed_ips', []);
        $startAt = AdminSetting::getValue('maintenance_start_at');
        $endAt = AdminSetting::getValue('maintenance_end_at');

        return response()->json([
            'enabled' => $enabled,
            'message' => $message,
            'allowed_ips' => $allowedIps,
            'start_at' => $startAt,
            'end_at' => $endAt,
            'is_scheduled' => !is_null($startAt) || !is_null($endAt),
        ]);
    }
}
