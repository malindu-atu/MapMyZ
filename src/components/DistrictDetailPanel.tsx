import { motion, AnimatePresence } from 'framer-motion';
import type { DistrictEligibility, University } from '../types';
import { formatScore, formatMargin, getStatusColor } from '../utils/colorLogic';
import HistoricalTrendChart from './HistoricalTrendChart';
import { CheckCircle2, Lock, Minus, GraduationCap } from 'lucide-react';

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

  // Split universities into qualified and locked for the current user score
  const qualifiedUnis: University[] = [];
  const lockedUnis: University[] = [];

  if (eligibility && !isNQC) {
    for (const uni of eligibility.universities) {
      if (userScore >= uni.cutoff) {
        qualifiedUnis.push(uni);
      } else {
        lockedUnis.push(uni);
      }
    }
  }

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
                  {isNQC
  ? <span className="flex items-center gap-1"><Minus size={11} /> NQC</span>
  : isQualified
  ? <span className="flex items-center gap-1"><CheckCircle2 size={11} /> ELIGIBLE</span>
  : <span className="flex items-center gap-1"><Lock size={11} /> LOCKED</span>
}
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
                  <div className="text-xs text-slate-500 mb-1">District Floor</div>
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

            {/* Universities you qualify for */}
            {!isNQC && qualifiedUnis.length > 0 && (
              <div>
                <div className="text-xs text-slate-500 uppercase tracking-wider mb-2">
                  You qualify for ({qualifiedUnis.length})
                </div>
                <div className="space-y-1.5">
                  {qualifiedUnis.map((uni, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between gap-2 px-2.5 py-2 rounded-lg text-xs"
                      style={{
                        background: 'rgba(0,255,136,0.05)',
                        border: '1px solid rgba(0,255,136,0.12)',
                      }}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                      <GraduationCap size={14} className="flex-shrink-0" style={{ color: '#00ff88' }} />
                        <span className="text-slate-300 leading-relaxed truncate">{uni.name}</span>
                      </div>
                      <span className="font-mono text-slate-500 flex-shrink-0" style={{ fontSize: '10px' }}>
                        {formatScore(uni.cutoff)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Universities you don't yet qualify for */}
            {!isNQC && lockedUnis.length > 0 && (
              <div>
                <div className="text-xs text-slate-500 uppercase tracking-wider mb-2">
                  Need higher score ({lockedUnis.length})
                </div>
                <div className="space-y-1.5">
                  {lockedUnis.map((uni, i) => {
                    const gap = uni.cutoff - userScore;
                    return (
                      <div
                        key={i}
                        className="flex items-center justify-between gap-2 px-2.5 py-2 rounded-lg text-xs"
                        style={{
                          background: 'rgba(255,255,255,0.02)',
                          border: '1px solid rgba(255,255,255,0.05)',
                        }}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                        <Lock size={14} className="flex-shrink-0" style={{ color: '#475569' }} />
                          <span className="text-slate-500 leading-relaxed truncate">{uni.name}</span>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="font-mono" style={{ color: '#64748b', fontSize: '10px' }}>
                            {formatScore(uni.cutoff)}
                          </div>
                          <div className="font-mono" style={{ color: '#ef4444', fontSize: '9px' }}>
                            -{gap.toFixed(4)}
                          </div>
                        </div>
                      </div>
                    );
                  })}
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
