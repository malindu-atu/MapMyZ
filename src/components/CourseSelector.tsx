import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { COURSES, YEARS } from '../hooks/useZScore';

const COURSE_ICONS: Record<string, string> = {
  'Medicine': '🩺',
  'Dentistry': '🦷',
  'Engineering': '⚙️',
  'Computer Science': '💻',
  'Architecture': '🏛️',
  'Law': '⚖️',
  'Veterinary Science': '🐾',
  'Agriculture': '🌾',
  'Management': '📊',
  'Arts': '🎨',
  'Science': '🔬',
  'Physical Science': '⚛️',
  'Bio Science': '🧬',
  'Quantity Surveying': '📐',
};

interface CourseSelectorProps {
  selectedCourse: string;
  selectedYear: string;
  onCourseChange: (course: string) => void;
  onYearChange: (year: string) => void;
}

export default function CourseSelector({
  selectedCourse,
  selectedYear,
  onCourseChange,
  onYearChange,
}: CourseSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="space-y-3">
      {/* Course Dropdown */}
      <div>
        <label className="text-xs text-slate-500 uppercase tracking-widest block mb-1.5">
          Course / Field
        </label>
        <div className="relative">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl border transition-all duration-200 text-left"
            style={{
              background: 'rgba(15, 23, 42, 0.8)',
              borderColor: isOpen ? 'rgba(0, 245, 255, 0.5)' : 'rgba(0, 245, 255, 0.15)',
              boxShadow: isOpen ? '0 0 12px rgba(0, 245, 255, 0.15)' : 'none',
            }}
          >
            <span className="flex items-center gap-2">
              <span className="text-base">{COURSE_ICONS[selectedCourse] ?? '📚'}</span>
              <span className="text-sm font-medium text-slate-200">{selectedCourse}</span>
            </span>
            <motion.span
              animate={{ rotate: isOpen ? 180 : 0 }}
              transition={{ duration: 0.2 }}
              className="text-slate-400 text-xs"
            >
              ▼
            </motion.span>
          </button>

          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8, scaleY: 0.9 }}
                animate={{ opacity: 1, y: 0, scaleY: 1 }}
                exit={{ opacity: 0, y: -8, scaleY: 0.9 }}
                transition={{ duration: 0.15 }}
                className="absolute top-full left-0 right-0 mt-1 rounded-xl border overflow-hidden z-50"
                style={{
                  background: 'rgba(10, 15, 30, 0.98)',
                  borderColor: 'rgba(0, 245, 255, 0.2)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.6), 0 0 20px rgba(0,245,255,0.1)',
                  backdropFilter: 'blur(16px)',
                  maxHeight: '280px',
                  overflowY: 'auto',
                }}
              >
                {COURSES.map(course => (
                  <button
                    key={course}
                    onClick={() => {
                      onCourseChange(course);
                      setIsOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-sm transition-all duration-100 text-left"
                    style={{
                      background: course === selectedCourse
                        ? 'rgba(0, 245, 255, 0.08)'
                        : 'transparent',
                      color: course === selectedCourse ? '#00f5ff' : '#94a3b8',
                      borderLeft: course === selectedCourse
                        ? '2px solid rgba(0, 245, 255, 0.6)'
                        : '2px solid transparent',
                    }}
                    onMouseEnter={e => {
                      if (course !== selectedCourse)
                        (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)';
                    }}
                    onMouseLeave={e => {
                      if (course !== selectedCourse)
                        (e.currentTarget as HTMLElement).style.background = 'transparent';
                    }}
                  >
                    <span className="text-base">{COURSE_ICONS[course] ?? '📚'}</span>
                    <span className="font-medium">{course}</span>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Year Selector */}
      <div>
        <label className="text-xs text-slate-500 uppercase tracking-widest block mb-1.5">
          Academic Year
        </label>
        <div className="flex gap-1.5">
          {YEARS.map(year => (
            <button
              key={year}
              onClick={() => onYearChange(year)}
              className="flex-1 py-1.5 text-xs font-mono rounded-lg border transition-all duration-150"
              style={{
                borderColor: year === selectedYear
                  ? 'rgba(0, 245, 255, 0.5)'
                  : 'rgba(0, 245, 255, 0.1)',
                background: year === selectedYear
                  ? 'rgba(0, 245, 255, 0.12)'
                  : 'rgba(15, 23, 42, 0.6)',
                color: year === selectedYear ? '#00f5ff' : '#64748b',
                boxShadow: year === selectedYear ? '0 0 8px rgba(0,245,255,0.2)' : 'none',
              }}
            >
              {year}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
