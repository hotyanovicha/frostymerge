#!/bin/bash

# GitHub Pages Deployment Script
# This script copies the web-mobile build to the docs/ folder for GitHub Pages deployment

set -e  # Exit on error

SOURCE_DIR="FrostyMerge/build/web-mobile"
TARGET_DIR="docs"

# Check if source directory exists
if [ ! -d "$SOURCE_DIR" ]; then
    echo "Error: Source directory '$SOURCE_DIR' not found!"
    echo "Please make sure you have built the project in Cocos Creator."
    exit 1
fi

# Create target directory if it doesn't exist
mkdir -p "$TARGET_DIR"

# Remove existing contents of docs folder (if any)
echo "Cleaning existing docs folder..."
rm -rf "$TARGET_DIR"/*

# Copy all files from web-mobile build to docs folder
echo "Copying files from $SOURCE_DIR to $TARGET_DIR..."
cp -R "$SOURCE_DIR"/* "$TARGET_DIR/"

# Add .nojekyll to disable Jekyll processing (fixes underscore file issues)
touch "$TARGET_DIR/.nojekyll"

# Count files copied
FILE_COUNT=$(find "$TARGET_DIR" -type f | wc -l | tr -d ' ')

echo ""
echo "✓ Deployment complete!"
echo "  - Copied $FILE_COUNT files to $TARGET_DIR/"
echo ""
echo "Next steps:"
echo "  1. Review the changes: git status"
echo "  2. Commit the docs folder: git add docs/ && git commit -m 'Deploy to GitHub Pages'"
echo "  3. Push to GitHub: git push origin main"
echo "  4. Configure GitHub Pages:"
echo "     - Go to repository Settings → Pages"
echo "     - Source: Deploy from a branch"
echo "     - Branch: main, Folder: /docs"
echo ""

