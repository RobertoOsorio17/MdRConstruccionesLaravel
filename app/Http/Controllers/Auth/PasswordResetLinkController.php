<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Password;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Initiates password reset emails by validating requests and delegating to Laravel's password broker.
 * Provides user-friendly responses while avoiding information disclosure about account existence.
 */
class PasswordResetLinkController extends Controller
{
    /**
     * Display the password reset link request view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/ForgotPasswordNew', [
            'status' => session('status'),
        ]);
    }

    /**
     * Handle an incoming password reset link request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'email' => 'required|email',
        ]);

        // We will send the password reset link to this user. Once we have attempted
        // to send the link, we will examine the response then see the message we
        // need to show to the user. Finally, we'll send out a proper response.
        $status = Password::sendResetLink($request->only('email'));

        if ($status === Password::RESET_THROTTLED) {
            throw ValidationException::withMessages([
                'email' => __('Demasiadas solicitudes de recuperación. Intenta nuevamente en unos minutos.'),
            ]);
        }

        if ($status !== Password::RESET_LINK_SENT) {
            Log::notice('Password reset link request for non-matching account', [
                'email_hash' => sha1(strtolower($request->input('email'))),
                'ip' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ]);
        }

        session()->flash('status', __('Si el correo electrónico existe en nuestros registros, recibirás un enlace de recuperación en los próximos minutos.'));

        return back();
    }
}
