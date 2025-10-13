<?php

namespace App\Http\Requests\ML;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;

/**
 * Validates interaction logging requests with comprehensive security checks.
 * Prevents spam, injection attacks, and data corruption.
 */
class LogInteractionRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // Public endpoint with rate limiting
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
                'regex:/^[a-zA-Z0-9_-]+$/'
            ],
            'post_id' => [
                'required',
                'integer',
                'min:1',
                'exists:posts,id'
            ],
            'interaction_type' => [
                'required',
                'string',
                'in:view,click,like,share,comment,bookmark,recommendation_click'
            ],
            'time_spent_seconds' => [
                'nullable',
                'integer',
                'min:0',
                'max:86400' // Max 24 hours
            ],
            'scroll_percentage' => [
                'nullable',
                'numeric',
                'min:0',
                'max:100'
            ],
            'completed_reading' => [
                'nullable',
                'boolean'
            ],
            'recommendation_source' => [
                'nullable',
                'string',
                'max:100',
                'in:content_based,collaborative,personalized,trending,hybrid,enhanced_personalized,temporal_trending,realtime_trending,enhanced_content_based'
            ],
            'recommendation_position' => [
                'nullable',
                'integer',
                'min:1',
                'max:100'
            ],
            'recommendation_score' => [
                'nullable',
                'numeric',
                'min:0',
                'max:1'
            ],
            'metadata' => [
                'nullable',
                'array',
                'max:50' // Limit metadata keys
            ],
            'metadata.*' => [
                'nullable'
            ],
            // Advanced tracking
            'viewport_width' => [
                'nullable',
                'integer',
                'min:320',
                'max:7680' // 8K resolution
            ],
            'viewport_height' => [
                'nullable',
                'integer',
                'min:240',
                'max:4320'
            ],
            'device_type' => [
                'nullable',
                'string',
                'in:desktop,tablet,mobile,unknown'
            ],
            'referrer' => [
                'nullable',
                'string',
                'max:500',
                'url'
            ],
            'user_agent' => [
                'nullable',
                'string',
                'max:500'
            ],
            // Engagement metrics
            'clicks_count' => [
                'nullable',
                'integer',
                'min:0',
                'max:1000'
            ],
            'copy_events' => [
                'nullable',
                'integer',
                'min:0',
                'max:100'
            ],
            'highlight_events' => [
                'nullable',
                'integer',
                'min:0',
                'max:100'
            ],
            'scroll_depth_max' => [
                'nullable',
                'numeric',
                'min:0',
                'max:100'
            ],
            'scroll_velocity' => [
                'nullable',
                'numeric',
                'min:0',
                'max:100'
            ],
            'reading_velocity' => [
                'nullable',
                'numeric',
                'min:0',
                'max:10'
            ],
            'pause_count' => [
                'nullable',
                'integer',
                'min:0',
                'max:1000'
            ],
            'avg_pause_duration' => [
                'nullable',
                'numeric',
                'min:0',
                'max:3600'
            ]
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'post_id.required' => 'Post ID is required.',
            'post_id.exists' => 'The specified post does not exist.',
            'interaction_type.required' => 'Interaction type is required.',
            'interaction_type.in' => 'Invalid interaction type.',
            'time_spent_seconds.max' => 'Time spent cannot exceed 24 hours.',
            'scroll_percentage.max' => 'Scroll percentage cannot exceed 100%.',
            'recommendation_source.in' => 'Invalid recommendation source.',
            'metadata.max' => 'Maximum 50 metadata keys allowed.',
            'referrer.url' => 'Referrer must be a valid URL.'
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

        // Sanitize user_agent
        if ($this->has('user_agent')) {
            $this->merge([
                'user_agent' => $this->sanitizeUserAgent($this->user_agent)
            ]);
        }

        // Set defaults
        $this->merge([
            'completed_reading' => $this->completed_reading ?? false,
            'device_type' => $this->device_type ?? 'unknown'
        ]);
    }

    /**
     * Sanitize session ID.
     */
    private function sanitizeSessionId(?string $sessionId): ?string
    {
        if (!$sessionId) {
            return null;
        }
        return preg_replace('/[^a-zA-Z0-9_-]/', '', $sessionId);
    }

    /**
     * Sanitize user agent string.
     */
    private function sanitizeUserAgent(?string $userAgent): ?string
    {
        if (!$userAgent) {
            return null;
        }
        
        // Remove potentially dangerous characters
        $userAgent = strip_tags($userAgent);
        $userAgent = preg_replace('/[<>]/', '', $userAgent);
        
        return substr($userAgent, 0, 500);
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

        // Additional sanitization for metadata
        if (isset($validated['metadata'])) {
            $validated['metadata'] = $this->sanitizeMetadata($validated['metadata']);
        }

        return $validated;
    }

    /**
     * Sanitize metadata array recursively.
     */
    private function sanitizeMetadata(array $metadata): array
    {
        $sanitized = [];
        
        foreach ($metadata as $key => $value) {
            // Sanitize key
            $cleanKey = preg_replace('/[^a-zA-Z0-9_-]/', '', $key);
            
            // Sanitize value
            if (is_string($value)) {
                $sanitized[$cleanKey] = strip_tags($value);
            } elseif (is_numeric($value)) {
                $sanitized[$cleanKey] = $value;
            } elseif (is_bool($value)) {
                $sanitized[$cleanKey] = $value;
            } elseif (is_array($value) && count($sanitized) < 10) {
                $sanitized[$cleanKey] = $this->sanitizeMetadata($value);
            }
        }
        
        return $sanitized;
    }
}

