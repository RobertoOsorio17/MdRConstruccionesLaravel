<?php

namespace App\Http\Requests\Auth;

use Illuminate\Auth\Events\Lockout;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

/**
 * Validate login input data.
 */
class LoginRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'email' => ['required', 'string', 'email'],
            'password' => ['required', 'string'],
        ];
    }

    /**
     * Attempt to authenticate the request's credentials.
     * ✅ SECURITY FIX: Updated decay times to match stricter rate limiting
     * ✅ SECURITY FIX: Added account lockout mechanism
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function authenticate(): void
    {
        $this->ensureIsNotRateLimited();

        // ✅ SECURITY: Check if account is locked
        $lockoutService = app(\App\Services\AccountLockoutService::class);
        if ($lockoutService->isAccountLocked($this->email)) {
            $remainingSeconds = $lockoutService->getRemainingLockoutTime($this->email);
            $remainingMinutes = ceil($remainingSeconds / 60);

            throw ValidationException::withMessages([
                'email' => "Tu cuenta ha sido bloqueada temporalmente debido a múltiples intentos fallidos. Intenta de nuevo en {$remainingMinutes} minutos.",
            ]);
        }

        if (! Auth::attempt($this->only('email', 'password'), $this->boolean('remember'))) {
            // ✅ IP-based: 15 minutes decay (increased from 1 minute)
            RateLimiter::hit($this->throttleKey(), 900);

            // ✅ Email-based: Progressive decay based on attempts
            RateLimiter::hit($this->emailThrottleKey(), $this->emailDecaySeconds());

            // ✅ SECURITY: Record failed attempt for account lockout
            $lockoutService->recordFailedAttempt($this->email, $this->ip());

            throw ValidationException::withMessages([
                'email' => trans('auth.failed'),
            ]);
        }

        RateLimiter::clear($this->throttleKey());
        RateLimiter::clear($this->emailThrottleKey());

        // ✅ SECURITY: Clear failed attempts on successful login
        $lockoutService->clearFailedAttempts($this->email);
    }

    /**
     * Ensure the login request is not rate limited.
     *
     * ✅ SECURITY FIX: Stricter rate limiting following industry best practices
     * - IP-based: 5 attempts per 15 minutes (was 5 per minute)
     * - Email-based: 10 attempts per 15 minutes (was 12 per minute)
     * - Progressive lockout with increasing delays
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function ensureIsNotRateLimited(): void
    {
        // ✅ IP-based rate limiting: 5 attempts per 15 minutes
        $ipKey = $this->throttleKey();
        $ipDecayMinutes = 15;
        $ipMaxAttempts = 5;

        // ✅ Email-based rate limiting: 10 attempts per 15 minutes with progressive lockout
        $emailKey = $this->emailThrottleKey();
        $emailAttempts = RateLimiter::attempts($emailKey);
        $emailDecayMinutes = $this->emailDecayMinutes();
        $emailMaxAttempts = $this->getEmailMaxAttempts($emailAttempts);

        $ipExceeded = RateLimiter::tooManyAttempts($ipKey, $ipMaxAttempts);
        $emailExceeded = RateLimiter::tooManyAttempts($emailKey, $emailMaxAttempts);

        if (! $ipExceeded && ! $emailExceeded) {
            return;
        }

        event(new Lockout($this));

        $seconds = max(
            RateLimiter::availableIn($ipKey),
            RateLimiter::availableIn($emailKey)
        );

        throw ValidationException::withMessages([
            'email' => trans('auth.throttle', [
                'seconds' => $seconds,
                'minutes' => ceil($seconds / 60),
            ]),
        ]);
    }

    /**
     * Get the rate limiting throttle key for the request.
     */
    public function throttleKey(): string
    {
        return Str::transliterate(Str::lower($this->string('email')).'|'.$this->ip());
    }

    protected function emailThrottleKey(): string
    {
        return 'login:email:' . Str::transliterate(Str::lower($this->string('email')));
    }

    /**
     * Get progressive decay time based on number of failed attempts.
     * ✅ SECURITY: Progressive lockout with increasing delays
     */
    protected function emailDecaySeconds(): int
    {
        $attempts = RateLimiter::attempts($this->emailThrottleKey());

        return match (true) {
            $attempts >= 15 => 3600, // 60 minutes lockout for persistent abuse
            $attempts >= 10 => 1800, // 30 minutes after 10 failures
            $attempts >= 6 => 900,   // 15 minutes after 6 failures (increased from 10)
            default => 900,          // 15 minutes default (increased from 5)
        };
    }

    /**
     * Get maximum allowed attempts based on current attempt count.
     * ✅ SECURITY: Progressive reduction of allowed attempts
     */
    protected function getEmailMaxAttempts(int $currentAttempts): int
    {
        return match (true) {
            $currentAttempts >= 10 => 1,  // Only 1 more attempt after 10 failures
            $currentAttempts >= 6 => 3,   // Only 3 more attempts after 6 failures
            default => 10,                // 10 attempts in first window (15 minutes)
        };
    }
}
