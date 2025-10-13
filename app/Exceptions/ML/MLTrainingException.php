<?php
namespace App\Exceptions\ML;
class MLTrainingException extends MLException
{
    protected string $errorCode = "ML_TRAINING_ERROR";
    protected int $httpStatusCode = 500;
    public static function insufficientData(string $dataType, int $required, int $actual): self
    {
        return new self("Insufficient {} for training. Required: {}, Actual: {}", ["data_type" => $dataType, "required" => $required, "actual" => $actual]);
    }
}