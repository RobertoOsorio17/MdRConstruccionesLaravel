<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Aggregates behavioural signals into a machine-learning user profile used for personalized recommendations.
 * Tracks category affinities, tag interests, and engagement metrics for both guests and authenticated users.
 */
class MLUserProfile extends Model
{
    use HasFactory;

    protected $table = 'ml_user_profiles';

    protected $fillable = [
        'session_id',
        'user_id',
        'reading_patterns',
        'category_preferences',
        'tag_interests',
        'content_type_preferences',
        'avg_reading_time',
        'engagement_rate',
        'total_posts_read',
        'return_rate',
        'user_cluster', // ✅ Validated: 0-4 range
        'cluster_confidence',
        'last_activity',
        'profile_updated_at',
        'model_version'
    ];

    /**
     * ✅ FIXED: Validate user_cluster range (0-4)
     */
    protected static function boot()
    {
        parent::boot();

        static::saving(function ($model) {
            if ($model->user_cluster !== null) {
                // Clamp cluster value between 0 and 4
                $model->user_cluster = max(0, min(4, $model->user_cluster));
            }
        });
    }

    protected $casts = [
        'reading_patterns' => 'array',
        'category_preferences' => 'array',
        'tag_interests' => 'array',
        'content_type_preferences' => 'array',
        'avg_reading_time' => 'float',
        'engagement_rate' => 'float',
        'return_rate' => 'float',
        'cluster_confidence' => 'float',
        'last_activity' => 'datetime',
        'profile_updated_at' => 'datetime'
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Locate the profile using either session ID or user ID
     */
    public static function findByIdentifier(string $sessionId = null, int $userId = null): ?self
    {
        $query = self::query();
        
        if ($userId) {
            $query->where('user_id', $userId);
        } elseif ($sessionId) {
            $query->where('session_id', $sessionId);
        } else {
            return null;
        }

        return $query->first();
    }

    /**
     * Update category preferences based on interactions
     */
    public function updateCategoryPreferences(array $categoryInteractions): void
    {
        // ✅ FIXED: Wrap in transaction for atomicity
        \DB::transaction(function () use ($categoryInteractions) {
            $preferences = $this->category_preferences ?? [];

            foreach ($categoryInteractions as $categoryId => $weight) {
                $preferences[$categoryId] = ($preferences[$categoryId] ?? 0) + $weight;
            }

            // Normalize preference weights.
            $total = array_sum($preferences);
            if ($total > 0) {
                foreach ($preferences as $categoryId => $value) {
                    $preferences[$categoryId] = $value / $total;
                }
            }

            $this->category_preferences = $preferences;
            $this->profile_updated_at = now();
            $this->save();
        });
    }

    /**
     * Update tag interests based on interactions
     */
    public function updateTagInterests(array $tagInteractions): void
    {
        // ✅ FIXED: Wrap in transaction for atomicity
        \DB::transaction(function () use ($tagInteractions) {
            $interests = $this->tag_interests ?? [];

            foreach ($tagInteractions as $tagId => $weight) {
                $interests[$tagId] = ($interests[$tagId] ?? 0) + $weight;
            }

            // Normalize and keep only the top tags.
            arsort($interests);
            $interests = array_slice($interests, 0, 20, true); // Top 20 tags

            $total = array_sum($interests);
            if ($total > 0) {
                foreach ($interests as $tagId => $value) {
                    $interests[$tagId] = $value / $total;
                }
            }

            $this->tag_interests = $interests;
            $this->profile_updated_at = now();
            $this->save();
        });
    }

    /**
     * Calculate a similarity score with another user profile
     */
    public function calculateSimilarity(self $otherProfile): float
    {
        $similarity = 0;
        $factors = 0;

        // Category preference similarity.
        if (!empty($this->category_preferences) && !empty($otherProfile->category_preferences)) {
            $similarity += $this->cosineSimilarityArrays($this->category_preferences, $otherProfile->category_preferences);
            $factors++;
        }

        // Tag interest similarity.
        if (!empty($this->tag_interests) && !empty($otherProfile->tag_interests)) {
            $similarity += $this->cosineSimilarityArrays($this->tag_interests, $otherProfile->tag_interests);
            $factors++;
        }

        return $factors > 0 ? $similarity / $factors : 0;
    }

    /**
     * Cosine similarity helper for associative arrays
     */
    private function cosineSimilarityArrays(array $arrayA, array $arrayB): float
    {
        $allKeys = array_unique(array_merge(array_keys($arrayA), array_keys($arrayB)));
        
        $vectorA = [];
        $vectorB = [];
        
        foreach ($allKeys as $key) {
            $vectorA[] = $arrayA[$key] ?? 0;
            $vectorB[] = $arrayB[$key] ?? 0;
        }

        return MLPostVector::cosineSimilarity($vectorA, $vectorB);
    }
}
