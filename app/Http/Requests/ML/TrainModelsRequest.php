<?php

namespace App\Http\Requests\ML;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;

/**
 * Validates ML model training requests.
 * Restricted to admin users only.
 */
class TrainModelsRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user() && $this->user()->is_admin;
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'mode' => [
                'nullable',
                'string',
                'in:full,posts_only,profiles_only,incremental'
            ],
            'clear_cache' => [
                'nullable',
                'boolean'
            ],
            'force' => [
                'nullable',
                'boolean'
            ],
            'batch_size' => [
                'nullable',
                'integer',
                'min:10',
                'max:1000'
            ],
            'async' => [
                'nullable',
                'boolean'
            ],
            'notify_on_completion' => [
                'nullable',
                'boolean'
            ],
            'notification_email' => [
                'nullable',
                'email',
                'required_if:notify_on_completion,true'
            ]
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'mode.in' => 'Invalid training mode. Must be: full, posts_only, profiles_only, or incremental.',
            'batch_size.min' => 'Batch size must be at least 10.',
            'batch_size.max' => 'Batch size cannot exceed 1000.',
            'notification_email.required_if' => 'Email is required when notifications are enabled.',
            'notification_email.email' => 'Invalid email address.'
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        $this->merge([
            'mode' => $this->mode ?? 'full',
            'clear_cache' => $this->clear_cache ?? true,
            'force' => $this->force ?? false,
            'batch_size' => $this->batch_size ?? 100,
            'async' => $this->async ?? true,
            'notify_on_completion' => $this->notify_on_completion ?? false
        ]);
    }

    /**
     * Handle a failed authorization attempt.
     */
    protected function failedAuthorization(): void
    {
        throw new HttpResponseException(
            response()->json([
                'success' => false,
                'message' => 'Unauthorized. Admin access required.',
                'error_code' => 'UNAUTHORIZED'
            ], 403)
        );
    }

    /**
     * Handle a failed validation attempt.
     */
    protected function failedValidation(Validator $validator): void
    {
        throw new HttpResponseException(
            response()->json([
                'success' => false,
                'message' => 'Validation failed.',
                'errors' => $validator->errors(),
                'error_code' => 'VALIDATION_ERROR'
            ], 422)
        );
    }
}

