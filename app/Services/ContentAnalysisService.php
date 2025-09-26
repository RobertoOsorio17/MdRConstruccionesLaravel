<?php

namespace App\Services;

use App\Models\Post;
use App\Models\MLPostVector;
use Illuminate\Support\Str;

class ContentAnalysisService
{
    /**
     * Palabras vacías en español
     */
    private array $stopWords = [
        'el', 'la', 'de', 'que', 'y', 'a', 'en', 'un', 'es', 'se', 'no', 'te', 'lo', 'le', 'da', 'su', 'por', 'son',
        'con', 'para', 'al', 'del', 'los', 'las', 'una', 'está', 'este', 'esta', 'como', 'todo', 'hay', 'fue', 'han',
        'pero', 'más', 'muy', 'ya', 'ser', 'si', 'tan', 'me', 'mi', 'nos', 'ni', 'or', 'ser', 'estar', 'tener',
        'hacer', 'poder', 'decir', 'ir', 'ver', 'dar', 'saber', 'querer', 'llegar', 'pasar', 'tiempo', 'bien', 'año',
        'día', 'vez', 'hombre', 'mujer', 'vida', 'mundo', 'país', 'casa', 'parte', 'estado', 'nuevo', 'gran', 'mismo'
    ];

    /**
     * Analiza el contenido de un post y genera sus vectores
     */
    public function analyzePost(Post $post): MLPostVector
    {
        $vector = MLPostVector::where('post_id', $post->id)->first();
        
        if (!$vector) {
            $vector = new MLPostVector(['post_id' => $post->id]);
        }

        // Generar vector TF-IDF del contenido
        $vector->content_vector = $this->generateTFIDFVector($post);
        
        // Generar vector de categorías
        $vector->category_vector = $this->generateCategoryVector($post);
        
        // Generar vector de tags
        $vector->tag_vector = $this->generateTagVector($post);
        
        // Calcular métricas adicionales
        $vector->content_length_normalized = $this->normalizeContentLength($post);
        $vector->readability_score = $this->calculateReadabilityScore($post);
        $vector->engagement_score = $this->calculateEngagementScore($post);
        
        $vector->vector_updated_at = now();
        $vector->model_version = '1.0';
        
        $vector->save();
        
        return $vector;
    }

    /**
     * Genera vector TF-IDF para el contenido del post
     */
    private function generateTFIDFVector(Post $post): array
    {
        // Combinar título, excerpt y contenido
        $text = implode(' ', [
            $post->title ?? '',
            $post->excerpt ?? '',
            strip_tags($post->content ?? '')
        ]);

        // Tokenizar y limpiar texto
        $tokens = $this->tokenize($text);
        $tokens = $this->removeStopWords($tokens);
        
        // Obtener vocabulario global (simplificado)
        $vocabulary = $this->getGlobalVocabulary();
        
        // Calcular TF (Term Frequency)
        $tf = $this->calculateTF($tokens);
        
        // Calcular IDF (Inverse Document Frequency) - simplificado
        $idf = $this->calculateIDF($vocabulary);
        
        // Generar vector TF-IDF
        $vector = [];
        foreach ($vocabulary as $term) {
            $tfValue = $tf[$term] ?? 0;
            $idfValue = $idf[$term] ?? 0;
            $vector[] = $tfValue * $idfValue;
        }

        return $vector;
    }

    /**
     * Tokeniza el texto
     */
    private function tokenize(string $text): array
    {
        // Convertir a minúsculas y remover caracteres especiales
        $text = Str::lower($text);
        $text = preg_replace('/[^\p{L}\p{N}\s]/u', ' ', $text);
        
        // Dividir en palabras
        $tokens = preg_split('/\s+/', $text, -1, PREG_SPLIT_NO_EMPTY);
        
        // Filtrar tokens muy cortos o muy largos
        return array_filter($tokens, function($token) {
            return strlen($token) >= 3 && strlen($token) <= 20;
        });
    }

    /**
     * Remueve palabras vacías
     */
    private function removeStopWords(array $tokens): array
    {
        return array_filter($tokens, function($token) {
            return !in_array($token, $this->stopWords);
        });
    }

    /**
     * Calcula frecuencia de términos
     */
    private function calculateTF(array $tokens): array
    {
        $tf = array_count_values($tokens);
        $maxFreq = max($tf);
        
        // Normalizar TF
        foreach ($tf as $term => $freq) {
            $tf[$term] = $freq / $maxFreq;
        }

        return $tf;
    }

    /**
     * Obtiene vocabulario global (simplificado - en producción usar base de datos)
     */
    private function getGlobalVocabulary(): array
    {
        // En una implementación real, esto vendría de análisis de todo el corpus
        // Por ahora usamos vocabulario común de construcción
        return [
            'construcción', 'edificio', 'obra', 'proyecto', 'diseño', 'arquitectura', 'ingeniería',
            'materiales', 'cemento', 'acero', 'ladrillo', 'concreto', 'estructura', 'cimientos',
            'excavación', 'instalación', 'eléctrica', 'plomería', 'acabados', 'pintura', 'pisos',
            'techos', 'ventanas', 'puertas', 'seguridad', 'calidad', 'presupuesto', 'tiempo',
            'cliente', 'contratista', 'supervisor', 'planos', 'permisos', 'normativas', 'sostenible',
            'eficiencia', 'energética', 'innovación', 'tecnología', 'smart', 'home', 'moderno',
            'tradicional', 'residencial', 'comercial', 'industrial', 'remodelación', 'restauración'
        ];
    }

    /**
     * Calcula IDF simplificado
     */
    private function calculateIDF(array $vocabulary): array
    {
        $totalDocs = Post::count();
        $idf = [];
        
        foreach ($vocabulary as $term) {
            // Contar documentos que contienen el término (simplificado)
            $docsWithTerm = Post::where('content', 'LIKE', "%{$term}%")
                ->orWhere('title', 'LIKE', "%{$term}%")
                ->orWhere('excerpt', 'LIKE', "%{$term}%")
                ->count();
            
            $idf[$term] = $docsWithTerm > 0 ? log($totalDocs / $docsWithTerm) : 0;
        }

        return $idf;
    }

    /**
     * Genera vector de categorías (one-hot encoding)
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
     * Genera vector de tags (one-hot encoding)
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
     * Normaliza la longitud del contenido
     */
    private function normalizeContentLength(Post $post): float
    {
        $contentLength = strlen(strip_tags($post->content ?? ''));
        $maxLength = 10000; // Longitud máxima esperada
        
        return min($contentLength / $maxLength, 1.0);
    }

    /**
     * Calcula score de legibilidad
     */
    private function calculateReadabilityScore(Post $post): float
    {
        $text = strip_tags($post->content ?? '');
        
        if (empty($text)) {
            return 0.0;
        }

        // Métricas básicas de legibilidad
        $sentences = preg_split('/[.!?]+/', $text, -1, PREG_SPLIT_NO_EMPTY);
        $words = preg_split('/\s+/', $text, -1, PREG_SPLIT_NO_EMPTY);
        $syllables = $this->countSyllables($text);

        $sentenceCount = count($sentences);
        $wordCount = count($words);
        $syllableCount = $syllables;

        if ($sentenceCount == 0 || $wordCount == 0) {
            return 0.0;
        }

        // Fórmula de Flesch Reading Ease adaptada
        $avgWordsPerSentence = $wordCount / $sentenceCount;
        $avgSyllablesPerWord = $syllableCount / $wordCount;
        
        $score = 206.835 - (1.015 * $avgWordsPerSentence) - (84.6 * $avgSyllablesPerWord);
        
        // Normalizar a 0-1
        return max(0, min(100, $score)) / 100;
    }

    /**
     * Cuenta sílabas aproximadamente
     */
    private function countSyllables(string $text): int
    {
        // Aproximación simple para español
        $vowels = 'aeiouáéíóúü';
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

        return max(1, $syllables); // Mínimo 1 sílaba por palabra
    }

    /**
     * Calcula score de engagement del post
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

        // Calcular engagement rate
        $engagements = $likes + ($comments * 2) + ($shares * 3); // Pesos diferentes
        $engagementRate = $engagements / max($views, 1);

        // Normalizar a 0-1
        return min($engagementRate, 1.0);
    }

    /**
     * Analiza todos los posts que necesitan actualización
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