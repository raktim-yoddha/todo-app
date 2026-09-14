import React from "react";
import { UpdateInfo, CURRENT_VERSION, openExternalUrl } from "../utils/updater";
import { Sparkles, Download, X, ArrowUpRight } from "lucide-react";

interface UpdateNotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  updateInfo: UpdateInfo | null;
  onDismissVersion?: (version: string) => void;
}

export const UpdateNotificationModal: React.FC<UpdateNotificationModalProps> = ({
  isOpen,
  onClose,
  updateInfo,
  onDismissVersion,
}) => {
  if (!isOpen || !updateInfo) return null;

  const handleDownload = async (url: string) => {
    await openExternalUrl(url);
  };

  const handleRemindLater = () => {
    if (onDismissVersion) {
      onDismissVersion(updateInfo.version);
    }
    onClose();
  };

  // Identify specific binaries from release assets
  const setupAsset = updateInfo.assets.find((a) => a.name.toLowerCase().endsWith("-setup.exe") || (a.name.toLowerCase().includes("setup") && a.name.toLowerCase().endsWith(".exe")));
  const portableAsset = updateInfo.assets.find((a) => a.name.toLowerCase().includes("portable") && a.name.toLowerCase().endsWith(".exe"));
  const msiAsset = updateInfo.assets.find((a) => a.name.toLowerCase().endsWith(".msi"));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg bg-[#0c0e14] border border-sky-500/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col text-neutral-200"
        style={{
          boxShadow: "0 25px 60px -15px rgba(0, 0, 0, 0.9), 0 0 35px -5px rgba(56, 189, 248, 0.15)",
        }}
      >
        {/* Header with gradient badge */}
        <div className="px-6 pt-6 pb-4 flex items-start justify-between border-b border-neutral-800/80 bg-gradient-to-b from-sky-500/[0.08] to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/20 border border-sky-500/40 flex items-center justify-center text-sky-400 shadow-inner">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-tight">
                  Update Available
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-sky-500/20 text-sky-400 border border-sky-500/30">
                  v{updateInfo.version}
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-0.5">
                Current version: <span className="font-mono text-neutral-300">v{CURRENT_VERSION}</span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800/60 transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body: Release Notes / Changelog */}
        <div className="px-6 py-4 flex-1 overflow-y-auto max-h-60 space-y-3 text-xs leading-relaxed">
          <div className="flex items-center gap-1.5 text-neutral-400 font-semibold uppercase tracking-wider text-[10px]">
            <span>What's New in {updateInfo.title}</span>
          </div>

          <div className="p-3.5 rounded-xl bg-black/40 border border-neutral-800/80 font-sans text-neutral-300 whitespace-pre-wrap select-text leading-relaxed">
            {updateInfo.notes}
          </div>
        </div>

        {/* Direct Download Options */}
        <div className="px-6 py-3 bg-black/30 border-t border-neutral-800/60 space-y-2">
          <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block mb-1">
            Available Windows Downloads
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {/* Setup .exe */}
            <button
              type="button"
              onClick={() => handleDownload(setupAsset ? setupAsset.downloadUrl : updateInfo.releaseUrl)}
              className="px-3 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-sky-500/20 cursor-pointer active:scale-95"
            >
              <Download className="w-3.5 h-3.5" />
              <span>EXE Setup (.exe)</span>
            </button>

            {/* Portable .exe */}
            <button
              type="button"
              onClick={() => handleDownload(portableAsset ? portableAsset.downloadUrl : updateInfo.releaseUrl)}
              className="px-3 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-all border border-neutral-700 cursor-pointer active:scale-95"
            >
              <Download className="w-3.5 h-3.5 text-neutral-400" />
              <span>Portable (.exe)</span>
            </button>

            {/* MSI Setup */}
            <button
              type="button"
              onClick={() => handleDownload(msiAsset ? msiAsset.downloadUrl : updateInfo.releaseUrl)}
              className="px-3 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-all border border-neutral-700 cursor-pointer active:scale-95"
            >
              <Download className="w-3.5 h-3.5 text-neutral-400" />
              <span>MSI Setup (.msi)</span>
            </button>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-3.5 bg-[#080a0f] border-t border-neutral-800 flex items-center justify-between">
          <button
            type="button"
            onClick={() => handleDownload(updateInfo.releaseUrl)}
            className="text-xs text-sky-400 hover:text-sky-300 flex items-center gap-1 font-medium transition-colors cursor-pointer"
          >
            <span>View Release on GitHub</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleRemindLater}
              className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50 transition-colors cursor-pointer"
            >
              Remind Me Later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
