<?php
namespace App\Exceptions\ML;
/**
 * Class MLProfileUpdateException.
 */
class MLProfileUpdateException extends MLException
{
    protected string $errorCode = "ML_PROFILE_UPDATE_ERROR";
    protected int $httpStatusCode = 500;
    public static function updateFailed(string $reason): self
    {
        return new self("Failed to update ML user profile: {}", ["reason" => $reason]);
    }
}