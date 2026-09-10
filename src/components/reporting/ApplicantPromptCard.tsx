import React, { useState } from "react";
import { APPLICANT_QUESTIONS, type ApplicantQuestion } from "../../data/reporting/applicantQuestions";

export const ApplicantPromptCard: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<"all" | "identity" | "culture" | "core">("all");

  const filteredQuestions = APPLICANT_QUESTIONS.filter((q) =>
    activeCategory === "all" ? true : q.category === activeCategory
  );

  return (
    <div className="w-full space-y-6">
      {/* Category Tabs */}
      <div className="flex gap-2 border-b border-black/10 dark:border-white/10 pb-2">
        {(["all", "identity", "culture", "core"] as const).map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1 rounded text-xs font-mono uppercase tracking-wider transition-colors ${
              activeCategory === cat
                ? "bg-black text-white dark:bg-white dark:text-black font-semibold"
                : "text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Prompts List */}
      <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2">
        {filteredQuestions.map((q) => (
          <div
            key={q.id}
            className={`p-4 rounded-xl border transition-all ${
              q.primary
                ? "bg-black/5 dark:bg-white/5 border-black/20 dark:border-white/20"
                : "bg-transparent border-black/5 dark:border-white/5"
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-mono uppercase tracking-widest text-neutral-400">
                {q.category}
              </span>
              {q.primary && (
                <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-black text-white dark:bg-white dark:text-black font-bold">
                  Core Sincerity Prompt
                </span>
              )}
            </div>
            <h4 className={`font-bold ${q.primary ? "text-xl md:text-2xl mt-2" : "text-sm md:text-base"}`}>
              {q.label}
            </h4>
            <p className="text-xs text-neutral-500 font-mono mt-1">{q.hint}</p>
          </div>
        ))}
      </div>

      <div className="text-[11px] font-mono text-neutral-400 italic text-center pt-2">
        "No form submission required. This is a conversational space to listen and understand."
      </div>
    </div>
  );
};
