<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

/**
 * Dispatches verification emails to users who have not yet confirmed ownership of their address.
 * Integrates guard checks and redirects so the verification flow remains smooth while preventing redundant mail.
 */
class EmailVerificationNotificationController extends Controller
{
    
    
    
    
    /**

    
    
    
     * Store a newly created resource.

    
    
    
     *

    
    
    
     * @param Request $request The request.

    
    
    
     * @return RedirectResponse

    
    
    
     */
    
    
    
    
    
    
    
    public function store(Request $request): RedirectResponse
    {
        if ($request->user()->hasVerifiedEmail()) {
            return redirect()->intended(route('dashboard', absolute: false));
        }

        $request->user()->sendEmailVerificationNotification();

        return back()->with('status', 'verification-link-sent');
    }
}
