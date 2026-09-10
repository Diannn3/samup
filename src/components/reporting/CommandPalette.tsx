import React, { useState, useEffect, useRef } from "react";
import { Search, MapPin, Film, User, HelpCircle, X, Sparkles } from "lucide-react";
import { STATIONS, type Station } from "../../data/reporting/stations";
import { useReportingStore } from "../../stores/reportingStore";

export const CommandPalette: React.FC = () => {
  const isCommandPaletteOpen = useReportingStore((s) => s.isCommandPaletteOpen);
  const setCommandPaletteOpen = useReportingStore((s) => s.setCommandPaletteOpen);
  const teleportToStation = useReportingStore((s) => s.teleportToStation);
  const openPortfolio = useReportingStore((s) => s.openPortfolio);
  const togglePresenterMode = useReportingStore((s) => s.togglePresenterMode);

  const [search, setSearch] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isCommandPaletteOpen) {
      setSearch("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isCommandPaletteOpen]);

  if (!isCommandPaletteOpen) return null;

  // Search results
  const matchingStations = STATIONS.filter(
    (s) =>
      s.title.toLowerCase().includes(search.toLowerCase()) ||
      s.subtitle.toLowerCase().includes(search.toLowerCase()) ||
      s.index.includes(search)
  );

  const handleSelectStation = (station: Station) => {
    teleportToStation(station.id);
    setCommandPaletteOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % (matchingStations.length + 2));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + matchingStations.length + 2) % (matchingStations.length + 2));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (selectedIndex < matchingStations.length) {
        handleSelectStation(matchingStations[selectedIndex]);
      } else if (selectedIndex === matchingStations.length) {
        openPortfolio();
        setCommandPaletteOpen(false);
      } else {
        togglePresenterMode();
        setCommandPaletteOpen(false);
      }
    } else if (e.key === "Escape") {
      setCommandPaletteOpen(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-lg rounded-2xl bg-white dark:bg-neutral-900 border border-black/10 dark:border-white/10 shadow-2xl overflow-hidden text-neutral-900 dark:text-neutral-100">
        {/* Search Bar */}
        <div className="flex items-center px-4 py-3 border-b border-black/10 dark:border-white/10">
          <Search className="w-5 h-5 text-neutral-400 mr-3" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Warp to station, open portfolio, or search..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setSelectedIndex(0);
            }}
            style={{ outline: "none", boxShadow: "none" }}
            className="w-full bg-transparent text-sm font-medium outline-none focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 border-none placeholder:text-neutral-400 font-mono shadow-none"
          />
          <button
            onClick={() => setCommandPaletteOpen(false)}
            className="text-xs font-mono px-2 py-1 rounded bg-black/5 dark:bg-white/10 text-neutral-400"
          >
            ESC
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-72 overflow-y-auto p-2 space-y-1">
          {matchingStations.length > 0 ? (
            matchingStations.map((station, idx) => (
              <div
                key={station.id}
                onClick={() => handleSelectStation(station)}
                onMouseEnter={() => setSelectedIndex(idx)}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-colors text-xs font-mono ${
                  selectedIndex === idx
                    ? "bg-black text-white dark:bg-white dark:text-black"
                    : "hover:bg-black/5 dark:hover:bg-white/5 text-neutral-700 dark:text-neutral-300"
                }`}
              >
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 opacity-70" />
                  <span className="font-bold">[{station.index}]</span>
                  <span className="truncate max-w-[260px] font-sans font-semibold text-sm">
                    {station.title}
                  </span>
                </div>
                <span className="text-[10px] opacity-60 uppercase">{station.category}</span>
              </div>
            ))
          ) : (
            <div className="p-4 text-center text-xs font-mono text-neutral-400">
              No matching stations found.
            </div>
          )}

          {/* Quick Shortcuts */}
          <div className="pt-2 border-t border-black/5 dark:border-white/5 space-y-1">
            <div
              onClick={() => {
                openPortfolio();
                setCommandPaletteOpen(false);
              }}
              onMouseEnter={() => setSelectedIndex(matchingStations.length)}
              className={`flex items-center justify-between px-3 py-2 rounded-xl cursor-pointer text-xs font-mono ${
                selectedIndex === matchingStations.length
                  ? "bg-black text-white dark:bg-white dark:text-black"
                  : "text-neutral-600 dark:text-neutral-400 hover:bg-black/5 dark:hover:bg-white/5"
              }`}
            >
              <div className="flex items-center gap-3">
                <Film className="w-4 h-4" />
                <span>Open Creative Portfolio & Stills</span>
              </div>
              <span className="text-[10px] opacity-60">⌘P</span>
            </div>

            <div
              onClick={() => {
                togglePresenterMode();
                setCommandPaletteOpen(false);
              }}
              onMouseEnter={() => setSelectedIndex(matchingStations.length + 1)}
              className={`flex items-center justify-between px-3 py-2 rounded-xl cursor-pointer text-xs font-mono ${
                selectedIndex === matchingStations.length + 1
                  ? "bg-black text-white dark:bg-white dark:text-black"
                  : "text-neutral-600 dark:text-neutral-400 hover:bg-black/5 dark:hover:bg-white/5"
              }`}
            >
              <div className="flex items-center gap-3">
                <Sparkles className="w-4 h-4" />
                <span>Toggle Presenter Control Mode</span>
              </div>
              <span className="text-[10px] opacity-60">HUD</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
