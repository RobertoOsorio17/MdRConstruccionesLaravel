<?php

namespace App\Exceptions\ML;

use Exception;
use Illuminate\Support\Facades\Log;

/**
 * Base exception for all ML-related errors.
 * Provides structured error handling and logging.
 */
abstract class MLException extends Exception
{
    protected array $context = [];
    protected string $errorCode;
    protected int $httpStatusCode = 500;

    /**
     * Create a new ML exception instance.
     */
    public function __construct(
        string $message = "",
        array $context = [],
        int $code = 0,
        ?\Throwable $previous = null
    ) {
        parent::__construct($message, $code, $previous);
        $this->context = $context;
        $this->logException();
    }

    /**
     * Get the exception context.
     */
    public function getContext(): array
    {
        return array_merge($this->context, [
            'exception_class' => get_class($this),
            'error_code' => $this->getErrorCode(),
            'timestamp' => now()->toIso8601String(),
            'trace' => $this->getTraceAsString()
        ]);
    }

    /**
     * Get the error code.
     */
    public function getErrorCode(): string
    {
        return $this->errorCode ?? 'ML_ERROR';
    }

    /**
     * Get the HTTP status code.
     */
    public function getHttpStatusCode(): int
    {
        return $this->httpStatusCode;
    }

    /**
     * Log the exception with appropriate severity.
     */
    protected function logException(): void
    {
        $severity = $this->getLogSeverity();
        
        Log::$severity($this->getMessage(), $this->getContext());
    }

    /**
     * Get the log severity level.
     */
    protected function getLogSeverity(): string
    {
        return 'error';
    }

    /**
     * Convert exception to JSON response.
     */
    public function toResponse(): array
    {
        return [
            'success' => false,
            'error' => $this->getMessage(),
            'error_code' => $this->getErrorCode(),
            'context' => config('app.debug') ? $this->getContext() : []
        ];
    }

    /**
     * Render the exception as an HTTP response.
     */
    public function render($request)
    {
        if ($request->expectsJson()) {
            return response()->json(
                $this->toResponse(),
                $this->getHttpStatusCode()
            );
        }

        return response()->view('errors.ml-error', [
            'exception' => $this
        ], $this->getHttpStatusCode());
    }
}

