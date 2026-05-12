import { motion, AnimatePresence } from 'framer-motion';
import { useMemo, useState } from 'react';
import type { DistrictEligibility } from '../types';
import { formatScore, formatMargin, getStatusColor } from '../utils/colorLogic';

interface LeaderboardProps {
  eligibilities: DistrictEligibility[];
  selectedDistrict: string | null;
  onDistrictSelect: (district: string) => void;
}

type SortMode = 'margin' | 'cutoff' | 'name';

export default function DistrictRankingLeaderboard({
  eligibilities,
  selectedDistrict,
  onDistrictSelect,
}: LeaderboardProps) {
  const [sortMode, setSortMode] = useState<SortMode>('margin');
  const [showAll, setShowAll] = useState(false);

  const sorted = useMemo(() => {
    return [...eligibilities].sort((a, b) => {
      if (sortMode === 'margin') {
        // Qualified first (by margin desc), then locked (by margin desc), then NQC
        if (a.status === 'nqc' && b.status !== 'nqc') return 1;
        if (b.status === 'nqc' && a.status !== 'nqc') return -1;
        return b.margin - a.margin;
      }
      if (sortMode === 'cutoff') {
        if (a.status === 'nqc') return 1;
        if (b.status === 'nqc') return -1;
        return a.cutoff - b.cutoff;
      }
      return a.district.localeCompare(b.district);
    });
  }, [eligibilities, sortMode]);

  const displayed = showAll ? sorted : sorted.slice(0, 8);

  return (
    <div className="flex flex-col min-h-0">
      {/* Sort controls */}
      <div className="flex items-center justify-between mb-2">
        <div className="text-xs text-slate-500 uppercase tracking-wider">Rankings</div>
        <div className="flex gap-1">
          {(['margin', 'cutoff', 'name'] as SortMode[]).map(mode => (
            <button
              key={mode}
              onClick={() => setSortMode(mode)}
              className="text-xs px-2 py-0.5 rounded-md font-mono transition-all"
              style={{
                background: sortMode === mode ? 'rgba(0,245,255,0.12)' : 'transparent',
                color: sortMode === mode ? '#00f5ff' : '#475569',
                border: `1px solid ${sortMode === mode ? 'rgba(0,245,255,0.25)' : 'transparent'}`,
              }}
            >
              {mode === 'margin' ? '±' : mode === 'cutoff' ? '↑' : 'A-Z'}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="space-y-1 overflow-y-auto flex-1" style={{ maxHeight: '280px' }}>
        <AnimatePresence mode="popLayout">
          {displayed.map((e, i) => {
            const isSelected = e.district === selectedDistrict;
            const statusColor = getStatusColor(e.status);

            return (
              <motion.button
                key={e.district}
                layout
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.15, delay: i * 0.02 }}
                onClick={() => onDistrictSelect(e.district)}
                className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg transition-all duration-150 text-left"
                style={{
                  background: isSelected
                    ? `${statusColor}12`
                    : 'rgba(255,255,255,0.02)',
                  border: `1px solid ${isSelected ? `${statusColor}25` : 'rgba(255,255,255,0.04)'}`,
                }}
              >
                {/* Rank */}
                <span className="text-xs font-mono text-slate-600 w-4 flex-shrink-0 text-right">
                  {e.status === 'nqc' ? '—' : (i + 1)}
                </span>

                {/* Color dot */}
                <div
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{
                    background: statusColor,
                    boxShadow: e.status === 'qualified' ? `0 0 6px ${statusColor}` : 'none',
                  }}
                />

                {/* District name */}
                <span className="text-xs text-slate-300 flex-1 truncate font-medium">
                  {e.district}
                </span>

                {/* Score info */}
                <div className="text-right flex-shrink-0">
                  {e.status === 'nqc' ? (
                    <span className="text-xs font-mono text-amber-500/60">NQC</span>
                  ) : (
                    <>
                      <div className="text-xs font-mono" style={{ color: statusColor }}>
                        {formatMargin(e.margin)}
                      </div>
                      <div className="text-xs font-mono text-slate-600" style={{ fontSize: '10px' }}>
                        {formatScore(e.cutoff)}
                      </div>
                    </>
                  )}
                </div>
              </motion.button>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Show more */}
      {sorted.length > 8 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="mt-2 w-full text-xs font-mono text-slate-500 hover:text-slate-300 py-1.5 transition-colors"
          style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}
        >
          {showAll ? '▲ Show less' : `▼ Show all ${sorted.length} districts`}
        </button>
      )}
    </div>
  );
}
