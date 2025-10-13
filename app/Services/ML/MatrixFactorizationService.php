<?php

namespace App\Services\ML;

use App\Models\MLInteractionLog;
use App\Models\MLUserProfile;
use App\Models\Post;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

/**
 * Matrix Factorization using Alternating Least Squares (ALS).
 * Implements collaborative filtering for personalized recommendations.
 */
class MatrixFactorizationService
{
    private int $numFactors = 50;
    private int $numIterations = 20;
    private float $regularization = 0.1;
    private float $learningRate = 0.01;
    private float $convergenceThreshold = 0.001;

    /**
     * Train matrix factorization model using ALS.
     * ✅ FIXED: Added optimistic locking to prevent concurrent training conflicts
     *
     * @return array ['user_factors' => array, 'item_factors' => array, 'metrics' => array]
     * @throws \Exception If concurrent training is detected
     */
    public function train(): array
    {
        Log::info('Starting Matrix Factorization training');

        // ✅ OPTIMISTIC LOCKING: Check if training is already in progress
        $lockKey = 'ml_training_lock';
        $lockValue = Cache::get($lockKey);

        if ($lockValue) {
            $lockAge = now()->diffInSeconds($lockValue);

            // If lock is older than 30 minutes, it's probably stale
            if ($lockAge < 1800) {
                throw new \Exception('Matrix Factorization training already in progress. Please wait.');
            }

            Log::warning('Stale training lock detected, clearing it', [
                'lock_age_seconds' => $lockAge
            ]);
        }

        // Acquire lock (expires in 30 minutes)
        Cache::put($lockKey, now(), 1800);

        try {
            // Get current version number
            $currentVersion = Cache::get('ml_model_version', 0);
            $newVersion = $currentVersion + 1;

            Log::info('Training ML model', [
                'current_version' => $currentVersion,
                'new_version' => $newVersion
            ]);

            // Build interaction matrix
            $interactionData = $this->buildInteractionMatrix();

            if (empty($interactionData['matrix'])) {
                throw new \Exception('Insufficient interaction data for matrix factorization');
            }

            $matrix = $interactionData['matrix'];
            $userIds = $interactionData['user_ids'];
            $itemIds = $interactionData['item_ids'];

            // Initialize factor matrices randomly
            $userFactors = $this->initializeFactors(count($userIds), $this->numFactors);
            $itemFactors = $this->initializeFactors(count($itemIds), $this->numFactors);

            // Perform ALS iterations
            $previousLoss = PHP_FLOAT_MAX;
            $converged = false;

            for ($iter = 0; $iter < $this->numIterations; $iter++) {
                // Update user factors
                $userFactors = $this->updateUserFactors($matrix, $userFactors, $itemFactors);

                // Update item factors
                $itemFactors = $this->updateItemFactors($matrix, $userFactors, $itemFactors);

                // Calculate loss
                $loss = $this->calculateLoss($matrix, $userFactors, $itemFactors);

                Log::info("ALS Iteration {$iter}: Loss = {$loss}");

                // Check convergence
                if (abs($previousLoss - $loss) < $this->convergenceThreshold) {
                    $converged = true;
                    Log::info("Converged at iteration {$iter}");
                    break;
                }

                $previousLoss = $loss;
            }

            // Map factors back to original IDs
            $userFactorMap = array_combine($userIds, $userFactors);
            $itemFactorMap = array_combine($itemIds, $itemFactors);

            // ✅ ATOMIC UPDATE: Save model with version check
            DB::transaction(function () use ($userFactorMap, $itemFactorMap, $newVersion, $currentVersion) {
                // Verify version hasn't changed (optimistic locking)
                $actualVersion = Cache::get('ml_model_version', 0);

                if ($actualVersion !== $currentVersion) {
                    throw new \Exception('Model version conflict detected. Another training process completed first.');
                }

                // Cache the trained model with new version
                Cache::put('ml_user_factors', $userFactorMap, now()->addDays(7));
                Cache::put('ml_item_factors', $itemFactorMap, now()->addDays(7));
                Cache::put('ml_model_version', $newVersion, now()->addDays(7));
                Cache::put('ml_model_trained_at', now(), now()->addDays(7));

                Log::info('ML model saved successfully', [
                    'version' => $newVersion,
                    'num_users' => count($userFactorMap),
                    'num_items' => count($itemFactorMap)
                ]);
            });

            return [
                'user_factors' => $userFactorMap,
                'item_factors' => $itemFactorMap,
                'metrics' => [
                    'final_loss' => $previousLoss,
                    'iterations' => $iter + 1,
                    'converged' => $converged,
                    'num_users' => count($userIds),
                    'num_items' => count($itemIds),
                    'num_factors' => $this->numFactors,
                    'version' => $newVersion
                ]
            ];

        } finally {
            // ✅ Always release lock
            Cache::forget($lockKey);
            Log::info('Training lock released');
        }
    }

    /**
     * Build user-item interaction matrix from logs.
     */
    private function buildInteractionMatrix(): array
    {
        // Get all interactions with implicit ratings
        $interactions = MLInteractionLog::with('post')
            ->whereNotNull('implicit_rating')
            ->where('implicit_rating', '>', 0)
            ->select('session_id', 'user_id', 'post_id', 'implicit_rating')
            ->get();

        if ($interactions->isEmpty()) {
            return ['matrix' => [], 'user_ids' => [], 'item_ids' => []];
        }

        // Create user identifier (prefer user_id, fallback to session_id)
        $userIdentifiers = $interactions->map(function($interaction) {
            return $interaction->user_id ?? 'session_' . $interaction->session_id;
        })->unique()->values()->toArray();

        $itemIds = $interactions->pluck('post_id')->unique()->values()->toArray();

        // Build matrix
        $matrix = [];
        foreach ($userIdentifiers as $userId) {
            $matrix[$userId] = array_fill_keys($itemIds, 0);
        }

        // Fill matrix with ratings
        foreach ($interactions as $interaction) {
            $userId = $interaction->user_id ?? 'session_' . $interaction->session_id;
            $itemId = $interaction->post_id;
            
            // Aggregate multiple interactions (take max rating)
            $matrix[$userId][$itemId] = max(
                $matrix[$userId][$itemId],
                $interaction->implicit_rating
            );
        }

        // Convert to indexed arrays
        $matrixArray = [];
        foreach ($userIdentifiers as $i => $userId) {
            $matrixArray[$i] = [];
            foreach ($itemIds as $j => $itemId) {
                $matrixArray[$i][$j] = $matrix[$userId][$itemId];
            }
        }

        return [
            'matrix' => $matrixArray,
            'user_ids' => $userIdentifiers,
            'item_ids' => $itemIds
        ];
    }

    /**
     * Initialize factor matrix with random values.
     */
    private function initializeFactors(int $rows, int $cols): array
    {
        $factors = [];
        
        for ($i = 0; $i < $rows; $i++) {
            $factors[$i] = [];
            for ($j = 0; $j < $cols; $j++) {
                // Random initialization with small values
                $factors[$i][$j] = (mt_rand() / mt_getrandmax() - 0.5) * 0.1;
            }
        }

        return $factors;
    }

    /**
     * Update user factors using ALS.
     */
    private function updateUserFactors(array $matrix, array $userFactors, array $itemFactors): array
    {
        $numUsers = count($userFactors);
        $newUserFactors = $userFactors;

        for ($u = 0; $u < $numUsers; $u++) {
            // Get items rated by this user
            $ratedItems = [];
            foreach ($matrix[$u] as $i => $rating) {
                if ($rating > 0) {
                    $ratedItems[$i] = $rating;
                }
            }

            if (empty($ratedItems)) {
                continue;
            }

            // Solve for user factors: (I^T * I + λI)^-1 * I^T * r
            $newUserFactors[$u] = $this->solveALS($ratedItems, $itemFactors);
        }

        return $newUserFactors;
    }

    /**
     * Update item factors using ALS.
     */
    private function updateItemFactors(array $matrix, array $userFactors, array $itemFactors): array
    {
        $numItems = count($itemFactors);
        $newItemFactors = $itemFactors;

        for ($i = 0; $i < $numItems; $i++) {
            // Get users who rated this item
            $ratingUsers = [];
            foreach ($matrix as $u => $ratings) {
                if ($ratings[$i] > 0) {
                    $ratingUsers[$u] = $ratings[$i];
                }
            }

            if (empty($ratingUsers)) {
                continue;
            }

            // Solve for item factors
            $newItemFactors[$i] = $this->solveALS($ratingUsers, $userFactors);
        }

        return $newItemFactors;
    }

    /**
     * Solve ALS equation for a single factor vector.
     */
    private function solveALS(array $ratings, array $factors): array
    {
        $k = $this->numFactors;
        
        // Build A = X^T * X + λI
        $A = $this->createIdentityMatrix($k, $this->regularization);
        
        // Build b = X^T * r
        $b = array_fill(0, $k, 0);

        foreach ($ratings as $idx => $rating) {
            $factor = $factors[$idx];
            
            // A += x * x^T
            for ($i = 0; $i < $k; $i++) {
                for ($j = 0; $j < $k; $j++) {
                    $A[$i][$j] += $factor[$i] * $factor[$j];
                }
                // b += r * x
                $b[$i] += $rating * $factor[$i];
            }
        }

        // Solve A * x = b using Gaussian elimination
        return $this->gaussianElimination($A, $b);
    }

    /**
     * Create identity matrix with diagonal values.
     */
    private function createIdentityMatrix(int $size, float $diagonal): array
    {
        $matrix = [];
        for ($i = 0; $i < $size; $i++) {
            $matrix[$i] = array_fill(0, $size, 0);
            $matrix[$i][$i] = $diagonal;
        }
        return $matrix;
    }

    /**
     * Solve linear system using Gaussian elimination.
     */
    private function gaussianElimination(array $A, array $b): array
    {
        $n = count($b);
        
        // Forward elimination
        for ($i = 0; $i < $n; $i++) {
            // Find pivot
            $maxRow = $i;
            for ($k = $i + 1; $k < $n; $k++) {
                if (abs($A[$k][$i]) > abs($A[$maxRow][$i])) {
                    $maxRow = $k;
                }
            }

            // Swap rows
            if ($maxRow != $i) {
                [$A[$i], $A[$maxRow]] = [$A[$maxRow], $A[$i]];
                [$b[$i], $b[$maxRow]] = [$b[$maxRow], $b[$i]];
            }

            // Eliminate column
            for ($k = $i + 1; $k < $n; $k++) {
                if ($A[$i][$i] != 0) {
                    $factor = $A[$k][$i] / $A[$i][$i];
                    for ($j = $i; $j < $n; $j++) {
                        $A[$k][$j] -= $factor * $A[$i][$j];
                    }
                    $b[$k] -= $factor * $b[$i];
                }
            }
        }

        // Back substitution
        $x = array_fill(0, $n, 0);
        for ($i = $n - 1; $i >= 0; $i--) {
            $x[$i] = $b[$i];
            for ($j = $i + 1; $j < $n; $j++) {
                $x[$i] -= $A[$i][$j] * $x[$j];
            }
            if ($A[$i][$i] != 0) {
                $x[$i] /= $A[$i][$i];
            }
        }

        return $x;
    }

    /**
     * Calculate reconstruction loss (RMSE).
     */
    private function calculateLoss(array $matrix, array $userFactors, array $itemFactors): float
    {
        $totalError = 0;
        $count = 0;

        foreach ($matrix as $u => $ratings) {
            foreach ($ratings as $i => $rating) {
                if ($rating > 0) {
                    $predicted = $this->dotProduct($userFactors[$u], $itemFactors[$i]);
                    $error = $rating - $predicted;
                    $totalError += $error * $error;
                    $count++;
                }
            }
        }

        // Add regularization term
        $regTerm = 0;
        foreach ($userFactors as $uf) {
            $regTerm += $this->regularization * $this->dotProduct($uf, $uf);
        }
        foreach ($itemFactors as $if) {
            $regTerm += $this->regularization * $this->dotProduct($if, $if);
        }

        return $count > 0 ? sqrt($totalError / $count) + $regTerm : 0;
    }

    /**
     * Calculate dot product of two vectors.
     */
    private function dotProduct(array $a, array $b): float
    {
        $sum = 0;
        $n = min(count($a), count($b));
        
        for ($i = 0; $i < $n; $i++) {
            $sum += $a[$i] * $b[$i];
        }

        return $sum;
    }

    /**
     * Predict rating for user-item pair.
     */
    public function predict(string $userId, int $itemId): float
    {
        $userFactors = Cache::get('ml_user_factors', []);
        $itemFactors = Cache::get('ml_item_factors', []);

        if (!isset($userFactors[$userId]) || !isset($itemFactors[$itemId])) {
            return 0;
        }

        return $this->dotProduct($userFactors[$userId], $itemFactors[$itemId]);
    }

    /**
     * Get top N recommendations for a user.
     */
    public function getRecommendations(string $userId, int $limit = 10, array $excludeItems = []): array
    {
        $userFactors = Cache::get('ml_user_factors', []);
        $itemFactors = Cache::get('ml_item_factors', []);

        if (!isset($userFactors[$userId])) {
            return [];
        }

        $userFactor = $userFactors[$userId];
        $scores = [];

        // Calculate scores for all items
        foreach ($itemFactors as $itemId => $itemFactor) {
            if (!in_array($itemId, $excludeItems)) {
                $scores[$itemId] = $this->dotProduct($userFactor, $itemFactor);
            }
        }

        // Sort by score descending
        arsort($scores);

        // Return top N
        return array_slice($scores, 0, $limit, true);
    }

    /**
     * Get similar items using item factors.
     */
    public function getSimilarItems(int $itemId, int $limit = 10): array
    {
        $itemFactors = Cache::get('ml_item_factors', []);

        if (!isset($itemFactors[$itemId])) {
            return [];
        }

        $targetFactor = $itemFactors[$itemId];
        $similarities = [];

        // Calculate cosine similarity with all other items
        foreach ($itemFactors as $otherId => $otherFactor) {
            if ($otherId != $itemId) {
                $similarities[$otherId] = $this->cosineSimilarity($targetFactor, $otherFactor);
            }
        }

        // Sort by similarity descending
        arsort($similarities);

        // Return top N
        return array_slice($similarities, 0, $limit, true);
    }

    /**
     * Calculate cosine similarity between two vectors.
     */
    private function cosineSimilarity(array $a, array $b): float
    {
        $dotProd = $this->dotProduct($a, $b);
        $magA = sqrt($this->dotProduct($a, $a));
        $magB = sqrt($this->dotProduct($b, $b));

        if ($magA == 0 || $magB == 0) {
            return 0;
        }

        return $dotProd / ($magA * $magB);
    }

    /**
     * Perform SVD decomposition (simplified).
     */
    public function performSVD(array $matrix, int $k): array
    {
        // This is a simplified SVD using power iteration
        // For production, consider using a proper linear algebra library

        $m = count($matrix);
        $n = count($matrix[0]);

        // Initialize U and V randomly
        $U = $this->initializeFactors($m, $k);
        $V = $this->initializeFactors($n, $k);

        // Power iteration
        for ($iter = 0; $iter < 50; $iter++) {
            // Update V: V = M^T * U
            $newV = [];
            for ($j = 0; $j < $n; $j++) {
                $newV[$j] = array_fill(0, $k, 0);
                for ($f = 0; $f < $k; $f++) {
                    for ($i = 0; $i < $m; $i++) {
                        $newV[$j][$f] += $matrix[$i][$j] * $U[$i][$f];
                    }
                }
                // Normalize
                $norm = sqrt(array_sum(array_map(fn($v) => $v * $v, $newV[$j])));
                if ($norm > 0) {
                    for ($f = 0; $f < $k; $f++) {
                        $newV[$j][$f] /= $norm;
                    }
                }
            }
            $V = $newV;

            // Update U: U = M * V
            $newU = [];
            for ($i = 0; $i < $m; $i++) {
                $newU[$i] = array_fill(0, $k, 0);
                for ($f = 0; $f < $k; $f++) {
                    for ($j = 0; $j < $n; $j++) {
                        $newU[$i][$f] += $matrix[$i][$j] * $V[$j][$f];
                    }
                }
                // Normalize
                $norm = sqrt(array_sum(array_map(fn($v) => $v * $v, $newU[$i])));
                if ($norm > 0) {
                    for ($f = 0; $f < $k; $f++) {
                        $newU[$i][$f] /= $norm;
                    }
                }
            }
            $U = $newU;
        }

        // Calculate singular values
        $S = array_fill(0, $k, 0);
        for ($f = 0; $f < $k; $f++) {
            $sum = 0;
            for ($i = 0; $i < $m; $i++) {
                for ($j = 0; $j < $n; $j++) {
                    $predicted = 0;
                    for ($ff = 0; $ff < $k; $ff++) {
                        $predicted += $U[$i][$ff] * $S[$ff] * $V[$j][$ff];
                    }
                    $sum += ($matrix[$i][$j] - $predicted) ** 2;
                }
            }
            $S[$f] = sqrt($sum / ($m * $n));
        }

        return [
            'U' => $U,
            'S' => $S,
            'V' => $V
        ];
    }

    /**
     * Get model configuration.
     */
    public function getConfig(): array
    {
        return [
            'num_factors' => $this->numFactors,
            'num_iterations' => $this->numIterations,
            'regularization' => $this->regularization,
            'learning_rate' => $this->learningRate,
            'convergence_threshold' => $this->convergenceThreshold
        ];
    }

    /**
     * Set model configuration.
     */
    public function setConfig(array $config): void
    {
        if (isset($config['num_factors'])) {
            $this->numFactors = $config['num_factors'];
        }
        if (isset($config['num_iterations'])) {
            $this->numIterations = $config['num_iterations'];
        }
        if (isset($config['regularization'])) {
            $this->regularization = $config['regularization'];
        }
        if (isset($config['learning_rate'])) {
            $this->learningRate = $config['learning_rate'];
        }
        if (isset($config['convergence_threshold'])) {
            $this->convergenceThreshold = $config['convergence_threshold'];
        }
    }
}


