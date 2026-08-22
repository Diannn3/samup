import React, { useState, useRef } from 'react';
import { Landmark, Globe, Shield, Star } from 'lucide-react';

interface SealLayer {
  id: string;
  title: string;
  category: string;
  icon: React.ElementType;
  description: string;
  constitutionRef: string;
}

const layers: SealLayer[] = [
  {
    id: 'piu',
    title: 'The Interlocking "Piu" (Π)',
    category: 'Core Monolith',
    icon: Landmark,
    description: 'Signifies the summation (∑) of all efforts, mathematical intellect, and capabilities of the members. The continuous interlocking geometry unites the Greek uppercase Pi (Π) arch, the inner loop counter-space, and the descending anchor stem.',
    constitutionRef: 'Article II, Section 2'
  },
  {
    id: 'outer-circle',
    title: 'The Outer Circle',
    category: 'Macro Society',
    icon: Globe,
    description: 'Represents the Philippine Society at large, affirming the foundational belief that abstract quantitative models, operations research, and mathematical sciences exist to serve and advance national progress.',
    constitutionRef: 'Article II, Section 1'
  },
  {
    id: 'inner-circle',
    title: 'The Inner Circle',
    category: 'The Organization',
    icon: Shield,
    description: 'Represents SAM-UP itself and the unbroken bond of unity, loyalty, and commitment among all resident, affiliate, and alumni members across generations.',
    constitutionRef: 'Article II, Section 1'
  },
  {
    id: 'twin-stars',
    title: 'Twin Stars & 1984 Foundation',
    category: 'Principles & Epoch',
    icon: Star,
    description: 'The twin guiding stars symbolize the Inviolate Principles and Constitutional Objectives of the society. 1984 codifies the official foundation year recognized at UPLB IMSP.',
    constitutionRef: 'Article II, Section 3'
  }
];

export const SealExplorer: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('piu');
  const tabListRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    let nextIndex = index;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      nextIndex = (index + 1) % layers.length;
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      nextIndex = (index - 1 + layers.length) % layers.length;
    } else if (e.key === 'Home') {
      e.preventDefault();
      nextIndex = 0;
    } else if (e.key === 'End') {
      e.preventDefault();
      nextIndex = layers.length - 1;
    }

    if (nextIndex !== index) {
      setActiveTab(layers[nextIndex].id);
      const buttons = tabListRef.current?.querySelectorAll<HTMLButtonElement>('button[role="tab"]');
      buttons?.[nextIndex]?.focus();
    }
  };

  const currentLayer = layers.find(l => l.id === activeTab) || layers[0];

  return (
    <div className="frosted-glass-card p-6 sm:p-10 relative overflow-hidden shadow-2xl">
      <div className="grid lg:grid-cols-12 gap-8 items-center">
        {/* Seal Visual Display with Dynamic Overlay Highlights */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center">
          <div className="relative w-64 h-64 sm:w-76 sm:h-76 flex items-center justify-center">
            {/* Ambient Background Aura */}
            <div className="absolute inset-0 rounded-full bg-[var(--primary)]/15 blur-2xl pointer-events-none" />

            {/* Authentic Seal Image */}
            <img
              src="/sam-up-seal.png"
              alt="Official Seal of the Society of Applied Mathematics of UPLB"
              className="w-full h-full object-contain relative z-10 drop-shadow-[0_8px_32px_rgba(0,0,0,0.7)]"
              loading="lazy"
              width="300"
              height="300"
            />

            {/* Visual Highlight Rings */}
            <svg
              className="w-full h-full absolute inset-0 z-20 pointer-events-none"
              viewBox="0 0 500 500"
              fill="none"
              aria-hidden="true"
            >
              {activeTab === 'outer-circle' && (
                <circle cx="250" cy="250" r="236" stroke="var(--primary)" strokeWidth="6" strokeDasharray="12 8" />
              )}
              {activeTab === 'inner-circle' && (
                <circle cx="250" cy="250" r="162" stroke="var(--primary)" strokeWidth="6" strokeDasharray="10 6" />
              )}
              {activeTab === 'piu' && (
                <rect x="135" y="135" width="230" height="250" rx="16" stroke="var(--primary)" strokeWidth="4" strokeDasharray="8 6" fill="rgba(240, 204, 78, 0.12)" />
              )}
              {activeTab === 'twin-stars' && (
                <>
                  <circle cx="150" cy="445" r="32" stroke="var(--primary)" strokeWidth="4" />
                  <circle cx="350" cy="445" r="32" stroke="var(--primary)" strokeWidth="4" />
                </>
              )}
            </svg>
          </div>
          <p className="mt-4 text-xs font-mono text-[var(--muted-foreground)] text-center">
            Codified under Article II of the SAM-UP Constitution
          </p>
        </div>

        {/* Accessible Tabs & Symbology Cards with Translucent Acrylic Base */}
        <div className="lg:col-span-7">
          <div
            ref={tabListRef}
            role="tablist"
            aria-label="Seal Anatomical Layers"
            className="flex flex-col gap-3"
          >
            {layers.map((layer, index) => {
              const Icon = layer.icon;
              const isSelected = activeTab === layer.id;

              return (
                <button
                  key={layer.id}
                  id={`tab-${layer.id}`}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  aria-controls={`panel-${layer.id}`}
                  tabIndex={isSelected ? 0 : -1}
                  onClick={() => setActiveTab(layer.id)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  className={`text-left p-4 rounded-xl border transition-all duration-200 ${
                    isSelected
                      ? 'bg-white/15 border-[var(--border-primary)] shadow-md'
                      : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2.5">
                      <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-[var(--primary)] text-[var(--primary-foreground)]' : 'bg-white/10 text-[var(--muted-foreground)]'}`}>
                        <Icon className="w-4 h-4" aria-hidden="true" />
                      </div>
                      <span className={`font-display text-sm sm:text-base font-bold ${isSelected ? 'text-[var(--primary)]' : 'text-[var(--foreground)]'}`}>
                        {layer.title}
                      </span>
                    </div>
                    <span className="text-[11px] font-mono uppercase px-2.5 py-0.5 rounded-full bg-white/10 text-[var(--muted-foreground)] border border-white/10">
                      {layer.category}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-[var(--foreground)]/80 leading-relaxed pl-9">
                    {layer.description}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Active Tab Panel (for Assistive Tech) */}
          <div
            id={`panel-${currentLayer.id}`}
            role="tabpanel"
            aria-labelledby={`tab-${currentLayer.id}`}
            className="sr-only"
          >
            <h3>{currentLayer.title}</h3>
            <p>{currentLayer.description}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
