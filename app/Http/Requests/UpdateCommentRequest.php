<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Validate update comment input data.
 */
class UpdateCommentRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     * Authorization is handled by CommentPolicy, so we return true here.
     *
     * @return bool
     */
    public function authorize(): bool
    {
        return true; // Authorization handled by policy in controller
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'body' => [
                'required',
                'string',
                'min:10',
                'max:2000',
                'regex:/^[^<>]*$/', // Prevent HTML tags for security
            ],
            'edit_reason' => [
                'nullable',
                'string',
                'min:10',
                'max:500',
            ],
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'body.required' => 'El contenido del comentario es obligatorio.',
            'body.min' => 'El comentario debe tener al menos :min caracteres.',
            'body.max' => 'El comentario no puede exceder :max caracteres.',
            'body.regex' => 'El comentario contiene caracteres no permitidos.',
            'edit_reason.min' => 'El motivo de edición debe tener al menos :min caracteres si se proporciona.',
            'edit_reason.max' => 'El motivo de edición no puede exceder :max caracteres.',
        ];
    }

    /**
     * Get custom attributes for validator errors.
     *
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'body' => 'contenido del comentario',
            'edit_reason' => 'motivo de edición',
        ];
    }

    /**
     * Prepare the data for validation.
     * Sanitize input before validation.
     *
     * @return void
     */
    protected function prepareForValidation(): void
    {
        if ($this->has('body')) {
            $this->merge([
                'body' => trim($this->body),
            ]);
        }

        if ($this->has('edit_reason')) {
            $this->merge([
                'edit_reason' => trim($this->edit_reason),
            ]);
        }
    }
}

