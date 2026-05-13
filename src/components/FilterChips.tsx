import { motion } from 'framer-motion';
import { CheckCircle2, Lock } from 'lucide-react';

interface FilterState {
  showEligible: boolean;
  showLocked: boolean;
  showNQC: boolean;
}

interface FilterChipsProps {
  filters: FilterState;
  onToggle: (key: keyof FilterState) => void;
  counts: { qualified: number; locked: number; nqc: number };
}

const CHIPS = [
  {
    key: 'showEligible' as keyof FilterState,
    label: 'Eligible',
    countKey: 'qualified' as const,
    color: '#00ff88',
    bg: 'rgba(0,255,136,0.1)',
    border: 'rgba(0,255,136,0.3)',
    icon: <CheckCircle2 size={13} />,
  },
  {
    key: 'showLocked' as keyof FilterState,
    label: 'Locked',
    countKey: 'locked' as const,
    color: '#64748b',
    bg: 'rgba(100,116,139,0.1)',
    border: 'rgba(100,116,139,0.3)',
    icon: <Lock size={13} />,
  },
  {
    key: 'showNQC' as keyof FilterState,
    label: 'NQC',
    countKey: 'nqc' as const,
    color: '#f59e0b',
    bg: 'rgba(245,158,11,0.1)',
    border: 'rgba(245,158,11,0.3)',
    icon: '—',
  },
];

export default function FilterChips({ filters, onToggle, counts }: FilterChipsProps) {
  return (
    <div>
      <label className="text-xs text-slate-500 uppercase tracking-widest block mb-1.5">
        Show on Map
      </label>
      <div className="flex gap-2">
        {CHIPS.map(chip => {
          const active = filters[chip.key];
          return (
            <motion.button
              key={chip.key}
              onClick={() => onToggle(chip.key)}
              whileTap={{ scale: 0.95 }}
              className="flex-1 flex flex-col items-center py-2 px-1.5 rounded-xl border transition-all duration-200 text-center"
              style={{
                background: active ? chip.bg : 'rgba(15, 23, 42, 0.5)',
                borderColor: active ? chip.border : 'rgba(255,255,255,0.06)',
                opacity: active ? 1 : 0.5,
              }}
            >
              <span className="text-base leading-none mb-1">{chip.icon}</span>
              <span className="text-xs font-mono font-bold" style={{ color: active ? chip.color : '#475569' }}>
                {counts[chip.countKey]}
              </span>
              <span className="text-xs text-slate-600 mt-0.5" style={{ fontSize: '10px' }}>
                {chip.label}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
