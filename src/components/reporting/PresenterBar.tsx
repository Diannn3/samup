import React from 'react';
import { Compass, Film, UserCheck, HelpCircle, Terminal, RotateCcw } from 'lucide-react';
import { useReportingStore } from '../../stores/reportingStore';
import { STATIONS } from '../../data/reporting/stations';

export const PresenterBar: React.FC = () => {
  const playerPos = useReportingStore((s) => s.playerPos);
  const nearestStation = useReportingStore((s) => s.nearestStation);
  const distanceToNearest = useReportingStore((s) => s.distanceToNearest);
  const teleportToStation = useReportingStore((s) => s.teleportToStation);
  const openStationInspection = useReportingStore((s) => s.openStationInspection);
  const openPortfolio = useReportingStore((s) => s.openPortfolio);
  const toggleCommandPalette = useReportingStore((s) => s.toggleCommandPalette);
  const currentChapter = useReportingStore((s) => s.currentChapter);

  const isDark = currentChapter === 'darkroom';

  return (
    <div className="hidden md:flex fixed bottom-6 inset-x-0 z-40 justify-center pointer-events-none px-4">
      <div
        className={`pointer-events-auto flex items-center gap-2 md:gap-4 px-4 py-2.5 rounded-full spatial-glass-pill transition-all duration-300 shadow-xl border ${
          isDark
            ? 'bg-neutral-900/80 border-white/15 text-white'
            : 'bg-white/80 border-black/10 text-neutral-900'
        }`}
      >
        {/* Telemetry / Coordinates */}
        <div className="hidden sm:flex items-center gap-2 border-r border-black/10 dark:border-white/10 pr-3 font-mono text-[11px] text-neutral-500">
          <Compass className="w-3.5 h-3.5" />
          <span>
            {Math.round(playerPos.x)} , {Math.round(playerPos.y)}
          </span>
        </div>

        {/* Nearest Station Indicator or Action */}
        {nearestStation && (
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-neutral-400 hidden md:inline">NEAR:</span>
            <span className="text-xs font-bold truncate max-w-[140px] md:max-w-[180px]">
              [{nearestStation.index}] {nearestStation.title}
            </span>

            {distanceToNearest < 180 && (
              <button
                onClick={() => openStationInspection(nearestStation)}
                className="ml-1 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-black text-white dark:bg-white dark:text-black hover:opacity-90 transition-opacity flex items-center gap-1 shadow-sm"
              >
                <span>[E] Inspect</span>
              </button>
            )}
          </div>
        )}

        <div className="h-4 w-[1px] bg-black/10 dark:border-white/10 hidden sm:block" />

        {/* Rapid Presenter Navigation Shortcuts */}
        <div className="flex items-center gap-1 font-mono text-[11px]">
          <button
            onClick={() => teleportToStation('st-01')}
            className="px-2.5 py-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-neutral-600 dark:text-neutral-300"
            title="Jump to Start"
          >
            Start
          </button>
          <button
            onClick={() => teleportToStation('st-06')}
            className="px-2.5 py-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-neutral-600 dark:text-neutral-300 hidden md:inline"
            title="Jump to Math in Sight"
          >
            Cinema
          </button>
          <button
            onClick={() => teleportToStation('st-10')}
            className="px-2.5 py-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-neutral-600 dark:text-neutral-300"
            title="Jump to Applicant Profile"
          >
            Applicant
          </button>
          <button
            onClick={() => teleportToStation('st-11')}
            className="px-2.5 py-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-neutral-600 dark:text-neutral-300 font-bold"
            title="Jump to Why SAM-UP"
          >
            Why?
          </button>
        </div>

        <div className="h-4 w-[1px] bg-black/10 dark:border-white/10" />

        {/* Global Utilities */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => openPortfolio()}
            className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-neutral-700 dark:text-neutral-300"
            title="Open Portfolio (Cmd+P)"
          >
            <Film className="w-4 h-4" />
          </button>
          <button
            onClick={toggleCommandPalette}
            className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-neutral-700 dark:text-neutral-300"
            title="Command Palette (Cmd+K)"
          >
            <Terminal className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
