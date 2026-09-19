# Release and Tagging Rules

## Critical Rule: Releases Must Use Git Tags and GitHub Releases

When instructed to release, build, or deploy a version of this application:
1. **Never only push git commits.** Pushing commits to `origin/master` alone does not notify existing users and does not trigger the auto-updater.
2. **Synchronize versions across all three files:**
   - `package.json`
   - `src-tauri/tauri.conf.json`
   - `src/utils/updater.ts`
3. **Do not track the `releases/` directory in git.** The binaries are distributed via GitHub Release assets, not git blobs.
4. **Always create an annotated git tag** with format `vX.Y.Z` and push it using `git push origin vX.Y.Z`.
5. **Always publish a GitHub Release** using `gh release create vX.Y.Z ...` attaching the portable `.exe`, installer `.exe`, and `.msi` binaries so the in-app updater detects the release and provides direct download links.
