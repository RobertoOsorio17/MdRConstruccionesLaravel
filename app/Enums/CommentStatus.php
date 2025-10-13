<?php

namespace App\Enums;

/**
 * Enum for comment statuses
 *
 * ✅ Using PHP 8.1+ enums for type safety
 */
enum CommentStatus: string
{
    case PENDING = 'pending';
    case APPROVED = 'approved';
    case SPAM = 'spam';
    case REJECTED = 'rejected';

    /**
     * Get human-readable label
     */
    public function label(): string
    {
        return match($this) {
            self::PENDING => 'Pendiente',
            self::APPROVED => 'Aprobado',
            self::SPAM => 'Spam',
            self::REJECTED => 'Rechazado',
        };
    }

    /**
     * Get badge color for UI
     */
    public function badgeColor(): string
    {
        return match($this) {
            self::PENDING => 'yellow',
            self::APPROVED => 'green',
            self::SPAM => 'red',
            self::REJECTED => 'gray',
        };
    }

    /**
     * Check if comment is visible to public
     */
    public function isPublic(): bool
    {
        return $this === self::APPROVED;
    }

    /**
     * Get all values as array
     */
    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
