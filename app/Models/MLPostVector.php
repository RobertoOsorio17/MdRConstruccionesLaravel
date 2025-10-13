<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Maintains vector representations of posts for machine-learning similarity and recommendation tasks.
 * Encapsulates cosine similarity utilities and tracks metadata such as model version and engagement scores.
 */
class MLPostVector extends Model
{
    use HasFactory;

    protected $table = 'ml_post_vectors';

    protected $fillable = [
        'post_id',
        'content_vector',
        'category_vector',
        'tag_vector',
        'content_length_normalized',
        'readability_score',
        'engagement_score',
        'vector_updated_at',
        'model_version'
    ];

    protected $casts = [
        'content_vector' => 'array',
        'category_vector' => 'array',
        'tag_vector' => 'array',
        'content_length_normalized' => 'float',
        'readability_score' => 'float',
        'engagement_score' => 'float',
        'vector_updated_at' => 'datetime'
    ];

    public function post(): BelongsTo
    {
        return $this->belongsTo(Post::class);
    }

    /**
     * Calcula la similitud de coseno entre dos vectores
     */
    public static function cosineSimilarity(array $vectorA, array $vectorB): float
    {
        if (empty($vectorA) || empty($vectorB) || count($vectorA) !== count($vectorB)) {
            return 0.0;
        }

        $dotProduct = 0;
        $magnitudeA = 0;
        $magnitudeB = 0;

        for ($i = 0; $i < count($vectorA); $i++) {
            $dotProduct += $vectorA[$i] * $vectorB[$i];
            $magnitudeA += $vectorA[$i] * $vectorA[$i];
            $magnitudeB += $vectorB[$i] * $vectorB[$i];
        }

        $magnitudeA = sqrt($magnitudeA);
        $magnitudeB = sqrt($magnitudeB);

        if ($magnitudeA == 0 || $magnitudeB == 0) {
            return 0.0;
        }

        return $dotProduct / ($magnitudeA * $magnitudeB);
    }

    /**
     * Obtiene vectores similares por contenido
     */
    public function findSimilarByContent(int $limit = 10): array
    {
        if (empty($this->content_vector)) {
            return [];
        }

        $similarPosts = [];
        $allVectors = self::with('post')
            ->where('id', '!=', $this->id)
            ->whereNotNull('content_vector')
            ->get();

        foreach ($allVectors as $vector) {
            $similarity = self::cosineSimilarity($this->content_vector, $vector->content_vector);
            if ($similarity > 0.1) { // Threshold mÃƒÆ’Ã‚Â­nimo
                $similarPosts[] = [
                    'post' => $vector->post,
                    'similarity_score' => $similarity,
                    'vector' => $vector
                ];
            }
        }

        // Ordenar por similitud descendente
        usort($similarPosts, function($a, $b) {
            return $b['similarity_score'] <=> $a['similarity_score'];
        });

        return array_slice($similarPosts, 0, $limit);
    }
}
