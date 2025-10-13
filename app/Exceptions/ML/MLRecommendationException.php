<?php
namespace App\Exceptions\ML;
class MLRecommendationException extends MLException
{
    protected string $errorCode = "ML_RECOMMENDATION_ERROR";
    protected int $httpStatusCode = 422;
    public static function noCandidatesAvailable(): self
    {
        return new self("No candidate posts available for recommendations.", ["reason" => "insufficient_data"]);
    }
}