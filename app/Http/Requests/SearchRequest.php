<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Validate search input data.
 */
class SearchRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'q' => [
                'required',
                'string',
                'min:2',
                'max:500',
                'regex:/^[\p{L}\p{N}\s\-_.,!?]+$/u', // Allow letters, numbers, spaces, and basic punctuation
            ],
            'category' => [
                'nullable',
                'string',
                'exists:categories,slug',
            ],
            'author' => [
                'nullable',
                'integer',
                'exists:users,id',
            ],
            'date_from' => [
                'nullable',
                'date',
                'before_or_equal:today',
                // ✅ FIXED: Validate maximum date range (1 year)
                function ($attribute, $value, $fail) {
                    if ($value && $this->date_to) {
                        $from = \Carbon\Carbon::parse($value);
                        $to = \Carbon\Carbon::parse($this->date_to);
                        $diffInDays = $from->diffInDays($to);

                        if ($diffInDays > 365) {
                            $fail('El rango de fechas no puede superar 1 año.');
                        }
                    }
                },
            ],
            'date_to' => [
                'nullable',
                'date',
                'after_or_equal:date_from',
                'before_or_equal:today',
            ],
            'page' => [
                'nullable',
                'integer',
                'min:1',
                'max:100',
            ],
            'per_page' => [
                'nullable',
                'integer',
                'min:1',
                'max:50',
            ],
            'sort' => [
                'nullable',
                'string',
                Rule::in(['relevance', 'date_desc', 'date_asc', 'title_asc', 'title_desc']),
            ],
        ];
    }

    /**
     * Get custom error messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'q.required' => 'El tÃƒÆ’Ã‚Â©rmino de bÃƒÆ’Ã‚Âºsqueda es obligatorio.',
            'q.min' => 'El tÃƒÆ’Ã‚Â©rmino de bÃƒÆ’Ã‚Âºsqueda debe tener al menos 2 caracteres.',
            'q.max' => 'El tÃƒÆ’Ã‚Â©rmino de bÃƒÆ’Ã‚Âºsqueda no puede exceder 500 caracteres.',
            'q.regex' => 'El tÃƒÆ’Ã‚Â©rmino de bÃƒÆ’Ã‚Âºsqueda contiene caracteres no vÃƒÆ’Ã‚Â¡lidos.',
            'category.exists' => 'La categorÃƒÆ’Ã‚Â­a seleccionada no existe.',
            'author.exists' => 'El autor seleccionado no existe.',
            'date_from.before_or_equal' => 'La fecha de inicio no puede ser futura.',
            'date_to.after_or_equal' => 'La fecha de fin debe ser posterior a la fecha de inicio.',
            'date_to.before_or_equal' => 'La fecha de fin no puede ser futura.',
            'page.min' => 'El nÃƒÆ’Ã‚Âºmero de pÃƒÆ’Ã‚Â¡gina debe ser mayor a 0.',
            'page.max' => 'El nÃƒÆ’Ã‚Âºmero de pÃƒÆ’Ã‚Â¡gina no puede exceder 100.',
            'per_page.min' => 'Los resultados por pÃƒÆ’Ã‚Â¡gina deben ser mayor a 0.',
            'per_page.max' => 'Los resultados por pÃƒÆ’Ã‚Â¡gina no pueden exceder 50.',
            'sort.in' => 'El criterio de ordenamiento no es vÃƒÆ’Ã‚Â¡lido.',
        ];
    }

    /**
     * Get the sanitized search query
     */
    public function getQuery(): string
    {
        return trim($this->input('q', ''));
    }

    /**
     * Get the filters array
     */
    public function getFilters(): array
    {
        return array_filter([
            'category' => $this->input('category'),
            'author' => $this->input('author'),
            'date_from' => $this->input('date_from'),
            'date_to' => $this->input('date_to'),
            'sort' => $this->input('sort', 'relevance'),
        ]);
    }

    /**
     * Get pagination parameters
     */
    public function getPaginationParams(): array
    {
        return [
            'page' => $this->input('page', 1),
            'per_page' => $this->input('per_page', 12),
        ];
    }
}

