import React, { useState } from 'react';
import { Calculator, RotateCcw, CheckCircle2 } from 'lucide-react';

const BASE_FEE = 125.00;
const MAX_DISCOUNT_POINTS = 50;

const formatPhp = (val: number) => {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2
  }).format(val);
};

export const MeritCalculator: React.FC = () => {
  const [scholarshipPoints, setScholarshipPoints] = useState<number>(0);
  const [activityPoints, setActivityPoints] = useState<{ [key: string]: number }>({});

  const toggleActivity = (key: string, points: number) => {
    setActivityPoints(prev => {
      const next = { ...prev };
      if (next[key]) {
        delete next[key];
      } else {
        next[key] = points;
      }
      return next;
    });
  };

  const handleReset = () => {
    setScholarshipPoints(0);
    setActivityPoints({});
  };

  const rawActivityTotal = Object.values(activityPoints).reduce((a, b) => a + b, 0);
  const totalEarnedPoints = scholarshipPoints + rawActivityTotal;
  const appliedPoints = Math.min(totalEarnedPoints, MAX_DISCOUNT_POINTS);
  const discountPercent = appliedPoints; // 1 point = 1% discount
  const savings = (BASE_FEE * discountPercent) / 100;
  const finalFee = BASE_FEE - savings;

  return (
    <div className="frosted-glass-card p-6 sm:p-10 relative shadow-2xl">
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Form Inputs (Left) */}
        <div className="w-full lg:w-7/12 space-y-6">
          {/* Section 1: Honorific Scholarships */}
          <fieldset className="border border-white/10 rounded-2xl p-5 bg-white/5 backdrop-blur-md">
            <legend className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--primary)] px-2">
              Academic Honors (Choose One)
            </legend>
            <div className="mt-3 grid sm:grid-cols-2 gap-3">
              <label className="flex items-center gap-3 p-3.5 rounded-xl border border-white/10 bg-white/5 cursor-pointer hover:border-[var(--border-primary)] hover:bg-white/10 transition-all">
                <input
                  type="radio"
                  name="scholarship"
                  value="0"
                  checked={scholarshipPoints === 0}
                  onChange={() => setScholarshipPoints(0)}
                  className="w-4 h-4 text-[var(--primary)] focus:ring-[var(--ring)]"
                />
                <span className="text-xs font-medium text-[var(--foreground)]">None / Standard</span>
              </label>

              <label className="flex items-center gap-3 p-3.5 rounded-xl border border-white/10 bg-white/5 cursor-pointer hover:border-[var(--border-primary)] hover:bg-white/10 transition-all">
                <input
                  type="radio"
                  name="scholarship"
                  value="20"
                  checked={scholarshipPoints === 20}
                  onChange={() => setScholarshipPoints(20)}
                  className="w-4 h-4 text-[var(--primary)] focus:ring-[var(--ring)]"
                />
                <div>
                  <div className="text-xs font-medium text-[var(--foreground)]">University Scholar</div>
                  <div className="text-[11px] font-mono text-[var(--primary)] font-bold">+20 Pts (20% Off)</div>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3.5 rounded-xl border border-white/10 bg-white/5 cursor-pointer hover:border-[var(--border-primary)] hover:bg-white/10 transition-all">
                <input
                  type="radio"
                  name="scholarship"
                  value="15"
                  checked={scholarshipPoints === 15}
                  onChange={() => setScholarshipPoints(15)}
                  className="w-4 h-4 text-[var(--primary)] focus:ring-[var(--ring)]"
                />
                <div>
                  <div className="text-xs font-medium text-[var(--foreground)]">College Scholar</div>
                  <div className="text-[11px] font-mono text-[var(--primary)] font-bold">+15 Pts (15% Off)</div>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3.5 rounded-xl border border-white/10 bg-white/5 cursor-pointer hover:border-[var(--border-primary)] hover:bg-white/10 transition-all">
                <input
                  type="radio"
                  name="scholarship"
                  value="10"
                  checked={scholarshipPoints === 10}
                  onChange={() => setScholarshipPoints(10)}
                  className="w-4 h-4 text-[var(--primary)] focus:ring-[var(--ring)]"
                />
                <div>
                  <div className="text-xs font-medium text-[var(--foreground)]">Honor Roll</div>
                  <div className="text-[11px] font-mono text-[var(--primary)] font-bold">+10 Pts (10% Off)</div>
                </div>
              </label>
            </div>
          </fieldset>

          {/* Section 2: Organizational Contributions */}
          <fieldset className="border border-white/10 rounded-2xl p-5 bg-white/5 backdrop-blur-md">
            <legend className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--primary)] px-2">
              Organizational Roles & Service (Select All Applicable)
            </legend>
            <div className="mt-3 grid sm:grid-cols-2 gap-3">
              <label className="flex items-start gap-3 p-3.5 rounded-xl border border-white/10 bg-white/5 cursor-pointer hover:border-[var(--border-primary)] hover:bg-white/10 transition-all">
                <input
                  type="checkbox"
                  name="organizational-activity"
                  value="attendance"
                  checked={!!activityPoints['attendance']}
                  onChange={() => toggleActivity('attendance', 10)}
                  className="w-4 h-4 mt-0.5 text-[var(--primary)] focus:ring-[var(--ring)] rounded"
                />
                <div>
                  <div className="text-xs font-medium text-[var(--foreground)]">Perfect GA Attendance</div>
                  <div className="text-[11px] font-mono text-[var(--primary)] font-bold">+10 Pts (10% Off)</div>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3.5 rounded-xl border border-white/10 bg-white/5 cursor-pointer hover:border-[var(--border-primary)] hover:bg-white/10 transition-all">
                <input
                  type="checkbox"
                  name="organizational-activity"
                  value="event-head"
                  checked={!!activityPoints['event_head']}
                  onChange={() => toggleActivity('event_head', 10)}
                  className="w-4 h-4 mt-0.5 text-[var(--primary)] focus:ring-[var(--ring)] rounded"
                />
                <div>
                  <div className="text-xs font-medium text-[var(--foreground)]">Event / FRA Head</div>
                  <div className="text-[11px] font-mono text-[var(--primary)] font-bold">+10 Pts (10% Off)</div>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3.5 rounded-xl border border-white/10 bg-white/5 cursor-pointer hover:border-[var(--border-primary)] hover:bg-white/10 transition-all">
                <input
                  type="checkbox"
                  name="organizational-activity"
                  value="peer-tutor"
                  checked={!!activityPoints['tutor']}
                  onChange={() => toggleActivity('tutor', 5)}
                  className="w-4 h-4 mt-0.5 text-[var(--primary)] focus:ring-[var(--ring)] rounded"
                />
                <div>
                  <div className="text-xs font-medium text-[var(--foreground)]">Peer Tutorial Tutor</div>
                  <div className="text-[11px] font-mono text-[var(--primary)] font-bold">+5 Pts (5% Off)</div>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3.5 rounded-xl border border-white/10 bg-white/5 cursor-pointer hover:border-[var(--border-primary)] hover:bg-white/10 transition-all">
                <input
                  type="checkbox"
                  name="organizational-activity"
                  value="committee-officer"
                  checked={!!activityPoints['committee_lead']}
                  onChange={() => toggleActivity('committee_lead', 5)}
                  className="w-4 h-4 mt-0.5 text-[var(--primary)] focus:ring-[var(--ring)] rounded"
                />
                <div>
                  <div className="text-xs font-medium text-[var(--foreground)]">Committee Officer</div>
                  <div className="text-[11px] font-mono text-[var(--primary)] font-bold">+5 Pts (5% Off)</div>
                </div>
              </label>
            </div>
          </fieldset>
        </div>

        {/* Breakdown Card (Right) with Translucent Acrylic Frame */}
        <div className="w-full lg:w-5/12 bg-white/10 border border-white/15 rounded-2xl p-6 sm:p-8 flex flex-col justify-between self-stretch shadow-xl backdrop-blur-xl">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Calculator className="w-5 h-5 text-[var(--primary)]" aria-hidden="true" />
                <h4 className="font-display font-bold text-sm tracking-wide text-[var(--foreground)]">
                  Semestral Fee Assessment
                </h4>
              </div>
              <button
                type="button"
                onClick={handleReset}
                className="text-xs font-mono text-[var(--muted-foreground)] hover:text-[var(--foreground)] flex items-center gap-1 p-1 rounded-md bg-white/5 border border-white/10 transition-colors"
                aria-label="Reset Calculator"
              >
                <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Reset</span>
              </button>
            </div>

            {/* Live Fee Computation */}
            <div aria-live="polite" className="mt-6 space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-[var(--muted-foreground)]">Base Semestral Dues:</span>
                <span className="font-mono text-[var(--foreground)]">{formatPhp(BASE_FEE)}</span>
              </div>

              <div className="flex justify-between items-center text-sm">
                <span className="text-[var(--muted-foreground)]">Total Merit Points:</span>
                <div className="text-right">
                  <span className="font-mono font-bold text-[var(--primary)]">{appliedPoints} Pts</span>
                  {totalEarnedPoints > MAX_DISCOUNT_POINTS && (
                    <span className="text-[11px] block font-mono text-[var(--muted-foreground)]">
                      ({totalEarnedPoints} earned · 50 max applied)
                    </span>
                  )}
                </div>
              </div>

              <div className="flex justify-between items-center text-sm">
                <span className="text-[var(--muted-foreground)]">Applied Discount:</span>
                <span className="font-mono text-[var(--success)] font-bold">-{discountPercent}% ({formatPhp(savings)})</span>
              </div>

              <div className="pt-4 border-t border-white/10 flex justify-between items-baseline">
                <span className="font-display font-bold text-sm text-[var(--foreground)]">Net Semestral Due:</span>
                <span className="font-mono font-extrabold text-3xl text-[var(--primary)] drop-shadow-sm">
                  {formatPhp(finalFee)}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-white/10 text-xs text-[var(--muted-foreground)] flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-[var(--primary)] shrink-0 mt-0.5" aria-hidden="true" />
            <span>
              Calculated in accordance with Article VI, Section 4 of the SAM-UP Bylaws (2026–2027). Discounts apply to active resident and affiliate members.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
