import React, { useState, useMemo } from 'react';
import { Search, X, Award, RotateCcw } from 'lucide-react';
import seniorExecs from '../../data/senior_executives.json';

export const ExecutiveSearch: React.FC = () => {
  const [query, setQuery] = useState('');

  const filteredLeaders = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return seniorExecs;
    return seniorExecs.filter(
      exec => exec.name.toLowerCase().includes(q) || exec.term.toLowerCase().includes(q)
    );
  }, [query]);

  const handleClear = () => {
    setQuery('');
  };

  return (
    <div className="space-y-6">
      {/* Search Bar Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
        <div className="relative flex-grow max-w-md">
          <label htmlFor="executive-search-input" className="sr-only">
            Search Senior Executives by name or academic term
          </label>
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[var(--muted-foreground)]">
            <Search className="w-4 h-4" aria-hidden="true" />
          </div>
          <input
            id="executive-search-input"
            name="executive-search"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by leader name or term (e.g. Edmund, 84–85)…"
            autoComplete="off"
            enterKeyHint="search"
            className="w-full min-h-11 pl-10 pr-11 py-2.5 rounded-xl bg-white/5 backdrop-blur-xl border border-white/10 text-[var(--foreground)] placeholder-[var(--muted-foreground)] text-sm focus:border-[var(--border-primary)] focus:bg-white/10 transition-all shadow-sm"
          />
          {query && (
            <button
              type="button"
              onClick={handleClear}
              aria-label="Clear search query"
              className="absolute inset-y-0 right-0 w-11 flex items-center justify-center text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
          )}
        </div>

        {/* Live Result Count */}
        <div
          aria-live="polite"
          className="text-xs sm:text-sm font-mono text-[var(--muted-foreground)] flex items-center gap-2 self-end sm:self-center"
        >
          <span>Showing <strong className="text-[var(--foreground)]">{filteredLeaders.length}</strong> of {seniorExecs.length} terms</span>
        </div>
      </div>

      {/* Results Grid / List */}
      {filteredLeaders.length > 0 ? (
        <ul className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 list-none p-0 m-0">
          {filteredLeaders.map((exec, idx) => (
            <li
              key={`${exec.name}-${exec.term}-${idx}`}
              className="frosted-glass-card p-3.5 flex items-center gap-3 shadow-sm hover:scale-[1.02] transition-transform"
            >
              <div className="w-9 h-9 rounded-xl bg-[var(--primary)]/10 border border-[var(--primary)]/20 flex items-center justify-center text-xs font-mono font-bold text-[var(--primary)] shrink-0">
                <Award className="w-4 h-4" aria-hidden="true" />
              </div>
              <div className="overflow-hidden min-w-0">
                <div className="text-sm font-semibold text-[var(--foreground)] truncate">
                  {exec.name}
                </div>
                <div className="text-xs font-mono text-[var(--muted-foreground)]">
                  {exec.term}
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        /* Empty State */
        <div className="frosted-glass-card p-12 text-center rounded-2xl space-y-4 shadow-xl">
          <div className="w-12 h-12 rounded-full bg-white/10 mx-auto flex items-center justify-center text-[var(--muted-foreground)]">
            <Search className="w-6 h-6" aria-hidden="true" />
          </div>
          <div className="space-y-1">
            <h4 className="text-base font-display font-bold text-[var(--foreground)]">
              No senior executives found
            </h4>
            <p className="text-sm text-[var(--muted-foreground)] max-w-sm mx-auto">
              No leadership records matched &ldquo;{query}&rdquo;. Check the spelling or search by academic year.
            </p>
          </div>
          <button
            type="button"
            onClick={handleClear}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 border border-white/15 text-sm font-medium text-[var(--foreground)] hover:border-[var(--border-primary)] transition-colors"
          >
            <RotateCcw className="w-4 h-4" aria-hidden="true" />
            <span>Reset Search</span>
          </button>
        </div>
      )}
    </div>
  );
};
