# Frontend HTML Sanitization Guide

## ✅ Security Best Practices

This document outlines the security practices for handling HTML content in the frontend to prevent XSS (Cross-Site Scripting) attacks.

## 🔒 Core Principle

**Only trusted, sanitized HTML should reach the client.**

All user-generated content or external data that will be rendered as HTML **must** be sanitized before being displayed in the browser.

## 📦 Centralized Sanitization Utility

We use **DOMPurify** for HTML sanitization. All sanitization logic is centralized in:

```
resources/js/utils/sanitize.js
```

### Available Functions

#### 1. `sanitizeHtml(html)`
Standard sanitization for rich content (blog posts, descriptions, etc.)

```javascript
import { sanitizeHtml } from '@/utils/sanitize';

const cleanHtml = sanitizeHtml(userContent);
```

**Allowed tags:** `p`, `br`, `strong`, `em`, `u`, `s`, `del`, `ins`, `h1-h6`, `ul`, `ol`, `li`, `a`, `img`, `blockquote`, `code`, `pre`, `table`, `div`, `span`, `mark`

#### 2. `sanitizeHtmlStrict(html)`
Strict sanitization for snippets and search results

```javascript
import { sanitizeHtmlStrict } from '@/utils/sanitize';

const cleanSnippet = sanitizeHtmlStrict(searchResult.excerpt);
```

**Allowed tags:** `strong`, `em`, `mark`, `br`

#### 3. `useSanitizedHtml(html, strict = false)`
React hook for memoized sanitization

```javascript
import { useSanitizedHtml } from '@/utils/sanitize';

function MyComponent({ content }) {
    const sanitizedContent = useSanitizedHtml(content);
    
    return <div dangerouslySetInnerHTML={{ __html: sanitizedContent }} />;
}
```

## ⚠️ When to Sanitize

### ✅ ALWAYS Sanitize

1. **User-generated content**
   - Blog post content
   - Comments
   - User profiles
   - Form submissions

2. **Search results**
   - Highlighted search terms
   - Excerpts
   - Titles with HTML

3. **External data**
   - API responses
   - Third-party content
   - RSS feeds

4. **Database content**
   - Even if sanitized on the backend, sanitize again on the frontend as defense-in-depth

### ❌ NEVER Use Without Sanitization

```javascript
// ❌ DANGEROUS - Never do this with user content
<div dangerouslySetInnerHTML={{ __html: userContent }} />

// ✅ SAFE - Always sanitize first
<div dangerouslySetInnerHTML={{ __html: sanitizeHtml(userContent) }} />
```

## 🛡️ Implementation Examples

### Example 1: Blog Post Content

```javascript
import React, { useMemo } from 'react';
import { sanitizeHtml } from '@/utils/sanitize';

function BlogPost({ post }) {
    const sanitizedContent = useMemo(
        () => sanitizeHtml(post?.content ?? ''),
        [post?.content]
    );
    
    return (
        <article>
            <h1>{post.title}</h1>
            <div dangerouslySetInnerHTML={{ __html: sanitizedContent }} />
        </article>
    );
}
```

### Example 2: Search Results with Highlighting

```javascript
import { sanitizeHtmlStrict } from '@/utils/sanitize';

function SearchResult({ result }) {
    return (
        <div>
            <h3 dangerouslySetInnerHTML={{ 
                __html: sanitizeHtmlStrict(result.title) 
            }} />
            <p dangerouslySetInnerHTML={{ 
                __html: sanitizeHtmlStrict(result.excerpt) 
            }} />
        </div>
    );
}
```

### Example 3: Using the Hook

```javascript
import { useSanitizedHtml } from '@/utils/sanitize';

function RichTextDisplay({ content }) {
    // Automatically memoized
    const sanitizedContent = useSanitizedHtml(content);
    
    return <div dangerouslySetInnerHTML={{ __html: sanitizedContent }} />;
}
```

## 🚫 Common Mistakes to Avoid

### 1. Trusting Backend Sanitization Alone

```javascript
// ❌ BAD - Assuming backend already sanitized
<div dangerouslySetInnerHTML={{ __html: post.content }} />

// ✅ GOOD - Defense in depth
<div dangerouslySetInnerHTML={{ __html: sanitizeHtml(post.content) }} />
```

### 2. Not Memoizing Sanitization

```javascript
// ❌ BAD - Sanitizes on every render
function Component({ content }) {
    return <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(content) }} />;
}

// ✅ GOOD - Memoized sanitization
function Component({ content }) {
    const sanitized = useMemo(() => sanitizeHtml(content), [content]);
    return <div dangerouslySetInnerHTML={{ __html: sanitized }} />;
}

// ✅ BETTER - Use the hook
function Component({ content }) {
    const sanitized = useSanitizedHtml(content);
    return <div dangerouslySetInnerHTML={{ __html: sanitized }} />;
}
```

### 3. Using Wrong Sanitization Level

```javascript
// ❌ BAD - Too permissive for search results
<span dangerouslySetInnerHTML={{ __html: sanitizeHtml(searchTerm) }} />

// ✅ GOOD - Use strict for snippets
<span dangerouslySetInnerHTML={{ __html: sanitizeHtmlStrict(searchTerm) }} />
```

## 🔧 Configuration

The sanitization configuration is defined in `resources/js/utils/sanitize.js`:

```javascript
export const DOMPURIFY_CONFIG = {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', ...],
    ALLOWED_ATTR: ['href', 'src', 'alt', ...],
    ALLOWED_CLASSES: {
        'mark': ['search-highlight'],
        'code': ['language-*'],
    },
    ALLOW_DATA_ATTR: false,
    ALLOW_UNKNOWN_PROTOCOLS: false,
    SAFE_FOR_TEMPLATES: true,
};
```

### Modifying Configuration

If you need to allow additional tags or attributes:

1. Update the configuration in `resources/js/utils/sanitize.js`
2. Document the reason in a comment
3. Get security review approval
4. Test thoroughly

## 📋 Checklist for New Features

Before deploying any feature that renders HTML:

- [ ] All user content is sanitized using `sanitizeHtml()` or `sanitizeHtmlStrict()`
- [ ] Sanitization is memoized (using `useMemo` or `useSanitizedHtml` hook)
- [ ] No direct use of `dangerouslySetInnerHTML` without sanitization
- [ ] Appropriate sanitization level is used (standard vs strict)
- [ ] Code has been reviewed for XSS vulnerabilities
- [ ] Tests include XSS attack vectors

## 🧪 Testing

Always test with malicious payloads:

```javascript
const xssPayloads = [
    '<script>alert("XSS")</script>',
    '<img src=x onerror=alert("XSS")>',
    '<svg onload=alert("XSS")>',
    'javascript:alert("XSS")',
    '<iframe src="javascript:alert(\'XSS\')">',
];

xssPayloads.forEach(payload => {
    const sanitized = sanitizeHtml(payload);
    // Should not contain executable code
    expect(sanitized).not.toContain('<script');
    expect(sanitized).not.toContain('onerror');
    expect(sanitized).not.toContain('javascript:');
});
```

## 📚 Additional Resources

- [DOMPurify Documentation](https://github.com/cure53/DOMPurify)
- [OWASP XSS Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html)
- [React Security Best Practices](https://react.dev/learn/writing-markup-with-jsx#the-rules-of-jsx)

## 🆘 Questions?

If you're unsure whether content needs sanitization or which method to use, **always err on the side of caution** and sanitize. Contact the security team for guidance.

---

**Last Updated:** 2025-11-02  
**Maintained By:** Security Team

