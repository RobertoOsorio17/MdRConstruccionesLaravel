<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

/**
 * Validates that a JSON value does not exceed a maximum depth.
 * Prevents deeply nested JSON attacks that can cause performance issues or DoS.
 */
class MaxJsonDepth implements ValidationRule
{
    protected int $maxDepth;

    /**
     * Create a new rule instance.
     *
     * @param int $maxDepth Maximum allowed depth (default: 10)
     */
    public function __construct(int $maxDepth = 10)
    {
        $this->maxDepth = $maxDepth;
    }

    /**
     * Run the validation rule.
     *
     * @param  \Closure(string): \Illuminate\Translation\PotentiallyTranslatedString  $fail
     */
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        // If value is a string, try to decode it
        if (is_string($value)) {
            $decoded = json_decode($value, true);
            if (json_last_error() !== JSON_ERROR_NONE) {
                $fail("El campo {$attribute} debe ser un JSON válido.");
                return;
            }
            $value = $decoded;
        }

        // If not an array or object, it's valid (depth 0)
        if (!is_array($value) && !is_object($value)) {
            return;
        }

        $depth = $this->calculateDepth($value);

        if ($depth > $this->maxDepth) {
            $fail("El campo {$attribute} no puede tener una profundidad mayor a {$this->maxDepth} niveles.");
        }
    }

    /**
     * Calculate the depth of a nested array/object.
     *
     * @param mixed $value
     * @param int $currentDepth
     * @return int
     */
    protected function calculateDepth(mixed $value, int $currentDepth = 0): int
    {
        if (!is_array($value) && !is_object($value)) {
            return $currentDepth;
        }

        $maxChildDepth = $currentDepth;

        foreach ($value as $item) {
            if (is_array($item) || is_object($item)) {
                $childDepth = $this->calculateDepth($item, $currentDepth + 1);
                $maxChildDepth = max($maxChildDepth, $childDepth);
            }
        }

        return $maxChildDepth;
    }
}

