<?php

namespace App\Http\Controllers;

use App\Models\UserDevice;
use App\Services\DeviceTrackingService;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\Request;
use Inertia\Inertia;

/**
 * Administers the authenticated user's registered devices, enabling review, naming, trust toggles, and clean-up.
 *
 * Features:
 * - List and summarize registered devices with derived activity state.
 * - Rename devices, toggle trust, and remove entries.
 * - Guard rails to prevent removing the current device.
 * - Backed by DeviceTrackingService for consistency across controllers.
 */
class DeviceController extends Controller
{
    use AuthorizesRequests;

    protected DeviceTrackingService $deviceService;

    public function __construct(DeviceTrackingService $deviceService)
    {
        $this->deviceService = $deviceService;
    }

    /**
     * Display a listing of the authenticated user's devices.
     *
     * @param Request $request The current HTTP request instance.
     * @return \Inertia\Response Inertia response with devices and stats.
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $devices = $this->deviceService->getUserDevices($user);

        return Inertia::render('Profile/Devices', [
            'devices' => $devices->map(function ($device) {
                return [
                    'id' => $device->id,
                    'device_id' => $device->device_id,
                    'display_name' => $device->display_name,
                    'device_name' => $device->device_name,
                    'device_type' => $device->device_type,
                    'browser' => $device->browser,
                    'browser_version' => $device->browser_version,
                    'platform' => $device->platform,
                    'platform_version' => $device->platform_version,
                    'ip_address' => $device->ip_address,
                    'country' => $device->country,
                    'city' => $device->city,
                    'is_trusted' => $device->is_trusted,
                    'is_active' => $device->isActive(),
                    'last_used_at' => $device->last_used_at?->diffForHumans(),
                    'created_at' => $device->created_at->format('M d, Y'),
                ];
            }),
            'stats' => [
                'total' => $devices->count(),
                'active' => $this->deviceService->getActiveDevicesCount($user),
                'trusted' => $this->deviceService->getTrustedDevicesCount($user),
                'inactive' => $devices->count() - $this->deviceService->getActiveDevicesCount($user),
            ],
        ]);
    }

    /**
     * Update a device custom name.
     *
     * @param Request $request The current HTTP request instance.
     * @param UserDevice $device The device to update.
     * @return \Illuminate\Http\RedirectResponse Redirect back with status.
     */
    public function update(Request $request, UserDevice $device)
    {
        $this->authorize('update', $device);

        $validated = $request->validate([
            'custom_name' => 'nullable|string|max:255',
        ]);

        $device->update($validated);

        return back()->with('success', 'Nombre del dispositivo actualizado correctamente.');
    }

    /**
     * Trust or untrust a device.
     *
     * @param Request $request The current HTTP request instance.
     * @param UserDevice $device The device to toggle trust for.
     * @return \Illuminate\Http\RedirectResponse Redirect back with status.
     */
    public function trust(Request $request, UserDevice $device)
    {
        $this->authorize('update', $device);

        $validated = $request->validate([
            'is_trusted' => 'required|boolean',
        ]);

        if ($validated['is_trusted']) {
            $this->deviceService->trustDevice($device);
            $message = 'Dispositivo marcado como confiable.';
        } else {
            $this->deviceService->untrustDevice($device);
            $message = 'Dispositivo desmarcado como confiable.';
        }

        return back()->with('success', $message);
    }

    /**
     * Remove a device from the account.
     *
     * @param Request $request The current HTTP request instance.
     * @param UserDevice $device The device to remove.
     * @return \Illuminate\Http\RedirectResponse Redirect back with status.
     */
    public function destroy(Request $request, UserDevice $device)
    {
        $this->authorize('delete', $device);

        // Prevent removing current device
        $currentDeviceId = $this->deviceService->trackDevice($request->user(), $request)->device_id;
        
        if ($device->device_id === $currentDeviceId) {
            return back()->with('error', 'No puedes eliminar el dispositivo actual.');
        }

        $this->deviceService->removeDevice($device);

        return back()->with('success', 'Dispositivo eliminado correctamente.');
    }

    /**
     * Remove all inactive devices.
     *
     * @param Request $request The current HTTP request instance.
     * @return \Illuminate\Http\RedirectResponse Redirect back with status.
     */
    public function destroyInactive(Request $request)
    {
        $user = $request->user();
        $count = $this->deviceService->removeInactiveDevices($user);

        return back()->with('success', "Se eliminaron {$count} dispositivos inactivos.");
    }
}

