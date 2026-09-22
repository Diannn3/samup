import React, { useMemo, useRef, useState } from 'react';
import { Search, X, RotateCcw } from 'lucide-react';
import seniorExecs from '../../data/senior_executives.json';

export const ExecutiveSearch: React.FC = () => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredLeaders = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();
    if (!normalizedQuery) return seniorExecs;

    return seniorExecs.filter(
      (entry) =>
        entry.name.toLocaleLowerCase().includes(normalizedQuery) ||
        entry.term.toLocaleLowerCase().includes(normalizedQuery),
    );
  }, [query]);

  const handleClear = () => {
    setQuery('');
    inputRef.current?.focus();
  };

  return (
    <div>
      <div className="grid sm:grid-cols-[minmax(0,28rem)_1fr] gap-4 items-center">
        <div className="relative">
          <label htmlFor="executive-search-input" className="sr-only">
            Search historical Senior Executive records by name or academic term
          </label>
          <Search
            className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)] pointer-events-none"
            aria-hidden="true"
          />
          <input
            ref={inputRef}
            id="executive-search-input"
            name="executive-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search name or term, e.g. Edmund or 84–85"
            autoComplete="off"
            enterKeyHint="search"
            aria-controls="executive-search-results"
            className="w-full min-h-12 rounded-xl border border-[var(--border)] bg-[var(--background)] pl-10 pr-11 py-3 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:border-[var(--border-primary)] transition-colors"
          />
          {query && (
            <button
              type="button"
              onClick={handleClear}
              aria-label="Clear leadership archive search"
              className="absolute right-0 top-0 min-h-12 min-w-11 flex items-center justify-center text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
          )}
        </div>

        <div aria-live="polite" aria-atomic="true" className="text-xs font-mono text-[var(--muted-foreground)] sm:text-right">
          Showing <strong className="text-[var(--foreground)]">{filteredLeaders.length}</strong> of {seniorExecs.length} documented entries
        </div>
      </div>

      {filteredLeaders.length > 0 ? (
        <ul id="executive-search-results" className="mt-7 divide-y divide-[var(--border)] border-y border-[var(--border)] list-none p-0">
          {filteredLeaders.map((entry, index) => (
            <li
              key={`${entry.name}-${entry.term}-${index}`}
              className="grid sm:grid-cols-[10rem_1fr_3rem] gap-2 sm:gap-5 items-center py-4"
            >
              <span className="font-mono text-xs text-[var(--primary)]">{entry.term}</span>
              <span className="text-sm font-semibold text-[var(--foreground)]">{entry.name}</span>
              <span className="hidden sm:block text-right font-mono text-[10px] text-[var(--muted-foreground)]">
                {String(index + 1).padStart(2, '0')}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <div id="executive-search-results" className="mt-7 rounded-[1.25rem] border border-[var(--border)] p-8 sm:p-10">
          <div className="max-w-md">
            <Search className="w-5 h-5 text-[var(--primary)]" aria-hidden="true" />
            <h3 className="mt-4 font-display font-bold text-xl text-[var(--foreground)]">No matching archive entry</h3>
            <p className="mt-2 text-sm leading-relaxed text-[var(--muted-foreground)]">
              No documented Senior Executive record matched “{query}”. Try a surname or academic term label.
            </p>
            <button
              type="button"
              onClick={handleClear}
              className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-lg border border-[var(--border)] px-4 py-2.5 text-sm font-semibold text-[var(--foreground)] hover:border-[var(--border-primary)] transition-colors"
            >
              <RotateCcw className="w-4 h-4" aria-hidden="true" />
              Reset search
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
