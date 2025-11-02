<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;

/**
 * Store User Request
 * 
 * Validates data for creating a new user account through the admin panel.
 * Enforces strong password requirements, unique email validation, and role assignment rules.
 * 
 * @package App\Http\Requests\Admin
 */
class StoreUserRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     * 
     * Only administrators with the 'admin' role can create new users.
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
     * Validates all required fields for user creation including name, email, password,
     * optional profile fields, and role assignments.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string> Validation rules.
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'password' => [
                'required',
                'string',
                'confirmed',
                Password::min(8)
                    ->mixedCase()
                    ->numbers()
                    ->symbols()
                    ->uncompromised()
            ],
            'bio' => ['nullable', 'string', 'max:1000'],
            'website' => ['nullable', 'url', 'max:255'],
            'location' => ['nullable', 'string', 'max:255'],
            'role' => ['nullable', 'string', 'exists:roles,name'],
            'roles' => ['nullable', 'array'],
            'roles.*' => ['integer', 'exists:roles,id'],
            'send_welcome_email' => ['nullable', 'boolean'],
        ];
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
            'name' => 'name',
            'email' => 'email address',
            'password' => 'password',
            'bio' => 'biography',
            'website' => 'website URL',
            'location' => 'location',
            'role' => 'primary role',
            'roles' => 'additional roles',
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
            'email.unique' => 'This email address is already registered.',
            'password.confirmed' => 'The password confirmation does not match.',
            'roles.*.exists' => 'One or more selected roles are invalid.',
        ];
    }
}

