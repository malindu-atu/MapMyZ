import { motion, useSpring, useTransform } from 'framer-motion';
import { useEffect } from 'react';
import { Map } from 'lucide-react';

interface AppHeaderProps {
  qualifiedCount: number;
  totalCount: number;
  selectedCourse: string;
  userScore: number;
}

function AnimatedNumber({ value }: { value: number }) {
  const spring = useSpring(value, { stiffness: 300, damping: 30 });
  const display = useTransform(spring, v => Math.round(v).toString());

  useEffect(() => {
    spring.set(value);
  }, [value, spring]);

  return <motion.span>{display}</motion.span>;
}

export default function AppHeader({
  qualifiedCount,
  totalCount,
  selectedCourse,
  userScore,
}: AppHeaderProps) {
  const pct = Math.round((qualifiedCount / totalCount) * 100);

  return (
    <header
      className="flex items-center justify-between px-4 py-3 border-b relative z-10 flex-shrink-0"
      style={{
        background: 'rgba(2, 6, 23, 0.9)',
        borderColor: 'rgba(0, 245, 255, 0.1)',
        backdropFilter: 'blur(12px)',
        boxShadow: '0 1px 0 rgba(0,245,255,0.05), 0 4px 24px rgba(0,0,0,0.4)',
      }}
    >
      {/* Logo & Title */}
      <div className="flex items-center gap-3">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{
            background: 'linear-gradient(135deg, rgba(0,245,255,0.2), rgba(0,255,136,0.1))',
            border: '1px solid rgba(0,245,255,0.3)',
            boxShadow: '0 0 12px rgba(0,245,255,0.2)',
          }}
        >
          <Map size={18} />
        </div>
        <div>
          <h1
            className="text-sm font-display font-bold tracking-wide leading-none"
            style={{ color: '#00f5ff', textShadow: '0 0 12px rgba(0,245,255,0.5)' }}
          >
            LankaScore
          </h1>
          <div className="text-xs text-slate-500 leading-none mt-0.5 font-mono">
            Z-Score Heatmap
          </div>
        </div>
      </div>

      {/* Center - Course badge */}
      <div className="hidden md:flex items-center gap-2">
        <div
          className="text-xs font-mono px-3 py-1.5 rounded-full"
          style={{
            background: 'rgba(0,245,255,0.06)',
            border: '1px solid rgba(0,245,255,0.15)',
            color: '#94a3b8',
          }}
        >
          <span className="text-slate-500">Viewing </span>
          <span className="text-slate-200 font-medium">{selectedCourse}</span>
        </div>
      </div>

      {/* Right - Stats */}
      <div className="flex items-center gap-4">
        {/* Your score */}
        <div className="hidden sm:block text-right">
          <div className="text-xs text-slate-500 leading-none mb-1">Your Score</div>
          <div className="font-mono text-sm font-bold" style={{ color: '#00f5ff' }}>
            {userScore.toFixed(4)}
          </div>
        </div>

        {/* Eligible count */}
        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl border"
          style={{
            background: qualifiedCount > 0 ? 'rgba(0,255,136,0.08)' : 'rgba(100,116,139,0.08)',
            borderColor: qualifiedCount > 0 ? 'rgba(0,255,136,0.2)' : 'rgba(100,116,139,0.2)',
          }}
        >
          <div
            className="w-2 h-2 rounded-full animate-pulse"
            style={{ background: qualifiedCount > 0 ? '#00ff88' : '#475569' }}
          />
          <span className="font-mono text-sm font-bold"
            style={{ color: qualifiedCount > 0 ? '#00ff88' : '#64748b' }}>
            <AnimatedNumber value={qualifiedCount} />
            <span className="text-slate-500 font-normal text-xs"> / {totalCount}</span>
          </span>
          <span className="text-xs text-slate-500 hidden sm:inline">eligible</span>
        </div>

        {/* Percentage ring */}
        <div className="relative w-9 h-9 hidden md:block">
          <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
            <circle cx="18" cy="18" r="15.9" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="2.5"/>
            <motion.circle
              cx="18" cy="18" r="15.9"
              fill="none"
              stroke={qualifiedCount > 0 ? '#00ff88' : '#334155'}
              strokeWidth="2.5"
              strokeDasharray="100"
              animate={{ strokeDashoffset: 100 - pct }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-mono font-bold text-slate-300">{pct}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
