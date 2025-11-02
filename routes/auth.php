<?php

use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Auth\ConfirmablePasswordController;
use App\Http\Controllers\Auth\EmailVerificationNotificationController;
use App\Http\Controllers\Auth\EmailVerificationPromptController;
use App\Http\Controllers\Auth\NewPasswordController;
use App\Http\Controllers\Auth\PasswordController;
use App\Http\Controllers\Auth\PasswordResetLinkController;
use App\Http\Controllers\Auth\RegisteredUserController;
use App\Http\Controllers\Auth\SocialAuthController;
use App\Http\Controllers\Auth\TwoFactorController;
use App\Http\Controllers\Auth\VerifyEmailController;
use App\Http\Controllers\TrustedDeviceController;
use Illuminate\Support\Facades\Route;

Route::middleware('guest.redirect')->group(function () {
    Route::get('register', [RegisteredUserController::class, 'create'])
        ->middleware('check.registration')
        ->name('register');

    Route::post('register', [RegisteredUserController::class, 'store'])
        ->middleware(['check.registration', 'auth.ratelimit']);

    Route::get('login', [AuthenticatedSessionController::class, 'create'])
        ->name('login');

    Route::post('login', [AuthenticatedSessionController::class, 'store'])
        ->middleware('auth.ratelimit');

    Route::get('forgot-password', [PasswordResetLinkController::class, 'create'])
        ->name('password.request');

    Route::post('forgot-password', [PasswordResetLinkController::class, 'store'])
        ->middleware(['auth.ratelimit', 'throttle:3,1'])
        ->name('password.email');

    Route::get('reset-password/{token}', [NewPasswordController::class, 'create'])
        ->name('password.reset');

    Route::post('reset-password', [NewPasswordController::class, 'store'])
        ->middleware('auth.ratelimit')
        ->name('password.store');

    // Two Factor Authentication Challenge
    Route::get('two-factor-challenge', [TwoFactorController::class, 'challenge'])
        ->middleware('two-factor.challenge')
        ->name('two-factor.login');

    Route::post('two-factor-challenge', [TwoFactorController::class, 'verify'])
        ->middleware(['two-factor.challenge', 'auth.ratelimit'])
        ->name('two-factor.verify');

    // OAuth Social Authentication
    Route::get('auth/{provider}', [SocialAuthController::class, 'redirect'])
        ->name('social.redirect');

    Route::get('auth/{provider}/callback', [SocialAuthController::class, 'callback'])
        ->name('social.callback');
});

Route::middleware(['auth', 'auth.enhanced'])->group(function () {
    // ⚡ PERFORMANCE: Email verification and password confirmation routes are registered by Laravel Fortify
    // See config/fortify.php - Features::emailVerification() and password confirmation
    // Removed duplicate routes to fix route caching error

    Route::put('password', [PasswordController::class, 'update'])->name('password.update');

    Route::post('logout', [AuthenticatedSessionController::class, 'destroy'])
        ->name('logout');

    // OAuth Management
    Route::get('connected-accounts', [SocialAuthController::class, 'index'])
        ->name('connected-accounts');

    Route::delete('auth/{provider}/unlink', [SocialAuthController::class, 'unlink'])
        ->name('social.unlink');

    // Trusted Devices Management
    Route::get('trusted-devices', [TrustedDeviceController::class, 'index'])
        ->name('trusted-devices.index');

    Route::delete('trusted-devices/{id}', [TrustedDeviceController::class, 'destroy'])
        ->name('trusted-devices.destroy');

    Route::delete('trusted-devices', [TrustedDeviceController::class, 'destroyAll'])
        ->name('trusted-devices.destroy-all');

    Route::post('recovery-codes/regenerate', [TrustedDeviceController::class, 'regenerateRecoveryCodes'])
        ->name('recovery-codes.regenerate');

    // ⚡ PERFORMANCE: Two Factor Authentication routes are registered by Laravel Fortify
    // See config/fortify.php - Features::twoFactorAuthentication()
    // Custom 2FA routes with additional features (QR code, initial recovery codes, etc.)
    // are registered in app/Providers/FortifyServiceProvider.php
});
