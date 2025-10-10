<?php

namespace App\Enums;

/**
 * Enum for user statuses
 *
 * ✅ Using PHP 8.1+ enums for type safety
 */
enum UserStatus: string
{
    case ACTIVE = 'active';
    case INACTIVE = 'inactive';
    case SUSPENDED = 'suspended';
    case BANNED = 'banned';
    case PENDING_VERIFICATION = 'pending_verification';

    /**
     * Get human-readable label
     */
    public function label(): string
    {
        return match($this) {
            self::ACTIVE => 'Activo',
            self::INACTIVE => 'Inactivo',
            self::SUSPENDED => 'Suspendido',
            self::BANNED => 'Baneado',
            self::PENDING_VERIFICATION => 'Pendiente de Verificación',
        };
    }

    /**
     * Get badge color for UI
     */
    public function badgeColor(): string
    {
        return match($this) {
            self::ACTIVE => 'green',
            self::INACTIVE => 'gray',
            self::SUSPENDED => 'yellow',
            self::BANNED => 'red',
            self::PENDING_VERIFICATION => 'blue',
        };
    }

    /**
     * Check if user can log in
     */
    public function canLogin(): bool
    {
        return $this === self::ACTIVE;
    }

    /**
     * Check if user is blocked
     */
    public function isBlocked(): bool
    {
        return in_array($this, [self::SUSPENDED, self::BANNED]);
    }

    /**
     * Get all values as array
     */
    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
