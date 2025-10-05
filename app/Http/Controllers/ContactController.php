<?php

namespace App\Http\Controllers;

use App\Models\ContactRequest;
use App\Services\RecaptchaService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Inertia\Inertia;
use App\Models\Setting;

class ContactController extends Controller
{
    /**
     * Validate file using magic bytes (file signature)
     */
    private function validateFileMagicBytes($file): bool
    {
        $handle = fopen($file->getRealPath(), 'rb');
        $bytes = fread($handle, 8);
        fclose($handle);

        // Magic bytes for allowed file types
        $magicBytes = [
            'pdf' => ['25504446'], // %PDF
            'jpg' => ['FFD8FF'], // JPEG
            'jpeg' => ['FFD8FF'], // JPEG
            'png' => ['89504E47'], // PNG
        ];

        $fileHex = strtoupper(bin2hex($bytes));
        $extension = strtolower($file->getClientOriginalExtension());

        if (!isset($magicBytes[$extension])) {
            return false;
        }

        foreach ($magicBytes[$extension] as $magic) {
            if (str_starts_with($fileHex, $magic)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Sanitize filename to prevent directory traversal and other attacks
     */
    private function sanitizeFilename(string $filename): string
    {
        // Remove path separators
        $filename = str_replace(['/', '\\', '..'], '', $filename);

        // Remove special characters except dots, dashes, and underscores
        $filename = preg_replace('/[^a-zA-Z0-9._\-]/', '_', $filename);

        // Limit length
        if (strlen($filename) > 100) {
            $extension = pathinfo($filename, PATHINFO_EXTENSION);
            $name = substr(pathinfo($filename, PATHINFO_FILENAME), 0, 95);
            $filename = $name . '.' . $extension;
        }

        return $filename;
    }

    /**
     * Handle contact form submission.
     */
    public function submit(Request $request, RecaptchaService $recaptcha)
    {
        // ✅ Rate limiting: 3 submissions per hour per IP
        $key = 'contact-submit:' . $request->ip();

        if (RateLimiter::tooManyAttempts($key, 3)) {
            $seconds = RateLimiter::availableIn($key);
            return back()->withErrors([
                'email' => "Demasiados intentos. Por favor intenta de nuevo en {$seconds} segundos."
            ]);
        }

        // ✅ Validate with strict rules
        // Usar email:rfc en desarrollo, email:rfc,dns en producción
        $emailValidation = app()->environment('production')
            ? 'required|email:rfc,dns|max:255|regex:/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/'
            : 'required|email:rfc|max:255|regex:/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/';

        // reCAPTCHA es obligatorio en producción, opcional en desarrollo
        $recaptchaValidation = app()->environment('production') ? 'required|string' : 'nullable|string';

        $validated = $request->validate([
            'name' => 'required|string|max:255|regex:/^[a-zA-Z\s\-\.áéíóúñÁÉÍÓÚÑ]+$/',
            'email' => $emailValidation,
            'phone' => [
                function ($attribute, $value, $fail) use ($request) {
                    $preferredContact = $request->input('preferred_contact');
                    // Si eligió Teléfono o WhatsApp, el teléfono es obligatorio
                    if (in_array($preferredContact, ['Teléfono', 'WhatsApp']) && empty($value)) {
                        $fail("El teléfono es obligatorio si eliges contacto por {$preferredContact}.");
                    }
                    // Validar formato si está presente
                    if (!empty($value) && !preg_match('/^[\d\s\+\-\(\)]+$/', $value)) {
                        $fail('El formato del teléfono no es válido.');
                    }
                },
                'max:20',
            ],
            'preferred_contact' => 'nullable|string|in:Email,Teléfono,WhatsApp',
            'contact_time' => 'nullable|string|max:50',
            'service' => 'nullable|string|max:255|regex:/^[^<>]*$/',
            'message' => 'required|string|min:10|max:2000|regex:/^[^<>]*$/',
            'attachments' => 'nullable|array|max:5', // Máximo 5 archivos
            'attachments.*' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:5120', // Max 5MB per file
            'privacy_accepted' => 'required|accepted',
            'recaptcha_token' => $recaptchaValidation, // Obligatorio en producción, opcional en desarrollo
        ], [
            'name.required' => 'El nombre es obligatorio.',
            'name.regex' => 'El nombre solo puede contener letras.',
            'email.required' => 'El email es obligatorio.',
            'email.email' => 'El email debe ser válido.',
            'email.dns' => 'El dominio del email no es válido.',
            'phone.max' => 'El teléfono no debe superar los 20 caracteres.',
            'message.required' => 'El mensaje es obligatorio.',
            'message.min' => 'El mensaje debe tener al menos 10 caracteres.',
            'attachments.max' => 'Máximo 5 archivos permitidos.',
            'attachments.*.mimes' => 'Solo se permiten archivos PDF, JPG, JPEG o PNG.',
            'attachments.*.max' => 'Cada archivo no debe superar los 5MB.',
            'privacy_accepted.accepted' => 'Debes aceptar la política de privacidad.',
            'recaptcha_token.required' => 'Error de verificación de seguridad. Por favor, recarga la página.',
        ]);

        // ✅ reCAPTCHA verification (MANDATORY in production, optional in development)
        $recaptchaToken = $validated['recaptcha_token'] ?? null;

        if (!$recaptcha->isEnabled()) {
            if (app()->environment('production')) {
                Log::error('reCAPTCHA is not enabled but form was submitted in production');
                return back()->withErrors([
                    'email' => 'Error de configuración del sistema. Por favor, contáctanos por teléfono.'
                ]);
            } else {
                Log::warning('reCAPTCHA is not enabled - skipping verification in development');
            }
        } elseif (!empty($recaptchaToken)) {
            // Solo verificar reCAPTCHA si hay un token
            $recaptchaResult = $recaptcha->verify($recaptchaToken, 'contact_form', 0.5);

            if (!$recaptchaResult['success']) {
                // En desarrollo, solo loguear el error pero permitir el envío
                if (app()->environment('production')) {
                    Log::warning('reCAPTCHA verification failed for contact form', [
                        'ip' => $request->ip(),
                        'score' => $recaptchaResult['score'] ?? 0,
                        'error' => $recaptchaResult['error'] ?? 'unknown',
                    ]);

                    return back()->withErrors([
                        'email' => 'No pudimos verificar que eres humano. Por favor intenta de nuevo o contáctanos por teléfono.'
                    ]);
                } else {
                    Log::warning('reCAPTCHA verification failed in development - allowing submission', [
                        'ip' => $request->ip(),
                        'score' => $recaptchaResult['score'] ?? 0,
                        'error' => $recaptchaResult['error'] ?? 'unknown',
                    ]);
                }
            } else {
                // ✅ Log suspicious activity (low score)
                if (isset($recaptchaResult['score']) && $recaptchaResult['score'] < 0.3) {
                    Log::warning('Suspicious contact form submission - low reCAPTCHA score', [
                        'ip' => $request->ip(),
                        'score' => $recaptchaResult['score'],
                        'email' => $validated['email'],
                    ]);
                }

                Log::info('reCAPTCHA verification successful', [
                    'score' => $recaptchaResult['score'],
                    'ip' => $request->ip(),
                ]);
            }
        } else {
            // Token vacío en desarrollo - permitir
            if (app()->environment('production')) {
                Log::error('Empty reCAPTCHA token in production');
                return back()->withErrors([
                    'email' => 'Error de verificación de seguridad. Por favor, recarga la página.'
                ]);
            } else {
                Log::warning('Empty reCAPTCHA token in development - allowing submission');
            }
        }

        try {
            // ✅ Handle file uploads with ENHANCED security validation
            $attachmentPaths = [];
            if ($request->hasFile('attachments')) {
                $fileCount = 0;

                foreach ($request->file('attachments') as $file) {
                    $fileCount++;

                    // Límite de archivos
                    if ($fileCount > 5) {
                        Log::warning('Too many files uploaded', [
                            'ip' => $request->ip(),
                            'count' => $fileCount,
                        ]);
                        return back()->withErrors([
                            'attachments' => 'Máximo 5 archivos permitidos.'
                        ]);
                    }

                    // Validar extensión
                    $allowedExtensions = ['pdf', 'jpg', 'jpeg', 'png'];
                    $extension = strtolower($file->getClientOriginalExtension());

                    if (!in_array($extension, $allowedExtensions)) {
                        Log::warning('Invalid file extension', [
                            'extension' => $extension,
                            'filename' => $file->getClientOriginalName(),
                            'ip' => $request->ip(),
                        ]);
                        return back()->withErrors([
                            'attachments' => "Extensión no permitida: {$extension}. Solo PDF, JPG, JPEG, PNG."
                        ]);
                    }

                    // Validar MIME type
                    $mimeType = $file->getMimeType();
                    $allowedMimes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];

                    if (!in_array($mimeType, $allowedMimes)) {
                        Log::warning('Invalid MIME type', [
                            'mime' => $mimeType,
                            'filename' => $file->getClientOriginalName(),
                            'ip' => $request->ip(),
                        ]);
                        return back()->withErrors([
                            'attachments' => 'Tipo de archivo no permitido. Solo PDF, JPG, JPEG o PNG.'
                        ]);
                    }

                    // ✅ CRITICAL: Validate file using magic bytes (file signature)
                    if (!$this->validateFileMagicBytes($file)) {
                        Log::warning('File failed magic bytes validation', [
                            'filename' => $file->getClientOriginalName(),
                            'mime' => $mimeType,
                            'extension' => $extension,
                            'ip' => $request->ip(),
                        ]);
                        return back()->withErrors([
                            'attachments' => 'El archivo no es válido o está corrupto. Por favor, verifica el archivo.'
                        ]);
                    }

                    // Validar tamaño mínimo (evitar archivos vacíos o sospechosos)
                    if ($file->getSize() < 100) {
                        Log::warning('File too small', [
                            'size' => $file->getSize(),
                            'filename' => $file->getClientOriginalName(),
                            'ip' => $request->ip(),
                        ]);
                        return back()->withErrors([
                            'attachments' => 'El archivo es demasiado pequeño o está vacío.'
                        ]);
                    }

                    // Sanitizar nombre de archivo
                    $originalName = $this->sanitizeFilename($file->getClientOriginalName());

                    // Generar nombre único para evitar colisiones
                    $uniqueName = Str::uuid() . '_' . time() . '.' . $extension;

                    // Store file securely en disco privado
                    $path = $file->storeAs('contact-attachments', $uniqueName, 'private');

                    $attachmentPaths[] = [
                        'path' => $path,
                        'original_name' => $originalName,
                        'mime_type' => $mimeType,
                        'size' => $file->getSize(),
                        'extension' => $extension,
                        'uploaded_at' => now()->toIso8601String(),
                    ];

                    Log::info('File uploaded successfully', [
                        'original_name' => $originalName,
                        'stored_name' => $uniqueName,
                        'size' => $file->getSize(),
                        'mime' => $mimeType,
                    ]);
                }
            }

            // ✅ Create contact request in database
            $contactRequest = ContactRequest::create([
                'name' => strip_tags($validated['name']),
                'email' => strip_tags($validated['email']),
                'phone' => isset($validated['phone']) ? strip_tags($validated['phone']) : null,
                'preferred_contact' => $validated['preferred_contact'] ?? null,
                'contact_time' => $validated['contact_time'] ?? null,
                'service' => isset($validated['service']) ? strip_tags($validated['service']) : null,
                'message' => strip_tags($validated['message']),
                'attachments' => !empty($attachmentPaths) ? $attachmentPaths : null,
                'status' => 'new',
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ]);

            // ✅ Hit rate limiter
            RateLimiter::hit($key, 3600);

            // ✅ Log creation with detailed info
            Log::info('New contact form submission', [
                'id' => $contactRequest->id,
                'name' => $contactRequest->name,
                'email' => $contactRequest->email,
                'phone' => $contactRequest->phone,
                'preferred_contact' => $contactRequest->preferred_contact,
                'service' => $contactRequest->service,
                'has_attachments' => !empty($attachmentPaths),
                'attachment_count' => count($attachmentPaths),
                'ip' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ]);

            // TODO: Send email notification to admin
            // TODO: Send confirmation email to user

            return back()->with('success', '¡Gracias por tu mensaje! Te contactaremos en las próximas 24 horas.');

        } catch (\Illuminate\Validation\ValidationException $e) {
            // Re-throw validation exceptions
            throw $e;
        } catch (\Exception $e) {
            Log::error('Error processing contact form', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'ip' => $request->ip(),
                'data' => [
                    'name' => $validated['name'] ?? null,
                    'email' => $validated['email'] ?? null,
                    'has_files' => $request->hasFile('attachments'),
                ],
            ]);

            return back()->withErrors([
                'email' => 'Ocurrió un error al enviar tu mensaje. Por favor intenta de nuevo o contáctanos por teléfono.'
            ])->withInput();
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


