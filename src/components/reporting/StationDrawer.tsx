import React from "react";
import { X, ArrowRight, Film, ExternalLink } from "lucide-react";
import { useReportingStore } from "../../stores/reportingStore";
import { ProfileLedger } from "./ProfileLedger";

export const StationDrawer: React.FC = () => {
  const activeStation = useReportingStore((s) => s.activeStation);
  const isInspecting = useReportingStore((s) => s.isInspecting);
  const closeStationInspection = useReportingStore((s) => s.closeStationInspection);
  const openPortfolio = useReportingStore((s) => s.openPortfolio);

  if (!isInspecting || !activeStation) return null;

  const isDarkroom = activeStation.theme === "darkroom";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end pointer-events-none p-4 md:p-6">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm pointer-events-auto transition-opacity duration-300"
        onClick={closeStationInspection}
      />

      {/* Slide-over Drawer Panel */}
      <div
        className={`relative w-full max-w-xl max-h-[92vh] overflow-y-auto pointer-events-auto spatial-glass-panel rounded-3xl p-6 md:p-8 pb-12 md:pb-16 shadow-2xl transition-all duration-300 ${
          isDarkroom ? "theme-darkroom text-white" : "text-neutral-900"
        }`}
      >
        {/* Direct Title & Controls Header (NO Eyebrow Pills above H2) */}
        <div className="flex items-start justify-between gap-4 border-b border-black/10 dark:border-white/10 pb-5 mb-6">
          <div className="space-y-1.5">
            <h2 className="text-2xl md:text-3xl font-black tracking-tight leading-tight">
              {activeStation.title}
            </h2>
            <div className="flex items-center gap-2 text-xs font-mono text-neutral-500 dark:text-neutral-400">
              <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                STATION {activeStation.index}
              </span>
              <span>•</span>
              <span className="uppercase tracking-wider">
                {activeStation.category}
              </span>
              {activeStation.roles && activeStation.roles.length > 0 && (
                <>
                  <span className="hidden sm:inline">•</span>
                  <span className="hidden sm:inline text-neutral-400">
                    {activeStation.roles.join(", ")}
                  </span>
                </>
              )}
            </div>
          </div>
          <button
            onClick={closeStationInspection}
            className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-neutral-400 hover:text-neutral-900 dark:hover:text-white shrink-0"
            aria-label="Close station inspection"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Narrative Description */}
        <div className="space-y-4 mb-6 text-sm md:text-base leading-relaxed text-neutral-600 dark:text-neutral-300">
          <p>{activeStation.description}</p>
        </div>

        {/* Custom Station Embed: About / Profile Ledger */}
        {activeStation.id === "st-01" && (
          <div className="mb-6 pt-2">
            <ProfileLedger />
          </div>
        )}

        {/* Key Highlights as Bento Squircle Cards */}
        {activeStation.bulletPoints && activeStation.bulletPoints.length > 0 && activeStation.id !== "st-01" && (
          <div className="space-y-3 mb-6">
            <div className="text-[10px] font-mono uppercase tracking-widest text-neutral-400 dark:text-neutral-500 font-bold">
              Key Focus Areas
            </div>
            <div className="grid grid-cols-1 gap-2.5">
              {activeStation.bulletPoints.map((point, idx) => (
                <div 
                  key={idx} 
                  className="p-3.5 rounded-2xl bg-black/[0.02] dark:bg-white/[0.04] border border-black/[0.05] dark:border-white/[0.06] flex items-start gap-3"
                >
                  <span className="font-mono text-xs text-neutral-400 shrink-0 select-none">
                    0{idx + 1}
                  </span>
                  <p className="text-xs md:text-sm text-neutral-700 dark:text-neutral-200 leading-relaxed font-normal">
                    {point}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Math in Sight Specific Action */}
        {activeStation.id === "st-06" && (
          <div className="p-5 rounded-2xl bg-black/60 border border-white/15 space-y-3 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-mono text-neutral-200">
                <Film className="w-4 h-4 text-white" />
                <span className="font-bold">MATH IN SIGHT : THE FILM ARCHIVE</span>
              </div>
              <span className="text-[10px] font-mono text-neutral-400">35MM CONTACT SHEET</span>
            </div>
            <p className="text-xs text-neutral-300 leading-relaxed">
              Explore the complete 35mm film stills, production details, and visual breakdown in the editorial portfolio.
            </p>
            <button
              onClick={() => openPortfolio("math-in-sight")}
              className="w-full flex items-center justify-between px-4 py-2.5 text-xs font-mono font-semibold rounded-xl bg-white text-black hover:bg-neutral-200 transition-all"
            >
              <span>View Film Stills & Stills Archive</span>
              <div className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center">
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </button>
          </div>
        )}

        {/* Direct Link to Portfolio if tagged */}
        {activeStation.portfolioTag && activeStation.id !== "st-06" && (
          <div className="pt-4 border-t border-black/10 dark:border-white/10 flex justify-between items-center">
            <span className="text-xs font-mono text-neutral-500">Related Creative Work Available</span>
            <button
              onClick={() => openPortfolio()}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 transition-all text-xs font-mono font-medium text-neutral-900 dark:text-neutral-100"
            >
              <span>Open Portfolio</span>
              <div className="w-5 h-5 rounded-full bg-black dark:bg-white text-white dark:text-black flex items-center justify-center text-[10px]">
                →
              </div>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
