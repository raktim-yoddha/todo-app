# Taskmaster Everywhere - AI Agent Guidelines & Release Protocol

This repository contains **Taskmaster Everywhere**, a high-performance Tauri + React + TypeScript productivity app.
All AI assistants (Claude, Cursor, Copilot, Gemini, Antigravity, etc.) working on this repository **MUST** adhere to the following mandatory guidelines.

---

## 1. Version Synchronization & Auto-Update Integrity

The app features an in-app auto-update system that compares the running version with the latest release on GitHub (`https://api.github.com/repos/raktim-yoddha/todo-app/releases/latest`).

Whenever releasing or bumping the version, you **MUST** synchronize the version across **all three** files:
1. `package.json` -> `"version": "X.Y.Z"`
2. `src-tauri/tauri.conf.json` -> `"version": "X.Y.Z"`
3. `src/utils/updater.ts` -> `export const CURRENT_VERSION = "X.Y.Z";`

Failure to update all three files will cause version mismatch bugs where users are repeatedly notified of phantom updates or never receive update alerts.

---

## 2. Git Tracking & Releases Directory Rule

- **NEVER** track binary release files (`.exe`, `.msi`, `.zip`, `.tar.gz`) in Git.
- The `releases/` directory is strictly for local build output and **MUST** remain ignored in `.gitignore`.
- Never execute `git add releases/` or commit any binary files to the git history.

---

## 3. Mandatory Release & Tagging Workflow

Whenever the user asks to "release", "tag", or "bump version", **DO NOT ONLY DO `git push`**. 
Simply pushing commits to `master` will **NOT** trigger the auto-updater for existing users!

You **MUST** execute the complete 5-step release pipeline:

### Step 1: Synchronize Version
Update `package.json`, `src-tauri/tauri.conf.json`, and `src/utils/updater.ts` to `X.Y.Z`.

### Step 2: Build Production Binaries
Run:
```powershell
pnpm run release
```
Ensure all 3 release binaries are produced:
- `releases/Taskmaster-Everywhere-Portable.exe`
- `releases/Taskmaster-Everywhere-Setup.exe`
- `releases/Taskmaster-Everywhere-Setup.msi`

### Step 3: Git Commit & Push
Stage and commit code changes:
```powershell
git add .
git commit -m "chore(release): vX.Y.Z - <summary of changes>"
git push origin master
```

### Step 4: Create & Push Git Tag
Create an annotated tag and push it to GitHub:
```powershell
git tag -a vX.Y.Z -m "Release vX.Y.Z - Taskmaster Everywhere"
git push origin vX.Y.Z
```

### Step 5: Publish GitHub Release with Assets
Publish the release using GitHub CLI (`gh`) and attach the 3 binaries:
```powershell
gh release create vX.Y.Z `
  releases/Taskmaster-Everywhere-Portable.exe `
  releases/Taskmaster-Everywhere-Setup.exe `
  releases/Taskmaster-Everywhere-Setup.msi `
  --title "Taskmaster Everywhere vX.Y.Z" `
  --notes "<Changelog and release notes>"
```

> **Why this is critical:**
> Older app versions query GitHub API's `releases/latest`. Only when a GitHub Release is published with attached assets will older versions display the "vX.Y.Z Available!" in-app modal with direct one-click download buttons for the installer and portable `.exe`.
