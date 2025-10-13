<?php

namespace App\Exceptions\ML;

/**
 * Exception thrown when ML data validation fails.
 * Low severity - client error.
 */
class MLValidationException extends MLException
{
    protected string $errorCode = 'ML_VALIDATION_FAILED';
    protected int $httpStatusCode = 422;

    /**
     * Get the log severity level.
     */
    protected function getLogSeverity(): string
    {
        return 'info';
    }

    /**
     * Create exception for invalid vector dimensions.
     */
    public static function invalidVectorDimensions(int $expected, int $actual): self
    {
        return new self(
            "Invalid vector dimensions. Expected: {$expected}, Actual: {$actual}",
            ['expected' => $expected, 'actual' => $actual]
        );
    }

    /**
     * Create exception for invalid score range.
     */
    public static function invalidScoreRange(float $score, float $min, float $max): self
    {
        return new self(
            "Score {$score} is outside valid range [{$min}, {$max}]",
            ['score' => $score, 'min' => $min, 'max' => $max]
        );
    }

    /**
     * Create exception for empty vector.
     */
    public static function emptyVector(string $vectorType): self
    {
        return new self(
            "Empty {$vectorType} vector provided",
            ['vector_type' => $vectorType]
        );
    }

    /**
     * Create exception for invalid algorithm parameter.
     */
    public static function invalidParameter(string $parameter, $value, string $reason): self
    {
        return new self(
            "Invalid parameter '{$parameter}': {$reason}",
            ['parameter' => $parameter, 'value' => $value, 'reason' => $reason]
        );
    }
}

