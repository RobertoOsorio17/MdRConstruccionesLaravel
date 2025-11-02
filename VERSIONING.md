# Semantic Versioning Guide

This document describes how MDR Construcciones follows [Semantic Versioning 2.0.0](https://semver.org/).

## Table of Contents

- [Version Format](#version-format)
- [Version Components](#version-components)
- [Pre-1.0.0 Development](#pre-100-development)
- [Release Process](#release-process)
- [Version Management](#version-management)
- [Examples](#examples)
- [FAQ](#faq)

---

## Version Format

```
MAJOR.MINOR.PATCH[-PRERELEASE][+BUILD]
```

### Examples
- `0.9.0-beta` - Current version
- `1.0.0` - First stable release
- `1.2.3` - Stable release
- `2.0.0-rc.1` - Release candidate
- `2.0.0+20250102` - With build metadata

---

## Version Components

### MAJOR Version (X.0.0)

Increment when you make **incompatible API changes**.

**Examples of breaking changes:**
- Removing or renaming public API endpoints
- Changing required parameters in API requests
- Removing database columns that are used by external systems
- Changing authentication mechanisms
- Removing or renaming configuration options
- Changing the structure of API responses

**When to increment:**
- When backwards compatibility is broken
- When major architectural changes are made
- When migrating to a new major framework version (e.g., Laravel 12 → 13)

### MINOR Version (0.X.0)

Increment when you add **backwards-compatible functionality**.

**Examples of new features:**
- Adding new API endpoints
- Adding new optional parameters to existing endpoints
- Adding new database tables or columns (without removing old ones)
- Adding new features to the UI
- Adding new configuration options (with defaults)
- Improving performance without changing behavior

**When to increment:**
- When adding new features
- When deprecating functionality (but not removing it)
- When adding substantial new functionality

### PATCH Version (0.0.X)

Increment when you make **backwards-compatible bug fixes**.

**Examples of bug fixes:**
- Fixing security vulnerabilities
- Fixing crashes or errors
- Fixing incorrect behavior
- Fixing typos in UI text
- Fixing performance issues
- Updating dependencies for security patches

**When to increment:**
- When fixing bugs
- When making internal improvements
- When updating documentation
- When refactoring code without changing behavior

### PRERELEASE Identifier

Optional identifier for pre-release versions.

**Common identifiers:**
- `alpha` - Early development, unstable, internal testing only
- `beta` - Feature complete, but may have bugs, wider testing
- `rc.1`, `rc.2` - Release candidates, stable, final testing

**Examples:**
- `0.9.0-alpha` - Alpha version
- `0.9.0-beta` - Beta version (current)
- `1.0.0-rc.1` - Release candidate 1
- `1.0.0-rc.2` - Release candidate 2

### BUILD Metadata

Optional build metadata (does not affect version precedence).

**Examples:**
- `1.0.0+20250102` - Build date
- `1.0.0+001` - Build number
- `1.0.0+sha.5114f85` - Git commit hash

---

## Pre-1.0.0 Development

**Current Status:** We are in pre-1.0.0 development (version `0.9.0-beta`).

### Rules for 0.x.x versions:

1. **Anything may change at any time**
   - The public API should not be considered stable
   - Breaking changes can occur in MINOR versions

2. **Version 1.0.0 defines the first stable public API**
   - After 1.0.0, we will strictly follow semantic versioning
   - Breaking changes will only occur in MAJOR versions

3. **Current versioning strategy:**
   - `0.MINOR.PATCH-PRERELEASE`
   - MINOR: Significant feature additions or changes
   - PATCH: Bug fixes and small improvements
   - PRERELEASE: Development stage (alpha, beta, rc)

### Path to 1.0.0:

- ✅ `0.7.0-beta` - Core features (Blog, Comments, Profiles)
- ✅ `0.8.0-beta` - Feature expansion (User management, RBAC, OAuth)
- ✅ `0.9.0-beta` - Security hardening (Current version)
- 🔄 `0.10.0-beta` - Performance optimization
- 🔄 `0.11.0-rc.1` - Release candidate 1
- 🔄 `0.11.0-rc.2` - Release candidate 2 (if needed)
- 🎯 `1.0.0` - First stable release

---

## Release Process

### 1. Planning a Release

1. Review the changelog and determine version bump:
   - Breaking changes? → MAJOR
   - New features? → MINOR
   - Bug fixes only? → PATCH

2. Update version in all files:
   - `VERSION`
   - `config/version.php`
   - `composer.json`
   - `package.json`

3. Update `CHANGELOG.md` with release notes

### 2. Version Bump Commands

```bash
# Update version files
echo "X.Y.Z-prerelease" > VERSION

# Update config/version.php
# Update composer.json
# Update package.json
```

### 3. Testing

```bash
# Run all tests
php artisan test

# Run security tests
php artisan test --filter="Require2FAVerificationTest|StoreUserRequestTest|ReviewBanAppealRequestTest"

# Check for vulnerabilities
composer audit
npm audit
```

### 4. Tagging and Release

```bash
# Commit version changes
git add VERSION config/version.php composer.json package.json CHANGELOG.md
git commit -m "chore: bump version to X.Y.Z"

# Create annotated tag
git tag -a vX.Y.Z -m "Release version X.Y.Z"

# Push changes and tags
git push origin main
git push origin vX.Y.Z
```

---

## Version Management

### Using the VersionHelper

```php
use App\Helpers\VersionHelper;

// Get full version
VersionHelper::full(); // "0.9.0-beta"

// Get short version
VersionHelper::short(); // "0.9.0"

// Get components
VersionHelper::major(); // 0
VersionHelper::minor(); // 9
VersionHelper::patch(); // 0
VersionHelper::prerelease(); // "beta"

// Check version status
VersionHelper::isPrerelease(); // true
VersionHelper::isStable(); // false

// Compare versions
VersionHelper::isGreaterThan('0.8.0'); // true
VersionHelper::isLessThan('1.0.0'); // true

// Get release info
VersionHelper::releaseDate(); // "2025-11-02"
VersionHelper::releaseName(); // "Security Hardening Release"

// Get version array
VersionHelper::toArray();
```

### Displaying Version in UI

```jsx
// In React components (via Inertia)
import { usePage } from '@inertiajs/react';

function Footer() {
  const { version } = usePage().props;
  
  return (
    <footer>
      <p>Version {version.full}</p>
    </footer>
  );
}
```

```php
// In Blade templates
<footer>
    <p>Version {{ config('version.version') }}</p>
</footer>
```

---

## Examples

### Example 1: Bug Fix Release

**Current:** `0.9.0-beta`
**Change:** Fixed XSS vulnerability in search component
**New Version:** `0.9.1-beta`

**Reasoning:** Bug fix, no new features, no breaking changes → PATCH bump

### Example 2: New Feature Release

**Current:** `0.9.1-beta`
**Change:** Added real-time notifications system
**New Version:** `0.10.0-beta`

**Reasoning:** New feature, backwards-compatible → MINOR bump

### Example 3: Breaking Change (Pre-1.0.0)

**Current:** `0.10.0-beta`
**Change:** Redesigned API authentication (breaking change)
**New Version:** `0.11.0-beta`

**Reasoning:** Breaking change in pre-1.0.0 → MINOR bump (not MAJOR)

### Example 4: Release Candidate

**Current:** `0.11.0-beta`
**Change:** Feature freeze, final testing
**New Version:** `0.11.0-rc.1`

**Reasoning:** Moving from beta to release candidate

### Example 5: First Stable Release

**Current:** `0.11.0-rc.2`
**Change:** All tests passed, ready for production
**New Version:** `1.0.0`

**Reasoning:** First stable release

### Example 6: Post-1.0.0 Breaking Change

**Current:** `1.5.3`
**Change:** Removed deprecated API endpoints
**New Version:** `2.0.0`

**Reasoning:** Breaking change after 1.0.0 → MAJOR bump

---

## FAQ

### Q: When should we release 1.0.0?

**A:** Release 1.0.0 when:
- All planned core features are implemented
- The public API is stable and well-documented
- All critical bugs are fixed
- Security audit is complete (✅ Done)
- Performance is acceptable
- The application is production-ready
- You're confident you won't need breaking changes soon

### Q: Can we make breaking changes in 0.x.x versions?

**A:** Yes, during pre-1.0.0 development, breaking changes can occur in MINOR versions. However, document them clearly in the CHANGELOG.

### Q: What if we need to make a breaking change after 1.0.0?

**A:** Increment the MAJOR version (e.g., 1.5.3 → 2.0.0). Consider:
1. Deprecating old functionality first
2. Providing migration guides
3. Supporting both old and new APIs for a transition period

### Q: Should we include build metadata in production?

**A:** Build metadata is optional. It's useful for:
- Tracking specific builds in CI/CD
- Debugging production issues
- Correlating deployments with code changes

Example: `1.0.0+20250102.sha5114f85`

### Q: How do we handle hotfixes?

**A:** For urgent production fixes:
1. Create a hotfix branch from the release tag
2. Fix the issue
3. Increment PATCH version
4. Tag and deploy
5. Merge back to main

Example: `1.0.0` → `1.0.1` (hotfix)

### Q: What about database migrations?

**A:** Database migrations should be:
- **Backwards-compatible** for MINOR/PATCH versions
- **Breaking changes allowed** only in MAJOR versions
- Always include rollback migrations
- Test thoroughly before release

---

## Resources

- [Semantic Versioning 2.0.0](https://semver.org/)
- [Keep a Changelog](https://keepachangelog.com/)
- [Git Tagging](https://git-scm.com/book/en/v2/Git-Basics-Tagging)
- [Laravel Versioning Best Practices](https://laravel.com/docs/releases)

---

**Last Updated:** 2025-11-02  
**Current Version:** 0.9.0-beta

