import React from "react";
import { User, Award, Compass, Layers, Quote } from "lucide-react";

export const ProfileLedger: React.FC = () => {
  return (
    <div className="w-full space-y-4">
      {/* 4-Card Apple Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {/* Card 1: Identity & Origins */}
        <div className="p-4 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.08] space-y-3">
          <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-neutral-400 font-bold">
            <User className="w-3.5 h-3.5 text-neutral-700 dark:text-neutral-300" />
            <span>Identity & Origins</span>
          </div>
          <div className="space-y-1.5 font-mono text-[11px]">
            <div className="flex justify-between items-start gap-2 py-0.5">
              <span className="text-neutral-500 shrink-0">Name</span>
              <span className="font-semibold text-neutral-900 dark:text-neutral-100 text-right">Aedrian "Dian" Ponce</span>
            </div>
            <div className="flex justify-between items-start gap-2 py-0.5">
              <span className="text-neutral-500 shrink-0">Pronouns</span>
              <span className="text-neutral-800 dark:text-neutral-200 text-right">he / him</span>
            </div>
            <div className="flex justify-between items-start gap-2 py-0.5">
              <span className="text-neutral-500 shrink-0">Batch</span>
              <span className="font-semibold text-neutral-900 dark:text-neutral-100 text-right">UPLB Batch 2025</span>
            </div>
            <div className="flex justify-between items-start gap-2 py-0.5">
              <span className="text-neutral-500 shrink-0">Program</span>
              <span className="text-neutral-800 dark:text-neutral-200 font-medium text-right">BS Applied Math</span>
            </div>
            <div className="flex justify-between items-start gap-2 py-0.5">
              <span className="text-neutral-500 shrink-0">Hometown</span>
              <span className="text-neutral-800 dark:text-neutral-200 text-right">Pagsanjan, Laguna</span>
            </div>
          </div>
        </div>

        {/* Card 2: SAM-UP Roots */}
        <div className="p-4 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.08] space-y-3">
          <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-neutral-400 font-bold">
            <Award className="w-3.5 h-3.5 text-neutral-700 dark:text-neutral-300" />
            <span>Organizational Cadence</span>
          </div>
          <div className="space-y-1.5 font-mono text-[11px]">
            <div className="flex justify-between items-start gap-2 py-0.5">
              <span className="text-neutral-500 shrink-0">SAM-UP Batch</span>
              <span className="font-semibold text-neutral-900 dark:text-neutral-100 text-right">Florensimus Vincula</span>
            </div>
            <div className="flex justify-between items-start gap-2 py-0.5">
              <span className="text-neutral-500 shrink-0">Standing Comm</span>
              <span className="text-neutral-800 dark:text-neutral-200 font-medium text-right">Business Committee</span>
            </div>
            <div className="flex justify-between items-start gap-2 py-0.5">
              <span className="text-neutral-500 shrink-0">Current Role</span>
              <span className="font-semibold text-neutral-900 dark:text-neutral-100 text-right">Marketing Deputy Head</span>
            </div>
            <div className="flex justify-between items-start gap-2 py-0.5">
              <span className="text-neutral-500 shrink-0">Induction</span>
              <span className="text-neutral-800 dark:text-neutral-200 text-right">1st Sem 2025–2026</span>
            </div>
            <div className="flex justify-between items-start gap-2 py-0.5">
              <span className="text-neutral-500 shrink-0">Domain</span>
              <span className="text-neutral-800 dark:text-neutral-200 text-right">Brand & Fieldwork</span>
            </div>
          </div>
        </div>

        {/* Card 3: Active Engagements */}
        <div className="p-4 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.08] space-y-3">
          <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-neutral-400 font-bold">
            <Layers className="w-3.5 h-3.5 text-neutral-700 dark:text-neutral-300" />
            <span>Active Engagements</span>
          </div>
          <div className="space-y-1.5 font-mono text-[11px]">
            <div className="flex justify-between items-start gap-2 py-0.5">
              <span className="text-neutral-500 shrink-0">Razzmatazz '26</span>
              <span className="font-semibold text-neutral-900 dark:text-neutral-100 text-right">Head of Logistics</span>
            </div>
            <div className="flex justify-between items-start gap-2 py-0.5">
              <span className="text-neutral-500 shrink-0">UPLB Tools</span>
              <span className="text-neutral-800 dark:text-neutral-200 font-medium text-right">Webmaster & Interface</span>
            </div>
            <div className="flex justify-between items-start gap-2 py-0.5">
              <span className="text-neutral-500 shrink-0">Residence</span>
              <span className="text-neutral-800 dark:text-neutral-200 text-right">Catalan Compound, UPLB</span>
            </div>
            <div className="flex justify-between items-start gap-2 py-0.5">
              <span className="text-neutral-500 shrink-0">Design Stack</span>
              <span className="text-neutral-800 dark:text-neutral-200 text-right">Figma, Motion, Astro</span>
            </div>
          </div>
        </div>

        {/* Card 4: Creative & Personal */}
        <div className="p-4 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.08] space-y-3">
          <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-neutral-400 font-bold">
            <Compass className="w-3.5 h-3.5 text-neutral-700 dark:text-neutral-300" />
            <span>Creative & Personal</span>
          </div>
          <div className="space-y-1.5 font-mono text-[11px]">
            <div className="flex justify-between items-start gap-2 py-0.5">
              <span className="text-neutral-500 shrink-0">Visual Media</span>
              <span className="text-neutral-800 dark:text-neutral-200 text-right">Cinematography, 35mm</span>
            </div>
            <div className="flex justify-between items-start gap-2 py-0.5">
              <span className="text-neutral-500 shrink-0">Narrative</span>
              <span className="text-neutral-800 dark:text-neutral-200 text-right">Marvel MCU, Comics</span>
            </div>
            <div className="flex justify-between items-start gap-2 py-0.5">
              <span className="text-neutral-500 shrink-0">Mental Rigor</span>
              <span className="text-neutral-800 dark:text-neutral-200 text-right">Chess, Rubik's Cube</span>
            </div>
            <div className="flex justify-between items-start gap-2 py-0.5">
              <span className="text-neutral-500 shrink-0">Daily Ritual</span>
              <span className="text-neutral-800 dark:text-neutral-200 text-right">Strength Training / Gym</span>
            </div>
          </div>
        </div>
      </div>

      {/* VisionOS Conversational Mandate Callout */}
      <div className="p-4 rounded-2xl bg-neutral-900 text-neutral-200 dark:bg-white dark:text-neutral-900 border border-black/10 dark:border-white/20 flex items-start gap-3 shadow-sm">
        <Quote className="w-4 h-4 mt-0.5 text-neutral-400 dark:text-neutral-500 shrink-0 select-none" />
        <p className="text-xs md:text-sm font-medium leading-relaxed italic">
          "I tell you who I am → you tell me who you are → I tell you how I experienced SAM-UP → we talk about how we can build together."
        </p>
      </div>
    </div>
  );
};
