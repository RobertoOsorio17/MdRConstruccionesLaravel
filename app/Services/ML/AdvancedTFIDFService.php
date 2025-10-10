<?php

namespace App\Services\ML;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

/**
 * Advanced TF-IDF implementation with Spanish stemming and n-grams.
 * Provides sophisticated text vectorization for content analysis.
 */
class AdvancedTFIDFService
{
    private array $stopWords;
    private array $stemCache = [];
    private int $maxVocabularySize = 5000;
    private int $minDocumentFrequency = 2;
    private float $maxDocumentFrequency = 0.8; // 80% of documents
    private bool $useNGrams = true;
    private int $nGramMin = 1;
    private int $nGramMax = 3;

    public function __construct()
    {
        $this->stopWords = $this->loadSpanishStopWords();
    }

    /**
     * Load Spanish stop words.
     */
    private function loadSpanishStopWords(): array
    {
        return [
            // Articles
            'el', 'la', 'los', 'las', 'un', 'una', 'unos', 'unas',
            // Pronouns
            'yo', 'tú', 'él', 'ella', 'nosotros', 'vosotros', 'ellos', 'ellas',
            'me', 'te', 'se', 'nos', 'os', 'le', 'les', 'lo', 'la',
            // Prepositions
            'de', 'del', 'a', 'al', 'en', 'con', 'por', 'para', 'sin', 'sobre',
            'entre', 'desde', 'hasta', 'hacia', 'bajo', 'tras',
            // Conjunctions
            'y', 'e', 'o', 'u', 'pero', 'sino', 'que', 'si', 'como', 'porque',
            // Common verbs
            'es', 'son', 'está', 'están', 'ser', 'estar', 'haber', 'hay',
            'fue', 'fueron', 'era', 'eran', 'sea', 'sean',
            // Others
            'este', 'esta', 'estos', 'estas', 'ese', 'esa', 'esos', 'esas',
            'aquel', 'aquella', 'aquellos', 'aquellas', 'su', 'sus', 'mi', 'mis',
            'tu', 'tus', 'nuestro', 'nuestra', 'vuestro', 'vuestra',
            'muy', 'más', 'menos', 'mucho', 'poco', 'todo', 'toda', 'todos', 'todas',
            'otro', 'otra', 'otros', 'otras', 'mismo', 'misma', 'mismos', 'mismas',
            'también', 'tampoco', 'sí', 'no', 'ni', 'ya', 'aún', 'todavía'
        ];
    }

    /**
     * Tokenize text with advanced preprocessing.
     */
    public function tokenize(string $text): array
    {
        // Convert to lowercase
        $text = mb_strtolower($text, 'UTF-8');

        // Remove HTML tags
        $text = strip_tags($text);

        // Remove URLs
        $text = preg_replace('#https?://[^\s]+#', '', $text);

        // Remove email addresses
        $text = preg_replace('#[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}#', '', $text);

        // Remove numbers (optional - keep if numbers are important)
        // $text = preg_replace('#\d+#', '', $text);

        // Remove special characters but keep Spanish accents
        $text = preg_replace('#[^\p{L}\p{N}\s]#u', ' ', $text);

        // Tokenize by whitespace
        $tokens = preg_split('/\s+/', $text, -1, PREG_SPLIT_NO_EMPTY);

        // Remove stop words
        $tokens = array_filter($tokens, function($token) {
            return !in_array($token, $this->stopWords) && mb_strlen($token) > 2;
        });

        // Apply stemming
        $tokens = array_map([$this, 'stem'], $tokens);

        return array_values($tokens);
    }

    /**
     * Spanish stemming algorithm (simplified Porter stemmer for Spanish).
     */
    public function stem(string $word): string
    {
        // Check cache first
        if (isset($this->stemCache[$word])) {
            return $this->stemCache[$word];
        }

        $original = $word;
        $word = mb_strtolower($word, 'UTF-8');

        // Remove common Spanish suffixes
        $suffixes = [
            // Plural
            'ces' => 'z',
            'ses' => 's',
            'es' => '',
            's' => '',
            // Verb endings
            'ando' => 'ar',
            'iendo' => 'er',
            'ado' => 'ar',
            'ido' => 'er',
            'ará' => 'ar',
            'erá' => 'er',
            'irá' => 'ir',
            'aría' => 'ar',
            'ería' => 'er',
            'iría' => 'ir',
            // Adjective endings
            'ísimo' => '',
            'ísima' => '',
            'mente' => '',
            'able' => '',
            'ible' => '',
            'ción' => '',
            'sión' => '',
            'dad' => '',
            'tad' => '',
            'eza' => '',
            'ura' => '',
            'oso' => '',
            'osa' => '',
            'ivo' => '',
            'iva' => '',
        ];

        foreach ($suffixes as $suffix => $replacement) {
            if (mb_strlen($word) > mb_strlen($suffix) + 3) {
                if (mb_substr($word, -mb_strlen($suffix)) === $suffix) {
                    $word = mb_substr($word, 0, -mb_strlen($suffix)) . $replacement;
                    break;
                }
            }
        }

        // Cache the result
        $this->stemCache[$original] = $word;

        return $word;
    }

    /**
     * Generate n-grams from tokens.
     */
    public function generateNGrams(array $tokens): array
    {
        if (!$this->useNGrams) {
            return $tokens;
        }

        $ngrams = [];

        // Add unigrams
        $ngrams = array_merge($ngrams, $tokens);

        // Add bigrams
        if ($this->nGramMax >= 2) {
            for ($i = 0; $i < count($tokens) - 1; $i++) {
                $ngrams[] = $tokens[$i] . '_' . $tokens[$i + 1];
            }
        }

        // Add trigrams
        if ($this->nGramMax >= 3) {
            for ($i = 0; $i < count($tokens) - 2; $i++) {
                $ngrams[] = $tokens[$i] . '_' . $tokens[$i + 1] . '_' . $tokens[$i + 2];
            }
        }

        return $ngrams;
    }

    /**
     * Calculate term frequency for a document.
     */
    public function calculateTF(array $tokens): array
    {
        $tf = [];
        $totalTokens = count($tokens);

        if ($totalTokens === 0) {
            return $tf;
        }

        // Count occurrences
        $counts = array_count_values($tokens);

        // Calculate normalized TF
        foreach ($counts as $term => $count) {
            // Use logarithmic TF: 1 + log(count)
            $tf[$term] = 1 + log($count);
        }

        return $tf;
    }

    /**
     * Calculate inverse document frequency.
     */
    public function calculateIDF(array $documents): array
    {
        $idf = [];
        $totalDocs = count($documents);

        if ($totalDocs === 0) {
            return $idf;
        }

        // Count document frequency for each term
        $df = [];
        foreach ($documents as $doc) {
            $uniqueTerms = array_unique($doc);
            foreach ($uniqueTerms as $term) {
                $df[$term] = ($df[$term] ?? 0) + 1;
            }
        }

        // Filter by document frequency
        $maxDF = (int)($totalDocs * $this->maxDocumentFrequency);
        $df = array_filter($df, function($freq) use ($maxDF) {
            return $freq >= $this->minDocumentFrequency && $freq <= $maxDF;
        });

        // Calculate IDF: log(N / df)
        foreach ($df as $term => $freq) {
            $idf[$term] = log($totalDocs / $freq);
        }

        // Sort by IDF and limit vocabulary size
        arsort($idf);
        $idf = array_slice($idf, 0, $this->maxVocabularySize, true);

        return $idf;
    }

    /**
     * Calculate TF-IDF vector for a document.
     */
    public function calculateTFIDF(array $tokens, array $idf): array
    {
        $tf = $this->calculateTF($tokens);
        $tfidf = [];

        foreach ($tf as $term => $tfValue) {
            if (isset($idf[$term])) {
                $tfidf[$term] = $tfValue * $idf[$term];
            }
        }

        // Normalize vector (L2 normalization)
        $magnitude = sqrt(array_sum(array_map(fn($v) => $v * $v, $tfidf)));
        
        if ($magnitude > 0) {
            foreach ($tfidf as $term => $value) {
                $tfidf[$term] = $value / $magnitude;
            }
        }

        return $tfidf;
    }

    /**
     * Build vocabulary from documents.
     */
    public function buildVocabulary(array $documents): array
    {
        $idf = $this->calculateIDF($documents);
        return array_keys($idf);
    }

    /**
     * Convert TF-IDF sparse vector to dense vector.
     */
    public function toDenseVector(array $tfidf, array $vocabulary): array
    {
        $vector = array_fill(0, count($vocabulary), 0.0);
        
        foreach ($vocabulary as $index => $term) {
            if (isset($tfidf[$term])) {
                $vector[$index] = $tfidf[$term];
            }
        }

        return $vector;
    }

    /**
     * Process text and return TF-IDF vector.
     */
    public function vectorize(string $text, array $idf): array
    {
        $tokens = $this->tokenize($text);
        $ngrams = $this->generateNGrams($tokens);
        return $this->calculateTFIDF($ngrams, $idf);
    }

    /**
     * Get configuration.
     */
    public function getConfig(): array
    {
        return [
            'max_vocabulary_size' => $this->maxVocabularySize,
            'min_document_frequency' => $this->minDocumentFrequency,
            'max_document_frequency' => $this->maxDocumentFrequency,
            'use_ngrams' => $this->useNGrams,
            'ngram_range' => [$this->nGramMin, $this->nGramMax],
            'stop_words_count' => count($this->stopWords)
        ];
    }
}

