<?php

namespace App\Enums;

/**
 * Enum for contact request statuses
 *
 * ✅ Using PHP 8.1+ enums for type safety
 */
enum ContactRequestStatus: string
{
    case NEW = 'new';
    case IN_PROGRESS = 'in_progress';
    case REPLIED = 'replied';
    case RESOLVED = 'resolved';
    case SPAM = 'spam';
    case ARCHIVED = 'archived';

    /**
     * Get human-readable label
     */
    public function label(): string
    {
        return match($this) {
            self::NEW => 'Nuevo',
            self::IN_PROGRESS => 'En Progreso',
            self::REPLIED => 'Respondido',
            self::RESOLVED => 'Resuelto',
            self::SPAM => 'Spam',
            self::ARCHIVED => 'Archivado',
        };
    }

    /**
     * Get badge color for UI
     */
    public function badgeColor(): string
    {
        return match($this) {
            self::NEW => 'blue',
            self::IN_PROGRESS => 'yellow',
            self::REPLIED => 'purple',
            self::RESOLVED => 'green',
            self::SPAM => 'red',
            self::ARCHIVED => 'gray',
        };
    }

    /**
     * Check if requires attention
     */
    public function requiresAttention(): bool
    {
        return in_array($this, [self::NEW, self::IN_PROGRESS]);
    }

    /**
     * Get all values as array
     */
    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
