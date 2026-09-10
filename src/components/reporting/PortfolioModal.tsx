import React, { useState } from "react";
import { X, Film, Eye, Tag, Calendar, User, ArrowLeft, ArrowUpRight, Sparkles } from "lucide-react";
import { PORTFOLIO_ITEMS, type PortfolioItem } from "../../data/reporting/portfolio";
import { useReportingStore } from "../../stores/reportingStore";

export const PortfolioModal: React.FC = () => {
  const isPortfolioOpen = useReportingStore((s) => s.isPortfolioOpen);
  const closePortfolio = useReportingStore((s) => s.closePortfolio);
  const selectedItem = useReportingStore((s) => s.selectedPortfolioItem);
  const setSelectedItem = useReportingStore((s) => s.setSelectedPortfolioItem);

  const [activeCategory, setActiveCategory] = useState<string>("all");

  if (!isPortfolioOpen) return null;

  const filteredItems = PORTFOLIO_ITEMS.filter((item) =>
    activeCategory === "all" ? true : item.category === activeCategory
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 bg-black/80 backdrop-blur-md overflow-hidden text-neutral-100">
      {/* Container Panel with Apple Liquid Glass */}
      <div className="relative w-full max-w-6xl h-[92vh] bg-neutral-950/90 border border-white/10 rounded-3xl shadow-2xl flex flex-col overflow-hidden backdrop-blur-2xl">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-neutral-950/60 backdrop-blur-md z-20">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white">
              <Film className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base tracking-tight text-white flex items-center gap-2.5">
                <span>EDITORIAL ARCHIVE & CREATIVE WORKS</span>
                <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-white/10 text-neutral-300 font-medium">
                  {filteredItems.length} Selected Works
                </span>
              </h3>
              <p className="font-mono text-[11px] text-neutral-400">
                Publications, cinematography, fieldwork, and design systems by Dian
              </p>
            </div>
          </div>

          <button
            onClick={closePortfolio}
            className="p-2 rounded-full hover:bg-white/10 text-neutral-400 hover:text-white transition-colors"
            aria-label="Close portfolio"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Categories Bar as Apple Segmented Control */}
        <div className="flex items-center px-6 py-3 border-b border-white/5 bg-black/40 overflow-x-auto">
          <div className="inline-flex items-center gap-1.5 p-1 rounded-full bg-white/5 border border-white/10">
            {[
              { id: "all", label: "All Works" },
              { id: "cinema", label: "Cinema / Video" },
              { id: "campaigns", label: "Campaigns" },
              { id: "publications", label: "Publications" },
              { id: "fieldwork", label: "Fieldwork" },
              { id: "photography", label: "Photography" },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setActiveCategory(cat.id);
                  setSelectedItem(null);
                }}
                className={`px-3.5 py-1.5 rounded-full transition-all whitespace-nowrap text-xs font-mono ${
                  activeCategory === cat.id
                    ? "bg-white text-black font-semibold shadow-sm"
                    : "text-neutral-400 hover:text-white hover:bg-white/5 font-medium"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6">
          {selectedItem ? (
            /* Detailed Lightbox Inspector */
            <div className="space-y-6 max-w-4xl mx-auto">
              <button
                onClick={() => setSelectedItem(null)}
                className="inline-flex items-center gap-2 text-xs font-mono text-neutral-400 hover:text-white transition-colors mb-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Contact Sheet</span>
              </button>

              {/* Master Media Display */}
              <div className="relative w-full aspect-[16/9] rounded-xl overflow-hidden bg-neutral-900 border border-white/10 flex items-center justify-center p-8">
                {/* Visual Representation */}
                <div className="text-center space-y-3 max-w-md">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/5 border border-white/10 mx-auto">
                    <Film className="w-8 h-8 text-neutral-300" />
                  </div>
                  <div className="font-mono text-xs uppercase tracking-widest text-neutral-400">
                    {selectedItem.event} • {selectedItem.year}
                  </div>
                  <h2 className="text-2xl font-bold tracking-tight text-white">
                    {selectedItem.title}
                  </h2>
                  <p className="text-xs font-mono text-neutral-400">
                    Roles: {selectedItem.roles.join(" • ")}
                  </p>
                </div>

                {/* Film frame number overlay */}
                <div className="absolute top-3 left-4 font-mono text-[10px] text-neutral-500 uppercase tracking-widest">
                  FRAME [RAW_{selectedItem.id.toUpperCase()}]
                </div>
                <div className="absolute bottom-3 right-4 font-mono text-[10px] text-neutral-500 uppercase tracking-widest">
                  ASPECT {selectedItem.aspectRatio} // SAM-UP ARCHIVE
                </div>
              </div>

              {/* Metadata Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-white/10">
                <div className="md:col-span-2 space-y-4">
                  <div>
                    <h4 className="text-sm font-mono uppercase tracking-wider text-neutral-400 mb-1">
                      Project Narrative
                    </h4>
                    <p className="text-sm leading-relaxed text-neutral-200">
                      {selectedItem.details}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-mono uppercase tracking-wider text-neutral-400 mb-1">
                      Visual Direction
                    </h4>
                    <p className="text-xs text-neutral-400 leading-relaxed">
                      {selectedItem.caption}
                    </p>
                  </div>
                </div>

                <div className="space-y-3 font-mono text-xs bg-white/5 p-4 rounded-xl border border-white/5">
                  <div className="text-[10px] uppercase text-neutral-400 tracking-widest pb-1 border-b border-white/10">
                    Artifact Metadata
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Event:</span>
                    <span className="text-neutral-200">{selectedItem.event}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Year:</span>
                    <span className="text-neutral-200">{selectedItem.year}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Category:</span>
                    <span className="text-neutral-200 uppercase">{selectedItem.category}</span>
                  </div>
                  <div className="pt-2 border-t border-white/10">
                    <span className="text-neutral-500 block mb-1">Production Roles:</span>
                    {selectedItem.roles.map((r, i) => (
                      <div key={i} className="text-neutral-200 font-semibold">
                        › {r}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* 35mm Contact Sheet Grid with Apple Liquid Glass Cards */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredItems.map((item, idx) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  className="group relative cursor-pointer rounded-2xl bg-white/[0.03] border border-white/10 hover:border-white/30 transition-all duration-300 p-5 space-y-4 hover:bg-white/[0.06] hover:shadow-xl flex flex-col justify-between"
                >
                  <div className="space-y-3.5">
                    {/* Top Bar with Frame Index & Format */}
                    <div className="flex items-center justify-between text-[10px] font-mono text-neutral-400 border-b border-white/5 pb-2">
                      <span className="font-semibold text-neutral-300">FRAME [{(idx + 1).toString().padStart(2, "0")}]</span>
                      <span className="uppercase tracking-widest text-[9px] px-2 py-0.5 rounded-full bg-white/5 border border-white/5">
                        {item.category}
                      </span>
                    </div>

                    {/* Thumbnail / High-End Graphic Area */}
                    <div className="aspect-[16/9] rounded-xl bg-black/50 border border-white/5 relative overflow-hidden flex items-center justify-center p-4 group-hover:border-white/20 transition-all">
                      {/* Generative Visual Accents based on Item */}
                      <div className="absolute inset-0 bg-radial from-white/[0.04] to-transparent pointer-events-none" />
                      
                      <div className="relative text-center space-y-1.5 z-10">
                        <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 mx-auto flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Film className="w-5 h-5 text-neutral-300 group-hover:text-white transition-colors" />
                        </div>
                        <div className="font-mono text-[9px] text-neutral-400 tracking-wider">
                          ASPECT {item.aspectRatio}
                        </div>
                      </div>

                      {/* Film Perforation simulation */}
                      <div className="absolute top-1.5 inset-x-2 flex justify-between opacity-30">
                        <div className="w-1.5 h-1 bg-white/40 rounded-xs" />
                        <div className="w-1.5 h-1 bg-white/40 rounded-xs" />
                        <div className="w-1.5 h-1 bg-white/40 rounded-xs" />
                        <div className="w-1.5 h-1 bg-white/40 rounded-xs" />
                      </div>
                    </div>

                    {/* Typography */}
                    <div className="space-y-1">
                      <h4 className="font-bold text-sm tracking-tight text-white group-hover:text-neutral-100 transition-colors">
                        {item.title}
                      </h4>
                      <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed">
                        {item.caption}
                      </p>
                    </div>
                  </div>

                  {/* Bottom Row: Metadata and Iconic Circular Arrow Action Button */}
                  <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                    <div className="text-[10px] font-mono text-neutral-400 truncate max-w-[190px]">
                      {item.roles[0]} • {item.year}
                    </div>

                    <div className="w-8 h-8 rounded-full bg-white/10 group-hover:bg-white group-hover:text-black flex items-center justify-center transition-all text-neutral-300 shrink-0">
                      <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="px-6 py-3 border-t border-white/10 bg-[#09090b]/90 text-neutral-500 font-mono text-[11px] flex justify-between items-center">
          <span>SAM-UP REPORTING COMPANION // DIAN</span>
          <span>Press ESC or Click Outside to Return to Spatial Map</span>
        </div>
      </div>
    </div>
  );
};
