import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface SearchBarProps {
  value: string;
  onChange: (query: string) => void;
  resultCount: number;
  totalCount: number;
}

export default function SearchBar({ value, onChange, resultCount, totalCount }: SearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  // Cmd/Ctrl + K shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === 'Escape') {
        onChange('');
        inputRef.current?.blur();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onChange]);

  const isFiltering = value.length > 0;

  return (
    <div className="relative">
      <div
        className="flex items-center gap-2 px-3 py-2 rounded-xl border transition-all duration-200"
        style={{
          background: 'rgba(15, 23, 42, 0.8)',
          borderColor: isFiltering
            ? 'rgba(0, 245, 255, 0.4)'
            : 'rgba(0, 245, 255, 0.12)',
          boxShadow: isFiltering ? '0 0 12px rgba(0,245,255,0.12)' : 'none',
        }}
      >
        {/* Search icon */}
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth="2" className="text-slate-500 flex-shrink-0">
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>

        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder="Search districts..."
          className="flex-1 bg-transparent text-sm text-slate-200 placeholder-slate-600 outline-none font-body min-w-0"
        />

        {/* Count badge */}
        {isFiltering && (
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-xs font-mono px-1.5 py-0.5 rounded-md flex-shrink-0"
            style={{
              background: 'rgba(0,245,255,0.12)',
              color: '#00f5ff',
              border: '1px solid rgba(0,245,255,0.2)',
            }}
          >
            {resultCount}/{totalCount}
          </motion.span>
        )}

        {/* Keyboard hint or clear */}
        {!isFiltering ? (
          <div className="flex gap-1 flex-shrink-0">
            <kbd className="text-xs px-1 py-0.5 rounded font-mono text-slate-600"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
              ⌘K
            </kbd>
          </div>
        ) : (
          <button
            onClick={() => onChange('')}
            className="text-slate-500 hover:text-slate-300 transition-colors flex-shrink-0"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6 6 18M6 6l12 12"/>
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
