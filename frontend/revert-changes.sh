#!/bin/bash

# Script to revert all changes pushed to GitHub

echo "⚠️  WARNING: This will revert changes on the fleet branch!"
echo ""

# Navigate to parent directory
cd ..

echo "📍 Current directory: $(pwd)"
echo ""

# Show current commits
echo "📜 Current commits:"
git log --oneline -5
echo ""

# Ask for confirmation
read -p "Do you want to revert to the commit BEFORE 'admin dean employee'? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "❌ Revert cancelled"
    exit 0
fi

echo ""
echo "🔄 Reverting to commit: 97d6599 (third commit)"
echo ""

# Reset to the previous commit
git reset --hard 97d6599

echo ""
echo "📊 Current status:"
git status
echo ""

# Force push to GitHub (this will rewrite history)
echo "📤 Force pushing to GitHub..."
read -p "Are you SURE you want to force push? This will rewrite GitHub history! (yes/no): " confirm2

if [ "$confirm2" != "yes" ]; then
    echo "❌ Force push cancelled"
    echo "💡 Your local changes are reverted, but GitHub still has the old version"
    echo "💡 Run 'git push origin fleet --force' manually if you want to update GitHub"
    exit 0
fi

git push origin fleet --force

echo ""
if [ $? -eq 0 ]; then
    echo "✅ Successfully reverted changes on GitHub!"
    echo "🔗 https://github.com/etrnkz/Fleet-Management-System/tree/fleet"
else
    echo "❌ Force push failed. You may need to set up authentication."
fi
