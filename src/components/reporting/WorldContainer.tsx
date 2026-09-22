import React from 'react';
import { SpatialCanvas } from './SpatialCanvas';
import { StationDrawer } from './StationDrawer';
import { PortfolioModal } from './PortfolioModal';
import { CommandPalette } from './CommandPalette';
import { PresenterBar } from './PresenterBar';
import { MobileNarrativeDeck } from './MobileNarrativeDeck';
import { useReportingStore } from '../../stores/reportingStore';

export const WorldContainer: React.FC = () => {
  const currentChapter = useReportingStore((s) => s.currentChapter);
  const isDark = currentChapter === 'darkroom';

  return (
    <div
      className={`relative w-screen h-screen overflow-hidden select-none ${isDark ? 'theme-darkroom' : ''}`}
    >
      {/* 2D PixiJS Spatial Canvas World */}
      <SpatialCanvas />

      {/* Luminous Apple 3D Glass Sphere & Ethereal Caustic Refraction */}
      <div
        className="fixed top-8 right-8 lg:right-24 w-[480px] h-[480px] lg:w-[640px] lg:h-[640px] pointer-events-none z-10 select-none overflow-visible hidden md:flex items-center justify-center"
        aria-hidden="true"
      >
        <div className="relative w-full h-full flex items-center justify-center">
          {/* Ambient Caustic Glow */}
          <div className="absolute inset-0 rounded-full bg-neutral-200/40 dark:bg-white/5 blur-3xl opacity-70 pointer-events-none" />
          {/* Refractive Glass Orb Render */}
          <img
            src="/assets/glass_orb.jpg"
            alt=""
            className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-screen opacity-95 dark:opacity-80 apple-glass-orb"
            style={{
              maskImage: 'radial-gradient(circle at 50% 48%, black 46%, transparent 68%)',
              WebkitMaskImage: 'radial-gradient(circle at 50% 48%, black 46%, transparent 68%)',
            }}
          />
        </div>
      </div>

      {/* Top Left Persistent Architectural Title & Navigation HUD */}
      <div className="fixed top-8 left-8 z-30 pointer-events-none hidden md:block max-w-sm">
        {/* Return to Institutional Home Link */}
        <a
          href="/"
          className="pointer-events-auto inline-flex items-center gap-1.5 px-3 py-1.5 mb-3 rounded-full bg-white/80 dark:bg-black/80 hover:bg-white dark:hover:bg-black border border-black/10 dark:border-white/10 text-[11px] font-mono font-medium text-neutral-800 dark:text-neutral-200 transition-all shadow-sm group"
        >
          <span className="group-hover:-translate-x-0.5 transition-transform font-bold">←</span>
          <span>Return to SAM-UP Portal</span>
        </a>

        <div className="space-y-1">
          <h1 className="text-3xl lg:text-4xl font-black tracking-tighter text-neutral-950 dark:text-white leading-[0.95]">
            Design.
            <br />
            Compute.
            <br />
            <span className="text-neutral-400 dark:text-neutral-500">Architect.</span>
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 font-medium leading-relaxed pt-2">
            Aedrian "Dian" Ponce — SAM-UP Applicant Reporting. Exploring 12 spatial stations, computational
            design, and creative archives.
          </p>
        </div>

        {/* Telemetry & Controls Pill */}
        <div className="mt-4 inline-flex items-center gap-2.5 px-3.5 py-2 rounded-full bg-white/70 dark:bg-black/60 border border-black/[0.08] dark:border-white/[0.08] backdrop-blur-md text-[10px] font-mono text-neutral-600 dark:text-neutral-300 shadow-sm">
          <span className="font-semibold text-neutral-900 dark:text-white">SAM-UP // BATCH 2025</span>
          <span className="text-neutral-300 dark:text-neutral-700">|</span>
          <span>WASD / ARROWS</span>
          <span className="text-neutral-300 dark:text-neutral-700">•</span>
          <span>[E] INSPECT</span>
          <span className="text-neutral-300 dark:text-neutral-700">•</span>
          <span>⌘K JUMP</span>
        </div>
      </div>

      {/* Mobile Station Step Deck */}
      <MobileNarrativeDeck />

      {/* Floating Presenter Controls HUD */}
      <PresenterBar />

      {/* Sliding Station Inspection Drawer */}
      <StationDrawer />

      {/* Fullscreen Editorial Portfolio & Film Stills */}
      <PortfolioModal />

      {/* Keyboard Command Palette */}
      <CommandPalette />
    </div>
  );
};
