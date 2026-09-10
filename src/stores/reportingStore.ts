import { create } from "zustand";
import { STATIONS, type Station } from "../data/reporting/stations";
import { PORTFOLIO_ITEMS, type PortfolioItem } from "../data/reporting/portfolio";

export type WorldChapter = "light" | "darkroom" | "applicant";

interface ReportingState {
  // Player & Kinematics
  playerPos: { x: number; y: number };
  targetPos: { x: number; y: number } | null;
  velocity: { x: number; y: number };

  // Stations & Proximity
  activeStation: Station | null;
  nearestStation: Station | null;
  distanceToNearest: number;
  isInspecting: boolean;

  // Chapter & Atmosphere
  currentChapter: WorldChapter;

  // Overlays
  isPortfolioOpen: boolean;
  selectedPortfolioItem: PortfolioItem | null;
  portfolioCategory: string;
  isCommandPaletteOpen: boolean;
  isPresenterMode: boolean;

  // Actions
  setPlayerPos: (pos: { x: number; y: number }) => void;
  setTargetPos: (pos: { x: number; y: number } | null) => void;
  setVelocity: (vel: { x: number; y: number }) => void;
  updateProximity: (player: { x: number; y: number }) => void;
  openStationInspection: (station: Station) => void;
  closeStationInspection: () => void;
  teleportToStation: (stationId: string) => void;
  openPortfolio: (itemId?: string) => void;
  closePortfolio: () => void;
  setPortfolioCategory: (category: string) => void;
  setSelectedPortfolioItem: (item: PortfolioItem | null) => void;
  togglePresenterMode: () => void;
  toggleCommandPalette: () => void;
  setCommandPaletteOpen: (open: boolean) => void;
}

export const useReportingStore = create<ReportingState>((set, get) => ({
  playerPos: { x: 600, y: 1800 },
  targetPos: null,
  velocity: { x: 0, y: 0 },

  activeStation: null,
  nearestStation: STATIONS[0],
  distanceToNearest: 0,
  isInspecting: false,

  currentChapter: "light",

  isPortfolioOpen: false,
  selectedPortfolioItem: null,
  portfolioCategory: "all",
  isCommandPaletteOpen: false,
  isPresenterMode: false,

  setPlayerPos: (pos) => set({ playerPos: pos }),
  setTargetPos: (pos) => set({ targetPos: pos }),
  setVelocity: (vel) => set({ velocity: vel }),

  updateProximity: (player) => {
    let minDistance = Infinity;
    let closest: Station | null = null;

    for (const station of STATIONS) {
      const dx = station.position.x - player.x;
      const dy = station.position.y - player.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < minDistance) {
        minDistance = dist;
        closest = station;
      }
    }

    // Determine current chapter based on closest station and coordinate bounds
    let chapter: WorldChapter = "light";
    if (closest?.theme === "darkroom" || (player.x >= 3300 && player.x <= 4000 && player.y >= 2000)) {
      chapter = "darkroom";
    } else if (closest?.theme === "applicant" || player.x >= 5100) {
      chapter = "applicant";
    }

    set({
      nearestStation: closest,
      distanceToNearest: minDistance,
      currentChapter: chapter,
    });
  },

  openStationInspection: (station) => {
    set({ activeStation: station, isInspecting: true });
  },

  closeStationInspection: () => {
    set({ isInspecting: false });
  },

  teleportToStation: (stationId) => {
    const station = STATIONS.find((s) => s.id === stationId);
    if (!station) return;

    set({
      playerPos: { x: station.position.x, y: station.position.y },
      targetPos: null,
      velocity: { x: 0, y: 0 },
      activeStation: station,
      isInspecting: false,
    });
    get().updateProximity(station.position);
  },

  openPortfolio: (itemId) => {
    const item = itemId ? PORTFOLIO_ITEMS.find((p) => p.id === itemId) || null : null;
    set({
      isPortfolioOpen: true,
      selectedPortfolioItem: item,
      isInspecting: false,
    });
  },

  closePortfolio: () => {
    set({ isPortfolioOpen: false, selectedPortfolioItem: null });
  },

  setPortfolioCategory: (category) => set({ portfolioCategory: category }),
  setSelectedPortfolioItem: (item) => set({ selectedPortfolioItem: item }),

  togglePresenterMode: () => set((state) => ({ isPresenterMode: !state.isPresenterMode })),
  toggleCommandPalette: () => set((state) => ({ isCommandPaletteOpen: !state.isCommandPaletteOpen })),
  setCommandPaletteOpen: (open) => set({ isCommandPaletteOpen: open }),
}));
