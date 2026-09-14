import { openUrl } from "@tauri-apps/plugin-opener";

export const CURRENT_VERSION = "0.1.0";
export const GITHUB_REPO = "raktim-yoddha/todo-app";

export interface ReleaseAsset {
  name: string;
  downloadUrl: string;
  size: number;
}

export interface UpdateInfo {
  version: string;
  title: string;
  notes: string;
  publishedAt: string;
  releaseUrl: string;
  assets: ReleaseAsset[];
  hasUpdate: boolean;
}

/**
 * Compares two semantic version strings (e.g. "0.1.0" and "0.1.1")
 * Returns true if remoteVersion is strictly greater than currentVersion
 */
export function isNewerVersion(current: string, remote: string): boolean {
  const cleanCurrent = current.replace(/^v/i, "").trim();
  const cleanRemote = remote.replace(/^v/i, "").trim();

  const cParts = cleanCurrent.split(".").map((n) => parseInt(n, 10) || 0);
  const rParts = cleanRemote.split(".").map((n) => parseInt(n, 10) || 0);

  for (let i = 0; i < Math.max(cParts.length, rParts.length); i++) {
    const c = cParts[i] ?? 0;
    const r = rParts[i] ?? 0;
    if (r > c) return true;
    if (r < c) return false;
  }
  return false;
}

/**
 * Checks GitHub Releases API for the latest release
 */
export async function checkForUpdate(): Promise<UpdateInfo | null> {
  try {
    const url = `https://api.github.com/repos/${GITHUB_REPO}/releases/latest`;
    const res = await fetch(url, {
      headers: {
        Accept: "application/vnd.github.v3+json",
      },
    });

    if (!res.ok) {
      if (res.status === 404) {
        // No releases published yet
        return null;
      }
      console.warn("GitHub API release check responded with:", res.status);
      return null;
    }

    const data = await res.json();
    const tag = data.tag_name || "";
    const cleanTag = tag.replace(/^v/i, "");
    const hasUpdate = isNewerVersion(CURRENT_VERSION, cleanTag);

    const assets: ReleaseAsset[] = (data.assets || []).map((a: any) => ({
      name: a.name,
      downloadUrl: a.browser_download_url,
      size: a.size,
    }));

    return {
      version: cleanTag,
      title: data.name || `Version ${cleanTag}`,
      notes: data.body || "A new update is available with improvements and bug fixes.",
      publishedAt: data.published_at,
      releaseUrl: data.html_url || `https://github.com/${GITHUB_REPO}/releases/latest`,
      assets,
      hasUpdate,
    };
  } catch (err) {
    console.warn("Failed to check for updates:", err);
    return null;
  }
}

/**
 * Opens a URL in the user's default browser safely
 */
export async function openExternalUrl(url: string): Promise<void> {
  try {
    await openUrl(url);
  } catch (err) {
    console.warn("openUrl failed, falling back to window.open", err);
    window.open(url, "_blank");
  }
}
