<?php

namespace App\Exceptions\ML;

/**
 * Exception thrown when user profile update fails.
 * Medium severity - affects personalization quality.
 */
class MLProfileUpdateException extends MLException
{
    protected string $errorCode = 'ML_PROFILE_UPDATE_FAILED';
    protected int $httpStatusCode = 500;

    /**
     * Get the log severity level.
     */
    protected function getLogSeverity(): string
    {
        return 'warning';
    }

    /**
     * Create exception for interaction log failure.
     */
    public static function interactionLogFailed(array $data, \Throwable $previous = null): self
    {
        return new self(
            "Failed to log interaction",
            ['interaction_data' => $data],
            0,
            $previous
        );
    }

    /**
     * Create exception for preference calculation failure.
     */
    public static function preferenceCalculationFailed(string $type, \Throwable $previous = null): self
    {
        return new self(
            "Failed to calculate {$type} preferences",
            ['preference_type' => $type],
            0,
            $previous
        );
    }

    /**
     * Create exception for cluster assignment failure.
     */
    public static function clusterAssignmentFailed(int $profileId, \Throwable $previous = null): self
    {
        return new self(
            "Failed to assign cluster for profile ID: {$profileId}",
            ['profile_id' => $profileId],
            0,
            $previous
        );
    }

    /**
     * Create exception for invalid profile data.
     */
    public static function invalidProfileData(string $field, $value): self
    {
        return new self(
            "Invalid profile data for field '{$field}'",
            ['field' => $field, 'value' => $value]
        );
    }
}

