<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProfileUpdateRequest;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Manages authenticated user profile settings, routing visitors to tailored configuration experiences.
 *
 * Features:
 * - Redirects legacy profile route to new tabbed settings.
 * - Aggregates device/trusted device info for the security tab.
 * - Surfaces recovery codes when 2FA is enabled.
 * - Presents notification/privacy settings with user defaults.
 */
class ProfileController extends Controller
{
    /**
     * Display the user's profile form.
     *
     * @param Request $request The current HTTP request instance.
     * @return RedirectResponse Redirect to the new settings page.
     */
    public function edit(Request $request): RedirectResponse
    {
        // Redirect to new settings page
        return redirect()->route('profile.settings', ['tab' => 'personal']);
    }

    /**
     * Display the user's settings page with tabs.
     *
     * @param Request $request The current HTTP request instance.
     * @return Response Inertia response for the settings page with device and security info.
     */
    public function settings(Request $request): Response
    {
        $user = $request->user();

        // Get devices data
        $deviceService = app(\App\Services\DeviceTrackingService::class);
        $devices = $deviceService->getUserDevices($user)->map(function ($device) {
            return [
                'id' => $device->id,
                'device_id' => $device->device_id,
                'display_name' => $device->display_name,
                'custom_name' => $device->custom_name,
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
            ];
        });

        $deviceStats = [
            'total' => $devices->count(),
            'active' => $deviceService->getActiveDevicesCount($user),
            'trusted' => $deviceService->getTrustedDevicesCount($user),
            'inactive' => $devices->count() - $deviceService->getActiveDevicesCount($user),
        ];

        // Get connected accounts
        $connectedAccounts = [];
        if ($user->provider) {
            $connectedAccounts[] = [
                'provider' => $user->provider,
                'provider_id' => $user->provider_id,
                'created_at' => $user->created_at,
            ];
        }

        // Check if 2FA is enabled
        $twoFactorEnabled = !empty($user->two_factor_secret) && !empty($user->two_factor_confirmed_at);

        // Get recovery codes if 2FA is enabled
        $recoveryCodes = [];
        if ($twoFactorEnabled && $user->two_factor_recovery_codes) {
            $recoveryCodes = json_decode(decrypt($user->two_factor_recovery_codes), true);
        }

        // Get notification settings (from user preferences or defaults)
        $notificationSettings = $user->preferences['notifications'] ?? [];

        // Get privacy settings (from user or defaults)
        $privacySettings = [
            'profile_visibility' => $user->profile_visibility ?? true,
            'show_email' => $user->show_email ?? false,
        ];

        // Check if 2FA setup is mandatory (for admins/editors)
        // Use persistent session flag, not flash (flash gets consumed on first read)
        $force2FASetup = session('2fa_setup_mandatory', false);

        return Inertia::render('Profile/Settings', [
            'user' => $user,
            'mustVerifyEmail' => $user instanceof MustVerifyEmail,
            'status' => session('status'),
            'devices' => $devices,
            'deviceStats' => $deviceStats,
            'connectedAccounts' => $connectedAccounts,
            'hasPassword' => !empty($user->password),
            'twoFactorEnabled' => $twoFactorEnabled,
            'recoveryCodes' => $recoveryCodes,
            'force2FASetup' => $force2FASetup, // Flag to show mandatory 2FA modal
            'notificationSettings' => $notificationSettings,
            'privacySettings' => $privacySettings,
        ]);
    }

    /**
     * Update the user's profile information.
     *
     * @param ProfileUpdateRequest $request The validated profile update request.
     * @return RedirectResponse Redirect to profile edit screen.
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $request->user()->fill($request->validated());

        if ($request->user()->isDirty('email')) {
            $request->user()->email_verified_at = null;
        }

        $request->user()->save();

        return Redirect::route('profile.edit');
    }

    /**
     * Delete the user's account.
     *
     * @param Request $request The current HTTP request instance.
     * @return RedirectResponse Redirect to home after logout.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return Redirect::to('/');
    }
}
