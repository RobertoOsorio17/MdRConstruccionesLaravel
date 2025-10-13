<?php

namespace App\Http\Requests\ML;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;

/**
 * Validates and sanitizes recommendation request parameters.
 * Ensures data integrity and prevents malicious inputs.
 */
class GetRecommendationsRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // Public endpoint
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'session_id' => [
                'nullable',
                'string',
                'max:255',
                'regex:/^[a-zA-Z0-9_-]+$/' // Alphanumeric, underscore, hyphen only
            ],
            'current_post_id' => [
                'nullable',
                'integer',
                'min:1',
                'exists:posts,id'
            ],
            'limit' => [
                'nullable',
                'integer',
                'min:1',
                'max:50' // Prevent excessive requests
            ],
            'context' => [
                'nullable',
                'array',
                'max:10' // Limit context items
            ],
            'context.*' => [
                'string',
                'max:255'
            ],
            'exclude_post_ids' => [
                'nullable',
                'array',
                'max:100' // Limit exclusions
            ],
            'exclude_post_ids.*' => [
                'integer',
                'min:1'
            ],
            'categories' => [
                'nullable',
                'array',
                'max:20'
            ],
            'categories.*' => [
                'integer',
                'exists:categories,id'
            ],
            'tags' => [
                'nullable',
                'array',
                'max:20'
            ],
            'tags.*' => [
                'integer',
                'exists:tags,id'
            ],
            'algorithm' => [
                'nullable',
                'string',
                'in:hybrid,content_based,collaborative,personalized,trending'
            ],
            'diversity_boost' => [
                'nullable',
                'numeric',
                'min:0',
                'max:1'
            ],
            'include_explanation' => [
                'nullable',
                'boolean'
            ]
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'session_id.regex' => 'Session ID contains invalid characters.',
            'current_post_id.exists' => 'The specified post does not exist.',
            'limit.max' => 'Maximum limit is 50 recommendations.',
            'exclude_post_ids.max' => 'Maximum 100 posts can be excluded.',
            'categories.max' => 'Maximum 20 categories can be specified.',
            'tags.max' => 'Maximum 20 tags can be specified.',
            'algorithm.in' => 'Invalid algorithm specified.'
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        // Sanitize session_id
        if ($this->has('session_id')) {
            $this->merge([
                'session_id' => $this->sanitizeSessionId($this->session_id)
            ]);
        }

        // Set defaults
        $this->merge([
            'limit' => $this->limit ?? 10,
            'diversity_boost' => $this->diversity_boost ?? 0.3,
            'include_explanation' => $this->include_explanation ?? false
        ]);
    }

    /**
     * Sanitize session ID to prevent injection attacks.
     */
    private function sanitizeSessionId(?string $sessionId): ?string
    {
        if (!$sessionId) {
            return null;
        }

        // Remove any non-alphanumeric characters except underscore and hyphen
        return preg_replace('/[^a-zA-Z0-9_-]/', '', $sessionId);
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

    /**
     * Get validated and sanitized data.
     */
    public function validated($key = null, $default = null): array
    {
        $validated = parent::validated();

        // Additional sanitization
        if (isset($validated['context'])) {
            $validated['context'] = array_map('strip_tags', $validated['context']);
        }

        return $validated;
    }
}

