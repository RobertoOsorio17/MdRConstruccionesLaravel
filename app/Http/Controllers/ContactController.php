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
            'name.required' => 'El nombre es obligatorio.',
            'email.required' => 'El email es obligatorio.',
            'email.email' => 'El email debe tener un formato válido.',
            'message.required' => 'El mensaje es obligatorio.',
            'privacy_accepted.accepted' => 'Debe aceptar la política de privacidad.',
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
                        ->subject('Nueva consulta desde la web - ' . $validated['name']);
            });
            */

            return back()->with('success', '¡Gracias por tu consulta! Nos pondremos en contacto contigo en las próximas 24 horas.');

        } catch (\Exception $e) {
            Log::error('Error processing contact form', [
                'error' => $e->getMessage(),
                'data' => $validated,
            ]);

            return back()->with('error', 'Ha ocurrido un error al enviar tu consulta. Por favor, inténtalo de nuevo o contáctanos por teléfono.');
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
            'name.required' => 'El nombre es obligatorio.',
            'email.required' => 'El email es obligatorio.',
            'phone.required' => 'El teléfono es obligatorio.',
            'service.required' => 'Debe seleccionar un servicio.',
            'property_type.required' => 'Debe indicar el tipo de propiedad.',
            'description.required' => 'La descripción del proyecto es obligatoria.',
            'privacy_accepted.accepted' => 'Debe aceptar la política de privacidad.',
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

            return back()->with('success', '¡Solicitud de presupuesto recibida! Nuestro equipo se pondrá en contacto contigo en las próximas horas para concretar una visita gratuita.');

        } catch (\Exception $e) {
            Log::error('Error processing budget request', [
                'error' => $e->getMessage(),
                'data' => $validated,
            ]);

            return back()->with('error', 'Ha ocurrido un error al enviar tu solicitud. Por favor, inténtalo de nuevo o llámanos directamente.');
        }
    }
}
