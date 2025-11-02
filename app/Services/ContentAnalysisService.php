<?php

namespace App\Services;

use App\Models\Post;
use App\Models\MLPostVector;
use Illuminate\Support\Str;

/**
 * Generates machine-learning friendly representations of posts, including TF-IDF vectors and engagement metrics.
 * Powers recommendation engines by analyzing text, taxonomy, and behavioural signals.
 */
class ContentAnalysisService
{
    /**
     * Spanish stop words used for content normalization.
     */
    private array $stopWords = [
        'el', 'la', 'de', 'que', 'y', 'a', 'en', 'un', 'es', 'se', 'no', 'te', 'lo', 'le', 'da', 'su', 'por', 'son',
        'con', 'para', 'al', 'del', 'los', 'las', 'una', 'estÃƒÆ’Ã‚Â¡', 'este', 'esta', 'como', 'todo', 'hay', 'fue', 'han',
        'pero', 'mÃƒÆ’Ã‚Â¡s', 'muy', 'ya', 'ser', 'si', 'tan', 'me', 'mi', 'nos', 'ni', 'or', 'ser', 'estar', 'tener',
        'hacer', 'poder', 'decir', 'ir', 'ver', 'dar', 'saber', 'querer', 'llegar', 'pasar', 'tiempo', 'bien', 'aÃƒÆ’Ã‚Â±o',
        'dÃƒÆ’Ã‚Â­a', 'vez', 'hombre', 'mujer', 'vida', 'mundo', 'paÃƒÆ’Ã‚Â­s', 'casa', 'parte', 'estado', 'nuevo', 'gran', 'mismo'
    ];

    
    
    
    
    /**

    
    
    
     * Handle analyze post.

    
    
    
     *

    
    
    
     * @param Post $post The post.

    
    
    
     * @return MLPostVector

    
    
    
     */
    
    
    
    
    
    
    
    public function analyzePost(Post $post): MLPostVector
    {
        $vector = MLPostVector::where('post_id', $post->id)->first();
        
        if (!$vector) {
            $vector = new MLPostVector(['post_id' => $post->id]);
        }

        // Generate the TF-IDF vector for the content.
        $vector->content_vector = $this->generateTFIDFVector($post);

        // Generate the category vector.
        $vector->category_vector = $this->generateCategoryVector($post);

        // Generate the tag vector.
        $vector->tag_vector = $this->generateTagVector($post);

        // Calculate additional metrics.
        $vector->content_length_normalized = $this->normalizeContentLength($post);
        $vector->readability_score = $this->calculateReadabilityScore($post);
        $vector->engagement_score = $this->calculateEngagementScore($post);
        
        $vector->vector_updated_at = now();
        $vector->model_version = '1.0';
        
        $vector->save();
        
        return $vector;
    }

    
    
    
    
    /**

    
    
    
     * Handle generate tfidfvector.

    
    
    
     *

    
    
    
     * @param Post $post The post.

    
    
    
     * @return array

    
    
    
     */
    
    
    
    
    
    
    
    private function generateTFIDFVector(Post $post): array
    {
        // Combine title, excerpt, and content.
        $text = implode(' ', [
            $post->title ?? '',
            $post->excerpt ?? '',
            strip_tags($post->content ?? '')
        ]);

        // Tokenize and sanitize the text.
        $tokens = $this->tokenize($text);
        $tokens = $this->removeStopWords($tokens);
        
        // Retrieve a simplified global vocabulary.
        $vocabulary = $this->getGlobalVocabulary();
        
        // Calculate term frequency (TF).
        $tf = $this->calculateTF($tokens);
        
        // Calculate inverse document frequency (IDF) - simplified.
        $idf = $this->calculateIDF($vocabulary);
        
        // Build the TF-IDF vector.
        $vector = [];
        foreach ($vocabulary as $term) {
            $tfValue = $tf[$term] ?? 0;
            $idfValue = $idf[$term] ?? 0;
            $vector[] = $tfValue * $idfValue;
        }

        return $vector;
    }

    
    
    
    
    /**

    
    
    
     * Handle tokenize.

    
    
    
     *

    
    
    
     * @param string $text The text.

    
    
    
     * @return array

    
    
    
     */
    
    
    
    
    
    
    
    private function tokenize(string $text): array
    {
        // Convert to lowercase and remove special characters.
        $text = Str::lower($text);
        $text = preg_replace('/[^\p{L}\p{N}\s]/u', ' ', $text);
        
        // Split into words.
        $tokens = preg_split('/\s+/', $text, -1, PREG_SPLIT_NO_EMPTY);
        
        // Filter overly short or long tokens.
        return array_filter($tokens, function($token) {
            return strlen($token) >= 3 && strlen($token) <= 20;
        });
    }

    
    
    
    
    /**

    
    
    
     * Handle remove stop words.

    
    
    
     *

    
    
    
     * @param array $tokens The tokens.

    
    
    
     * @return array

    
    
    
     */
    
    
    
    
    
    
    
    private function removeStopWords(array $tokens): array
    {
        return array_filter($tokens, function($token) {
            return !in_array($token, $this->stopWords);
        });
    }

    
    
    
    
    /**

    
    
    
     * Calculate tf.

    
    
    
     *

    
    
    
     * @param array $tokens The tokens.

    
    
    
     * @return array

    
    
    
     */
    
    
    
    
    
    
    
    private function calculateTF(array $tokens): array
    {
        $tf = array_count_values($tokens);

        if (empty($tf)) {
            return [];
        }

        $maxFreq = max($tf);

        // Normalize TF values.
        foreach ($tf as $term => $freq) {
            $tf[$term] = $freq / $maxFreq;
        }

        return $tf;
    }

    
    
    
    
    /**

    
    
    
     * Get global vocabulary.

    
    
    
     *

    
    
    
     * @return array

    
    
    
     */
    
    
    
    
    
    
    
    private function getGlobalVocabulary(): array
    {
        // In a production implementation this would derive from the entire corpus.
        // For now we rely on a common construction-related vocabulary.
        return [
            'construcciÃƒÆ’Ã‚Â³n', 'edificio', 'obra', 'proyecto', 'diseÃƒÆ’Ã‚Â±o', 'arquitectura', 'ingenierÃƒÆ’Ã‚Â­a',
            'materiales', 'cemento', 'acero', 'ladrillo', 'concreto', 'estructura', 'cimientos',
            'excavaciÃƒÆ’Ã‚Â³n', 'instalaciÃƒÆ’Ã‚Â³n', 'elÃƒÆ’Ã‚Â©ctrica', 'plomerÃƒÆ’Ã‚Â­a', 'acabados', 'pintura', 'pisos',
            'techos', 'ventanas', 'puertas', 'seguridad', 'calidad', 'presupuesto', 'tiempo',
            'cliente', 'contratista', 'supervisor', 'planos', 'permisos', 'normativas', 'sostenible',
            'eficiencia', 'energÃƒÆ’Ã‚Â©tica', 'innovaciÃƒÆ’Ã‚Â³n', 'tecnologÃƒÆ’Ã‚Â­a', 'smart', 'home', 'moderno',
            'tradicional', 'residencial', 'comercial', 'industrial', 'remodelaciÃƒÆ’Ã‚Â³n', 'restauraciÃƒÆ’Ã‚Â³n'
        ];
    }

    
    
    
    
    /**

    
    
    
     * Calculate idf.

    
    
    
     *

    
    
    
     * @param array $vocabulary The vocabulary.

    
    
    
     * @return array

    
    
    
     */
    
    
    
    
    
    
    
    private function calculateIDF(array $vocabulary): array
    {
        $totalDocs = Post::count();
        $idf = [];

        if ($totalDocs === 0) {
            return $idf;
        }

        foreach ($vocabulary as $term) {
            // Count documents containing the term (simplified).
            $docsWithTerm = Post::where('content', 'LIKE', "%{$term}%")
                ->orWhere('title', 'LIKE', "%{$term}%")
                ->orWhere('excerpt', 'LIKE', "%{$term}%")
                ->count();

            $idf[$term] = $docsWithTerm > 0 ? log($totalDocs / $docsWithTerm) : 0;
        }

        return $idf;
    }

    
    
    
    
    /**

    
    
    
     * Handle generate category vector.

    
    
    
     *

    
    
    
     * @param Post $post The post.

    
    
    
     * @return array

    
    
    
     */
    
    
    
    
    
    
    
    private function generateCategoryVector(Post $post): array
    {
        $categories = $post->categories ?? collect();
        $allCategories = \App\Models\Category::pluck('id')->toArray();
        
        $vector = [];
        foreach ($allCategories as $categoryId) {
            $vector[] = $categories->contains('id', $categoryId) ? 1 : 0;
        }

        return $vector;
    }

    
    
    
    
    /**

    
    
    
     * Handle generate tag vector.

    
    
    
     *

    
    
    
     * @param Post $post The post.

    
    
    
     * @return array

    
    
    
     */
    
    
    
    
    
    
    
    private function generateTagVector(Post $post): array
    {
        $tags = $post->tags ?? collect();
        $allTags = \App\Models\Tag::pluck('id')->toArray();
        
        $vector = [];
        foreach ($allTags as $tagId) {
            $vector[] = $tags->contains('id', $tagId) ? 1 : 0;
        }

        return $vector;
    }

    
    
    
    
    /**

    
    
    
     * Handle normalize content length.

    
    
    
     *

    
    
    
     * @param Post $post The post.

    
    
    
     * @return float

    
    
    
     */
    
    
    
    
    
    
    
    private function normalizeContentLength(Post $post): float
    {
        $contentLength = strlen(strip_tags($post->content ?? ''));
        $maxLength = 10000; // Maximum expected length.
        
        return min($contentLength / $maxLength, 1.0);
    }

    
    
    
    
    /**

    
    
    
     * Calculate readability score.

    
    
    
     *

    
    
    
     * @param Post $post The post.

    
    
    
     * @return float

    
    
    
     */
    
    
    
    
    
    
    
    private function calculateReadabilityScore(Post $post): float
    {
        $text = strip_tags($post->content ?? '');
        
        if (empty($text)) {
            return 0.0;
        }

        // Basic readability metrics.
        $sentences = preg_split('/[.!?]+/', $text, -1, PREG_SPLIT_NO_EMPTY);
        $words = preg_split('/\s+/', $text, -1, PREG_SPLIT_NO_EMPTY);
        $syllables = $this->countSyllables($text);

        $sentenceCount = count($sentences);
        $wordCount = count($words);
        $syllableCount = $syllables;

        if ($sentenceCount == 0 || $wordCount == 0) {
            return 0.0;
        }

        // Adapted Flesch Reading Ease formula.
        $avgWordsPerSentence = $wordCount / $sentenceCount;
        $avgSyllablesPerWord = $syllableCount / $wordCount;
        
        $score = 206.835 - (1.015 * $avgWordsPerSentence) - (84.6 * $avgSyllablesPerWord);
        
        // Normalize to 0-1 range.
        return max(0, min(100, $score)) / 100;
    }

    
    
    
    
    /**

    
    
    
     * Handle count syllables.

    
    
    
     *

    
    
    
     * @param string $text The text.

    
    
    
     * @return int

    
    
    
     */
    
    
    
    
    
    
    
    private function countSyllables(string $text): int
    {
        // Simple approximation for Spanish content.
        $vowels = 'aeiouÃƒÆ’Ã‚Â¡ÃƒÆ’Ã‚Â©ÃƒÆ’Ã‚Â­ÃƒÆ’Ã‚Â³ÃƒÆ’Ã‚ÂºÃƒÆ’Ã‚Â¼';
        $syllables = 0;
        $prevWasVowel = false;

        for ($i = 0; $i < strlen($text); $i++) {
            $char = Str::lower($text[$i]);
            $isVowel = strpos($vowels, $char) !== false;
            
            if ($isVowel && !$prevWasVowel) {
                $syllables++;
            }
            
            $prevWasVowel = $isVowel;
        }

        return max(1, $syllables); // Ensure at least one syllable per word.
    }

    
    
    
    
    /**

    
    
    
     * Calculate engagement score.

    
    
    
     *

    
    
    
     * @param Post $post The post.

    
    
    
     * @return float

    
    
    
     */
    
    
    
    
    
    
    
    private function calculateEngagementScore(Post $post): float
    {
        $views = $post->views_count ?? 0;
        $likes = $post->likes_count ?? 0;
        $comments = $post->comments_count ?? 0;
        $shares = $post->shares_count ?? 0;

        if ($views == 0) {
            return 0.0;
        }

        // Calculate engagement rate.
        $engagements = $likes + ($comments * 2) + ($shares * 3); // Pesos diferentes
        $engagementRate = $engagements / max($views, 1);

        // Normalize to 0-1 range.
        return min($engagementRate, 1.0);
    }

    
    
    
    
    /**

    
    
    
     * Handle analyze all posts.

    
    
    
     *

    
    
    
     * @return void

    
    
    
     */
    
    
    
    
    
    
    
    public function analyzeAllPosts(): void
    {
        $posts = Post::whereDoesntHave('mlVector')
            ->orWhereHas('mlVector', function($query) {
                $query->where('vector_updated_at', '<', now()->subHours(24));
            })
            ->get();

        foreach ($posts as $post) {
            $this->analyzePost($post);
        }
    }
}
