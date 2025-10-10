<?php

namespace App\Exceptions\ML;

/**
 * Exception thrown when ML model training fails.
 * Critical severity - requires immediate attention.
 */
class MLTrainingException extends MLException
{
    protected string $errorCode = 'ML_TRAINING_FAILED';
    protected int $httpStatusCode = 500;

    /**
     * Get the log severity level.
     */
    protected function getLogSeverity(): string
    {
        return 'critical';
    }

    /**
     * Create exception for post analysis failure.
     */
    public static function postAnalysisFailed(int $postId, \Throwable $previous = null): self
    {
        return new self(
            "Failed to analyze post ID: {$postId}",
            ['post_id' => $postId],
            0,
            $previous
        );
    }

    /**
     * Create exception for profile update failure.
     */
    public static function profileUpdateFailed(int $profileId, \Throwable $previous = null): self
    {
        return new self(
            "Failed to update user profile ID: {$profileId}",
            ['profile_id' => $profileId],
            0,
            $previous
        );
    }

    /**
     * Create exception for vocabulary building failure.
     */
    public static function vocabularyBuildFailed(\Throwable $previous = null): self
    {
        return new self(
            "Failed to build global vocabulary",
            [],
            0,
            $previous
        );
    }

    /**
     * Create exception for IDF calculation failure.
     */
    public static function idfCalculationFailed(\Throwable $previous = null): self
    {
        return new self(
            "Failed to calculate IDF values",
            [],
            0,
            $previous
        );
    }

    /**
     * Create exception for clustering failure.
     */
    public static function clusteringFailed(string $reason, \Throwable $previous = null): self
    {
        return new self(
            "K-Means clustering failed: {$reason}",
            ['reason' => $reason],
            0,
            $previous
        );
    }

    /**
     * Create exception for insufficient data.
     */
    public static function insufficientData(string $dataType, int $required, int $actual): self
    {
        return new self(
            "Insufficient {$dataType} for training. Required: {$required}, Actual: {$actual}",
            [
                'data_type' => $dataType,
                'required' => $required,
                'actual' => $actual
            ]
        );
    }
}

