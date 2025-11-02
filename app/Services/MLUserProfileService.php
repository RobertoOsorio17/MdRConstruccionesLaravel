<?php

namespace App\Services;

use App\Models\User;
use App\Models\MLUserProfile;
use App\Models\MLInteractionLog;
use App\Models\Post;
use App\Services\ML\KMeansClusteringService;
use App\Exceptions\ML\MLProfileUpdateException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

/**
 * Service for managing and updating ML user profiles based on interaction history.
 * Implements automatic profile updates, clustering, and preference learning.
 */
class MLUserProfileService
{
    private KMeansClusteringService $clusteringService;


    


    

    

    

    /**


    

    

    

     * Handle __construct.


    

    

    

     *


    

    

    

     * @param KMeansClusteringService $clusteringService The clusteringService.


    

    

    

     * @return void


    

    

    

     */

    

    

    

    

    

    

    

    public function __construct(KMeansClusteringService $clusteringService)
    {
        $this->clusteringService = $clusteringService;
    }
    
    
    
    
    /**

    
    
    
     * Handle update user profile.

    
    
    
     *

    
    
    
     * @param string $sessionId The sessionId.

    
    
    
     * @param int $userId The userId.

    
    
    
     * @return MLUserProfile

    
    
    
     */
    
    
    
    
    
    
    
    public function updateUserProfile(string $sessionId = null, int $userId = null): MLUserProfile
    {
        $profile = MLUserProfile::findByIdentifier($sessionId, $userId);
        
        if (!$profile) {
            $profile = MLUserProfile::create([
                'session_id' => $sessionId,
                'user_id' => $userId,
                'model_version' => '2.0'
            ]);
        }

        // Get recent interactions (last 90 days)
        $interactions = MLInteractionLog::where(function($query) use ($sessionId, $userId) {
            if ($userId) {
                $query->where('user_id', $userId);
            } else {
                $query->where('session_id', $sessionId);
            }
        })
        ->where('created_at', '>=', now()->subDays(90))
        ->with('post.categories', 'post.tags')
        ->get();

        if ($interactions->isEmpty()) {
            return $profile;
        }

        // Update reading patterns
        $profile->reading_patterns = $this->calculateReadingPatterns($interactions);
        
        // Update category preferences
        $profile->category_preferences = $this->calculateCategoryPreferences($interactions);
        
        // Update tag interests
        $profile->tag_interests = $this->calculateTagInterests($interactions);
        
        // Update content type preferences
        $profile->content_type_preferences = $this->calculateContentTypePreferences($interactions);
        
        // Update metrics
        $profile->avg_reading_time = $interactions->avg('time_spent_seconds') ?? 0;
        $profile->engagement_rate = $interactions->avg('engagement_score') ?? 0;
        $profile->total_posts_read = $interactions->where('interaction_type', 'view')->count();
        $profile->return_rate = $this->calculateReturnRate($interactions);

        // Update clustering using real K-Means if enough data
        try {
            $this->updateClusterAssignment($profile);
        } catch (\Exception $e) {
            Log::warning('Failed to update cluster assignment', [
                'profile_id' => $profile->id,
                'error' => $e->getMessage()
            ]);
            // Fallback to simple clustering
            $profile->user_cluster = $this->assignUserClusterSimple($profile);
            $profile->cluster_confidence = $this->calculateClusterConfidenceSimple($profile);
        }

        $profile->last_activity = now();
        $profile->profile_updated_at = now();
        $profile->save();

        return $profile;
    }

    
    
    
    
    /**

    
    
    
     * Calculate reading patterns.

    
    
    
     *

    
    
    
     * @param mixed $interactions The interactions.

    
    
    
     * @return array

    
    
    
     */
    
    
    
    
    
    
    
    private function calculateReadingPatterns($interactions): array
    {
        $patterns = [
            'preferred_hours' => [],
            'preferred_days' => [],
            'avg_session_duration' => 0,
            'reading_speed' => 'medium'
        ];

        // Analyze time of day preferences with weights
        $hourCounts = [];
        $totalInteractions = $interactions->count();

        foreach ($interactions as $interaction) {
            $hour = $interaction->created_at->hour;
            $hourCounts[$hour] = ($hourCounts[$hour] ?? 0) + 1;
        }

        // Convert to weighted preferences (0-1 scale)
        $hourWeights = [];
        foreach ($hourCounts as $hour => $count) {
            $hourWeights[$hour] = $count / $totalInteractions;
        }
        arsort($hourWeights);
        $patterns['preferred_hours'] = $hourWeights;

        // Analyze day of week preferences with weights
        $dayCounts = [];
        foreach ($interactions as $interaction) {
            $day = $interaction->created_at->dayOfWeek;
            $dayCounts[$day] = ($dayCounts[$day] ?? 0) + 1;
        }

        // Convert to weighted preferences (0-1 scale)
        $dayWeights = [];
        foreach ($dayCounts as $day => $count) {
            $dayWeights[$day] = $count / $totalInteractions;
        }
        arsort($dayWeights);
        $patterns['preferred_days'] = $dayWeights;

        // Calculate average session duration
        $patterns['avg_session_duration'] = $interactions->avg('time_spent_seconds') ?? 0;

        // Determine reading speed
        $avgTimePerPost = $patterns['avg_session_duration'];
        if ($avgTimePerPost < 120) {
            $patterns['reading_speed'] = 'fast';
        } elseif ($avgTimePerPost > 300) {
            $patterns['reading_speed'] = 'slow';
        } else {
            $patterns['reading_speed'] = 'medium';
        }

        // Calculate engagement by content length
        $patterns['engagement_by_length'] = [
            'short' => 0.5,  // Default neutral
            'medium' => 0.5,
            'long' => 0.5
        ];

        $lengthEngagement = ['short' => [], 'medium' => [], 'long' => []];
        foreach ($interactions as $interaction) {
            if ($interaction->post && $interaction->engagement_score) {
                $wordCount = str_word_count(strip_tags($interaction->post->content ?? ''));
                $length = $wordCount < 300 ? 'short' : ($wordCount < 800 ? 'medium' : 'long');
                $lengthEngagement[$length][] = $interaction->engagement_score;
            }
        }

        foreach ($lengthEngagement as $length => $scores) {
            if (!empty($scores)) {
                $patterns['engagement_by_length'][$length] = array_sum($scores) / count($scores) / 100;
            }
        }

        // Calculate average scroll depth
        $patterns['avg_scroll_depth'] = $interactions->avg('scroll_percentage') ?? 0;

        return $patterns;
    }

    
    
    
    
    /**

    
    
    
     * Calculate category preferences.

    
    
    
     *

    
    
    
     * @param mixed $interactions The interactions.

    
    
    
     * @return array

    
    
    
     */
    
    
    
    
    
    
    
    private function calculateCategoryPreferences($interactions): array
    {
        $categoryScores = [];

        foreach ($interactions as $interaction) {
            if (!$interaction->post) continue;

            $weight = $this->getInteractionWeight($interaction);
            
            foreach ($interaction->post->categories as $category) {
                $categoryId = $category->id;
                $categoryScores[$categoryId] = ($categoryScores[$categoryId] ?? 0) + $weight;
            }
        }

        // Normalize scores
        if (!empty($categoryScores)) {
            $maxScore = max($categoryScores) ?: 1;
            foreach ($categoryScores as $id => $score) {
                $categoryScores[$id] = $score / $maxScore;
            }
            arsort($categoryScores);
        }

        return $categoryScores;
    }

    
    
    
    
    /**

    
    
    
     * Calculate tag interests.

    
    
    
     *

    
    
    
     * @param mixed $interactions The interactions.

    
    
    
     * @return array

    
    
    
     */
    
    
    
    
    
    
    
    private function calculateTagInterests($interactions): array
    {
        $tagScores = [];

        foreach ($interactions as $interaction) {
            if (!$interaction->post) continue;

            $weight = $this->getInteractionWeight($interaction);
            
            foreach ($interaction->post->tags as $tag) {
                $tagId = $tag->id;
                $tagScores[$tagId] = ($tagScores[$tagId] ?? 0) + $weight;
            }
        }

        // Normalize scores
        if (!empty($tagScores)) {
            $maxScore = max($tagScores) ?: 1;
            foreach ($tagScores as $id => $score) {
                $tagScores[$id] = $score / $maxScore;
            }
            arsort($tagScores);
        }

        return $tagScores;
    }

    
    
    
    
    /**

    
    
    
     * Calculate content type preferences.

    
    
    
     *

    
    
    
     * @param mixed $interactions The interactions.

    
    
    
     * @return array

    
    
    
     */
    
    
    
    
    
    
    
    private function calculateContentTypePreferences($interactions): array
    {
        $preferences = [
            'preferred_length' => 'medium',
            'preferred_complexity' => 'medium',
            'prefers_images' => false,
            'prefers_videos' => false
        ];

        $lengths = [];
        foreach ($interactions as $interaction) {
            if (!$interaction->post) continue;
            
            $contentLength = strlen(strip_tags($interaction->post->content ?? ''));
            $lengths[] = $contentLength;
        }

        if (!empty($lengths)) {
            $avgLength = array_sum($lengths) / count($lengths);
            
            if ($avgLength < 1000) {
                $preferences['preferred_length'] = 'short';
            } elseif ($avgLength > 3000) {
                $preferences['preferred_length'] = 'long';
            } else {
                $preferences['preferred_length'] = 'medium';
            }
        }

        return $preferences;
    }

    
    
    
    
    /**

    
    
    
     * Calculate return rate.

    
    
    
     *

    
    
    
     * @param mixed $interactions The interactions.

    
    
    
     * @return float

    
    
    
     */
    
    
    
    
    
    
    
    private function calculateReturnRate($interactions): float
    {
        if ($interactions->count() < 2) {
            return 0.0;
        }

        $dates = $interactions->pluck('created_at')->map(fn($date) => $date->format('Y-m-d'))->unique();
        $totalDays = now()->diffInDays($interactions->min('created_at'));
        
        if ($totalDays == 0) {
            return 1.0;
        }

        return min($dates->count() / $totalDays, 1.0);
    }

    
    
    
    
    /**

    
    
    
     * Get interaction weight.

    
    
    
     *

    
    
    
     * @param mixed $interaction The interaction.

    
    
    
     * @return float

    
    
    
     */
    
    
    
    
    
    
    
    private function getInteractionWeight($interaction): float
    {
        $weights = [
            'view' => 1.0,
            'like' => 2.0,
            'bookmark' => 2.5,
            'share' => 3.0,
            'comment' => 3.5,
            'recommendation_click' => 1.5
        ];

        $baseWeight = $weights[$interaction->interaction_type] ?? 1.0;
        
        // Boost weight for completed reading
        if ($interaction->completed_reading) {
            $baseWeight *= 1.5;
        }

        // Boost weight for high engagement
        if ($interaction->engagement_score > 0.7) {
            $baseWeight *= 1.3;
        }

        return $baseWeight;
    }

    
    
    
    
    /**

    
    
    
     * Handle update cluster assignment.

    
    
    
     *

    
    
    
     * @param MLUserProfile $profile The profile.

    
    
    
     * @return void

    
    
    
     */
    
    
    
    
    
    
    
    private function updateClusterAssignment(MLUserProfile $profile): void
    {
        // Get cached centroids from last clustering run
        $centroids = Cache::get('ml_cluster_centroids');

        if (!$centroids) {
            // No centroids available, use simple assignment
            $profile->user_cluster = $this->assignUserClusterSimple($profile);
            $profile->cluster_confidence = $this->calculateClusterConfidenceSimple($profile);
            return;
        }

        // Assign to nearest centroid
        $vector = $this->clusteringService->profileToVector($profile);
        $minDist = PHP_FLOAT_MAX;
        $assignedCluster = 0;

        foreach ($centroids as $c => $centroid) {
            $dist = $this->euclideanDistance($vector, $centroid);
            if ($dist < $minDist) {
                $minDist = $dist;
                $assignedCluster = $c;
            }
        }

        $profile->user_cluster = $assignedCluster;
        $profile->cluster_confidence = $this->clusteringService->getClusterConfidence($profile, $centroids);
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
        $n = min(count($a), count($b));

        for ($i = 0; $i < $n; $i++) {
            $diff = $a[$i] - $b[$i];
            $sum += $diff * $diff;
        }

        return sqrt($sum);
    }

    
    
    
    
    /**

    
    
    
     * Handle assign user cluster simple.

    
    
    
     *

    
    
    
     * @param MLUserProfile $profile The profile.

    
    
    
     * @return int

    
    
    
     */
    
    
    
    
    
    
    
    private function assignUserClusterSimple(MLUserProfile $profile): int
    {
        // Simplified clustering based on engagement patterns
        $engagementRate = $profile->engagement_rate ?? 0;
        $returnRate = $profile->return_rate ?? 0;
        $totalPosts = $profile->total_posts_read ?? 0;

        // Define 5 clusters
        if ($engagementRate > 0.7 && $returnRate > 0.5) {
            return 0; // Power users
        } elseif ($engagementRate > 0.4 && $totalPosts > 10) {
            return 1; // Regular engaged users
        } elseif ($returnRate > 0.3) {
            return 2; // Casual returners
        } elseif ($totalPosts > 5) {
            return 3; // Explorers
        } else {
            return 4; // New/inactive users
        }
    }

    
    
    
    
    /**

    
    
    
     * Calculate cluster confidence simple.

    
    
    
     *

    
    
    
     * @param MLUserProfile $profile The profile.

    
    
    
     * @return float

    
    
    
     */
    
    
    
    
    
    
    
    private function calculateClusterConfidenceSimple(MLUserProfile $profile): float
    {
        $totalInteractions = $profile->total_posts_read ?? 0;

        // More interactions = higher confidence
        if ($totalInteractions > 50) {
            return 0.9;
        } elseif ($totalInteractions > 20) {
            return 0.7;
        } elseif ($totalInteractions > 5) {
            return 0.5;
        } else {
            return 0.3;
        }
    }

    
    
    
    
    /**

    
    
    
     * Handle update all profiles.

    
    
    
     *

    
    
    
     * @return int

    
    
    
     */
    
    
    
    
    
    
    
    public function updateAllProfiles(): int
    {
        $profiles = MLUserProfile::where('profile_updated_at', '<', now()->subHours(24))
            ->orWhereNull('profile_updated_at')
            ->get();

        $count = 0;
        foreach ($profiles as $profile) {
            $this->updateUserProfile($profile->session_id, $profile->user_id);
            $count++;
        }

        return $count;
    }

    
    
    
    
    /**

    
    
    
     * Get similar users.

    
    
    
     *

    
    
    
     * @param MLUserProfile $profile The profile.

    
    
    
     * @param int $limit The limit.

    
    
    
     * @return array

    
    
    
     */
    
    
    
    
    
    
    
    public function getSimilarUsers(MLUserProfile $profile, int $limit = 10): array
    {
        return MLUserProfile::where('user_cluster', $profile->user_cluster)
            ->where('id', '!=', $profile->id)
            ->where('cluster_confidence', '>', 0.5)
            ->orderBy('cluster_confidence', 'desc')
            ->limit($limit)
            ->get()
            ->toArray();
    }
}

