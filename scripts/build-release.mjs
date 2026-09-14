import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const appRoot = path.resolve(__dirname, "..");
const workspaceRoot = path.resolve(appRoot, "..");

// Define destination directories
const releaseDirs = [
  path.resolve(workspaceRoot, "releases"),
  path.resolve(appRoot, "releases"),
];

console.log("\n========================================================");
console.log("  🚀 BUILDING TODO-OVERLAY TAURI PRODUCTION RELEASE");
console.log("========================================================\n");

// 1. Build frontend and Tauri packages
console.log("📦 Compiling frontend and bundling Tauri (EXE, MSI, NSIS)...");
execSync("npx tauri build", {
  cwd: appRoot,
  stdio: "inherit",
});

// 2. Locate built artifacts
const targetReleaseDir = path.resolve(appRoot, "src-tauri/target/release");
const bundleDir = path.resolve(targetReleaseDir, "bundle");
const nsisDir = path.resolve(bundleDir, "nsis");
const msiDir = path.resolve(bundleDir, "msi");

const portableExe = path.resolve(targetReleaseDir, "todo-overlay-app.exe");

let setupExe = null;
if (fs.existsSync(nsisDir)) {
  const files = fs.readdirSync(nsisDir);
  const match = files.find((f) => f.endsWith("-setup.exe") || f.endsWith(".exe"));
  if (match) setupExe = path.resolve(nsisDir, match);
}

let setupMsi = null;
if (fs.existsSync(msiDir)) {
  const files = fs.readdirSync(msiDir);
  const match = files.find((f) => f.endsWith(".msi"));
  if (match) setupMsi = path.resolve(msiDir, match);
}

// 3. Prepare release files map
const filesToDeploy = [
  { source: portableExe, targetName: "Todo-Overlay-Portable.exe", desc: "Portable Executable (No install needed)" },
  { source: setupExe, targetName: "Todo-Overlay-Setup.exe", desc: "NSIS Installer Setup (.exe)" },
  { source: setupMsi, targetName: "Todo-Overlay-Setup.msi", desc: "MSI Windows Installer (.msi)" },
];

// 4. Clean & copy to release folders
for (const dir of releaseDirs) {
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
  fs.mkdirSync(dir, { recursive: true });

  for (const item of filesToDeploy) {
    if (item.source && fs.existsSync(item.source)) {
      const destPath = path.resolve(dir, item.targetName);
      fs.copyFileSync(item.source, destPath);
    }
  }
}

// 5. Output Summary
console.log("\n========================================================");
console.log("  ✅ RELEASE BUILD COMPLETED & REPLACED SUCCESSFULLY");
console.log("========================================================\n");
console.log("The following releases have been generated and updated:\n");

const primaryReleaseDir = releaseDirs[0];
for (const item of filesToDeploy) {
  const filePath = path.resolve(primaryReleaseDir, item.targetName);
  if (fs.existsSync(filePath)) {
    const stats = fs.statSync(filePath);
    const sizeMb = (stats.size / (1024 * 1024)).toFixed(2);
    console.log(` • ${item.targetName} (${sizeMb} MB)`);
    console.log(`   Description: ${item.desc}`);
    console.log(`   Path: ${filePath}\n`);
  } else {
    console.log(` ⚠️ ${item.targetName}: Not found\n`);
  }
}

console.log("📁 Release directories:");
for (const dir of releaseDirs) {
  console.log(` - ${dir}`);
}
console.log("\nEach time you run this command, all old files in these directories are automatically replaced with the new build.\n");
