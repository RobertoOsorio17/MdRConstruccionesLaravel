<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

/**
 * SubmitBanAppealRequest
 *
 * Validates user input when submitting a ban appeal.
 * Ensures data integrity and security for the appeal submission process.
 */
class SubmitBanAppealRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * ✅ SECURITY: Authorization is handled by signed URL validation in middleware
     * and controller-level checks. This request is used with signed URLs, not auth.
     */
    public function authorize(): bool
    {
        // ✅ Authorization is handled by:
        // 1. Signed URL middleware (validates signature)
        // 2. Controller checks (user exists, ban belongs to user, can appeal)
        // We don't use auth()->check() here because banned users can't authenticate
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
            'reason' => [
                'required',
                'string',
                'min:50',
                'max:2000',
            ],
            'evidence' => [
                'nullable',
                'file',
                'image',
                'mimes:jpeg,jpg,png,gif,webp',
                'max:5120', // 5MB max
            ],
            'terms_accepted' => [
                'required',
                'accepted',
            ],
        ];
    }

    /**
     * Get custom validation messages.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'reason.required' => 'Debes proporcionar una explicación para tu apelación.',
            'reason.min' => 'La explicación debe tener al menos 50 caracteres. Sé específico sobre por qué crees que el baneo fue injusto.',
            'reason.max' => 'La explicación no puede exceder 2000 caracteres.',
            'evidence.file' => 'La evidencia debe ser un archivo válido.',
            'evidence.image' => 'La evidencia debe ser una imagen.',
            'evidence.mimes' => 'La evidencia debe ser un archivo de tipo: jpeg, jpg, png, gif, webp.',
            'evidence.max' => 'La evidencia no puede ser mayor a 5MB.',
            'terms_accepted.required' => 'Debes aceptar que has leído las reglas de la comunidad.',
            'terms_accepted.accepted' => 'Debes confirmar que has leído las reglas de la comunidad.',
        ];
    }

    /**
     * Get custom attribute names for validation errors.
     *
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'reason' => 'explicación',
            'evidence' => 'evidencia',
            'terms_accepted' => 'aceptación de términos',
        ];
    }

    /**
     * Prepare the data for validation.
     *
     * Sanitize input to prevent XSS attacks.
     */
    protected function prepareForValidation(): void
    {
        if ($this->has('reason')) {
            $this->merge([
                'reason' => strip_tags($this->reason),
            ]);
        }
    }
}
