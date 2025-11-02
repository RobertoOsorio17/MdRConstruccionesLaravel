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

    
    
    
     * Handle __construct.

    
    
    
     *

    
    
    
     * @param string $message The message.

    
    
    
     * @param array $context The context.

    
    
    
     * @param int $code The code.

    
    
    
     * @param ?\Throwable $previous The previous.

    
    
    
     * @return void

    
    
    
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

    
    
    
     * Get context.

    
    
    
     *

    
    
    
     * @return array

    
    
    
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

    
    
    
     * Get error code.

    
    
    
     *

    
    
    
     * @return string

    
    
    
     */
    
    
    
    
    
    
    
    public function getErrorCode(): string
    {
        return $this->errorCode ?? 'ML_ERROR';
    }

    
    
    
    
    /**

    
    
    
     * Get http status code.

    
    
    
     *

    
    
    
     * @return int

    
    
    
     */
    
    
    
    
    
    
    
    public function getHttpStatusCode(): int
    {
        return $this->httpStatusCode;
    }

    
    
    
    
    /**

    
    
    
     * Handle log exception.

    
    
    
     *

    
    
    
     * @return void

    
    
    
     */
    
    
    
    
    
    
    
    protected function logException(): void
    {
        $severity = $this->getLogSeverity();
        
        Log::$severity($this->getMessage(), $this->getContext());
    }

    
    
    
    
    /**

    
    
    
     * Get log severity.

    
    
    
     *

    
    
    
     * @return string

    
    
    
     */
    
    
    
    
    
    
    
    protected function getLogSeverity(): string
    {
        return 'error';
    }

    
    
    
    
    /**

    
    
    
     * Handle to response.

    
    
    
     *

    
    
    
     * @return array

    
    
    
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

    
    
    
     * Handle render.

    
    
    
     *

    
    
    
     * @param mixed $request The request.

    
    
    
     * @return void

    
    
    
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

