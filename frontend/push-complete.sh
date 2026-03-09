#!/bin/bash

# Script to push complete Fleet-Management-System

echo "🚀 Pushing complete Fleet-Management-System to GitHub..."
echo ""

# Navigate to parent directory
cd ..

echo "📍 Current directory: $(pwd)"
echo ""

# Check current branch
CURRENT_BRANCH=$(git branch --show-current)
echo "🌿 Current branch: $CURRENT_BRANCH"
echo ""

# Switch to fleet branch if not already on it
if [ "$CURRENT_BRANCH" != "fleet" ]; then
    echo "🔄 Switching to fleet branch..."
    git checkout fleet
    echo ""
fi

# Show status
echo "📊 Git status:"
git status
echo ""

# Add all changes
echo "➕ Adding all changes..."
git add .
echo ""

# Check if there are changes to commit
if git diff --cached --quiet; then
    echo "⚠️  No changes to commit"
    echo ""
else
    # Show what will be committed
    echo "📝 Files to be committed:"
    git diff --cached --name-only
    echo ""
    
    # Commit the changes
    echo "💾 Committing changes..."
    git commit -m "feat: Complete Fleet Management System with employee dashboard

Employee App Features:
- Landing page with animations and emerald green theme
- Login page with validation (employee@hu.edu.et / employee123)
- Signup page with profile image upload
- Complete dashboard with:
  * Profile image display in header
  * Notification system with approval/rejection details
  * Loading spinners for all navigation (2 sec)
  * Sidebar navigation (Dashboard, Request Trip, Feedback, Vehicles, Documents)
  * Available vehicles section with full details
  * Trip request form
  * Feedback form with rating system
  * Document center
  * Recent activity feed
  * All forms functional with validation
  * Blurred background for loading states
  * Emerald green color scheme throughout"
    echo ""
    echo "✅ Changes committed successfully"
    echo ""
fi

# Push to fleet branch
echo "📤 Pushing to fleet branch..."
git push origin fleet
echo ""

if [ $? -eq 0 ]; then
    echo "✨ Success! Complete system pushed to GitHub"
    echo "🔗 https://github.com/etrnkz/Fleet-Management-System/tree/fleet"
else
    echo "❌ Push failed. You may need to set up authentication."
    echo ""
    echo "To fix authentication, run one of these:"
    echo "1. For HTTPS with token:"
    echo "   git remote set-url origin https://YOUR_TOKEN@github.com/etrnkz/Fleet-Management-System.git"
    echo ""
    echo "2. For SSH:"
    echo "   git remote set-url origin git@github.com:etrnkz/Fleet-Management-System.git"
fi
