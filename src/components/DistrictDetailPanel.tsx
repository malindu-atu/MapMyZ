import { motion, AnimatePresence } from 'framer-motion';
import type { DistrictEligibility } from '../types';
import { formatScore, formatMargin, getStatusColor } from '../utils/colorLogic';
import HistoricalTrendChart from './HistoricalTrendChart';

interface DistrictDetailPanelProps {
  eligibility: DistrictEligibility | null;
  course: string;
  userScore: number;
  onClose: () => void;
}

export default function DistrictDetailPanel({
  eligibility,
  course,
  userScore,
  onClose,
}: DistrictDetailPanelProps) {
  const statusColor = eligibility ? getStatusColor(eligibility.status) : '#64748b';
  const isQualified = eligibility?.status === 'qualified';
  const isNQC = eligibility?.status === 'nqc';

  return (
    <AnimatePresence>
      {eligibility && (
        <motion.div
          key={eligibility.district}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="glass-card overflow-hidden"
          style={{
            borderColor: `${statusColor}22`,
            boxShadow: `0 8px 32px rgba(0,0,0,0.5), 0 0 20px ${statusColor}11`,
          }}
        >
          {/* Header */}
          <div className="p-4 border-b border-white/5">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="font-display font-semibold text-white text-base truncate">
                  {eligibility.district}
                </h3>
                <div className="text-xs text-slate-500 mt-0.5">{course}</div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {/* Status badge */}
                <span
                  className="text-xs font-mono font-bold px-2 py-1 rounded-lg"
                  style={{
                    color: statusColor,
                    background: `${statusColor}18`,
                    border: `1px solid ${statusColor}33`,
                    boxShadow: isQualified ? `0 0 8px ${statusColor}33` : 'none',
                  }}
                >
                  {isNQC ? 'NQC' : isQualified ? '✓ ELIGIBLE' : '✗ LOCKED'}
                </span>
                <button
                  onClick={onClose}
                  className="text-slate-500 hover:text-slate-300 transition-colors p-1"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6 6 18M6 6l12 12"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <div className="p-4 space-y-4">
            {/* Score stats */}
            {!isNQC && (
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-lg p-2.5 text-center"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div className="text-xs text-slate-500 mb-1">Cutoff</div>
                  <div className="font-mono text-sm font-semibold text-slate-200">
                    {formatScore(eligibility.cutoff)}
                  </div>
                </div>
                <div className="rounded-lg p-2.5 text-center"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div className="text-xs text-slate-500 mb-1">Margin</div>
                  <div
                    className="font-mono text-sm font-semibold"
                    style={{ color: statusColor }}
                  >
                    {formatMargin(eligibility.margin)}
                  </div>
                </div>
              </div>
            )}

            {/* NQC notice */}
            {isNQC && (
              <div className="rounded-lg p-3 text-xs text-amber-400/80 font-mono text-center"
                style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}>
                No Qualified Candidates (NQC) — this district has no university intake for {course}
              </div>
            )}

            {/* Universities */}
            {!isNQC && eligibility.universities.length > 0 && (
              <div>
                <div className="text-xs text-slate-500 uppercase tracking-wider mb-2">
                  {isQualified ? 'You\'re eligible at' : 'Would qualify at'}
                </div>
                <div className="space-y-1.5">
                  {eligibility.universities.map((uni, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-2 px-2.5 py-2 rounded-lg text-xs"
                      style={{
                        background: isQualified
                          ? 'rgba(0,255,136,0.05)'
                          : 'rgba(255,255,255,0.03)',
                        border: `1px solid ${isQualified ? 'rgba(0,255,136,0.12)' : 'rgba(255,255,255,0.06)'}`,
                      }}
                    >
                      <span className="mt-0.5 flex-shrink-0" style={{ color: isQualified ? '#00ff88' : '#475569' }}>
                        {isQualified ? '🎓' : '🔒'}
                      </span>
                      <span className="text-slate-300 leading-relaxed">{uni.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Historical trend chart */}
            <HistoricalTrendChart
              course={course}
              district={eligibility.district}
              userScore={userScore}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
