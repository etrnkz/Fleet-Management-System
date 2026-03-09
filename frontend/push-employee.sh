#!/bin/bash

# Script to push only the employee app to GitHub

echo "🚀 Pushing employee app to GitHub..."

# Add only the employee app
git add apps/employee/

# Check if there are changes to commit
if git diff --cached --quiet; then
    echo "⚠️  No changes to commit in employee app"
else
    # Commit the changes
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

    echo "✅ Changes committed successfully"
fi

# Push to fleet branch
echo "📤 Pushing to fleet branch..."
git push origin fleet

echo "✨ Done! Employee app pushed to GitHub"
