<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

/**
 * ReviewBanAppealRequest
 *
 * Validates admin input when reviewing a ban appeal.
 * Ensures proper decision making and response formatting.
 */
class ReviewBanAppealRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * Only administrators can review ban appeals.
     */
    public function authorize(): bool
    {
        return auth()->check() && auth()->user()->hasRole('admin');
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'decision' => [
                'required',
                'string',
                'in:approve,reject,request_info',
            ],
            'response' => [
                'required_if:decision,reject,request_info',
                'nullable',
                'string',
                'max:1000',
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
            'decision.required' => 'Debes seleccionar una decisión (aprobar, rechazar o solicitar información).',
            'decision.in' => 'La decisión debe ser: aprobar, rechazar o solicitar información.',
            'response.required_if' => 'Debes proporcionar una explicación cuando rechazas una apelación o solicitas más información.',
            'response.max' => 'La respuesta no puede exceder 1000 caracteres.',
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
            'decision' => 'decisión',
            'response' => 'respuesta',
        ];
    }

    /**
     * Prepare the data for validation.
     *
     * Sanitize input to prevent XSS attacks.
     */
    protected function prepareForValidation(): void
    {
        if ($this->has('response')) {
            $this->merge([
                'response' => strip_tags($this->response),
            ]);
        }
    }
}
