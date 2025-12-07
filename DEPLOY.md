# GitHub Pages Deployment Guide

This guide explains how to deploy your Cocos Creator game to GitHub Pages.

## Prerequisites

1. Make sure you have built your project in Cocos Creator:
   - Open the project in Cocos Creator
   - Build for Web Mobile platform
   - The build should be located at `FrostyMerge/build/web-mobile/`

2. Ensure you have Git configured and the repository is connected to GitHub

## Deployment Steps

### 1. Run the Deployment Script

Make the script executable (first time only):
```bash
chmod +x deploy.sh
```

Run the deployment script:
```bash
./deploy.sh
```

This script will:
- Copy all files from `FrostyMerge/build/web-mobile/` to the `docs/` folder
- Clean any existing files in the `docs/` folder first
- Provide a summary of what was copied

### 2. Review and Commit Changes

Check what files were added/modified:
```bash
git status
```

Stage the docs folder:
```bash
git add docs/
```

Commit the changes:
```bash
git commit -m "Deploy to GitHub Pages"
```

### 3. Push to GitHub

Push your changes to the main branch:
```bash
git push origin main
```

### 4. Configure GitHub Pages

1. Go to your GitHub repository: `https://github.com/hotyanovicha/frostymerge`
2. Navigate to **Settings** → **Pages**
3. Under **Source**, select:
   - **Deploy from a branch**
   - **Branch**: `main`
   - **Folder**: `/docs`
4. Click **Save**

### 5. Access Your Game

After GitHub Pages finishes deploying (usually takes 1-2 minutes), your game will be available at:

**https://hotyanovicha.github.io/frostymerge/**

You can find the exact URL in the repository Settings → Pages section.

## Updating the Deployment

Whenever you make changes to your game and rebuild it:

1. Build the project in Cocos Creator (for Web Mobile platform)
2. Run `./deploy.sh` again
3. Commit and push the changes:
   ```bash
   git add docs/
   git commit -m "Update GitHub Pages deployment"
   git push origin main
   ```

GitHub Pages will automatically rebuild and deploy your updated game.

## Troubleshooting

### Build directory not found
- Make sure you've built the project in Cocos Creator
- Verify the build is located at `FrostyMerge/build/web-mobile/`

### GitHub Pages not updating
- Wait a few minutes for GitHub to process the changes
- Check the Actions tab in your repository for any deployment errors
- Verify the Pages settings are configured correctly

### Game not loading
- Check the browser console for errors
- Verify all asset paths are relative (not absolute)
- Ensure the `docs/` folder contains all necessary files including `index.html`

## Notes

- The `docs/` folder is tracked in Git and contains your deployable build
- The deployment script preserves the exact structure of your web-mobile build
- GitHub Pages may take a few minutes to update after pushing changes

