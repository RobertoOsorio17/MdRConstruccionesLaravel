<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Ban User Request
 * 
 * Validates data for banning or modifying a user ban through the admin panel.
 * Enforces ban reason requirements, duration validation, and custom expiration date rules.
 * 
 * @package App\Http\Requests\Admin
 */
class BanUserRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     * 
     * Only administrators with the 'admin' role can ban users.
     *
     * @return bool True if the user is authorized.
     */
    public function authorize(): bool
    {
        return $this->user() && $this->user()->hasRole('admin');
    }

    /**
     * Get the validation rules that apply to the request.
     * 
     * Validates ban reason, duration, custom expiration date, IP ban flag, and admin notes.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string> Validation rules.
     */
    public function rules(): array
    {
        $rules = [
            'reason' => ['required', 'string', 'max:500'],
            'duration' => [
                'required',
                'string',
                Rule::in([
                    '1_hour',
                    '1_day',
                    '1_week',
                    '1_month',
                    '3_months',
                    '6_months',
                    '1_year',
                    'permanent',
                    'custom'
                ])
            ],
            'custom_expires_at' => [
                'required_if:duration,custom',
                'nullable',
                'date',
                'after:now'
            ],
            'expires_at' => [
                'nullable',
                'date',
                'after:now'
            ],
            'ip_ban' => ['nullable', 'boolean'],
            'is_irrevocable' => ['nullable', 'boolean'],
            'admin_notes' => ['nullable', 'string', 'max:1000'],
        ];

        // ✅ VALIDATION: If ban is irrevocable, duration must be permanent and admin_notes required
        if ($this->input('is_irrevocable')) {
            $rules['duration'][] = Rule::in(['permanent']);
            $rules['admin_notes'] = ['required', 'string', 'min:20', 'max:1000'];
        }

        return $rules;
    }

    /**
     * Get custom attribute names for validator errors.
     * 
     * Provides user-friendly field names for validation error messages.
     *
     * @return array<string, string> Custom attribute names.
     */
    public function attributes(): array
    {
        return [
            'reason' => 'ban reason',
            'duration' => 'ban duration',
            'custom_expires_at' => 'custom expiration date',
            'expires_at' => 'expiration date',
            'ip_ban' => 'IP ban',
            'is_irrevocable' => 'irrevocable ban',
            'admin_notes' => 'administrator notes',
        ];
    }

    /**
     * Get custom validation messages.
     * 
     * Provides specific error messages for common validation failures.
     *
     * @return array<string, string> Custom validation messages.
     */
    public function messages(): array
    {
        return [
            'reason.required' => 'You must provide a reason for the ban.',
            'duration.required' => 'You must select a ban duration.',
            'duration.in' => $this->input('is_irrevocable')
                ? 'Irrevocable bans must be permanent.'
                : 'The selected ban duration is invalid.',
            'custom_expires_at.required_if' => 'You must specify an expiration date for custom duration bans.',
            'custom_expires_at.after' => 'The expiration date must be in the future.',
            'expires_at.after' => 'The expiration date must be in the future.',
            'admin_notes.required' => 'Administrator notes are required for irrevocable bans.',
            'admin_notes.min' => 'Administrator notes must be at least 20 characters for irrevocable bans.',
        ];
    }

    /**
     * Prepare the data for validation.
     * 
     * Normalizes the expires_at field to handle both custom_expires_at and expires_at inputs.
     *
     * @return void
     */
    protected function prepareForValidation(): void
    {
        // Normalize expires_at field
        if ($this->has('custom_expires_at') && !$this->has('expires_at')) {
            $this->merge([
                'expires_at' => $this->input('custom_expires_at')
            ]);
        }
    }
}

