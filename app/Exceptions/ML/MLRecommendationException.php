<?php

namespace App\Exceptions\ML;

/**
 * Exception thrown when recommendation generation fails.
 * High severity - affects user experience.
 */
class MLRecommendationException extends MLException
{
    protected string $errorCode = 'ML_RECOMMENDATION_FAILED';
    protected int $httpStatusCode = 500;

    /**
     * Get the log severity level.
     */
    protected function getLogSeverity(): string
    {
        return 'error';
    }

    /**
     * Create exception for vector not found.
     */
    public static function vectorNotFound(int $postId): self
    {
        return new self(
            "ML vector not found for post ID: {$postId}",
            ['post_id' => $postId]
        );
    }

    /**
     * Create exception for profile not found.
     */
    public static function profileNotFound(string $identifier): self
    {
        return new self(
            "User profile not found: {$identifier}",
            ['identifier' => $identifier]
        );
    }

    /**
     * Create exception for no candidates available.
     */
    public static function noCandidatesAvailable(): self
    {
        return new self(
            "No candidate posts available for recommendations",
            []
        );
    }

    /**
     * Create exception for algorithm failure.
     */
    public static function algorithmFailed(string $algorithm, \Throwable $previous = null): self
    {
        return new self(
            "Recommendation algorithm '{$algorithm}' failed",
            ['algorithm' => $algorithm],
            0,
            $previous
        );
    }

    /**
     * Create exception for similarity calculation failure.
     */
    public static function similarityCalculationFailed(int $postA, int $postB, \Throwable $previous = null): self
    {
        return new self(
            "Failed to calculate similarity between posts {$postA} and {$postB}",
            ['post_a' => $postA, 'post_b' => $postB],
            0,
            $previous
        );
    }

    /**
     * Create exception for cache failure.
     */
    public static function cacheFailed(string $key, \Throwable $previous = null): self
    {
        return new self(
            "Cache operation failed for key: {$key}",
            ['cache_key' => $key],
            0,
            $previous
        );
    }
}

