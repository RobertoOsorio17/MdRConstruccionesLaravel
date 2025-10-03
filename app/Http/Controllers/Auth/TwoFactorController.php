<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;
use Laravel\Fortify\Actions\DisableTwoFactorAuthentication;
use Laravel\Fortify\Actions\EnableTwoFactorAuthentication;
use Laravel\Fortify\Actions\GenerateNewRecoveryCodes;
use Laravel\Fortify\Contracts\TwoFactorAuthenticationProvider;

class TwoFactorController extends Controller
{
    /**
     * Show the two factor authentication setup page.
     */
    public function show(Request $request): Response
    {
        $user = $request->user();
        
        return Inertia::render('Auth/TwoFactorSetup', [
            'twoFactorEnabled' => !is_null($user->two_factor_secret),
            'twoFactorConfirmed' => !is_null($user->two_factor_confirmed_at),
        ]);
    }

    /**
     * Enable two factor authentication for the user.
     */
    public function store(Request $request, EnableTwoFactorAuthentication $enable): RedirectResponse
    {
        $enable($request->user());

        return back()->with('status', 'two-factor-authentication-enabled');
    }

    /**
     * Get the two factor authentication QR code.
     */
    public function qrCode(Request $request)
    {
        $user = $request->user();

        if (is_null($user->two_factor_secret)) {
            return response()->json(['error' => 'Two factor authentication is not enabled.'], 400);
        }

        return response()->json([
            'svg' => $user->twoFactorQrCodeSvg(),
            'url' => $user->twoFactorQrCodeUrl(),
        ]);
    }

    /**
     * Get the two factor authentication recovery codes.
     */
    public function recoveryCodes(Request $request)
    {
        $user = $request->user();

        if (is_null($user->two_factor_secret)) {
            return response()->json(['error' => 'Two factor authentication is not enabled.'], 400);
        }

        return response()->json([
            'recoveryCodes' => json_decode(decrypt($user->two_factor_recovery_codes), true),
        ]);
    }

    /**
     * Confirm two factor authentication for the user.
     */
    public function confirm(Request $request): RedirectResponse
    {
        $request->validate([
            'code' => 'required|string',
        ]);

        $user = $request->user();

        if (is_null($user->two_factor_secret)) {
            return back()->withErrors(['code' => 'Two factor authentication is not enabled.']);
        }

        $provider = app(TwoFactorAuthenticationProvider::class);

        if (!$provider->verify(decrypt($user->two_factor_secret), $request->code)) {
            return back()->withErrors(['code' => 'The provided code was invalid.']);
        }

        $user->forceFill([
            'two_factor_confirmed_at' => now(),
        ])->save();

        return back()->with('status', 'two-factor-authentication-confirmed');
    }

    /**
     * Regenerate the two factor authentication recovery codes.
     */
    public function regenerate(Request $request, GenerateNewRecoveryCodes $generate): RedirectResponse
    {
        $generate($request->user());

        return back()->with('status', 'recovery-codes-generated');
    }

    /**
     * Disable two factor authentication for the user.
     */
    public function destroy(Request $request, DisableTwoFactorAuthentication $disable): RedirectResponse
    {
        $disable($request->user());

        return back()->with('status', 'two-factor-authentication-disabled');
    }

    /**
     * Show the two factor challenge page.
     */
    public function challenge(): Response
    {
        return Inertia::render('Auth/TwoFactorChallenge');
    }
}

