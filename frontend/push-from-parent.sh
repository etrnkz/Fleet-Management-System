#!/bin/bash

# Script to push employee app from parent directory

echo "🚀 Pushing employee app to GitHub..."
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

# Add only the employee app from frontend
echo "➕ Adding employee app files..."
git add frontend/apps/employee/
echo ""

# Check if there are changes to commit
if git diff --cached --quiet; then
    echo "⚠️  No changes to commit in employee app"
    echo ""
else
    # Commit the changes
    echo "💾 Committing changes..."
    git commit -m "feat: Complete employee dashboard implementation

- Profile image upload during signup
- User profile display in dashboard header
- Notification system with approval/rejection details
- Loading spinners for all navigation (2 sec)
- Sidebar navigation with conditional sections
- Available vehicles section with full details
- Rating system for feedback
- All forms functional with validation
- Blurred background for loading states"
    echo ""
    echo "✅ Changes committed successfully"
    echo ""
fi

# Push to fleet branch
echo "📤 Pushing to fleet branch..."
git push origin fleet
echo ""

echo "✨ Done! Check your GitHub repository"
echo "🔗 https://github.com/etrnkz/Fleet-Management-System/tree/fleet"
