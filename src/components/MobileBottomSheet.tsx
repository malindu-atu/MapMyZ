import type { PanInfo } from "framer-motion";
import { motion, useMotionValue, animate } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';

interface MobileBottomSheetProps {
  children: React.ReactNode;
  title: string;
  peekHeight?: number;
}

const SNAP_HALF = 0.45;     // 45% of screen height
const SNAP_FULL = 0.85;     // 85% of screen height

export default function MobileBottomSheet({
  children,
  title,
  peekHeight = 72,
}: MobileBottomSheetProps) {
  const [snapState, setSnapState] = useState<'collapsed' | 'half' | 'full'>('half');
  const sheetRef = useRef<HTMLDivElement>(null);
  const y = useMotionValue(0);

  function getTargetY(state: 'collapsed' | 'half' | 'full'): number {
    const vh = window.innerHeight;
    switch (state) {
      case 'collapsed': return vh - peekHeight;
      case 'half': return vh * (1 - SNAP_HALF);
      case 'full': return vh * (1 - SNAP_FULL);
    }
  }

  useEffect(() => {
    const target = getTargetY(snapState);
    animate(y, target, { type: 'spring', stiffness: 350, damping: 35 });
  }, [snapState]);

  useEffect(() => {
    // Initialize
    animate(y, getTargetY('half'), { duration: 0 });
  }, []);

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    const velocity = info.velocity.y;
    const currentY = y.get();
    const vh = window.innerHeight;

    if (velocity > 500) {
      // Fast flick down
      setSnapState(snapState === 'full' ? 'half' : 'collapsed');
    } else if (velocity < -500) {
      // Fast flick up
      setSnapState(snapState === 'collapsed' ? 'half' : 'full');
    } else {
      // Snap to nearest
      const pct = 1 - (currentY / vh);
      if (pct < 0.2) setSnapState('collapsed');
      else if (pct < 0.65) setSnapState('half');
      else setSnapState('full');
    }
  };


  return (
    <motion.div
      ref={sheetRef}
      drag="y"
      dragConstraints={{ top: getTargetY('full'), bottom: getTargetY('collapsed') }}
      dragElastic={0.1}
      onDragEnd={handleDragEnd}
      style={{
        y,
        position: 'fixed',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        background: 'rgba(5, 8, 20, 0.97)',
        borderTop: '1px solid rgba(0,245,255,0.15)',
        borderRadius: '20px 20px 0 0',
        boxShadow: '0 -8px 40px rgba(0,0,0,0.6), 0 -1px 0 rgba(0,245,255,0.08)',
        backdropFilter: 'blur(16px)',
        zIndex: 40,
        touchAction: 'none',
        willChange: 'transform',
      }}
    >
      {/* Handle */}
      <div className="flex flex-col items-center pt-3 pb-2 cursor-grab active:cursor-grabbing">
        <div
          className="w-10 h-1 rounded-full"
          style={{ background: 'rgba(0,245,255,0.3)' }}
        />
        <div className="flex items-center justify-between w-full px-4 mt-3">
          <h2
            className="text-sm font-display font-semibold"
            style={{ color: '#00f5ff', textShadow: '0 0 8px rgba(0,245,255,0.4)' }}
          >
            {title}
          </h2>
          <div className="flex gap-2">
            {(['collapsed', 'half', 'full'] as const).map(state => (
              <button
                key={state}
                onClick={() => setSnapState(state)}
                className="w-2 h-2 rounded-full transition-all"
                style={{
                  background: snapState === state ? '#00f5ff' : 'rgba(255,255,255,0.15)',
                  boxShadow: snapState === state ? '0 0 6px rgba(0,245,255,0.6)' : 'none',
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Scrollable content */}
      <div
        className="overflow-y-auto px-4 pb-safe"
        style={{
          height: 'calc(100% - 72px)',
          WebkitOverflowScrolling: 'touch',
        }}
        onPointerDown={e => e.stopPropagation()}
      >
        {children}
      </div>
    </motion.div>
  );
}
