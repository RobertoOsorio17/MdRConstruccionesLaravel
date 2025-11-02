<?php

namespace App\Services;

use Illuminate\Support\Str;

/**
 * Service for handling text sanitization across the application
 *
 * ✅ DRY principle - Centralized sanitization logic
 */
class SanitizationService
{
    
    
    
    
    /**

    
    
    
     * Handle sanitize comment body.

    
    
    
     *

    
    
    
     * @param ?string $body The body.

    
    
    
     * @return string

    
    
    
     */
    
    
    
    
    
    
    
    public function sanitizeCommentBody(?string $body): string
    {
        $body = $body ?? '';

        // Remove script/style blocks explicitly
        $body = preg_replace('/<\/(?:script|style)>/i', '', preg_replace('/<(script|style)[^>]*>.*?<\/\1>/is', '', $body));

        // Allow only safe HTML tags for basic formatting
        $allowed_tags = '<b><i><em><strong><a><br><p>';
        $body = strip_tags($body, $allowed_tags);

        // Sanitize <a> tags to only allow href attribute and add security attributes
        $body = preg_replace_callback(
            '/<a\s+([^>]+)>/i',
            function($matches) {
                // Only allow href attribute with http/https URLs
                if (preg_match('/href=["\'](https?:\/\/[^"\']+)["\']/', $matches[1], $href)) {
                    $cleanUrl = htmlspecialchars($href[1], ENT_QUOTES, 'UTF-8');
                    return '<a href="' . $cleanUrl . '" rel="nofollow noopener noreferrer" target="_blank">';
                }
                // If no valid href, remove the tag entirely
                return '';
            },
            $body
        );

        // Normalize whitespace and trim
        $body = preg_replace("/\s+/u", ' ', $body);

        return trim($body);
    }

    
    
    
    
    /**

    
    
    
     * Handle sanitize text.

    
    
    
     *

    
    
    
     * @param ?string $text The text.

    
    
    
     * @param int $maxLength The maxLength.

    
    
    
     * @return string

    
    
    
     */
    
    
    
    
    
    
    
    public function sanitizeText(?string $text, int $maxLength = 255): string
    {
        $text = strip_tags($text ?? '');
        $text = htmlspecialchars($text, ENT_QUOTES, 'UTF-8');
        $text = Str::limit($text, $maxLength, '');
        return trim($text);
    }

    
    
    
    
    /**

    
    
    
     * Handle sanitize filename.

    
    
    
     *

    
    
    
     * @param string $filename The filename.

    
    
    
     * @return string

    
    
    
     */
    
    
    
    
    
    
    
    public function sanitizeFilename(string $filename): string
    {
        // Remove path separators
        $filename = str_replace(['/', '\\', '..'], '', $filename);

        // Remove special characters except dots, dashes, and underscores
        $filename = preg_replace('/[^a-zA-Z0-9._\-]/', '_', $filename);

        // Limit length
        if (strlen($filename) > 100) {
            $extension = pathinfo($filename, PATHINFO_EXTENSION);
            $name = substr(pathinfo($filename, PATHINFO_FILENAME), 0, 95);
            $filename = $name . '.' . $extension;
        }

        return $filename;
    }

    
    
    
    
    /**

    
    
    
     * Handle sanitize search term.

    
    
    
     *

    
    
    
     * @param string $searchTerm The searchTerm.

    
    
    
     * @param int $maxLength The maxLength.

    
    
    
     * @return string

    
    
    
     */
    
    
    
    
    
    
    
    public function sanitizeSearchTerm(string $searchTerm, int $maxLength = 100): string
    {
        $searchTerm = trim($searchTerm);
        // Escape special LIKE characters
        $searchTerm = str_replace(['%', '_'], ['\%', '\_'], $searchTerm);
        // Limit length to prevent DoS
        $searchTerm = substr($searchTerm, 0, $maxLength);
        return $searchTerm;
    }

    
    
    
    
    /**

    
    
    
     * Handle remove null bytes.

    
    
    
     *

    
    
    
     * @param string $string The string.

    
    
    
     * @return string

    
    
    
     */
    
    
    
    
    
    
    
    public function removeNullBytes(string $string): string
    {
        return str_replace("\0", '', $string);
    }
}
