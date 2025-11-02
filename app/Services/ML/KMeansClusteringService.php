<?php

namespace App\Services\ML;

use App\Models\MLUserProfile;
use App\Exceptions\ML\MLTrainingException;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;

/**
 * Professional K-Means clustering implementation with K-Means++ initialization.
 * Provides robust user segmentation for personalized recommendations.
 */
class KMeansClusteringService
{
    private int $maxIterations = 100;
    private float $tolerance = 0.0001;
    private int $kMeansPlusPlusTrials = 10;

    
    
    
    
    /**

    
    
    
     * Handle cluster.

    
    
    
     *

    
    
    
     * @param Collection $profiles The profiles.

    
    
    
     * @param int $k The k.

    
    
    
     * @return array

    
    
    
     */
    
    
    
    
    
    
    
    public function cluster(Collection $profiles, int $k = 5): array
    {
        if ($profiles->count() < $k) {
            throw MLTrainingException::insufficientData(
                'user profiles',
                $k,
                $profiles->count()
            );
        }

        Log::info("Starting K-Means clustering", [
            'profiles_count' => $profiles->count(),
            'k' => $k
        ]);

        try {
            // Extract profile IDs for later reference
            $profileIds = $profiles->pluck('id')->toArray();

            // Extract feature vectors from profiles
            $features = $this->extractFeatureVectors($profiles);

            if (empty($features)) {
                throw MLTrainingException::clusteringFailed('No valid feature vectors extracted');
            }

            // Initialize centroids using K-Means++
            $centroids = $this->initializeCentroidsKMeansPlusPlus($features, $k);

            // Perform iterative clustering
            $result = $this->performIterativeClustering($features, $centroids, $k);

            // Calculate cluster quality metrics
            $metrics = $this->calculateClusterMetrics($features, $result['assignments'], $result['centroids']);

            Log::info("K-Means clustering completed", [
                'iterations' => $result['iterations'],
                'silhouette_score' => $metrics['silhouette_score'],
                'inertia' => $metrics['inertia']
            ]);

            return [
                'assignments' => $result['assignments'],
                'centroids' => $result['centroids'],
                'iterations' => $result['iterations'],
                'converged' => $result['converged'],
                'metrics' => $metrics,
                'cluster_sizes' => $this->calculateClusterSizes($result['assignments'], $k),
                'profile_ids' => $profileIds
            ];

        } catch (\Exception $e) {
            throw MLTrainingException::clusteringFailed($e->getMessage(), $e);
        }
    }

    
    
    
    
    /**

    
    
    
     * Handle extract feature vectors.

    
    
    
     *

    
    
    
     * @param Collection $profiles The profiles.

    
    
    
     * @return array

    
    
    
     */
    
    
    
    
    
    
    
    private function extractFeatureVectors(Collection $profiles): array
    {
        $features = [];
        $profileIds = [];

        foreach ($profiles as $profile) {
            $vector = $this->profileToVector($profile);
            
            if (!empty($vector)) {
                $features[] = $vector;
                $profileIds[] = $profile->id;
            }
        }

        // Normalize features
        $features = $this->normalizeFeatures($features);

        return [
            'vectors' => $features,
            'profile_ids' => $profileIds
        ];
    }

    
    
    
    
    /**

    
    
    
     * Handle profile to vector.

    
    
    
     *

    
    
    
     * @param MLUserProfile $profile The profile.

    
    
    
     * @return array

    
    
    
     */
    
    
    
    
    
    
    
    private function profileToVector(MLUserProfile $profile): array
    {
        $vector = [];

        // Engagement metrics (4 features)
        $vector[] = $profile->engagement_rate ?? 0;
        $vector[] = $profile->return_rate ?? 0;
        $vector[] = min(($profile->total_posts_read ?? 0) / 100, 1.0); // Normalized
        $vector[] = min(($profile->avg_reading_time ?? 0) / 600, 1.0); // Normalized to 10 min

        // Category preferences (top 5 categories)
        $categoryPrefs = $profile->category_preferences ?? [];
        arsort($categoryPrefs);
        $topCategories = array_slice($categoryPrefs, 0, 5, true);
        
        for ($i = 0; $i < 5; $i++) {
            $vector[] = $topCategories[$i] ?? 0;
        }

        // Reading patterns (3 features)
        $patterns = $profile->reading_patterns ?? [];
        $vector[] = $this->extractReadingSpeedFeature($patterns);
        $vector[] = $this->extractTimePreferenceFeature($patterns);
        $vector[] = $this->extractConsistencyFeature($patterns);

        // Content type preferences (2 features)
        $contentPrefs = $profile->content_type_preferences ?? [];
        $vector[] = $this->extractLengthPreference($contentPrefs);
        $vector[] = $this->extractComplexityPreference($contentPrefs);

        return $vector;
    }

    
    
    
    
    /**

    
    
    
     * Handle extract reading speed feature.

    
    
    
     *

    
    
    
     * @param array $patterns The patterns.

    
    
    
     * @return float

    
    
    
     */
    
    
    
    
    
    
    
    private function extractReadingSpeedFeature(array $patterns): float
    {
        $speed = $patterns['reading_speed'] ?? 'medium';
        
        return match($speed) {
            'fast' => 1.0,
            'medium' => 0.5,
            'slow' => 0.0,
            default => 0.5
        };
    }

    
    
    
    
    /**

    
    
    
     * Handle extract time preference feature.

    
    
    
     *

    
    
    
     * @param array $patterns The patterns.

    
    
    
     * @return float

    
    
    
     */
    
    
    
    
    
    
    
    private function extractTimePreferenceFeature(array $patterns): float
    {
        $preferredHours = $patterns['preferred_hours'] ?? [];
        
        if (empty($preferredHours)) {
            return 0.5;
        }

        // Calculate average preferred hour normalized to [0, 1]
        $avgHour = array_sum($preferredHours) / count($preferredHours);
        return $avgHour / 24;
    }

    
    
    
    
    /**

    
    
    
     * Handle extract consistency feature.

    
    
    
     *

    
    
    
     * @param array $patterns The patterns.

    
    
    
     * @return float

    
    
    
     */
    
    
    
    
    
    
    
    private function extractConsistencyFeature(array $patterns): float
    {
        $sessionDuration = $patterns['avg_session_duration'] ?? 0;
        return min($sessionDuration / 1800, 1.0); // Normalized to 30 min
    }

    
    
    
    
    /**

    
    
    
     * Handle extract length preference.

    
    
    
     *

    
    
    
     * @param array $contentPrefs The contentPrefs.

    
    
    
     * @return float

    
    
    
     */
    
    
    
    
    
    
    
    private function extractLengthPreference(array $contentPrefs): float
    {
        $length = $contentPrefs['preferred_length'] ?? 'medium';
        
        return match($length) {
            'short' => 0.0,
            'medium' => 0.5,
            'long' => 1.0,
            default => 0.5
        };
    }

    
    
    
    
    /**

    
    
    
     * Handle extract complexity preference.

    
    
    
     *

    
    
    
     * @param array $contentPrefs The contentPrefs.

    
    
    
     * @return float

    
    
    
     */
    
    
    
    
    
    
    
    private function extractComplexityPreference(array $contentPrefs): float
    {
        $complexity = $contentPrefs['preferred_complexity'] ?? 'medium';
        
        return match($complexity) {
            'simple' => 0.0,
            'medium' => 0.5,
            'complex' => 1.0,
            default => 0.5
        };
    }

    
    
    
    
    /**

    
    
    
     * Handle normalize features.

    
    
    
     *

    
    
    
     * @param array $features The features.

    
    
    
     * @return array

    
    
    
     */
    
    
    
    
    
    
    
    private function normalizeFeatures(array $features): array
    {
        if (empty($features)) {
            return [];
        }

        $numFeatures = count($features[0]);
        $normalized = $features;

        // Calculate min and max for each feature
        for ($f = 0; $f < $numFeatures; $f++) {
            $values = array_column($features, $f);
            $min = min($values);
            $max = max($values);
            $range = $max - $min;

            // Normalize each value
            if ($range > 0) {
                for ($i = 0; $i < count($features); $i++) {
                    $normalized[$i][$f] = ($features[$i][$f] - $min) / $range;
                }
            }
        }

        return $normalized;
    }

    
    
    
    
    /**

    
    
    
     * Handle initialize centroids kmeans plus plus.

    
    
    
     *

    
    
    
     * @param array $features The features.

    
    
    
     * @param int $k The k.

    
    
    
     * @return array

    
    
    
     */
    
    
    
    
    
    
    
    private function initializeCentroidsKMeansPlusPlus(array $features, int $k): array
    {
        $vectors = $features['vectors'];
        $n = count($vectors);
        
        if ($n < $k) {
            throw MLTrainingException::clusteringFailed("Not enough data points for {$k} clusters");
        }

        $centroids = [];

        // Choose first centroid randomly
        $centroids[] = $vectors[array_rand($vectors)];

        // Choose remaining centroids
        for ($c = 1; $c < $k; $c++) {
            $distances = [];

            // Calculate distance to nearest centroid for each point
            foreach ($vectors as $i => $vector) {
                $minDist = PHP_FLOAT_MAX;
                
                foreach ($centroids as $centroid) {
                    $dist = $this->euclideanDistance($vector, $centroid);
                    $minDist = min($minDist, $dist);
                }
                
                $distances[$i] = $minDist * $minDist; // Squared distance
            }

            // Choose next centroid with probability proportional to distance squared
            $totalDist = array_sum($distances);
            $rand = mt_rand() / mt_getrandmax() * $totalDist;
            
            $cumulative = 0;
            foreach ($distances as $i => $dist) {
                $cumulative += $dist;
                if ($cumulative >= $rand) {
                    $centroids[] = $vectors[$i];
                    break;
                }
            }
        }

        return $centroids;
    }

    
    
    
    
    /**

    
    
    
     * Handle perform iterative clustering.

    
    
    
     *

    
    
    
     * @param array $features The features.

    
    
    
     * @param array $centroids The centroids.

    
    
    
     * @param int $k The k.

    
    
    
     * @return array

    
    
    
     */
    
    
    
    
    
    
    
    private function performIterativeClustering(array $features, array $centroids, int $k): array
    {
        $vectors = $features['vectors'];
        $assignments = [];
        $iteration = 0;
        $converged = false;

        for ($iteration = 0; $iteration < $this->maxIterations; $iteration++) {
            // Assignment step: assign each point to nearest centroid
            $newAssignments = $this->assignToClusters($vectors, $centroids);

            // Check for convergence
            if ($iteration > 0 && $this->hasConverged($assignments, $newAssignments)) {
                $converged = true;
                break;
            }

            $assignments = $newAssignments;

            // Update step: recalculate centroids
            $newCentroids = $this->updateCentroids($vectors, $assignments, $k);

            // Check centroid convergence
            if ($this->centroidsConverged($centroids, $newCentroids)) {
                $converged = true;
                break;
            }

            $centroids = $newCentroids;
        }

        return [
            'assignments' => $assignments,
            'centroids' => $centroids,
            'iterations' => $iteration + 1,
            'converged' => $converged
        ];
    }

    
    
    
    
    /**

    
    
    
     * Handle assign to clusters.

    
    
    
     *

    
    
    
     * @param array $vectors The vectors.

    
    
    
     * @param array $centroids The centroids.

    
    
    
     * @return array

    
    
    
     */
    
    
    
    
    
    
    
    private function assignToClusters(array $vectors, array $centroids): array
    {
        $assignments = [];

        foreach ($vectors as $i => $vector) {
            $minDist = PHP_FLOAT_MAX;
            $assignedCluster = 0;

            foreach ($centroids as $c => $centroid) {
                $dist = $this->euclideanDistance($vector, $centroid);
                
                if ($dist < $minDist) {
                    $minDist = $dist;
                    $assignedCluster = $c;
                }
            }

            $assignments[$i] = $assignedCluster;
        }

        return $assignments;
    }

    
    
    
    
    /**

    
    
    
     * Handle update centroids.

    
    
    
     *

    
    
    
     * @param array $vectors The vectors.

    
    
    
     * @param array $assignments The assignments.

    
    
    
     * @param int $k The k.

    
    
    
     * @return array

    
    
    
     */
    
    
    
    
    
    
    
    private function updateCentroids(array $vectors, array $assignments, int $k): array
    {
        $centroids = [];
        $numFeatures = count($vectors[0]);

        for ($c = 0; $c < $k; $c++) {
            // Find all vectors assigned to this cluster
            $clusterVectors = [];
            
            foreach ($assignments as $i => $cluster) {
                if ($cluster === $c) {
                    $clusterVectors[] = $vectors[$i];
                }
            }

            // Calculate mean of cluster vectors
            if (!empty($clusterVectors)) {
                $centroid = array_fill(0, $numFeatures, 0);
                
                foreach ($clusterVectors as $vector) {
                    for ($f = 0; $f < $numFeatures; $f++) {
                        $centroid[$f] += $vector[$f];
                    }
                }
                
                $count = count($clusterVectors);
                for ($f = 0; $f < $numFeatures; $f++) {
                    $centroid[$f] /= $count;
                }
                
                $centroids[] = $centroid;
            } else {
                // Empty cluster: reinitialize with random vector
                $centroids[] = $vectors[array_rand($vectors)];
            }
        }

        return $centroids;
    }

    
    
    
    
    /**

    
    
    
     * Determine whether converged.

    
    
    
     *

    
    
    
     * @param array $oldAssignments The oldAssignments.

    
    
    
     * @param array $newAssignments The newAssignments.

    
    
    
     * @return bool

    
    
    
     */
    
    
    
    
    
    
    
    private function hasConverged(array $oldAssignments, array $newAssignments): bool
    {
        if (empty($oldAssignments)) {
            return false;
        }

        $changes = 0;
        foreach ($oldAssignments as $i => $oldCluster) {
            if ($oldCluster !== $newAssignments[$i]) {
                $changes++;
            }
        }

        return $changes === 0;
    }

    
    
    
    
    /**

    
    
    
     * Handle centroids converged.

    
    
    
     *

    
    
    
     * @param array $oldCentroids The oldCentroids.

    
    
    
     * @param array $newCentroids The newCentroids.

    
    
    
     * @return bool

    
    
    
     */
    
    
    
    
    
    
    
    private function centroidsConverged(array $oldCentroids, array $newCentroids): bool
    {
        $maxShift = 0;

        foreach ($oldCentroids as $c => $oldCentroid) {
            $shift = $this->euclideanDistance($oldCentroid, $newCentroids[$c]);
            $maxShift = max($maxShift, $shift);
        }

        return $maxShift < $this->tolerance;
    }

    
    
    
    
    /**

    
    
    
     * Handle euclidean distance.

    
    
    
     *

    
    
    
     * @param array $a The a.

    
    
    
     * @param array $b The b.

    
    
    
     * @return float

    
    
    
     */
    
    
    
    
    
    
    
    private function euclideanDistance(array $a, array $b): float
    {
        $sum = 0;
        $n = count($a);

        for ($i = 0; $i < $n; $i++) {
            $diff = $a[$i] - $b[$i];
            $sum += $diff * $diff;
        }

        return sqrt($sum);
    }

    
    
    
    
    /**

    
    
    
     * Calculate cluster metrics.

    
    
    
     *

    
    
    
     * @param array $features The features.

    
    
    
     * @param array $assignments The assignments.

    
    
    
     * @param array $centroids The centroids.

    
    
    
     * @return array

    
    
    
     */
    
    
    
    
    
    
    
    private function calculateClusterMetrics(array $features, array $assignments, array $centroids): array
    {
        $vectors = $features['vectors'];
        
        return [
            'silhouette_score' => $this->calculateSilhouetteScore($vectors, $assignments, $centroids),
            'inertia' => $this->calculateInertia($vectors, $assignments, $centroids),
            'davies_bouldin_index' => $this->calculateDaviesBouldinIndex($vectors, $assignments, $centroids)
        ];
    }

    
    
    
    
    /**

    
    
    
     * Calculate silhouette score.

    
    
    
     *

    
    
    
     * @param array $vectors The vectors.

    
    
    
     * @param array $assignments The assignments.

    
    
    
     * @param array $centroids The centroids.

    
    
    
     * @return float

    
    
    
     */
    
    
    
    
    
    
    
    private function calculateSilhouetteScore(array $vectors, array $assignments, array $centroids): float
    {
        $n = count($vectors);
        if ($n <= 1) {
            return 0;
        }

        $silhouetteScores = [];

        foreach ($vectors as $i => $vector) {
            $cluster = $assignments[$i];

            // Calculate a(i): mean distance to points in same cluster
            $sameClusterDistances = [];
            foreach ($vectors as $j => $otherVector) {
                if ($i !== $j && $assignments[$j] === $cluster) {
                    $sameClusterDistances[] = $this->euclideanDistance($vector, $otherVector);
                }
            }
            $a = !empty($sameClusterDistances) ? array_sum($sameClusterDistances) / count($sameClusterDistances) : 0;

            // Calculate b(i): min mean distance to points in other clusters
            $b = PHP_FLOAT_MAX;
            foreach ($centroids as $c => $centroid) {
                if ($c !== $cluster) {
                    $otherClusterDistances = [];
                    foreach ($vectors as $j => $otherVector) {
                        if ($assignments[$j] === $c) {
                            $otherClusterDistances[] = $this->euclideanDistance($vector, $otherVector);
                        }
                    }
                    if (!empty($otherClusterDistances)) {
                        $meanDist = array_sum($otherClusterDistances) / count($otherClusterDistances);
                        $b = min($b, $meanDist);
                    }
                }
            }

            // Calculate silhouette score for this point
            if ($a < $b) {
                $silhouetteScores[] = 1 - ($a / $b);
            } elseif ($a > $b) {
                $silhouetteScores[] = ($b / $a) - 1;
            } else {
                $silhouetteScores[] = 0;
            }
        }

        return !empty($silhouetteScores) ? array_sum($silhouetteScores) / count($silhouetteScores) : 0;
    }

    
    
    
    
    /**

    
    
    
     * Calculate inertia.

    
    
    
     *

    
    
    
     * @param array $vectors The vectors.

    
    
    
     * @param array $assignments The assignments.

    
    
    
     * @param array $centroids The centroids.

    
    
    
     * @return float

    
    
    
     */
    
    
    
    
    
    
    
    private function calculateInertia(array $vectors, array $assignments, array $centroids): float
    {
        $inertia = 0;

        foreach ($vectors as $i => $vector) {
            $cluster = $assignments[$i];
            $centroid = $centroids[$cluster];
            $distance = $this->euclideanDistance($vector, $centroid);
            $inertia += $distance * $distance;
        }

        return $inertia;
    }

    
    
    
    
    /**

    
    
    
     * Calculate davies bouldin index.

    
    
    
     *

    
    
    
     * @param array $vectors The vectors.

    
    
    
     * @param array $assignments The assignments.

    
    
    
     * @param array $centroids The centroids.

    
    
    
     * @return float

    
    
    
     */
    
    
    
    
    
    
    
    private function calculateDaviesBouldinIndex(array $vectors, array $assignments, array $centroids): float
    {
        $k = count($centroids);
        $clusterScatters = [];

        // Calculate scatter for each cluster
        for ($c = 0; $c < $k; $c++) {
            $clusterVectors = [];
            foreach ($assignments as $i => $cluster) {
                if ($cluster === $c) {
                    $clusterVectors[] = $vectors[$i];
                }
            }

            if (!empty($clusterVectors)) {
                $scatter = 0;
                foreach ($clusterVectors as $vector) {
                    $scatter += $this->euclideanDistance($vector, $centroids[$c]);
                }
                $clusterScatters[$c] = $scatter / count($clusterVectors);
            } else {
                $clusterScatters[$c] = 0;
            }
        }

        // Calculate DB index
        $dbSum = 0;
        for ($i = 0; $i < $k; $i++) {
            $maxRatio = 0;
            for ($j = 0; $j < $k; $j++) {
                if ($i !== $j) {
                    $centroidDist = $this->euclideanDistance($centroids[$i], $centroids[$j]);
                    if ($centroidDist > 0) {
                        $ratio = ($clusterScatters[$i] + $clusterScatters[$j]) / $centroidDist;
                        $maxRatio = max($maxRatio, $ratio);
                    }
                }
            }
            $dbSum += $maxRatio;
        }

        return $k > 0 ? $dbSum / $k : 0;
    }

    
    
    
    
    /**

    
    
    
     * Calculate cluster sizes.

    
    
    
     *

    
    
    
     * @param array $assignments The assignments.

    
    
    
     * @param int $k The k.

    
    
    
     * @return array

    
    
    
     */
    
    
    
    
    
    
    
    private function calculateClusterSizes(array $assignments, int $k): array
    {
        $sizes = array_fill(0, $k, 0);

        foreach ($assignments as $cluster) {
            $sizes[$cluster]++;
        }

        return $sizes;
    }

    
    
    
    
    /**

    
    
    
     * Get cluster confidence.

    
    
    
     *

    
    
    
     * @param MLUserProfile $profile The profile.

    
    
    
     * @param array $centroids The centroids.

    
    
    
     * @return float

    
    
    
     */
    
    
    
    
    
    
    
    public function getClusterConfidence(MLUserProfile $profile, array $centroids): float
    {
        $vector = $this->profileToVector($profile);

        if (empty($vector) || empty($centroids)) {
            return 0.0;
        }

        $assignedCluster = $profile->user_cluster ?? 0;

        if (!isset($centroids[$assignedCluster])) {
            return 0.0;
        }

        // Calculate distance to assigned centroid
        $distToAssigned = $this->euclideanDistance($vector, $centroids[$assignedCluster]);

        // Calculate distance to nearest other centroid
        $minDistToOther = PHP_FLOAT_MAX;
        foreach ($centroids as $c => $centroid) {
            if ($c !== $assignedCluster) {
                $dist = $this->euclideanDistance($vector, $centroid);
                $minDistToOther = min($minDistToOther, $dist);
            }
        }

        // Confidence based on relative distances
        if ($minDistToOther > 0) {
            $confidence = 1 - ($distToAssigned / $minDistToOther);
            return max(0, min(1, $confidence));
        }

        return 0.5;
    }

    
    
    
    
    /**

    
    
    
     * Handle find optimal k.

    
    
    
     *

    
    
    
     * @param Collection $profiles The profiles.

    
    
    
     * @param int $minK The minK.

    
    
    
     * @param int $maxK The maxK.

    
    
    
     * @return array

    
    
    
     */
    
    
    
    
    
    
    
    public function findOptimalK(Collection $profiles, int $minK = 2, int $maxK = 10): array
    {
        $inertias = [];
        $silhouetteScores = [];

        for ($k = $minK; $k <= $maxK; $k++) {
            try {
                $result = $this->cluster($profiles, $k);
                $inertias[$k] = $result['metrics']['inertia'];
                $silhouetteScores[$k] = $result['metrics']['silhouette_score'];
            } catch (\Exception $e) {
                Log::warning("Failed to cluster with k={$k}", ['error' => $e->getMessage()]);
                continue;
            }
        }

        // Find elbow point
        $optimalK = $this->findElbowPoint($inertias);

        return [
            'optimal_k' => $optimalK,
            'inertias' => $inertias,
            'silhouette_scores' => $silhouetteScores,
            'recommendation' => $this->getKRecommendation($optimalK, $silhouetteScores)
        ];
    }

    
    
    
    
    /**

    
    
    
     * Handle find elbow point.

    
    
    
     *

    
    
    
     * @param array $inertias The inertias.

    
    
    
     * @return int

    
    
    
     */
    
    
    
    
    
    
    
    private function findElbowPoint(array $inertias): int
    {
        if (count($inertias) < 3) {
            return array_key_first($inertias);
        }

        $maxAngle = 0;
        $elbowK = array_key_first($inertias);

        $keys = array_keys($inertias);
        for ($i = 1; $i < count($keys) - 1; $i++) {
            $k = $keys[$i];
            $prevK = $keys[$i - 1];
            $nextK = $keys[$i + 1];

            // Calculate angle at this point
            $angle = $this->calculateAngle(
                [$prevK, $inertias[$prevK]],
                [$k, $inertias[$k]],
                [$nextK, $inertias[$nextK]]
            );

            if ($angle > $maxAngle) {
                $maxAngle = $angle;
                $elbowK = $k;
            }
        }

        return $elbowK;
    }

    
    
    
    
    /**

    
    
    
     * Calculate angle.

    
    
    
     *

    
    
    
     * @param array $p1 The p1.

    
    
    
     * @param array $p2 The p2.

    
    
    
     * @param array $p3 The p3.

    
    
    
     * @return float

    
    
    
     */
    
    
    
    
    
    
    
    private function calculateAngle(array $p1, array $p2, array $p3): float
    {
        $v1 = [$p1[0] - $p2[0], $p1[1] - $p2[1]];
        $v2 = [$p3[0] - $p2[0], $p3[1] - $p2[1]];

        $dot = $v1[0] * $v2[0] + $v1[1] * $v2[1];
        $mag1 = sqrt($v1[0] * $v1[0] + $v1[1] * $v1[1]);
        $mag2 = sqrt($v2[0] * $v2[0] + $v2[1] * $v2[1]);

        if ($mag1 * $mag2 == 0) {
            return 0;
        }

        $cosAngle = $dot / ($mag1 * $mag2);
        return acos(max(-1, min(1, $cosAngle)));
    }

    
    
    
    
    /**

    
    
    
     * Get krecommendation.

    
    
    
     *

    
    
    
     * @param int $optimalK The optimalK.

    
    
    
     * @param array $silhouetteScores The silhouetteScores.

    
    
    
     * @return string

    
    
    
     */
    
    
    
    
    
    
    
    private function getKRecommendation(int $optimalK, array $silhouetteScores): string
    {
        $score = $silhouetteScores[$optimalK] ?? 0;

        if ($score > 0.7) {
            return "Excellent clustering quality with k={$optimalK}";
        } elseif ($score > 0.5) {
            return "Good clustering quality with k={$optimalK}";
        } elseif ($score > 0.3) {
            return "Moderate clustering quality with k={$optimalK}. Consider adjusting k.";
        } else {
            return "Poor clustering quality with k={$optimalK}. Data may not have clear clusters.";
        }
    }
}

