<?php

namespace App\Services;

use App\Models\Post;
use App\Models\MLPostVector;
use App\Services\ML\AdvancedTFIDFService;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

/**
 * Enhanced Content Analysis Service with improved performance and accuracy.
 * Generates ML-friendly representations using optimized TF-IDF, caching, and batch processing.
 *
 * V2.1: Integrated with AdvancedTFIDFService for superior text analysis
 */
class ContentAnalysisServiceV2
{
    private AdvancedTFIDFService $tfidfService;
    /**
     * Spanish stop words for content normalization (UTF-8 corrected).
     */
    private array $stopWords = [
        'el', 'la', 'de', 'que', 'y', 'a', 'en', 'un', 'es', 'se', 'no', 'te', 'lo', 'le', 'da', 'su', 'por', 'son',
        'con', 'para', 'al', 'del', 'los', 'las', 'una', 'esta', 'este', 'como', 'todo', 'hay', 'fue', 'han',
        'pero', 'mas', 'muy', 'ya', 'ser', 'si', 'tan', 'me', 'mi', 'nos', 'ni', 'or', 'estar', 'tener',
        'hacer', 'poder', 'decir', 'ir', 'ver', 'dar', 'saber', 'querer', 'llegar', 'pasar', 'tiempo', 'bien',
        'dia', 'vez', 'hombre', 'mujer', 'vida', 'mundo', 'pais', 'casa', 'parte', 'estado', 'nuevo', 'gran', 'mismo'
    ];

    /**
     * Constructor - Inject AdvancedTFIDFService
     */
    public function __construct(AdvancedTFIDFService $tfidfService)
    {
        $this->tfidfService = $tfidfService;
    }

    /**
     * Analyze post and generate vector representations with caching.
     * Now uses AdvancedTFIDFService for superior text analysis
     */
    public function analyzePost(Post $post): MLPostVector
    {
        $vector = MLPostVector::firstOrNew(['post_id' => $post->id]);

        // Generate vectors
        $vector->content_vector = $this->generateTFIDFVector($post);
        $vector->category_vector = $this->generateCategoryVector($post);
        $vector->tag_vector = $this->generateTagVector($post);

        // Calculate metrics
        $vector->content_length_normalized = $this->normalizeContentLength($post);
        $vector->readability_score = $this->calculateReadabilityScore($post);
        $vector->engagement_score = $this->calculateEngagementScore($post);
        
        $vector->vector_updated_at = now();
        $vector->model_version = '2.0';
        
        $vector->save();
        
        // Invalidate cache
        Cache::forget("post_vector_{$post->id}");
        
        return $vector;
    }

    /**
     * Generate optimized TF-IDF vector using AdvancedTFIDFService
     *
     * Now uses advanced features:
     * - Spanish stemming
     * - N-grams (1-3)
     * - Sublinear TF scaling
     * - L2 normalization
     */
    private function generateTFIDFVector(Post $post): array
    {
        $text = implode(' ', [
            $post->title ?? '',
            $post->excerpt ?? '',
            strip_tags($post->content ?? '')
        ]);

        // Use AdvancedTFIDFService for superior vectorization
        try {
            $vector = $this->tfidfService->vectorize($text);
            return $vector;
        } catch (\Exception $e) {
            \Log::warning('AdvancedTFIDFService failed, falling back to basic TF-IDF', [
                'post_id' => $post->id,
                'error' => $e->getMessage()
            ]);

            // Fallback to basic TF-IDF
            return $this->generateBasicTFIDFVector($post);
        }
    }

    /**
     * Fallback basic TF-IDF vector generation
     */
    private function generateBasicTFIDFVector(Post $post): array
    {
        $text = implode(' ', [
            $post->title ?? '',
            $post->excerpt ?? '',
            strip_tags($post->content ?? '')
        ]);

        $tokens = $this->tokenize($text);
        $tokens = $this->removeStopWords($tokens);

        // Get cached vocabulary and IDF
        $vocabulary = $this->getCachedVocabulary();
        $idf = $this->getCachedIDF();

        // Calculate TF
        $tf = $this->calculateTF($tokens);

        // Build TF-IDF vector
        $vector = [];
        foreach ($vocabulary as $term) {
            $tfValue = $tf[$term] ?? 0;
            $idfValue = $idf[$term] ?? 0;
            $vector[] = $tfValue * $idfValue;
        }

        return $vector;
    }

    /**
     * Get cached global vocabulary built from all posts.
     */
    private function getCachedVocabulary(): array
    {
        return Cache::remember('ml_global_vocabulary', 3600, function() {
            return $this->buildGlobalVocabulary();
        });
    }

    /**
     * Build global vocabulary from all published posts.
     */
    private function buildGlobalVocabulary(): array
    {
        // Get top 200 most common terms across all posts
        $allText = Post::published()
            ->select(DB::raw("CONCAT(title, ' ', excerpt, ' ', SUBSTRING(content, 1, 1000)) as combined_text"))
            ->pluck('combined_text')
            ->implode(' ');

        $tokens = $this->tokenize($allText);
        $tokens = $this->removeStopWords($tokens);
        
        $termFrequency = array_count_values($tokens);
        arsort($termFrequency);
        
        return array_slice(array_keys($termFrequency), 0, 200);
    }

    /**
     * Get cached IDF values for vocabulary.
     */
    private function getCachedIDF(): array
    {
        return Cache::remember('ml_global_idf', 3600, function() {
            return $this->calculateGlobalIDF();
        });
    }

    /**
     * Calculate IDF values efficiently using batch queries.
     */
    private function calculateGlobalIDF(): array
    {
        $vocabulary = $this->getCachedVocabulary();
        $totalDocs = Post::published()->count();
        $idf = [];
        
        if ($totalDocs == 0) {
            return array_fill_keys($vocabulary, 0);
        }

        // Batch query for document frequencies
        foreach ($vocabulary as $term) {
            $cacheKey = "idf_term_{$term}";
            
            $docsWithTerm = Cache::remember($cacheKey, 3600, function() use ($term) {
                return Post::published()
                    ->where(function($query) use ($term) {
                        $query->where('title', 'LIKE', "%{$term}%")
                              ->orWhere('excerpt', 'LIKE', "%{$term}%")
                              ->orWhere('content', 'LIKE', "%{$term}%");
                    })
                    ->count();
            });
            
            $idf[$term] = $docsWithTerm > 0 ? log($totalDocs / $docsWithTerm) : 0;
        }

        return $idf;
    }

    /**
     * Tokenize text with improved Unicode support.
     */
    private function tokenize(string $text): array
    {
        $text = Str::lower($text);
        $text = preg_replace('/[^\p{L}\p{N}\s]/u', ' ', $text);
        $tokens = preg_split('/\s+/', $text, -1, PREG_SPLIT_NO_EMPTY);
        
        return array_filter($tokens, fn($token) => mb_strlen($token) >= 3 && mb_strlen($token) <= 20);
    }

    /**
     * Remove stop words from tokens.
     */
    private function removeStopWords(array $tokens): array
    {
        return array_filter($tokens, fn($token) => !in_array($token, $this->stopWords));
    }

    /**
     * Calculate normalized term frequency.
     */
    private function calculateTF(array $tokens): array
    {
        if (empty($tokens)) {
            return [];
        }

        $tf = array_count_values($tokens);
        $maxFreq = max($tf);
        
        foreach ($tf as $term => $freq) {
            $tf[$term] = $freq / $maxFreq;
        }

        return $tf;
    }

    /**
     * Generate one-hot category vector.
     */
    private function generateCategoryVector(Post $post): array
    {
        $categories = $post->categories ?? collect();
        $allCategories = Cache::remember('all_category_ids', 3600, function() {
            return \App\Models\Category::pluck('id')->toArray();
        });
        
        $vector = [];
        foreach ($allCategories as $categoryId) {
            $vector[] = $categories->contains('id', $categoryId) ? 1 : 0;
        }

        return $vector;
    }

    /**
     * Generate one-hot tag vector.
     */
    private function generateTagVector(Post $post): array
    {
        $tags = $post->tags ?? collect();
        $allTags = Cache::remember('all_tag_ids', 3600, function() {
            return \App\Models\Tag::pluck('id')->toArray();
        });
        
        $vector = [];
        foreach ($allTags as $tagId) {
            $vector[] = $tags->contains('id', $tagId) ? 1 : 0;
        }

        return $vector;
    }

    /**
     * Normalize content length.
     */
    private function normalizeContentLength(Post $post): float
    {
        $contentLength = mb_strlen(strip_tags($post->content ?? ''));
        $maxLength = 10000;
        
        return min($contentLength / $maxLength, 1.0);
    }

    /**
     * Calculate readability score using Flesch Reading Ease.
     */
    private function calculateReadabilityScore(Post $post): float
    {
        $text = strip_tags($post->content ?? '');
        
        if (empty($text)) {
            return 0.0;
        }

        $sentences = preg_split('/[.!?]+/', $text, -1, PREG_SPLIT_NO_EMPTY);
        $words = preg_split('/\s+/', $text, -1, PREG_SPLIT_NO_EMPTY);
        $syllables = $this->countSyllables($text);

        $sentenceCount = count($sentences);
        $wordCount = count($words);

        if ($sentenceCount == 0 || $wordCount == 0) {
            return 0.0;
        }

        $avgWordsPerSentence = $wordCount / $sentenceCount;
        $avgSyllablesPerWord = $syllables / $wordCount;
        
        $score = 206.835 - (1.015 * $avgWordsPerSentence) - (84.6 * $avgSyllablesPerWord);
        
        return max(0, min(100, $score)) / 100;
    }

    /**
     * Count syllables in Spanish text.
     */
    private function countSyllables(string $text): int
    {
        $vowels = 'aeiouáéíóúü';
        $syllables = 0;
        $prevWasVowel = false;

        $text = Str::lower($text);
        for ($i = 0; $i < mb_strlen($text); $i++) {
            $char = mb_substr($text, $i, 1);
            $isVowel = mb_strpos($vowels, $char) !== false;
            
            if ($isVowel && !$prevWasVowel) {
                $syllables++;
            }
            
            $prevWasVowel = $isVowel;
        }

        return max(1, $syllables);
    }

    /**
     * Calculate engagement score based on interactions.
     */
    private function calculateEngagementScore(Post $post): float
    {
        $views = $post->views_count ?? 0;
        $likes = $post->likes_count ?? 0;
        $comments = $post->comments_count ?? 0;
        $bookmarks = $post->bookmarks_count ?? 0;

        if ($views == 0) {
            return 0.0;
        }

        // Weighted engagement calculation
        $engagements = $likes + ($comments * 2) + ($bookmarks * 1.5);
        $engagementRate = $engagements / max($views, 1);

        return min($engagementRate, 1.0);
    }

    /**
     * Batch analyze all posts that need vector updates.
     */
    public function analyzeAllPosts(): int
    {
        $posts = Post::published()
            ->whereDoesntHave('mlVector')
            ->orWhereHas('mlVector', function($query) {
                $query->where('vector_updated_at', '<', now()->subHours(24));
            })
            ->get();

        $count = 0;
        foreach ($posts as $post) {
            $this->analyzePost($post);
            $count++;
        }

        // Clear global caches to rebuild with new data
        Cache::forget('ml_global_vocabulary');
        Cache::forget('ml_global_idf');

        return $count;
    }

    /**
     * Clear all ML-related caches.
     */
    public function clearCaches(): void
    {
        Cache::forget('ml_global_vocabulary');
        Cache::forget('ml_global_idf');
        Cache::forget('all_category_ids');
        Cache::forget('all_tag_ids');
        
        // Clear individual term IDF caches
        $vocabulary = $this->buildGlobalVocabulary();
        foreach ($vocabulary as $term) {
            Cache::forget("idf_term_{$term}");
        }
    }
}

