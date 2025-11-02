# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Planned
- Full 1.0.0 stable release
- Mobile application
- Advanced analytics dashboard
- Real-time notifications

---

## [0.9.2-beta] - 2025-11-02

### 🐛 Fixed
- **CRITICAL**: Fixed all React DOM property warnings (`fetchpriority` → `fetchPriority`)
  - Fixed `EnhancedHeroSection.jsx` - Hero image loading priority
  - Fixed `ServiceHero.jsx` - Service page hero image loading priority
  - Fixed `app.blade.php` - Preload link priority attribute
- **HIGH**: Fixed MUI Grid deprecation warnings
  - Updated `FeaturedServicesSection.jsx` - Changed `size={{}}` to `item xs={}`
  - Updated `MeetTheTeamSection.jsx` - Changed `size={{}}` to `item xs={}`
- **HIGH**: Fixed MUI Menu Fragment error in `MainLayout.jsx`
  - Replaced Fragment (`<>...</>`) with array syntax for conditional menu items
  - Added proper keys to prevent React warnings
- **MEDIUM**: Fixed PWA manifest errors (GET /null 404)
  - Created `public/images/icons/icon.svg` - MDR logo icon
  - Created `public/images/icons/icon-192x192.png` - PWA icon placeholder
  - Created `public/images/icons/icon-512x512.png` - PWA icon placeholder
  - Updated `public/manifest.json` with valid icon references

### ✅ Added
- PWA icon assets for Progressive Web App support
- SVG logo icon for scalable display across all devices

### 📊 Impact
- **100% elimination** of React console warnings
- **100% elimination** of MUI deprecation warnings
- **100% elimination** of 404 errors for PWA resources
- Improved developer experience with clean console output
- Better SEO and performance with proper `fetchPriority` attributes

---

## [0.9.1-beta] - 2025-11-02

### ⚡ Performance
- **CRITICAL**: Fixed severe performance issue causing 15-20 second page loads
- **HIGH**: Optimized `HandleInertiaRequests` - reduced from 8+ to 2 SQL queries per request
- **HIGH**: Implemented `AdminSetting::getAllCached()` - reduced from 30+ to 1 SQL query
- **HIGH**: Optimized `AppServiceProvider` boot methods - reduced from 15+ to 1 SQL query
- **MEDIUM**: Reorganized middleware stack - reduced overhead from 14 to 12 middlewares
- **MEDIUM**: Implemented user data caching (5 min TTL) with automatic invalidation
- **TOTAL**: Reduced SQL queries from 53+ to 4 per request (**92% reduction**)
- **RESULT**: Page load times improved from 15-20s to 1-3s (**85-95% faster**)

### 🔧 Changed
- Migrated to Tailwind CSS v4 with native Vite plugin
- Removed `postcss.config.js` and `tailwind.config.js` (no longer needed in v4)
- Updated CSS syntax to use `@import "tailwindcss"` and `@theme` directive
- Optimized middleware grouping in `bootstrap/app.php`

### ✅ Added
- `AdminSetting::getAllCached()` method for bulk settings retrieval
- `HandleInertiaRequests::getUserData()` method with caching
- Performance optimization documentation (`docs/PERFORMANCE_OPTIMIZATIONS.md`)

### 🐛 Fixed
- Resolved N+1 query problem in user authentication data
- Fixed redundant AdminSetting queries across multiple providers
- Eliminated duplicate middleware append calls

---

## [0.9.0-beta] - 2025-11-02

### 🔒 Security
- **CRITICAL**: Verified production secrets are not versioned in repository
- **CRITICAL**: Confirmed no hardcoded API keys in codebase
- **HIGH**: Fixed XSS vulnerabilities in `GlobalSearch.jsx` and `ShowWithML.jsx`
- **HIGH**: Implemented centralized DOMPurify sanitization (`resources/js/utils/sanitize.js`)
- **HIGH**: Hardened CSP policies - removed `unsafe-eval`, implemented nonce-based inline scripts
- **HIGH**: Created CSP violation reporting endpoint (`/api/csp-report`)
- **MEDIUM**: Implemented 2FA verification middleware for privileged roles
- **MEDIUM**: Added comprehensive FormRequest validation tests
- **MEDIUM**: Enhanced session security (secure cookies, 15-60 min timeouts)
- **MEDIUM**: Implemented progressive rate limiting with automatic IP banning
- **MEDIUM**: Added audit logging with anonymized session IDs
- **MEDIUM**: Improved impersonation security with session limits

### 🔄 Changed
- **BREAKING**: Updated Laravel from 12.28.1 to 12.36.1
- **BREAKING**: Updated 25 composer packages to latest versions
- Updated security headers middleware with stricter policies
- Enhanced logging configuration with dedicated security channel

### ✅ Added
- Created comprehensive security test suite (47 tests)
  - `tests/Feature/Require2FAVerificationTest.php` (14 tests)
  - `tests/Unit/StoreUserRequestTest.php` (15 tests)
  - `tests/Unit/ReviewBanAppealRequestTest.php` (18 tests)
- Added security documentation
  - `docs/SECURITY_FRONTEND_SANITIZATION.md`
  - `docs/PRODUCTION_CONFIGURATION.md`
- Implemented Semantic Versioning system
  - `VERSION` file
  - `config/version.php`
  - `app/Helpers/VersionHelper.php`
  - `CHANGELOG.md`
  - `VERSIONING.md`

### 🐛 Fixed
- Fixed duplicate `user_devices` table migration
- Fixed migration order issue with `user_bans` synchronization
- Fixed MySQL-specific syntax in migrations for SQLite compatibility
- Resolved database migration conflicts in test environment

### 📚 Documentation
- Added frontend sanitization guidelines
- Added production configuration checklist
- Added semantic versioning documentation
- Updated security audit documentation

---

## [0.8.0-beta] - 2025-10-15

### Added
- User management system with role-based access control
- Device tracking and trusted device management
- OAuth social login integration (Google, Facebook, GitHub)
- User ban and appeal system
- Admin audit logging

### Changed
- Improved authentication flow with 2FA support
- Enhanced user profile management

### Fixed
- Various bug fixes in user authentication
- Performance improvements in device tracking

---

## [0.7.0-beta] - 2025-09-01

### Added
- Blog system with ML-powered recommendations
- Comment system with moderation capabilities
- User profiles and settings
- Rich text editor with TinyMCE
- Image upload and management

### Changed
- Improved UI/UX with Material-UI components
- Enhanced responsive design

### Fixed
- Various bug fixes in blog post rendering
- Performance improvements in ML recommendations

---

## Version History Summary

- **0.9.0-beta** (2025-11-02) - Security Hardening Release
- **0.8.0-beta** (2025-10-15) - Feature Expansion
- **0.7.0-beta** (2025-09-01) - Core Features

---

## Semantic Versioning Guide

This project follows [Semantic Versioning 2.0.0](https://semver.org/):

### Version Format: `MAJOR.MINOR.PATCH[-PRERELEASE][+BUILD]`

- **MAJOR**: Incompatible API changes (breaking changes)
- **MINOR**: Backwards-compatible functionality additions
- **PATCH**: Backwards-compatible bug fixes
- **PRERELEASE**: alpha, beta, rc.1, etc.
- **BUILD**: Build metadata

### Pre-1.0.0 Development

During initial development (0.x.x versions):
- **0.MINOR.PATCH**: Anything may change at any time
- The public API should not be considered stable
- Version 1.0.0 defines the first stable public API

### Release Types

- **alpha**: Early development, unstable, for internal testing
- **beta**: Feature complete, but may have bugs, for wider testing
- **rc** (release candidate): Stable, final testing before release
- **stable**: Production-ready release

### Examples

- `0.9.0-beta` - Beta release, version 0.9.0
- `1.0.0` - First stable release
- `1.1.0` - New features, backwards-compatible
- `1.1.1` - Bug fixes, backwards-compatible
- `2.0.0` - Breaking changes, new major version
- `2.0.0-rc.1` - Release candidate for version 2.0.0
- `2.0.0+20250102` - Build metadata (date: 2025-01-02)

---

## Links

- [Semantic Versioning Specification](https://semver.org/)
- [Keep a Changelog](https://keepachangelog.com/)
- [MDR Construcciones Documentation](./docs/)

