<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;
use Illuminate\Validation\Rule;

/**
 * Update User Request
 * 
 * Validates data for updating an existing user account through the admin panel.
 * Enforces unique email validation (excluding current user), optional password updates,
 * and role assignment rules.
 * 
 * @package App\Http\Requests\Admin
 */
class UpdateUserRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     * 
     * Only administrators with the 'admin' role can update users.
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
     * Validates all fields for user updates including name, email (unique except current user),
     * optional password change, profile fields, and role assignments.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string> Validation rules.
     */
    public function rules(): array
    {
        $userId = $this->route('user')->id ?? $this->route('user');

        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => [
                'required',
                'string',
                'email',
                'max:255',
                Rule::unique('users', 'email')->ignore($userId)
            ],
            'password' => [
                'nullable',
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
            'email_verified' => ['nullable', 'boolean'],
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
            'email_verified' => 'email verification status',
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
            'email.unique' => 'This email address is already registered to another user.',
            'password.confirmed' => 'The password confirmation does not match.',
            'roles.*.exists' => 'One or more selected roles are invalid.',
        ];
    }
}

