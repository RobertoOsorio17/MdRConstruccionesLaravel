<?php

namespace App\Helpers;

class VersionHelper
{
    /**
     * Get the full version string.
     *
     * @return string
     */
    public static function full(): string
    {
        return config('version.version');
    }

    /**
     * Get the version without prerelease/build metadata.
     *
     * @return string
     */
    public static function short(): string
    {
        $major = config('version.major');
        $minor = config('version.minor');
        $patch = config('version.patch');

        return "{$major}.{$minor}.{$patch}";
    }

    /**
     * Get the major version number.
     *
     * @return int
     */
    public static function major(): int
    {
        return config('version.major');
    }

    /**
     * Get the minor version number.
     *
     * @return int
     */
    public static function minor(): int
    {
        return config('version.minor');
    }

    /**
     * Get the patch version number.
     *
     * @return int
     */
    public static function patch(): int
    {
        return config('version.patch');
    }

    /**
     * Get the prerelease identifier.
     *
     * @return string|null
     */
    public static function prerelease(): ?string
    {
        return config('version.prerelease');
    }

    /**
     * Get the build metadata.
     *
     * @return string|null
     */
    public static function build(): ?string
    {
        return config('version.build');
    }

    /**
     * Check if this is a prerelease version.
     *
     * @return bool
     */
    public static function isPrerelease(): bool
    {
        return !empty(config('version.prerelease'));
    }

    /**
     * Check if this is a stable release.
     *
     * @return bool
     */
    public static function isStable(): bool
    {
        return config('version.major') >= 1 && empty(config('version.prerelease'));
    }

    /**
     * Get the release date.
     *
     * @return string
     */
    public static function releaseDate(): string
    {
        return config('version.release_date');
    }

    /**
     * Get the release name.
     *
     * @return string
     */
    public static function releaseName(): string
    {
        return config('version.release_name');
    }

    /**
     * Get version history.
     *
     * @return array
     */
    public static function history(): array
    {
        return config('version.history', []);
    }

    /**
     * Get the changelog URL.
     *
     * @return string
     */
    public static function changelogUrl(): string
    {
        return config('version.changelog_url');
    }

    /**
     * Get formatted version for display.
     *
     * @param bool $includePrerelease
     * @return string
     */
    public static function display(bool $includePrerelease = true): string
    {
        $version = self::short();

        if ($includePrerelease && self::isPrerelease()) {
            $version .= '-' . self::prerelease();
        }

        if (self::build()) {
            $version .= '+' . self::build();
        }

        return $version;
    }

    /**
     * Get version information as array.
     *
     * @return array
     */
    public static function toArray(): array
    {
        return [
            'full' => self::full(),
            'short' => self::short(),
            'major' => self::major(),
            'minor' => self::minor(),
            'patch' => self::patch(),
            'prerelease' => self::prerelease(),
            'build' => self::build(),
            'is_prerelease' => self::isPrerelease(),
            'is_stable' => self::isStable(),
            'release_date' => self::releaseDate(),
            'release_name' => self::releaseName(),
            'changelog_url' => self::changelogUrl(),
        ];
    }

    /**
     * Compare two versions.
     *
     * @param string $version1
     * @param string $version2
     * @return int Returns -1 if version1 < version2, 0 if equal, 1 if version1 > version2
     */
    public static function compare(string $version1, string $version2): int
    {
        return version_compare($version1, $version2);
    }

    /**
     * Check if current version is greater than given version.
     *
     * @param string $version
     * @return bool
     */
    public static function isGreaterThan(string $version): bool
    {
        return self::compare(self::full(), $version) > 0;
    }

    /**
     * Check if current version is less than given version.
     *
     * @param string $version
     * @return bool
     */
    public static function isLessThan(string $version): bool
    {
        return self::compare(self::full(), $version) < 0;
    }

    /**
     * Check if current version equals given version.
     *
     * @param string $version
     * @return bool
     */
    public static function equals(string $version): bool
    {
        return self::compare(self::full(), $version) === 0;
    }
}

