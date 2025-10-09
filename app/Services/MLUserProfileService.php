<?php

namespace App\Services;

use App\Models\User;
use App\Models\MLUserProfile;
use App\Models\MLInteractionLog;
use App\Models\Post;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;

/**
 * Service for managing and updating ML user profiles based on interaction history.
 * Implements automatic profile updates, clustering, and preference learning.
 */
class MLUserProfileService
{
    /**
     * Update or create user profile based on recent interactions.
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
        
        // Update clustering (simplified)
        $profile->user_cluster = $this->assignUserCluster($profile);
        $profile->cluster_confidence = $this->calculateClusterConfidence($profile);
        
        $profile->last_activity = now();
        $profile->profile_updated_at = now();
        $profile->save();

        return $profile;
    }

    /**
     * Calculate reading patterns (time of day, day of week preferences).
     */
    private function calculateReadingPatterns($interactions): array
    {
        $patterns = [
            'preferred_hours' => [],
            'preferred_days' => [],
            'avg_session_duration' => 0,
            'reading_speed' => 'medium'
        ];

        // Analyze time of day preferences
        $hourCounts = [];
        foreach ($interactions as $interaction) {
            $hour = $interaction->created_at->hour;
            $hourCounts[$hour] = ($hourCounts[$hour] ?? 0) + 1;
        }
        
        arsort($hourCounts);
        $patterns['preferred_hours'] = array_slice(array_keys($hourCounts), 0, 3);

        // Analyze day of week preferences
        $dayCounts = [];
        foreach ($interactions as $interaction) {
            $day = $interaction->created_at->dayOfWeek;
            $dayCounts[$day] = ($dayCounts[$day] ?? 0) + 1;
        }
        
        arsort($dayCounts);
        $patterns['preferred_days'] = array_slice(array_keys($dayCounts), 0, 3);

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

        return $patterns;
    }

    /**
     * Calculate category preferences with weighted scores.
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
        $maxScore = max($categoryScores) ?: 1;
        foreach ($categoryScores as $id => $score) {
            $categoryScores[$id] = $score / $maxScore;
        }

        arsort($categoryScores);
        return $categoryScores;
    }

    /**
     * Calculate tag interests with weighted scores.
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
        $maxScore = max($tagScores) ?: 1;
        foreach ($tagScores as $id => $score) {
            $tagScores[$id] = $score / $maxScore;
        }

        arsort($tagScores);
        return $tagScores;
    }

    /**
     * Calculate content type preferences (length, complexity).
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
     * Calculate return rate (how often user comes back).
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
     * Get interaction weight based on type.
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
     * Assign user to a cluster using simple k-means-like approach.
     */
    private function assignUserCluster(MLUserProfile $profile): int
    {
        // Simplified clustering based on engagement patterns
        $engagementRate = $profile->engagement_rate ?? 0;
        $returnRate = $profile->return_rate ?? 0;
        $totalPosts = $profile->total_posts_read ?? 0;

        // Define 5 clusters
        if ($engagementRate > 0.7 && $returnRate > 0.5) {
            return 1; // Power users
        } elseif ($engagementRate > 0.4 && $totalPosts > 10) {
            return 2; // Regular engaged users
        } elseif ($returnRate > 0.3) {
            return 3; // Casual returners
        } elseif ($totalPosts > 5) {
            return 4; // Explorers
        } else {
            return 5; // New/inactive users
        }
    }

    /**
     * Calculate confidence in cluster assignment.
     */
    private function calculateClusterConfidence(MLUserProfile $profile): float
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
     * Batch update all user profiles that need refresh.
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
     * Get similar users based on cluster and preferences.
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

