#!/bin/bash

# Script to install Git hooks for security checks
# Run this script after cloning the repository

echo "🔧 Installing Git security hooks..."

# Check if .git directory exists
if [ ! -d ".git" ]; then
    echo "❌ Error: .git directory not found. Are you in the repository root?"
    exit 1
fi

# Create hooks directory if it doesn't exist
mkdir -p .git/hooks

# Copy pre-commit hook
if [ -f ".git-hooks/pre-commit" ]; then
    cp .git-hooks/pre-commit .git/hooks/pre-commit
    chmod +x .git/hooks/pre-commit
    echo "✅ Pre-commit hook installed successfully!"
else
    echo "❌ Error: .git-hooks/pre-commit not found"
    exit 1
fi

# Test the hook
echo ""
echo "🧪 Testing pre-commit hook..."
if .git/hooks/pre-commit; then
    echo "✅ Hook is working correctly!"
else
    echo "⚠️  Hook test failed, but it's installed. It will run on actual commits."
fi

echo ""
echo "✅ Git hooks installation complete!"
echo ""
echo "The pre-commit hook will now:"
echo "  • Prevent commits of .env files"
echo "  • Warn about potential secrets in code"
echo "  • Warn about large files"
echo ""
echo "To bypass the hook (not recommended), use: git commit --no-verify"

