import { useMemo } from 'react';
import rawData from '../data/data.json';
import type { ZScoreDatabase, DistrictEligibility } from '../types';
import { getDistrictEligibility } from '../utils/colorLogic';

const data = rawData as unknown as ZScoreDatabase;

export const COURSES = Object.keys(data);

// ← Updated: now includes 2020–2024
export const YEARS = ['2020', '2021', '2022', '2023', '2024'];
export const LATEST_YEAR = '2024';

export function useAllDistricts(
  course: string,
  year: string,
  userScore: number
): DistrictEligibility[] {
  return useMemo(() => {
    const courseData = data[course]?.[year];
    if (!courseData) return [];

    return Object.entries(courseData).map(([district, info]) => {
      return getDistrictEligibility(
        district,
        userScore,
        info.cutoff_zscore,
        // ← Key fix: pass the {name, cutoff}[] objects directly instead of
        //   casting to string[]. colorLogic.ts now expects this shape.
        info.universities as { name: string; cutoff: number }[],
        info.nqc
      );
    });
  }, [course, year, userScore]);
}

export function useDistrictData(course: string, year: string, district: string) {
  return useMemo(() => {
    return data[course]?.[year]?.[district] ?? null;
  }, [course, year, district]);
}

export function useHistoricalData(course: string, district: string) {
  return useMemo(() => {
    return YEARS.map(year => {
      const entry = data[course]?.[year]?.[district];
      return {
        year: parseInt(year),
        cutoff: entry?.nqc ? null : (entry?.cutoff_zscore ?? null),
        nqc: entry?.nqc ?? false,
      };
    });
  }, [course, district]);
}

export function useEligibilitySummary(eligibilities: DistrictEligibility[]) {
  return useMemo(() => {
    const qualified = eligibilities.filter(e => e.status === 'qualified').length;
    const locked = eligibilities.filter(e => e.status === 'locked').length;
    const nqc = eligibilities.filter(e => e.status === 'nqc').length;
    return { qualified, locked, nqc, total: eligibilities.length };
  }, [eligibilities]);
}

export function useMinRequiredScore(course: string, year: string): number {
  return useMemo(() => {
    const courseData = data[course]?.[year];
    if (!courseData) return 0;
    const cutoffs = Object.values(courseData)
      .filter(d => !d.nqc)
      .map(d => d.cutoff_zscore);
    return cutoffs.length ? Math.min(...cutoffs) : 0;
  }, [course, year]);
}

export { data as zscoreData };