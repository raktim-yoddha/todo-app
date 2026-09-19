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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg liquid-glass-card rounded-[22px] border border-white/10 shadow-2xl overflow-hidden flex flex-col text-neutral-200"
        style={{
          boxShadow: "0 25px 60px -15px rgba(0, 0, 0, 0.9), 0 0 35px -5px rgba(255, 87, 51, 0.15)",
        }}
      >
        {/* Header with gradient badge */}
        <div className="px-6 pt-6 pb-4 flex items-start justify-between border-b border-white/[0.06] bg-gradient-to-b from-[#ff5733]/[0.08] to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#ff5733]/20 border border-[#ff5733]/40 flex items-center justify-center text-[#ff5733] shadow-inner">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-tight">
                  Update Available
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#ff5733]/20 text-[#ff5733] border border-[#ff5733]/30">
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
            className="p-1.5 rounded-xl text-neutral-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
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

          <div className="p-4 rounded-2xl liquid-glass-row border border-white/[0.06] font-sans text-neutral-300 whitespace-pre-wrap select-text leading-relaxed">
            {updateInfo.notes}
          </div>
        </div>

        {/* Direct Download Options */}
        <div className="px-6 py-3.5 bg-black/40 border-t border-white/[0.06] space-y-2">
          <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-1">
            Available Windows Downloads
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {/* Setup .exe */}
            <button
              type="button"
              onClick={() => handleDownload(setupAsset ? setupAsset.downloadUrl : updateInfo.releaseUrl)}
              className="liquid-coral-btn px-3 py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 active:scale-95"
            >
              <Download className="w-3.5 h-3.5" />
              <span>EXE Setup (.exe)</span>
            </button>

            {/* Portable .exe */}
            <button
              type="button"
              onClick={() => handleDownload(portableAsset ? portableAsset.downloadUrl : updateInfo.releaseUrl)}
              className="px-3 py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-all border border-white/10 cursor-pointer active:scale-95"
            >
              <Download className="w-3.5 h-3.5 text-neutral-400" />
              <span>Portable (.exe)</span>
            </button>

            {/* MSI Setup */}
            <button
              type="button"
              onClick={() => handleDownload(msiAsset ? msiAsset.downloadUrl : updateInfo.releaseUrl)}
              className="px-3 py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-all border border-white/10 cursor-pointer active:scale-95"
            >
              <Download className="w-3.5 h-3.5 text-neutral-400" />
              <span>MSI Setup (.msi)</span>
            </button>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-3.5 bg-[#121418] border-t border-white/[0.06] flex items-center justify-between">
          <button
            type="button"
            onClick={() => handleDownload(updateInfo.releaseUrl)}
            className="text-xs text-[#ff5733] hover:text-[#ff6947] flex items-center gap-1 font-medium transition-colors cursor-pointer"
          >
            <span>View Release on GitHub</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleRemindLater}
              className="px-3.5 py-1.5 rounded-xl text-xs font-medium text-neutral-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              Remind Me Later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
