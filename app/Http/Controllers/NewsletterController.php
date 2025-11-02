<?php

namespace App\Http\Controllers;

use App\Models\Newsletter;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\RateLimiter;

/**
 * Manages public newsletter subscriptions with throttling, validation, and confirmation messaging.
 *
 * Features:
 * - Per‑IP rate limiting to prevent abuse.
 * - Double‑opt‑in via tokenized verification links.
 * - Idempotent flows for already subscribed/unsubscribed states.
 * - Preference management for content categories.
 * - Operational logging around subscribe/verify/unsubscribe.
 */
class NewsletterController extends Controller
{
    
    
    
    
    /**

    
    
    
     * Handle subscribe.

    
    
    
     *

    
    
    
     * @param Request $request The request.

    
    
    
     * @return void

    
    
    
     */
    
    
    
    
    
    
    
    public function subscribe(Request $request)
    {
        // 1) Apply a conservative rate limit (3/hour/IP).
        $key = 'newsletter-subscribe:' . $request->ip();
        
        if (RateLimiter::tooManyAttempts($key, 3)) {
            $seconds = RateLimiter::availableIn($key);
            return back()->withErrors([
                'email' => "Too many subscription attempts. Please try again in {$seconds} seconds."
            ]);
        }

        // 2) Validate input (email with DNS where configured; optional name/preferences).
        $validated = $request->validate([
            'email' => 'required|email:rfc,dns|max:255|regex:/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/',
            'name' => 'nullable|string|max:255|regex:/^[a-zA-Z\s\-\.áéíóúñÁÉÍÓÚÑ]+$/',
            'preferences' => 'nullable|array',
            'preferences.*' => 'string|in:news,projects,services,blog',
        ]);

        RateLimiter::hit($key, 3600); // 1 hour

        // 3) Handle existing subscription states (active, unsubscribed, unverified).
        $existing = Newsletter::where('email', $validated['email'])->first();

        if ($existing) {
            if ($existing->is_active && $existing->isVerified()) {
                return back()->with('info', 'This email is already subscribed to our newsletter.');
            }

            if ($existing->isUnsubscribed()) {
                // Reactivate subscription
                $existing->resubscribe();
                $existing->regenerateToken();
                
                // Send verification email
                $this->sendVerificationEmail($existing);

                return back()->with('success', 'Welcome back! Please check your email to verify your subscription.');
            }

            // Resend verification if not verified
            if (!$existing->isVerified()) {
                $existing->regenerateToken();
                $this->sendVerificationEmail($existing);

                return back()->with('success', 'Verification email resent. Please check your inbox.');
            }
        }

        // 4) Create new subscription and capture client hints.
        $newsletter = Newsletter::create([
            'email' => $validated['email'],
            'name' => $validated['name'] ?? null,
            'preferences' => $validated['preferences'] ?? null,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        // 5) Send verification email (double‑opt‑in).
        $this->sendVerificationEmail($newsletter);

        // 6) Log subscription for audit/observability.
        \Log::info('Newsletter subscription created', [
            'email' => $newsletter->email,
            'ip' => $request->ip(),
        ]);

        return back()->with('success', 'Thank you for subscribing! Please check your email to verify your subscription.');
    }

    
    
    
    
    /**

    
    
    
     * Handle verify.

    
    
    
     *

    
    
    
     * @param Request $request The request.

    
    
    
     * @param mixed $token The token.

    
    
    
     * @return void

    
    
    
     */
    
    
    
    
    
    
    
    public function verify(Request $request, $token)
    {
        // 1) Resolve the subscription by token; 404 if invalid.
        $newsletter = Newsletter::where('token', $token)->firstOrFail();

        if ($newsletter->isVerified()) {
            return redirect()->route('home')->with('info', 'Your subscription is already verified.');
        }

        $newsletter->verify();

        // 2) Log verification to correlate with subscribe event.
        \Log::info('Newsletter subscription verified', [
            'email' => $newsletter->email,
            'ip' => $request->ip(),
        ]);

        return redirect()->route('home')->with('success', 'Your subscription has been verified! Thank you for joining our newsletter.');
    }

    
    
    
    
    /**

    
    
    
     * Handle unsubscribe.

    
    
    
     *

    
    
    
     * @param Request $request The request.

    
    
    
     * @param mixed $token The token.

    
    
    
     * @return void

    
    
    
     */
    
    
    
    
    
    
    
    public function unsubscribe(Request $request, $token)
    {
        // 1) Resolve the subscription by token; 404 if invalid.
        $newsletter = Newsletter::where('token', $token)->firstOrFail();

        if ($newsletter->isUnsubscribed()) {
            return redirect()->route('home')->with('info', 'You are already unsubscribed.');
        }

        $newsletter->unsubscribe();

        // 2) Log unsubscription to track user choice and client context.
        \Log::info('Newsletter unsubscription', [
            'email' => $newsletter->email,
            'ip' => $request->ip(),
        ]);

        return redirect()->route('home')->with('success', 'You have been unsubscribed from our newsletter. We\'re sorry to see you go!');
    }

    
    
    
    
    /**

    
    
    
     * Handle update preferences.

    
    
    
     *

    
    
    
     * @param Request $request The request.

    
    
    
     * @param mixed $token The token.

    
    
    
     * @return void

    
    
    
     */
    
    
    
    
    
    
    
    public function updatePreferences(Request $request, $token)
    {
        // 1) Resolve subscription and validate category choices.
        $newsletter = Newsletter::where('token', $token)->firstOrFail();

        // 2) Validate request data (categories from allow‑list).
        $validated = $request->validate([
            'preferences' => 'required|array',
            'preferences.*' => 'string|in:news,projects,services,blog',
        ]);

        $newsletter->update([
            'preferences' => $validated['preferences'],
        ]);

        // 3) Log preference update for audit trail.
        \Log::info('Newsletter preferences updated', [
            'email' => $newsletter->email,
            'preferences' => $validated['preferences'],
        ]);

        return back()->with('success', 'Your preferences have been updated successfully.');
    }

    
    
    
    
    /**

    
    
    
     * Send verification email.

    
    
    
     *

    
    
    
     * @param Newsletter $newsletter The newsletter.

    
    
    
     * @return void

    
    
    
     */
    
    
    
    
    
    
    
    private function sendVerificationEmail(Newsletter $newsletter)
    {
        try {
            // Compose and send a minimal verification message.
            Mail::send('emails.newsletter.verify', [
                'newsletter' => $newsletter,
                'verifyUrl' => route('newsletter.verify', $newsletter->token),
            ], function ($message) use ($newsletter) {
                $message->to($newsletter->email, $newsletter->name)
                        ->subject('Verify Your Newsletter Subscription - MDR Construcciones');
            });
        } catch (\Exception $e) {
            // Swallow delivery errors and capture context for later retries.
            \Log::error('Failed to send newsletter verification email', [
                'email' => $newsletter->email,
                'error' => $e->getMessage(),
            ]);
        }
    }
}

