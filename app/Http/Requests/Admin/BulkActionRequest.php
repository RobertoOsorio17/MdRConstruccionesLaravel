<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Bulk Action Request
 * 
 * Validates data for performing bulk actions on multiple users through the admin panel.
 * Supports delete, activate, deactivate, and assign_role actions.
 * 
 * @package App\Http\Requests\Admin
 */
class BulkActionRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     * 
     * Only administrators with the 'admin' role can perform bulk actions.
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
     * Validates the action type, user IDs array, and role ID for assign_role action.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string> Validation rules.
     */
    public function rules(): array
    {
        return [
            'action' => [
                'required',
                'string',
                Rule::in(['delete', 'activate', 'deactivate', 'assign_role'])
            ],
            'user_ids' => ['required', 'array', 'min:1'],
            'user_ids.*' => ['integer', 'exists:users,id'],
            'role_id' => ['required_if:action,assign_role', 'nullable', 'integer', 'exists:roles,id'],
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
            'action' => 'bulk action',
            'user_ids' => 'selected users',
            'role_id' => 'role',
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
            'action.required' => 'You must select an action to perform.',
            'action.in' => 'The selected action is invalid.',
            'user_ids.required' => 'You must select at least one user.',
            'user_ids.min' => 'You must select at least one user.',
            'user_ids.*.exists' => 'One or more selected users are invalid.',
            'role_id.required_if' => 'You must select a role when using the assign_role action.',
            'role_id.exists' => 'The selected role is invalid.',
        ];
    }
}

