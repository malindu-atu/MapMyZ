import { motion } from 'framer-motion';
import { formatScore } from '../utils/colorLogic';

interface SliderPanelProps {
  userScore: number;
  onScoreChange: (score: number) => void;
  qualifiedCount: number;
  totalCount: number;
  minRequired: number;
}

export default function SliderPanel({
  userScore,
  onScoreChange,
  qualifiedCount,
  totalCount,
  minRequired,
}: SliderPanelProps) {
  const percentage = (userScore / 3.0) * 100;
  const qualifiedPct = Math.round((qualifiedCount / totalCount) * 100) || 0;

  const scoreColor =
    qualifiedCount === 0
      ? '#64748b'
      : qualifiedCount < 5
      ? '#f59e0b'
      : qualifiedCount < 15
      ? '#00ff88'
      : '#00f5ff';

  return (
    <div className="space-y-4">
      {/* Score Display */}
      <div className="text-center">
        <div className="text-xs text-slate-500 uppercase tracking-widest mb-1 font-mono">
          Your Z-Score
        </div>
        <motion.div
          key={Math.round(userScore * 100)}
          initial={{ scale: 0.95, opacity: 0.7 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.08 }}
          className="text-4xl font-mono font-bold tracking-tight"
          style={{
            color: scoreColor,
            textShadow: `0 0 20px ${scoreColor}88`,
          }}
        >
          {formatScore(userScore)}
        </motion.div>
      </div>

      {/* Slider */}
      <div className="relative px-1">
        {/* Track background gradient */}
        <div className="relative h-2 rounded-full overflow-hidden mb-3"
          style={{ background: 'linear-gradient(to right, #1e293b, #334155)' }}>
          <motion.div
            className="absolute inset-y-0 left-0 rounded-full"
            style={{
              width: `${percentage}%`,
              background: `linear-gradient(to right, #00ff88, ${scoreColor})`,
              boxShadow: `0 0 8px ${scoreColor}88`,
            }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.05 }}
          />
        </div>

        <input
          type="range"
          min={0}
          max={3.0}
          step={0.0001}
          value={userScore}
          onChange={e => onScoreChange(parseFloat(e.target.value))}
          className="w-full absolute inset-0 opacity-0 cursor-pointer h-8 -top-3"
          style={{ zIndex: 10 }}
        />

        {/* Tick marks */}
        <div className="flex justify-between text-xs text-slate-600 font-mono mt-1">
          {[0, 0.5, 1.0, 1.5, 2.0, 2.5, 3.0].map(v => (
            <span key={v} className={userScore >= v ? 'text-slate-400' : ''}>{v.toFixed(1)}</span>
          ))}
        </div>
      </div>

      {/* Eligibility Bar */}
      <div className="glass-card p-3 space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-xs text-slate-400 uppercase tracking-wider">Districts Eligible</span>
          <motion.span
            key={qualifiedCount}
            initial={{ y: -4, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-sm font-mono font-bold"
            style={{ color: scoreColor }}
          >
            {qualifiedCount} / {totalCount}
          </motion.span>
        </div>

        {/* Progress bar */}
        <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ background: `linear-gradient(to right, #00ff88, ${scoreColor})` }}
            animate={{ width: `${qualifiedPct}%` }}
            transition={{ duration: 0.15 }}
          />
        </div>

        <div className="text-xs text-slate-500 font-mono">
          Min score needed:{' '}
          <span className="text-slate-300">{formatScore(minRequired)}</span>
        </div>
      </div>

      {/* Quick presets */}
      <div>
        <div className="text-xs text-slate-500 mb-2 uppercase tracking-wider">Quick Set</div>
        <div className="grid grid-cols-4 gap-1.5">
          {[
            { label: 'Min', value: minRequired, color: '#64748b' },
            { label: '1.0', value: 1.0, color: '#f59e0b' },
            { label: '1.5', value: 1.5, color: '#00ff88' },
            { label: '2.0', value: 2.0, color: '#00f5ff' },
          ].map(preset => (
            <button
              key={preset.label}
              onClick={() => onScoreChange(preset.value)}
              className="text-xs font-mono py-1.5 px-2 rounded-lg border transition-all duration-150 hover:scale-105"
              style={{
                borderColor: `${preset.color}44`,
                color: preset.color,
                background: `${preset.color}11`,
              }}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
