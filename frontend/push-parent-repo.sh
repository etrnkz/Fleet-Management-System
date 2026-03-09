#!/bin/bash

# Script to push the entire Fleet-Management-System repository
# Run this from the Fleet-Management-System root directory (parent of frontend)

echo "=== Pushing Fleet-Management-System Repository ==="
echo ""

# Navigate to parent directory
cd ..

# Check if we're in the right directory
if [ ! -d ".git" ]; then
    echo "Error: Not in a git repository. Make sure you're in Fleet-Management-System root."
    exit 1
fi

echo "Current directory: $(pwd)"
echo ""

# Show current status
echo "Git status:"
git status
echo ""

# Add all changes
echo "Adding all changes..."
git add .
echo ""

# Show what will be committed
echo "Files to be committed:"
git status --short
echo ""

# Commit with message
read -p "Enter commit message (or press Enter for default): " commit_msg
if [ -z "$commit_msg" ]; then
    commit_msg="Update Fleet Management System with employee app"
fi

git commit -m "$commit_msg"
echo ""

# Push to fleet branch
echo "Pushing to origin/fleet..."
git push origin fleet

echo ""
echo "=== Push Complete ==="
