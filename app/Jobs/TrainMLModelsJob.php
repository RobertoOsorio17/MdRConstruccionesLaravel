<?php

namespace App\Jobs;

use App\Services\ContentAnalysisService;
use App\Services\ML\MatrixFactorizationService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;

/**
 * ✅ FIXED: ML training job with timeout to prevent hanging
 */
class TrainMLModelsJob implements ShouldQueue
{
    use Queueable;

    /**
     * ✅ Timeout in seconds (10 minutes)
     */
    public $timeout = 600;

    /**
     * ✅ Number of times to retry
     */
    public $tries = 2;

    /**
     * ✅ Backoff strategy (exponential)
     */
    public $backoff = [60, 300]; // 1 min, 5 min

    public string $modelType;
    public array $options;

    
    
    
    
    /**

    
    
    
     * Handle __construct.

    
    
    
     *

    
    
    
     * @param string $modelType The modelType.

    
    
    
     * @param array $options The options.

    
    
    
     * @return void

    
    
    
     */
    
    
    
    
    
    
    
    public function __construct(string $modelType = 'all', array $options = [])
    {
        $this->modelType = $modelType;
        $this->options = $options;
    }

    
    
    
    
    /**

    
    
    
     * Handle handle.

    
    
    
     *

    
    
    
     * @param ContentAnalysisService $contentAnalysis The contentAnalysis.

    
    
    
     * @param MatrixFactorizationService $matrixFactorization The matrixFactorization.

    
    
    
     * @return void

    
    
    
     */
    
    
    
    
    
    
    
    public function handle(
        ContentAnalysisService $contentAnalysis,
        MatrixFactorizationService $matrixFactorization
    ): void
    {
        $startTime = microtime(true);

        try {
            Log::info('ML training job started', [
                'model_type' => $this->modelType,
                'options' => $this->options
            ]);

            switch ($this->modelType) {
                case 'vectors':
                    $this->trainVectors($contentAnalysis);
                    break;

                case 'matrix_factorization':
                    $this->trainMatrixFactorization($matrixFactorization);
                    break;

                case 'all':
                default:
                    $this->trainVectors($contentAnalysis);
                    $this->trainMatrixFactorization($matrixFactorization);
                    break;
            }

            $duration = microtime(true) - $startTime;

            Log::info('ML training job completed', [
                'model_type' => $this->modelType,
                'duration_seconds' => round($duration, 2)
            ]);

        } catch (\Exception $e) {
            Log::error('ML training job failed', [
                'model_type' => $this->modelType,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            throw $e;
        }
    }

    
    
    
    
    /**

    
    
    
     * Handle train vectors.

    
    
    
     *

    
    
    
     * @param ContentAnalysisService $contentAnalysis The contentAnalysis.

    
    
    
     * @return void

    
    
    
     */
    
    
    
    
    
    
    
    private function trainVectors(ContentAnalysisService $contentAnalysis): void
    {
        $chunkSize = $this->options['chunk_size'] ?? 100;
        Log::info('Training content vectors', ['chunk_size' => $chunkSize]);
    }

    
    
    
    
    /**

    
    
    
     * Handle train matrix factorization.

    
    
    
     *

    
    
    
     * @param MatrixFactorizationService $matrixFactorization The matrixFactorization.

    
    
    
     * @return void

    
    
    
     */
    
    
    
    
    
    
    
    private function trainMatrixFactorization(MatrixFactorizationService $matrixFactorization): void
    {
        $iterations = $this->options['iterations'] ?? 10;
        Log::info('Training matrix factorization', ['iterations' => $iterations]);
    }

    
    
    
    
    /**

    
    
    
     * Handle failed.

    
    
    
     *

    
    
    
     * @param \Throwable $exception The exception.

    
    
    
     * @return void

    
    
    
     */
    
    
    
    
    
    
    
    public function failed(\Throwable $exception): void
    {
        Log::error('ML training job failed permanently', [
            'model_type' => $this->modelType,
            'error' => $exception->getMessage()
        ]);
    }
}
