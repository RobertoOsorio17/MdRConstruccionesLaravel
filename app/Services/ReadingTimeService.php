<?php

namespace App\Services;

/**
 * Estimates reading time for mixed content by weighting text, code, media, and lists appropriately.
 * Returns both numeric durations and human-friendly strings for UI display.
 */
class ReadingTimeService
{
    // Base reading speeds (words per minute)
    const AVERAGE_READING_SPEED = 200; // Standard text
    const CODE_READING_SPEED = 100;    // Code blocks (slower)
    const TECHNICAL_READING_SPEED = 150; // Technical content
    
    // Time allocations (seconds)
    const IMAGE_VIEWING_TIME = 12;     // Per image
    const VIDEO_VIEWING_TIME = 30;     // Per video (if embedded)
    const CODE_BLOCK_OVERHEAD = 5;     // Additional time per code block
    
    
    
    
    
    /**

    
    
    
     * Handle calculate.

    
    
    
     *

    
    
    
     * @param string $content The content.

    
    
    
     * @return int

    
    
    
     */
    
    
    
    
    
    
    
    public function calculate(string $content): int
    {
        if (empty($content)) {
            return 1;
        }

        $minutes = 0;
        
        // 1. Extract and count different content types
        $codeBlocks = $this->extractCodeBlocks($content);
        $textContent = $this->extractTextContent($content);
        $images = $this->countImages($content);
        $videos = $this->countVideos($content);
        $lists = $this->countLists($content);
        
        // 2. Calculate text reading time
        // ✅ FIX: Use Unicode-aware word count for Spanish and other languages
        $wordCount = $this->countWords($textContent);
        $textMinutes = $wordCount / self::AVERAGE_READING_SPEED;

        // 3. Calculate code reading time
        foreach ($codeBlocks as $code) {
            $codeWords = $this->countWords(strip_tags($code));
            $textMinutes += $codeWords / self::CODE_READING_SPEED;
            $textMinutes += self::CODE_BLOCK_OVERHEAD / 60; // Add overhead
        }
        
        // 4. Add image viewing time
        $textMinutes += ($images * self::IMAGE_VIEWING_TIME) / 60;
        
        // 5. Add video viewing time
        $textMinutes += ($videos * self::VIDEO_VIEWING_TIME) / 60;
        
        // 6. Adjust for lists (slightly faster reading)
        if ($lists > 0) {
            $textMinutes *= 0.95; // 5% faster for lists
        }
        
        // 7. Round up to nearest minute (minimum 1 minute)
        return max(1, (int) ceil($textMinutes));
    }
    
    
    
    
    
    /**

    
    
    
     * Handle extract text content.

    
    
    
     *

    
    
    
     * @param string $content The content.

    
    
    
     * @return string

    
    
    
     */
    
    
    
    
    
    
    
    private function extractTextContent(string $content): string
    {
        // Remove code blocks (will be counted separately)
        $text = preg_replace('/```[\s\S]*?```/', '', $content);
        $text = preg_replace('/<pre[^>]*>[\s\S]*?<\/pre>/i', '', $text);
        $text = preg_replace('/<code[^>]*>[\s\S]*?<\/code>/i', '', $text);
        
        // Remove HTML tags
        $text = strip_tags($text);
        
        return $text;
    }
    
    
    
    
    
    /**

    
    
    
     * Handle extract code blocks.

    
    
    
     *

    
    
    
     * @param string $content The content.

    
    
    
     * @return array

    
    
    
     */
    
    
    
    
    
    
    
    private function extractCodeBlocks(string $content): array
    {
        $codeBlocks = [];
        
        // Match markdown code blocks
        preg_match_all('/```[\s\S]*?```/', $content, $matches);
        if (!empty($matches[0])) {
            $codeBlocks = array_merge($codeBlocks, $matches[0]);
        }
        
        // Match HTML pre/code blocks
        preg_match_all('/<pre[^>]*>[\s\S]*?<\/pre>/i', $content, $matches);
        if (!empty($matches[0])) {
            $codeBlocks = array_merge($codeBlocks, $matches[0]);
        }
        
        preg_match_all('/<code[^>]*>[\s\S]*?<\/code>/i', $content, $matches);
        if (!empty($matches[0])) {
            $codeBlocks = array_merge($codeBlocks, $matches[0]);
        }
        
        return $codeBlocks;
    }
    
    
    
    
    
    /**

    
    
    
     * Handle count images.

    
    
    
     *

    
    
    
     * @param string $content The content.

    
    
    
     * @return int

    
    
    
     */
    
    
    
    
    
    
    
    private function countImages(string $content): int
    {
        // Count img tags
        preg_match_all('/<img[^>]+>/i', $content, $matches);
        $imgTags = count($matches[0]);
        
        // Count markdown images
        preg_match_all('/!\[.*?\]\(.*?\)/', $content, $matches);
        $mdImages = count($matches[0]);
        
        return $imgTags + $mdImages;
    }
    
    
    
    
    
    /**

    
    
    
     * Handle count videos.

    
    
    
     *

    
    
    
     * @param string $content The content.

    
    
    
     * @return int

    
    
    
     */
    
    
    
    
    
    
    
    private function countVideos(string $content): int
    {
        // Count video tags
        preg_match_all('/<video[^>]+>/i', $content, $matches);
        $videoTags = count($matches[0]);
        
        // Count iframe embeds (YouTube, Vimeo, etc.)
        preg_match_all('/<iframe[^>]+>/i', $content, $matches);
        $iframes = count($matches[0]);
        
        return $videoTags + $iframes;
    }
    
    
    
    
    
    /**

    
    
    
     * Handle count lists.

    
    
    
     *

    
    
    
     * @param string $content The content.

    
    
    
     * @return int

    
    
    
     */
    
    
    
    
    
    
    
    private function countLists(string $content): int
    {
        // ✅ FIXED: Count ordered and unordered lists with or without attributes
        // Matches <ul>, <ul class="...">, <ol>, <ol class="...">, etc.
        preg_match_all('/<[ou]l(\s+[^>]*)?>/i', $content, $matches);
        return count($matches[0]);
    }
    
    
    
    
    
    /**

    
    
    
     * Handle format.

    
    
    
     *

    
    
    
     * @param int $minutes The minutes.

    
    
    
     * @return string

    
    
    
     */
    
    
    
    
    
    
    
    public function format(int $minutes): string
    {
        if ($minutes < 1) {
            return 'Menos de 1 min';
        }
        
        if ($minutes === 1) {
            return '1 min de lectura';
        }
        
        if ($minutes < 60) {
            return "{$minutes} min de lectura";
        }
        
        $hours = floor($minutes / 60);
        $mins = $minutes % 60;
        
        if ($mins === 0) {
            return $hours === 1 ? '1 hora de lectura' : "{$hours} horas de lectura";
        }
        
        return "{$hours}h {$mins}min de lectura";
    }

    
    
    
    
    /**

    
    
    
     * Handle count words.

    
    
    
     *

    
    
    
     * @param string $text The text.

    
    
    
     * @return int

    
    
    
     */
    
    
    
    
    
    
    
    private function countWords(string $text): int
    {
        if (empty($text)) {
            return 0;
        }

        // Match sequences of Unicode letters (including accented characters)
        // \p{L} matches any Unicode letter
        // \p{M} matches any Unicode mark (accents, diacritics)
        preg_match_all('/[\p{L}\p{M}]+/u', $text, $matches);

        return count($matches[0]);
    }
}

