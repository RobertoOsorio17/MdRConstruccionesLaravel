<?php

namespace App\Http\Controllers;

use App\Models\ContactRequest;
use App\Models\ContactRequestAttachment;
use App\Services\RecaptchaService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Inertia\Inertia;
use App\Models\Setting;

/**
 * Handles inbound contact interactions from the public site, including validation, throttling, and follow-up orchestration.
 * Bridges the front-end form with persistence, mail delivery, and spam mitigation services to ensure reliable communication.
 */
class ContactController extends Controller
{
    /**
     * Validate file using magic bytes (file signature).
     *
     * @param mixed $file The uploaded file instance.
     * @return bool True when the file header matches allowed signatures.
     */
    private function validateFileMagicBytes($file): bool
    {
        $handle = fopen($file->getRealPath(), 'rb');
        $bytes = fread($handle, 8);
        fclose($handle);

        // Magic bytes for allowed file types (only modern formats).
        $magicBytes = [
            'pdf' => ['25504446'], // %PDF
            'jpg' => ['FFD8FF'], // JPEG
            'jpeg' => ['FFD8FF'], // JPEG
            'png' => ['89504E47'], // PNG
            'docx' => ['504B0304'], // ZIP-based (Office 2007+)
            'xlsx' => ['504B0304'], // ZIP-based (Office 2007+)
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
     * Sanitize filename to prevent directory traversal and other attacks.
     *
     * @param string $filename The original client filename.
     * @return string A sanitized, length-limited filename.
     */
    private function sanitizeFilename(string $filename): string
    {
        // Remove path separators.
        $filename = str_replace(['/', '\\', '..'], '', $filename);

        // Remove special characters except dots, dashes, and underscores.
        $filename = preg_replace('/[^a-zA-Z0-9._\-]/', '_', $filename);

        // Limit length.
        if (strlen($filename) > 100) {
            $extension = pathinfo($filename, PATHINFO_EXTENSION);
            $name = substr(pathinfo($filename, PATHINFO_FILENAME), 0, 95);
            $filename = $name . '.' . $extension;
        }

        return $filename;
    }

    /**
     * Handle contact form submission.
     *
     * Applies rate limiting, strict validation, reCAPTCHA verification, secure
     * attachment processing, and sends email notifications.
     *
     * @param Request $request The inbound HTTP request.
     * @param RecaptchaService $recaptcha reCAPTCHA verification service.
     * @return \Illuminate\Http\RedirectResponse Redirects back with status or errors.
     */
    public function submit(Request $request, RecaptchaService $recaptcha)
    {
        // 1) Throttle: 3 submissions/hour/IP to curb abuse.
        $key = 'contact-submit:' . $request->ip();

        if (RateLimiter::tooManyAttempts($key, 3)) {
            $seconds = RateLimiter::availableIn($key);
            return back()->withErrors([
                'email' => "Demasiados intentos. Por favor intenta de nuevo en {$seconds} segundos."
            ]);
        }

        // 2) Validate with strict rules. Use email:rfc in dev, email:rfc,dns in prod.
        $emailValidation = app()->environment('production')
            ? 'required|email:rfc,dns|max:255|regex:/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/'
            : 'required|email:rfc|max:255|regex:/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/';

        // 3) reCAPTCHA is mandatory in all environments.
        $recaptchaValidation = 'required|string';

        $validated = $request->validate([
            'name' => 'required|string|max:255|regex:/^[a-zA-Z\s\-\.áéíóúñÁÉÍÓÚÑ]+$/',
            'email' => $emailValidation,
            'phone' => [
                function ($attribute, $value, $fail) use ($request) {
                    $preferredContact = $request->input('preferred_contact');
                    // If user chose Phone or WhatsApp, phone number is required.
                    if (in_array($preferredContact, ['Teléfono', 'WhatsApp']) && empty($value)) {
                        $fail("El teléfono es obligatorio si eliges contacto por {$preferredContact}.");
                    }
                    // Validate format when provided.
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
            'attachments' => 'nullable|array|max:5', // Maximum of 5 files.
            // Improved: Only modern Office formats (docx/xlsx) - removed old .doc/.xls for security.
            'attachments.*' => 'nullable|file|mimetypes:application/pdf,image/jpeg,image/png,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet|max:10240', // Max 10MB per file
            'privacy_accepted' => 'required|accepted',
            'recaptcha_token' => $recaptchaValidation, // Required in all environments.
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
            'attachments.*.mimetypes' => 'Solo se permiten archivos PDF, imágenes JPG/PNG, Word (.docx) y Excel (.xlsx) modernos.',
            'attachments.*.max' => 'Cada archivo no debe superar los 10MB.',
            'privacy_accepted.accepted' => 'Debes aceptar la política de privacidad.',
            'recaptcha_token.required' => 'Error de verificación de seguridad. Por favor, recarga la página.',
        ]);

        // 4) Validate total size of all attachments (max 25MB total).
        if ($request->hasFile('attachments')) {
            $totalSize = 0;
            foreach ($request->file('attachments') as $file) {
                $totalSize += $file->getSize();
            }

            $maxTotalSize = 25 * 1024 * 1024; // 25MB in bytes
            if ($totalSize > $maxTotalSize) {
                return back()->withErrors([
                    'attachments' => 'El tamaño total de todos los archivos no puede superar los 25MB.'
                ])->withInput();
            }
        }

        // 5) Verify reCAPTCHA (skip only when service disabled and environment allows).
        $recaptchaToken = $validated['recaptcha_token'];

        if (!$recaptcha->isEnabled()) {
            if (app()->environment('production')) {
                Log::error('reCAPTCHA is not enabled in production', [
                    'ip' => $request->ip(),
                ]);
                return back()->withErrors([
                    'email' => 'Error de configuración del sistema. Por favor, contáctanos por teléfono.'
                ]);
            }
            // Allow bypass in non-production environments.
            Log::info('reCAPTCHA bypassed in non-production environment', [
                'environment' => app()->environment(),
            ]);
        }

        // 6) Verify reCAPTCHA token (always).
        $recaptchaResult = $recaptcha->verify($recaptchaToken, 'contact_form');

        if (!($recaptchaResult['success'] ?? false)) {
            Log::warning('reCAPTCHA verification failed', [
                'ip' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'errors' => $recaptchaResult['error-codes'] ?? [],
                'score' => $recaptchaResult['score'] ?? 0,
            ]);
            return back()->withErrors([
                'email' => 'Verificación de seguridad fallida. Por favor, intenta de nuevo.'
            ]);
        }



        try {
            // 7) Create the contact request in database first.
            $contactRequest = ContactRequest::create([
                'name' => strip_tags($validated['name']),
                'email' => strip_tags($validated['email']),
                'phone' => isset($validated['phone']) ? strip_tags($validated['phone']) : null,
                'preferred_contact' => $validated['preferred_contact'] ?? null,
                'contact_time' => $validated['contact_time'] ?? null,
                'service' => isset($validated['service']) ? strip_tags($validated['service']) : null,
                'message' => strip_tags($validated['message']),
                'status' => 'new',
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ]);

            // 8) Handle file uploads with encrypted storage (validate, encrypt, persist, log).
            $attachmentCount = 0;
            $totalSize = 0;

            if ($request->hasFile('attachments')) {
                foreach ($request->file('attachments') as $file) {
                    $attachmentCount++;

                    // Enforce maximum file count.
                    if ($attachmentCount > 5) {
                        Log::warning('Too many files uploaded', [
                            'ip' => $request->ip(),
                            'count' => $attachmentCount,
                        ]);
                        return back()->withErrors([
                            'attachments' => 'Máximo 5 archivos permitidos.'
                        ]);
                    }

                    // Validate extension (removed old .doc/.xls formats for security).
                    $allowedExtensions = ['pdf', 'jpg', 'jpeg', 'png', 'docx', 'xlsx'];
                    $extension = strtolower($file->getClientOriginalExtension());

                    if (!in_array($extension, $allowedExtensions)) {
                        Log::warning('Invalid file extension', [
                            'extension' => $extension,
                            'filename' => $file->getClientOriginalName(),
                            'ip' => $request->ip(),
                        ]);
                        return back()->withErrors([
                            'attachments' => "Extensión no permitida: {$extension}. Solo PDF, imágenes, Word (.docx) y Excel (.xlsx)."
                        ]);
                    }

                    // Validate MIME type (only modern formats).
                    $mimeType = $file->getMimeType();
                    $allowedMimes = [
                        'application/pdf',
                        'image/jpeg',
                        'image/jpg',
                        'image/png',
                        'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx only
                        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx only
                    ];

                    if (!in_array($mimeType, $allowedMimes)) {
                        Log::warning('Invalid MIME type', [
                            'mime' => $mimeType,
                            'filename' => $file->getClientOriginalName(),
                            'ip' => $request->ip(),
                        ]);
                        return back()->withErrors([
                            'attachments' => 'Tipo de archivo no permitido.'
                        ]);
                    }

                    // Critical: Validate file using magic bytes (file signature).
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

                    // Validate minimum size (avoid empty or suspicious files).
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

                    // Validate maximum file size per file (10MB).
                    if ($file->getSize() > 10485760) {
                        return back()->withErrors([
                            'attachments' => 'Cada archivo no debe superar los 10MB.'
                        ]);
                    }

                    // Validate total size (25MB).
                    $totalSize += $file->getSize();
                    if ($totalSize > 26214400) {
                        return back()->withErrors([
                            'attachments' => 'El tamaño total de archivos no debe superar los 25MB.'
                        ]);
                    }

                    // Store file with encryption.
                    try {
                        $attachment = ContactRequestAttachment::storeEncrypted($file, $contactRequest->id);

                        Log::info('File uploaded and encrypted successfully', [
                            'attachment_id' => $attachment->id,
                            'original_name' => $attachment->original_filename,
                            'size' => $attachment->file_size,
                            'mime' => $attachment->mime_type,
                        ]);
                    } catch (\Exception $e) {
                        Log::error('Failed to encrypt and store attachment', [
                            'error' => $e->getMessage(),
                            'filename' => $file->getClientOriginalName(),
                        ]);
                        return back()->withErrors([
                            'attachments' => 'Error al procesar el archivo. Por favor intenta de nuevo.'
                        ]);
                    }
                }
            }

            // 9) Hit rate limiter after successful persistence to enforce quota windows.
            RateLimiter::hit($key, 3600);

            // 10) Log creation for operational traceability.
            Log::info('New contact form submission', [
                'id' => $contactRequest->id,
                'name' => $contactRequest->name,
                'email' => $contactRequest->email,
                'phone' => $contactRequest->phone,
                'preferred_contact' => $contactRequest->preferred_contact,
                'service' => $contactRequest->service,
                'has_attachments' => $attachmentCount > 0,
                'attachment_count' => $attachmentCount,
                'total_size' => $totalSize,
                'ip' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ]);

            // 11) Send email notification to admin.
            $adminEmail = config('mail.admin_email', config('mail.from.address'));
            $adminNotifiable = new \App\Models\AnonymousNotifiable($adminEmail, 'Admin');
            $adminNotifiable->notify(new \App\Notifications\NewContactRequestNotification($contactRequest));

            // 12) Send confirmation email to user.
            $userNotifiable = new \App\Models\AnonymousNotifiable($contactRequest->email, $contactRequest->name);
            $userNotifiable->notify(new \App\Notifications\ContactRequestConfirmation($contactRequest));

            session()->flash('success', '¡Gracias por tu mensaje! Te contactaremos en las próximas 24 horas.');
            return redirect()->back();

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

            throw \Illuminate\Validation\ValidationException::withMessages([
                'email' => 'Ocurrió un error al enviar tu mensaje. Por favor intenta de nuevo o contáctanos por teléfono.'
            ]);
        }
    }

    /**
     * Handle budget request form submission.
     *
     * Applies strict validation and reCAPTCHA verification and stores the request for follow-up, then notifies admin and user.
     *
     * @param Request $request The current HTTP request instance.
     * @param RecaptchaService $recaptcha reCAPTCHA verification service.
     * @return \Illuminate\Http\RedirectResponse Redirect back with status.
     */
    public function budgetRequest(Request $request, RecaptchaService $recaptcha)
    {
        // reCAPTCHA validation to prevent spam.
        $recaptchaValidation = 'required|string';

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
            'recaptcha_token' => $recaptchaValidation, // reCAPTCHA required.
        ], [
            'name.required' => 'The name field is required.',
            'email.required' => 'The email field is required.',
            'phone.required' => 'The phone field is required.',
            'service.required' => 'You must select a service.',
            'property_type.required' => 'You must specify the property type.',
            'description.required' => 'The project description is required.',
            'privacy_accepted.accepted' => 'You must accept the privacy policy.',
            'recaptcha_token.required' => 'Security verification error. Please reload the page.',
        ]);

        // Verify reCAPTCHA token.
        $recaptchaToken = $validated['recaptcha_token'];

        if (!$recaptcha->isEnabled()) {
            Log::error('reCAPTCHA is not enabled but budget request form was submitted', [
                'environment' => app()->environment(),
                'ip' => $request->ip(),
            ]);
            return back()->with('error', 'Security verification is not configured. Please contact support.');
        }

        $recaptchaResult = $recaptcha->verify($recaptchaToken, 'budget_request');

        if (!($recaptchaResult['success'] ?? false)) {
            Log::warning('reCAPTCHA verification failed for budget request', [
                'ip' => $request->ip(),
                'errors' => $recaptchaResult['error-codes'] ?? [],
                'score' => $recaptchaResult['score'] ?? 0,
            ]);
            return back()->with('error', 'Security verification failed. Please try again.');
        }

        try {
            // Bugfix: Store the budget request in database instead of just logging.
            $contactRequest = ContactRequest::create([
                'name' => strip_tags($validated['name']),
                'email' => strip_tags($validated['email']),
                'phone' => strip_tags($validated['phone']),
                'service' => strip_tags($validated['service']),
                'message' => strip_tags($validated['description']),
                'type' => 'budget_request',
                'status' => 'new',
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'metadata' => json_encode([
                    'property_type' => $validated['property_type'],
                    'property_size' => $validated['property_size'] ?? null,
                    'budget_range' => $validated['budget_range'] ?? null,
                    'timeline' => $validated['timeline'] ?? null,
                ]),
            ]);

            // Log creation for tracking
            Log::info('New budget request submission', [
                'id' => $contactRequest->id,
                'name' => $contactRequest->name,
                'email' => $contactRequest->email,
                'service' => $contactRequest->service,
                'property_type' => $validated['property_type'],
                'ip' => $request->ip(),
            ]);

            // Send email notification to admin
            $adminEmail = config('mail.admin_email', config('mail.from.address'));
            $adminNotifiable = new \App\Models\AnonymousNotifiable($adminEmail, 'Admin');
            $adminNotifiable->notify(new \App\Notifications\NewContactRequestNotification($contactRequest));

            // Send confirmation email to user
            $userNotifiable = new \App\Models\AnonymousNotifiable($contactRequest->email, $contactRequest->name);
            $userNotifiable->notify(new \App\Notifications\ContactRequestConfirmation($contactRequest));

            session()->flash('success', 'Budget request received! Our team will contact you in the next few hours to schedule a free visit.');
            return redirect()->back();

        } catch (\Exception $e) {
            Log::error('Error processing budget request', [
                'error' => $e->getMessage(),
                'data' => $validated,
            ]);

            return back()->with('error', 'An error occurred while sending your request. Please try again or call us directly.');
        }
    }
}


