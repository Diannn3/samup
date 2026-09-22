import React from 'react';
import { ChevronLeft, ChevronRight, Compass, Film, ExternalLink, ArrowLeft } from 'lucide-react';
import { STATIONS } from '../../data/reporting/stations';
import { useReportingStore } from '../../stores/reportingStore';

export const MobileNarrativeDeck: React.FC = () => {
  const nearestStation = useReportingStore((s) => s.nearestStation) || STATIONS[0];
  const teleportToStation = useReportingStore((s) => s.teleportToStation);
  const openStationInspection = useReportingStore((s) => s.openStationInspection);
  const openPortfolio = useReportingStore((s) => s.openPortfolio);

  const currentIndex = STATIONS.findIndex((s) => s.id === nearestStation.id);

  const handlePrev = () => {
    if (currentIndex > 0) {
      teleportToStation(STATIONS[currentIndex - 1].id);
    }
  };

  const handleNext = () => {
    if (currentIndex < STATIONS.length - 1) {
      teleportToStation(STATIONS[currentIndex + 1].id);
    }
  };

  return (
    <div className="md:hidden fixed top-4 inset-x-4 z-40 pointer-events-auto">
      <div className="spatial-glass-panel p-4 shadow-xl border border-black/10 bg-white/95 text-neutral-900 rounded-2xl backdrop-blur-xl">
        {/* Navigation Step Header & Portal Exit Bridge */}
        <div className="flex items-center justify-between text-[11px] font-mono text-neutral-500 border-b border-black/5 pb-2.5 mb-3">
          <div className="flex items-center gap-2">
            <a
              href="/"
              className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-900 font-bold border border-neutral-200 transition-colors"
              title="Return to SAM-UP Portal"
            >
              <ArrowLeft className="w-3 h-3" />
              <span>Portal</span>
            </a>
            <span className="text-neutral-300">|</span>
            <span className="font-semibold text-neutral-700">
              STATION {currentIndex + 1} / {STATIONS.length}
            </span>
          </div>
          <button
            onClick={() => openPortfolio()}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-900 font-semibold border border-neutral-200 transition-colors"
          >
            <Film className="w-3.5 h-3.5" />
            <span>Portfolio</span>
          </button>
        </div>

        {/* Station Title & Subtitle */}
        <div className="space-y-1 mb-4">
          <h3 className="font-bold text-lg tracking-tight line-clamp-1">{nearestStation.title}</h3>
          <p className="font-mono text-[11px] text-neutral-500 tracking-wide line-clamp-1">
            {nearestStation.subtitle}
          </p>
        </div>

        {/* Actions Bar */}
        <div className="flex items-center justify-between gap-2 pt-2 border-t border-black/5 font-mono text-xs">
          <div className="flex gap-1">
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="p-2 rounded-lg bg-black/5 hover:bg-black/10 disabled:opacity-30 disabled:pointer-events-none text-neutral-800"
              aria-label="Previous station"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNext}
              disabled={currentIndex === STATIONS.length - 1}
              className="p-2 rounded-lg bg-black/5 hover:bg-black/10 disabled:opacity-30 disabled:pointer-events-none text-neutral-800"
              aria-label="Next station"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => openStationInspection(nearestStation)}
            className="flex-1 py-2 px-3 rounded-lg bg-black text-white font-semibold text-center text-xs"
          >
            Inspect Details
          </button>
        </div>
      </div>
    </div>
  );
};
