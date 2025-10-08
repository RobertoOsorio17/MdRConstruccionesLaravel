<?php

namespace App\Http\Controllers;

use App\Models\Newsletter;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\RateLimiter;

/**
 * Manages public newsletter subscriptions with throttling, validation, and confirmation messaging.
 * Coordinates with mailing services so subscribers receive timely onboarding and curated content.
 */
class NewsletterController extends Controller
{
    /**
     * Subscribe to newsletter
     */
    public function subscribe(Request $request)
    {
        // ✅ Rate limiting: 3 subscriptions per hour per IP
        $key = 'newsletter-subscribe:' . $request->ip();
        
        if (RateLimiter::tooManyAttempts($key, 3)) {
            $seconds = RateLimiter::availableIn($key);
            return back()->withErrors([
                'email' => "Too many subscription attempts. Please try again in {$seconds} seconds."
            ]);
        }

        // ✅ Validate input
        $validated = $request->validate([
            'email' => 'required|email:rfc,dns|max:255|regex:/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/',
            'name' => 'nullable|string|max:255|regex:/^[a-zA-Z\s\-\.áéíóúñÁÉÍÓÚÑ]+$/',
            'preferences' => 'nullable|array',
            'preferences.*' => 'string|in:news,projects,services,blog',
        ]);

        RateLimiter::hit($key, 3600); // 1 hour

        // Check if already subscribed
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

        // Create new subscription
        $newsletter = Newsletter::create([
            'email' => $validated['email'],
            'name' => $validated['name'] ?? null,
            'preferences' => $validated['preferences'] ?? null,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        // Send verification email
        $this->sendVerificationEmail($newsletter);

        // ✅ Log subscription
        \Log::info('Newsletter subscription created', [
            'email' => $newsletter->email,
            'ip' => $request->ip(),
        ]);

        return back()->with('success', 'Thank you for subscribing! Please check your email to verify your subscription.');
    }

    /**
     * Verify email subscription
     */
    public function verify(Request $request, $token)
    {
        $newsletter = Newsletter::where('token', $token)->firstOrFail();

        if ($newsletter->isVerified()) {
            return redirect()->route('home')->with('info', 'Your subscription is already verified.');
        }

        $newsletter->verify();

        // ✅ Log verification
        \Log::info('Newsletter subscription verified', [
            'email' => $newsletter->email,
            'ip' => $request->ip(),
        ]);

        return redirect()->route('home')->with('success', 'Your subscription has been verified! Thank you for joining our newsletter.');
    }

    /**
     * Unsubscribe from newsletter
     */
    public function unsubscribe(Request $request, $token)
    {
        $newsletter = Newsletter::where('token', $token)->firstOrFail();

        if ($newsletter->isUnsubscribed()) {
            return redirect()->route('home')->with('info', 'You are already unsubscribed.');
        }

        $newsletter->unsubscribe();

        // ✅ Log unsubscription
        \Log::info('Newsletter unsubscription', [
            'email' => $newsletter->email,
            'ip' => $request->ip(),
        ]);

        return redirect()->route('home')->with('success', 'You have been unsubscribed from our newsletter. We\'re sorry to see you go!');
    }

    /**
     * Update preferences
     */
    public function updatePreferences(Request $request, $token)
    {
        $newsletter = Newsletter::where('token', $token)->firstOrFail();

        // ✅ Validate
        $validated = $request->validate([
            'preferences' => 'required|array',
            'preferences.*' => 'string|in:news,projects,services,blog',
        ]);

        $newsletter->update([
            'preferences' => $validated['preferences'],
        ]);

        // ✅ Log update
        \Log::info('Newsletter preferences updated', [
            'email' => $newsletter->email,
            'preferences' => $validated['preferences'],
        ]);

        return back()->with('success', 'Your preferences have been updated successfully.');
    }

    /**
     * Send verification email
     */
    private function sendVerificationEmail(Newsletter $newsletter)
    {
        try {
            Mail::send('emails.newsletter.verify', [
                'newsletter' => $newsletter,
                'verifyUrl' => route('newsletter.verify', $newsletter->token),
            ], function ($message) use ($newsletter) {
                $message->to($newsletter->email, $newsletter->name)
                        ->subject('Verify Your Newsletter Subscription - MDR Construcciones');
            });
        } catch (\Exception $e) {
            \Log::error('Failed to send newsletter verification email', [
                'email' => $newsletter->email,
                'error' => $e->getMessage(),
            ]);
        }
    }
}

