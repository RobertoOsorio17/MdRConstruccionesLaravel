<?php

namespace App\Services\ML;

use App\Models\Post;
use App\Models\MLUserProfile;
use App\Models\MLInteractionLog;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;

/**
 * Advanced feature engineering service for ML models.
 * Extracts and transforms features from posts and user interactions.
 */
class FeatureEngineeringService
{
    /**
     * Extract comprehensive features from a post.
     */
    public function extractPostFeatures(Post $post): array
    {
        return [
            // Content features
            'content_length' => $this->calculateContentLength($post),
            'word_count' => $this->calculateWordCount($post),
            'avg_word_length' => $this->calculateAvgWordLength($post),
            'sentence_count' => $this->calculateSentenceCount($post),
            'avg_sentence_length' => $this->calculateAvgSentenceLength($post),
            'paragraph_count' => $this->calculateParagraphCount($post),
            
            // Readability features
            'readability_score' => $this->calculateReadabilityScore($post),
            'complexity_score' => $this->calculateComplexityScore($post),
            'technical_density' => $this->calculateTechnicalDensity($post),
            
            // Structural features
            'has_images' => $this->hasImages($post),
            'image_count' => $this->countImages($post),
            'has_videos' => $this->hasVideos($post),
            'has_code_blocks' => $this->hasCodeBlocks($post),
            'has_lists' => $this->hasLists($post),
            'has_tables' => $this->hasTables($post),
            'heading_count' => $this->countHeadings($post),
            
            // Metadata features (using actual columns)
            'author_id' => $post->user_id, // posts table uses user_id, not author_id
            'is_featured' => $post->featured ? 1 : 0, // posts table uses 'featured', not 'is_featured'

            // Temporal features
            'days_since_published' => $this->daysSincePublished($post),
            'publish_hour' => $this->getPublishHour($post),
            'publish_day_of_week' => $this->getPublishDayOfWeek($post),
            'is_weekend' => $this->isWeekend($post),

            // Engagement features (using actual columns)
            'view_count' => $post->views_count ?? 0, // posts table uses 'views_count'
            'like_count' => $post->likes_count ?? 0,
            'comment_count' => $post->comments_count ?? 0,
            'bookmark_count' => $post->bookmarks_count ?? 0,
            
            // Engagement rates
            'engagement_rate' => $this->calculateEngagementRate($post),
            'ctr' => $this->calculateCTR($post),
            'avg_time_on_page' => $this->calculateAvgTimeOnPage($post),
            
            // Freshness features
            'freshness_score' => $this->calculateFreshnessScore($post),
            'trending_score' => $this->calculateTrendingScore($post),
            
            // Quality indicators
            'quality_score' => $this->calculateQualityScore($post),
            'authority_score' => $this->calculateAuthorityScore($post)
        ];
    }

    /**
     * Extract user-post interaction features.
     */
    public function extractInteractionFeatures(MLUserProfile $profile, Post $post): array
    {
        $categoryPrefs = $profile->category_preferences ?? [];
        // Posts don't have direct category_id, use tags instead
        $postTags = $post->tags->pluck('id')->toArray();
        $tagAffinity = 0;
        foreach ($postTags as $tagId) {
            $tagAffinity += $categoryPrefs[$tagId] ?? 0;
        }
        $tagAffinity = count($postTags) > 0 ? $tagAffinity / count($postTags) : 0;

        return [
            // Tag affinity (instead of category)
            'category_affinity' => $tagAffinity,
            'category_rank' => 0, // Deprecated - posts don't have categories

            // Author affinity
            'author_affinity' => $this->calculateAuthorAffinity($profile, $post->user_id),
            
            // Content type match
            'length_match' => $this->calculateLengthMatch($profile, $post),
            'complexity_match' => $this->calculateComplexityMatch($profile, $post),
            
            // Temporal match
            'time_match' => $this->calculateTimeMatch($profile, $post),
            
            // Recency features
            'days_since_last_similar' => $this->daysSinceLastSimilar($profile, $post),
            
            // Diversity features
            'category_diversity' => $this->calculateCategoryDiversity($profile),
            'exploration_score' => $this->calculateExplorationScore($profile, $post)
        ];
    }

    /**
     * Calculate content length in characters.
     */
    private function calculateContentLength(Post $post): int
    {
        return mb_strlen(strip_tags($post->content ?? ''));
    }

    /**
     * Calculate word count.
     */
    private function calculateWordCount(Post $post): int
    {
        $text = strip_tags($post->content ?? '');
        return str_word_count($text);
    }

    /**
     * Calculate average word length.
     */
    private function calculateAvgWordLength(Post $post): float
    {
        $text = strip_tags($post->content ?? '');
        $words = str_word_count($text, 1);
        
        if (empty($words)) {
            return 0;
        }

        $totalLength = array_sum(array_map('mb_strlen', $words));
        return $totalLength / count($words);
    }

    /**
     * Calculate sentence count.
     */
    private function calculateSentenceCount(Post $post): int
    {
        $text = strip_tags($post->content ?? '');
        return preg_match_all('/[.!?]+/', $text);
    }

    /**
     * Calculate average sentence length.
     */
    private function calculateAvgSentenceLength(Post $post): float
    {
        $wordCount = $this->calculateWordCount($post);
        $sentenceCount = $this->calculateSentenceCount($post);
        
        return $sentenceCount > 0 ? $wordCount / $sentenceCount : 0;
    }

    /**
     * Calculate paragraph count.
     */
    private function calculateParagraphCount(Post $post): int
    {
        $content = $post->content ?? '';
        return preg_match_all('/<p[^>]*>/', $content) ?: substr_count($content, "\n\n") + 1;
    }

    /**
     * Calculate readability score (Flesch Reading Ease adapted for Spanish).
     */
    private function calculateReadabilityScore(Post $post): float
    {
        $wordCount = $this->calculateWordCount($post);
        $sentenceCount = $this->calculateSentenceCount($post);
        $syllableCount = $this->estimateSyllableCount($post);

        if ($wordCount === 0 || $sentenceCount === 0) {
            return 0;
        }

        $avgWordsPerSentence = $wordCount / $sentenceCount;
        $avgSyllablesPerWord = $syllableCount / $wordCount;

        // Adapted Flesch formula for Spanish
        $score = 206.835 - (1.015 * $avgWordsPerSentence) - (60 * $avgSyllablesPerWord);
        
        return max(0, min(100, $score));
    }

    /**
     * Estimate syllable count (simplified for Spanish).
     */
    private function estimateSyllableCount(Post $post): int
    {
        $text = mb_strtolower(strip_tags($post->content ?? ''));
        
        // Count vowels as approximation of syllables
        $vowels = ['a', 'e', 'i', 'o', 'u', 'á', 'é', 'í', 'ó', 'ú'];
        $count = 0;
        
        foreach ($vowels as $vowel) {
            $count += mb_substr_count($text, $vowel);
        }
        
        return $count;
    }

    /**
     * Calculate complexity score based on vocabulary richness.
     */
    private function calculateComplexityScore(Post $post): float
    {
        $text = strip_tags($post->content ?? '');
        $words = str_word_count(mb_strtolower($text), 1);
        
        if (empty($words)) {
            return 0;
        }

        $uniqueWords = count(array_unique($words));
        $totalWords = count($words);
        
        // Type-Token Ratio (TTR)
        $ttr = $uniqueWords / $totalWords;
        
        // Normalize to 0-1 scale
        return min(1, $ttr * 2);
    }

    /**
     * Calculate technical density (presence of technical terms).
     */
    private function calculateTechnicalDensity(Post $post): float
    {
        $text = mb_strtolower(strip_tags($post->content ?? ''));
        
        // Technical indicators for construction domain
        $technicalTerms = [
            'construcción', 'estructura', 'cimentación', 'hormigón', 'acero',
            'arquitectura', 'ingeniería', 'proyecto', 'diseño', 'cálculo',
            'normativa', 'seguridad', 'materiales', 'resistencia', 'carga',
            'plano', 'especificación', 'técnico', 'profesional', 'certificación'
        ];
        
        $count = 0;
        foreach ($technicalTerms as $term) {
            $count += mb_substr_count($text, $term);
        }
        
        $wordCount = $this->calculateWordCount($post);
        return $wordCount > 0 ? min(1, $count / ($wordCount * 0.1)) : 0;
    }

    /**
     * Check if post has images.
     */
    private function hasImages(Post $post): int
    {
        return preg_match('/<img[^>]+>/', $post->content ?? '') ? 1 : 0;
    }

    /**
     * Count images in post.
     */
    private function countImages(Post $post): int
    {
        return preg_match_all('/<img[^>]+>/', $post->content ?? '');
    }

    /**
     * Check if post has videos.
     */
    private function hasVideos(Post $post): int
    {
        $content = $post->content ?? '';
        return (preg_match('/<video[^>]+>/', $content) || 
                preg_match('/youtube\.com|vimeo\.com/', $content)) ? 1 : 0;
    }

    /**
     * Check if post has code blocks.
     */
    private function hasCodeBlocks(Post $post): int
    {
        return preg_match('/<code[^>]*>|<pre[^>]*>/', $post->content ?? '') ? 1 : 0;
    }

    /**
     * Check if post has lists.
     */
    private function hasLists(Post $post): int
    {
        return preg_match('/<ul[^>]*>|<ol[^>]*>/', $post->content ?? '') ? 1 : 0;
    }

    /**
     * Check if post has tables.
     */
    private function hasTables(Post $post): int
    {
        return preg_match('/<table[^>]*>/', $post->content ?? '') ? 1 : 0;
    }

    /**
     * Count headings in post.
     */
    private function countHeadings(Post $post): int
    {
        return preg_match_all('/<h[1-6][^>]*>/', $post->content ?? '');
    }

    /**
     * Calculate days since published.
     */
    private function daysSincePublished(Post $post): int
    {
        return $post->published_at ? now()->diffInDays($post->published_at) : 0;
    }

    /**
     * Get publish hour (0-23).
     */
    private function getPublishHour(Post $post): int
    {
        return $post->published_at ? (int)$post->published_at->format('H') : 0;
    }

    /**
     * Get publish day of week (0-6, 0 = Sunday).
     */
    private function getPublishDayOfWeek(Post $post): int
    {
        return $post->published_at ? (int)$post->published_at->format('w') : 0;
    }

    /**
     * Check if published on weekend.
     */
    private function isWeekend(Post $post): int
    {
        $day = $this->getPublishDayOfWeek($post);
        return ($day === 0 || $day === 6) ? 1 : 0;
    }

    /**
     * Calculate engagement rate.
     */
    private function calculateEngagementRate(Post $post): float
    {
        $views = $post->view_count ?? 0;
        if ($views === 0) {
            return 0;
        }

        $engagements = ($post->likes_count ?? 0) +
                      ($post->comments_count ?? 0) +
                      ($post->bookmarks_count ?? 0);

        return $engagements / $views;
    }

    /**
     * Calculate click-through rate.
     */
    private function calculateCTR(Post $post): float
    {
        $impressions = Cache::get("post_{$post->id}_impressions", 0);
        $clicks = $post->view_count ?? 0;

        return $impressions > 0 ? $clicks / $impressions : 0;
    }

    /**
     * Calculate average time on page.
     */
    private function calculateAvgTimeOnPage(Post $post): float
    {
        return MLInteractionLog::where('post_id', $post->id)
            ->where('interaction_type', 'view')
            ->whereNotNull('time_spent_seconds')
            ->avg('time_spent_seconds') ?? 0;
    }

    /**
     * Calculate freshness score (decays over time).
     */
    private function calculateFreshnessScore(Post $post): float
    {
        $days = $this->daysSincePublished($post);

        // Exponential decay: score = e^(-days/30)
        return exp(-$days / 30);
    }

    /**
     * Calculate trending score (recent engagement velocity).
     */
    private function calculateTrendingScore(Post $post): float
    {
        $recentEngagements = MLInteractionLog::where('post_id', $post->id)
            ->where('created_at', '>', now()->subDays(7))
            ->count();

        $totalEngagements = MLInteractionLog::where('post_id', $post->id)->count();

        return $totalEngagements > 0 ? $recentEngagements / $totalEngagements : 0;
    }

    /**
     * Calculate quality score based on multiple factors.
     */
    private function calculateQualityScore(Post $post): float
    {
        $factors = [
            'content_length' => min(1, $this->calculateContentLength($post) / 2000),
            'readability' => $this->calculateReadabilityScore($post) / 100,
            'structure' => $this->calculateStructureScore($post),
            'engagement' => min(1, $this->calculateEngagementRate($post) * 10)
        ];

        return array_sum($factors) / count($factors);
    }

    /**
     * Calculate structure score.
     */
    private function calculateStructureScore(Post $post): float
    {
        $score = 0;
        $maxScore = 6;

        if ($this->hasImages($post)) $score++;
        if ($this->hasLists($post)) $score++;
        if ($this->countHeadings($post) > 0) $score++;
        if ($this->calculateParagraphCount($post) > 3) $score++;
        if ($this->calculateWordCount($post) > 500) $score++;
        if ($this->calculateWordCount($post) < 3000) $score++;

        return $score / $maxScore;
    }

    /**
     * Calculate authority score based on author reputation.
     */
    private function calculateAuthorityScore(Post $post): float
    {
        $authorPosts = Cache::remember(
            "author_{$post->user_id}_stats",
            3600,
            function() use ($post) {
                return Post::where('user_id', $post->user_id)
                    ->where('status', 'published')
                    ->get();
            }
        );

        if ($authorPosts->isEmpty()) {
            return 0.5;
        }

        $avgEngagement = $authorPosts->avg(function($p) {
            return $this->calculateEngagementRate($p);
        });

        return min(1, $avgEngagement * 10);
    }

    /**
     * Get category rank in user preferences.
     */
    private function getCategoryRank(array $categoryPrefs, int $categoryId): int
    {
        arsort($categoryPrefs);
        $rank = 1;

        foreach ($categoryPrefs as $catId => $score) {
            if ($catId == $categoryId) {
                return $rank;
            }
            $rank++;
        }

        return count($categoryPrefs) + 1;
    }

    /**
     * Calculate author affinity.
     */
    private function calculateAuthorAffinity(MLUserProfile $profile, int $authorId): float
    {
        $interactions = MLInteractionLog::where('session_id', $profile->session_id)
            ->whereHas('post', function($query) use ($authorId) {
                $query->where('user_id', $authorId);
            })
            ->count();

        $totalInteractions = $profile->total_posts_read ?? 1;

        return $interactions / $totalInteractions;
    }

    /**
     * Calculate length preference match.
     */
    private function calculateLengthMatch(MLUserProfile $profile, Post $post): float
    {
        $contentPrefs = $profile->content_type_preferences ?? [];
        $preferredLength = $contentPrefs['preferred_length'] ?? 'medium';

        $postLength = $this->calculateWordCount($post);

        $match = match($preferredLength) {
            'short' => $postLength < 500 ? 1.0 : 0.5,
            'medium' => ($postLength >= 500 && $postLength <= 1500) ? 1.0 : 0.5,
            'long' => $postLength > 1500 ? 1.0 : 0.5,
            default => 0.5
        };

        return $match;
    }

    /**
     * Calculate complexity preference match.
     */
    private function calculateComplexityMatch(MLUserProfile $profile, Post $post): float
    {
        $contentPrefs = $profile->content_type_preferences ?? [];
        $preferredComplexity = $contentPrefs['preferred_complexity'] ?? 'medium';

        $postComplexity = $this->calculateComplexityScore($post);

        $match = match($preferredComplexity) {
            'simple' => $postComplexity < 0.4 ? 1.0 : 0.5,
            'medium' => ($postComplexity >= 0.4 && $postComplexity <= 0.7) ? 1.0 : 0.5,
            'complex' => $postComplexity > 0.7 ? 1.0 : 0.5,
            default => 0.5
        };

        return $match;
    }

    /**
     * Calculate time preference match.
     */
    private function calculateTimeMatch(MLUserProfile $profile, Post $post): float
    {
        $patterns = $profile->reading_patterns ?? [];
        $preferredHours = $patterns['preferred_hours'] ?? [];

        if (empty($preferredHours)) {
            return 0.5;
        }

        $currentHour = (int)now()->format('H');

        return in_array($currentHour, $preferredHours) ? 1.0 : 0.3;
    }

    /**
     * Calculate days since last similar post interaction.
     */
    private function daysSinceLastSimilar(MLUserProfile $profile, Post $post): int
    {
        // Posts don't have category_id, use tags instead
        $postTags = $post->tags->pluck('id')->toArray();
        if (empty($postTags)) {
            return 999;
        }

        $lastInteraction = MLInteractionLog::where('session_id', $profile->session_id)
            ->whereHas('post.tags', function($query) use ($postTags) {
                $query->whereIn('tags.id', $postTags);
            })
            ->latest()
            ->first();

        return $lastInteraction ? now()->diffInDays($lastInteraction->created_at) : 999;
    }

    /**
     * Calculate category diversity in user's history.
     */
    private function calculateCategoryDiversity(MLUserProfile $profile): float
    {
        $categoryPrefs = $profile->category_preferences ?? [];

        if (empty($categoryPrefs)) {
            return 0;
        }

        // Calculate Shannon entropy
        $total = array_sum($categoryPrefs);
        $entropy = 0;

        foreach ($categoryPrefs as $count) {
            if ($count > 0) {
                $p = $count / $total;
                $entropy -= $p * log($p);
            }
        }

        // Normalize by max entropy
        $maxEntropy = log(count($categoryPrefs));

        return $maxEntropy > 0 ? $entropy / $maxEntropy : 0;
    }

    /**
     * Calculate exploration score (tendency to try new categories).
     */
    private function calculateExplorationScore(MLUserProfile $profile, Post $post): float
    {
        $categoryPrefs = $profile->category_preferences ?? [];
        $postTags = $post->tags->pluck('id')->toArray();

        if (empty($postTags)) {
            return 0.5; // Neutral score for posts without tags
        }

        // Check if user has interacted with any of these tags
        $hasInteracted = false;
        foreach ($postTags as $tagId) {
            if (isset($categoryPrefs[$tagId]) && $categoryPrefs[$tagId] > 0) {
                $hasInteracted = true;
                break;
            }
        }

        // If never interacted with these tags, high exploration
        if (!$hasInteracted) {
            return 1.0;
        }

        // Calculate how much user explores vs exploits
        $diversity = $this->calculateCategoryDiversity($profile);

        return $diversity;
    }

    /**
     * Normalize features to [0, 1] range.
     */
    public function normalizeFeatures(array $features, array $stats): array
    {
        $normalized = [];

        foreach ($features as $key => $value) {
            if (isset($stats[$key])) {
                $min = $stats[$key]['min'];
                $max = $stats[$key]['max'];
                $range = $max - $min;

                $normalized[$key] = $range > 0 ? ($value - $min) / $range : 0;
            } else {
                $normalized[$key] = $value;
            }
        }

        return $normalized;
    }

    /**
     * Calculate feature statistics from dataset.
     */
    public function calculateFeatureStats(array $featureSet): array
    {
        $stats = [];

        if (empty($featureSet)) {
            return $stats;
        }

        $keys = array_keys($featureSet[0]);

        foreach ($keys as $key) {
            $values = array_column($featureSet, $key);

            $stats[$key] = [
                'min' => min($values),
                'max' => max($values),
                'mean' => array_sum($values) / count($values),
                'std' => $this->calculateStdDev($values)
            ];
        }

        return $stats;
    }

    /**
     * Calculate standard deviation.
     */
    private function calculateStdDev(array $values): float
    {
        $mean = array_sum($values) / count($values);
        $variance = array_sum(array_map(fn($v) => ($v - $mean) ** 2, $values)) / count($values);

        return sqrt($variance);
    }
}


