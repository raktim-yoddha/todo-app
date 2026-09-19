---
name: release-and-tag
description: Mandatory step-by-step workflow for building, tagging, creating GitHub releases, and maintaining auto-update compatibility in Taskmaster Everywhere.
---

# Taskmaster Everywhere: Release & Tagging Skill

This skill guides you through executing an official release for Taskmaster Everywhere, ensuring that the in-app auto-updater detects the update and delivers direct download buttons to existing users.

## Checklist Before Release
- [ ] Ensure all code changes are tested and frontend builds cleanly (`pnpm run build`).
- [ ] Confirm no release binaries or `releases/` directory files are tracked in git (`git ls-files releases` must be empty).
- [ ] Verify version number matches across `package.json`, `src-tauri/tauri.conf.json`, and `src/utils/updater.ts`.

## Execution Steps

### 1. Version Bump
Set the target version in:
- `package.json` -> `"version": "0.1.x"`
- `src-tauri/tauri.conf.json` -> `"version": "0.1.x"`
- `src/utils/updater.ts` -> `export const CURRENT_VERSION = "0.1.x";`

### 2. Compile and Package Tauri Release
Run:
```powershell
pnpm run release
```
This script runs `npm run build` and `tauri build`, creating the portable, NSIS setup, and MSI installer files in the `releases/` directory.

### 3. Commit Code Changes
Stage all modified source files (excluding `releases/`):
```powershell
git add .
git commit -m "chore(release): vX.Y.Z - <summary of changes>"
git push origin master
```

### 4. Create and Push Git Tag
Create an annotated tag and push it:
```powershell
git tag -a vX.Y.Z -m "Release vX.Y.Z - Taskmaster Everywhere"
git push origin vX.Y.Z
```

### 5. Publish GitHub Release with Assets
Use the GitHub CLI (`gh`) to upload the 3 binaries:
```powershell
gh release create vX.Y.Z `
  releases/Taskmaster-Everywhere-Portable.exe `
  releases/Taskmaster-Everywhere-Setup.exe `
  releases/Taskmaster-Everywhere-Setup.msi `
  --title "Taskmaster Everywhere vX.Y.Z" `
  --notes "<Release highlights>"
```

### 6. Verify Auto-Update Endpoint
Test that the GitHub release is live:
```powershell
gh release view vX.Y.Z
```
When an existing user opens an older version of the app, `checkForUpdate()` queries `https://api.github.com/repos/raktim-yoddha/todo-app/releases/latest`, receives the new release with its assets, and immediately prompts the user to download the update.
