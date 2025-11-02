<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Presents the verification prompt or forwards verified users to their intended destination.
 * Ensures newly registered accounts complete email confirmation before accessing protected areas.
 */
class EmailVerificationPromptController extends Controller
{
    
    
    
    
    /**

    
    
    
     * Handle __invoke.

    
    
    
     *

    
    
    
     * @param Request $request The request.

    
    
    
     * @return RedirectResponse|Response

    
    
    
     */
    
    
    
    
    
    
    
    public function __invoke(Request $request): RedirectResponse|Response
    {
        return $request->user()->hasVerifiedEmail()
                    ? redirect()->intended(route('dashboard', absolute: false))
                    : Inertia::render('Auth/VerifyEmailMUI', ['status' => session('status')]);
    }
}
