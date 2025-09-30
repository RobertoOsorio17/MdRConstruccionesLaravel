<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use App\Models\Setting;

class ContactController extends Controller
{
    /**
     * Handle contact form submission.
     */
    public function submit(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'nullable|string|max:20',
            'service' => 'nullable|string|max:255',
            'message' => 'required|string|max:2000',
            'privacy_accepted' => 'required|accepted',
            'g-recaptcha-response' => 'sometimes', // Will be required when reCAPTCHA is implemented
        ], [
            'name.required' => 'The name field is required.',
            'email.required' => 'The email field is required.',
            'email.email' => 'The email must be a valid address.',
            'message.required' => 'The message field is required.',
            'privacy_accepted.accepted' => 'You must accept the privacy policy.',
        ]);

        try {
            // Store the contact in database (we'll create this table later)
            $contactData = [
                'name' => $validated['name'],
                'email' => $validated['email'],
                'phone' => $validated['phone'] ?? null,
                'service' => $validated['service'] ?? null,
                'message' => $validated['message'],
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'created_at' => now(),
                'updated_at' => now(),
            ];

            // For now, just log it. Later we'll save to contacts table
            Log::info('New contact form submission', $contactData);

            // Send email notification (commented for now, will implement in email phase)
            /*
            Mail::send('emails.contact', $contactData, function ($message) use ($validated) {
                $message->to(Setting::get('company_email', 'info@mdrconstrucciones.com'))
                        ->subject('New inquiry from the website - ' . $validated['name']);
            });
            */

            return back()->with('success', 'Thank you for your inquiry! We will contact you within the next 24 hours.');

        } catch (\Exception $e) {
            Log::error('Error processing contact form', [
                'error' => $e->getMessage(),
                'data' => $validated,
            ]);

            return back()->with('error', 'An error occurred while sending your inquiry. Please try again or contact us by phone.');
        }
    }

    /**
     * Handle budget request form submission.
     */
    public function budgetRequest(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'required|string|max:20',
            'service' => 'required|string|max:255',
            'property_type' => 'required|string|in:piso,casa,local,oficina,otro',
            'property_size' => 'nullable|string|max:100',
            'budget_range' => 'nullable|string|max:100',
            'timeline' => 'nullable|string|max:100',
            'description' => 'required|string|max:2000',
            'privacy_accepted' => 'required|accepted',
        ], [
            'name.required' => 'The name field is required.',
            'email.required' => 'The email field is required.',
            'phone.required' => 'The phone field is required.',
            'service.required' => 'You must select a service.',
            'property_type.required' => 'You must specify the property type.',
            'description.required' => 'The project description is required.',
            'privacy_accepted.accepted' => 'You must accept the privacy policy.',
        ]);

        try {
            // Store the budget request
            $budgetData = array_merge($validated, [
                'type' => 'budget_request',
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            // For now, just log it
            Log::info('New budget request submission', $budgetData);

            return back()->with('success', 'Budget request received! Our team will contact you in the next few hours to schedule a free visit.');

        } catch (\Exception $e) {
            Log::error('Error processing budget request', [
                'error' => $e->getMessage(),
                'data' => $validated,
            ]);

            return back()->with('error', 'An error occurred while sending your request. Please try again or call us directly.');
        }
    }
}


