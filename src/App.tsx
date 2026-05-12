import { useState, useMemo, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import AppHeader from './components/AppHeader';
import DistrictMap from './components/DistrictMap';
import SliderPanel from './components/SliderPanel';
import CourseSelector from './components/CourseSelector';
import SearchBar from './components/SearchBar';
import FilterChips from './components/FilterChips';
import DistrictDetailPanel from './components/DistrictDetailPanel';
import DistrictRankingLeaderboard from './components/DistrictRankingLeaderboard';
import MobileBottomSheet from './components/MobileBottomSheet';
import { useAllDistricts, useEligibilitySummary, useMinRequiredScore, LATEST_YEAR } from './hooks/useZScore';

const DEFAULT_COURSE = 'Computer Science';
const DEFAULT_SCORE = 1.45;

function useIsMobile() {
  return typeof window !== 'undefined' && window.innerWidth < 768;
}

export default function App() {
  const [selectedCourse, setSelectedCourse] = useState(DEFAULT_COURSE);
  const [selectedYear, setSelectedYear] = useState(LATEST_YEAR);
  const [userScore, setUserScore] = useState(DEFAULT_SCORE);
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);
  const [hoveredDistrict, setHoveredDistrict] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    showEligible: true,
    showLocked: true,
    showNQC: true,
  });

  const isMobile = useIsMobile();

  // Core data
  const eligibilities = useAllDistricts(selectedCourse, selectedYear, userScore);
  const summary = useEligibilitySummary(eligibilities);
  const minRequired = useMinRequiredScore(selectedCourse, selectedYear);

  // Search + filter logic
  const filteredDistricts = useMemo(() => {
    return new Set(
      eligibilities
        .filter(e => {
          const matchesSearch = searchQuery.length === 0 ||
            e.district.toLowerCase().includes(searchQuery.toLowerCase());
          const matchesFilter =
            (filters.showEligible && e.status === 'qualified') ||
            (filters.showLocked && e.status === 'locked') ||
            (filters.showNQC && e.status === 'nqc');
          return matchesSearch && matchesFilter;
        })
        .map(e => e.district)
    );
  }, [eligibilities, searchQuery, filters]);

  const selectedEligibility = useMemo(
    () => eligibilities.find(e => e.district === selectedDistrict) ?? null,
    [eligibilities, selectedDistrict]
  );

  const handleFilterToggle = useCallback((key: keyof typeof filters) => {
    setFilters(prev => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const handleCourseChange = useCallback((course: string) => {
    setSelectedCourse(course);
    setSelectedDistrict(null);
  }, []);

  const sidebarContent = (
    <div className="flex flex-col gap-4 h-full">
      <CourseSelector
        selectedCourse={selectedCourse}
        selectedYear={selectedYear}
        onCourseChange={handleCourseChange}
        onYearChange={setSelectedYear}
      />

      <div className="border-t border-white/5 pt-4">
        <SliderPanel
          userScore={userScore}
          onScoreChange={setUserScore}
          qualifiedCount={summary.qualified}
          totalCount={summary.total}
          minRequired={minRequired}
        />
      </div>

      <div className="border-t border-white/5 pt-4">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          resultCount={filteredDistricts.size}
          totalCount={eligibilities.length}
        />
      </div>

      <FilterChips
        filters={filters}
        onToggle={handleFilterToggle}
        counts={{ qualified: summary.qualified, locked: summary.locked, nqc: summary.nqc }}
      />

      <div className="border-t border-white/5 pt-4 flex-1 min-h-0">
        <DistrictRankingLeaderboard
          eligibilities={eligibilities}
          selectedDistrict={selectedDistrict}
          onDistrictSelect={d => setSelectedDistrict(prev => prev === d ? null : d)}
        />
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-screen grid-bg" style={{ background: '#020617' }}>
      {/* Header */}
      <AppHeader
        qualifiedCount={summary.qualified}
        totalCount={summary.total}
        selectedCourse={selectedCourse}
        userScore={userScore}
      />

      {/* Main layout */}
      <div className="flex flex-1 min-h-0 relative">
        {/* Desktop sidebar */}
        {!isMobile && (
          <aside
            className="w-72 flex-shrink-0 flex flex-col border-r overflow-hidden"
            style={{
              background: 'rgba(5, 8, 20, 0.92)',
              borderColor: 'rgba(0,245,255,0.08)',
              backdropFilter: 'blur(12px)',
            }}
          >
            <div className="flex-1 overflow-y-auto p-4">
              {sidebarContent}
            </div>
          </aside>
        )}

        {/* Map */}
        <div className="flex-1 relative">
          <DistrictMap
            eligibilities={eligibilities}
            selectedDistrict={hoveredDistrict ?? selectedDistrict}
            searchQuery={searchQuery}
            filteredDistricts={filteredDistricts}
            onDistrictClick={d => setSelectedDistrict(prev => prev === d ? null : d)}
            onDistrictHover={setHoveredDistrict}
          />

          {/* Color legend */}
          <div
            className="absolute bottom-4 left-4 px-3 py-2 rounded-xl text-xs font-mono space-y-1.5"
            style={{
              background: 'rgba(5,8,20,0.85)',
              border: '1px solid rgba(0,245,255,0.12)',
              backdropFilter: 'blur(8px)',
            }}
          >
            <div className="text-slate-500 uppercase tracking-wider text-xs mb-1">Legend</div>
            {[
              { color: '#00f5ff', label: 'High margin' },
              { color: '#00ff88', label: 'Eligible' },
              { color: '#334155', label: 'Locked' },
              { color: '#78350f', label: 'NQC' },
            ].map(item => (
              <div key={item.label} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm" style={{ background: item.color }} />
                <span className="text-slate-400">{item.label}</span>
              </div>
            ))}
          </div>

          {/* Hovered district tooltip */}
          <AnimatePresence>
            {hoveredDistrict && !selectedDistrict && (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 4 }}
                className="absolute top-4 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-lg text-xs font-mono pointer-events-none"
                style={{
                  background: 'rgba(5,8,20,0.9)',
                  border: '1px solid rgba(0,245,255,0.2)',
                  backdropFilter: 'blur(8px)',
                  color: '#00f5ff',
                }}
              >
                {hoveredDistrict} — click for details
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Desktop detail panel */}
        {!isMobile && selectedEligibility && (
          <aside
            className="w-72 flex-shrink-0 overflow-y-auto border-l p-4"
            style={{
              background: 'rgba(5, 8, 20, 0.92)',
              borderColor: 'rgba(0,245,255,0.08)',
            }}
          >
            <DistrictDetailPanel
              eligibility={selectedEligibility}
              course={selectedCourse}
              userScore={userScore}
              onClose={() => setSelectedDistrict(null)}
            />
          </aside>
        )}
      </div>

      {/* Mobile bottom sheet */}
      {isMobile && (
        <MobileBottomSheet title="LankaScore Controls">
          <div className="space-y-4 pb-8">
            {sidebarContent}
            {selectedEligibility && (
              <div className="border-t border-white/10 pt-4">
                <DistrictDetailPanel
                  eligibility={selectedEligibility}
                  course={selectedCourse}
                  userScore={userScore}
                  onClose={() => setSelectedDistrict(null)}
                />
              </div>
            )}
          </div>
        </MobileBottomSheet>
      )}
    </div>
  );
}
