import type { DistrictEligibility, EligibilityStatus, University } from '../types';

// Locked gray
const LOCKED_COLOR = '#1e293b';
const LOCKED_BORDER = '#334155';

// NQC - striped pattern color
const NQC_COLOR = '#0f172a';
const NQC_BORDER = '#475569';

/**
 * Maps a margin (userScore - cutoff) to a neon green→cyan gradient
 * margin 0.00 → dim green #00aa55
 * margin 0.10 → mid green #00cc66
 * margin 0.30+ → full neon green #00ff88
 * margin 0.50+ → cyan-shifted #00f5ff
 */
export function marginToColor(margin: number): { fill: string; border: string; opacity: number; glow: number } {
  if (margin <= 0) {
    return { fill: LOCKED_COLOR, border: LOCKED_BORDER, opacity: 0.85, glow: 0 };
  }

  // Normalize margin: 0 → 0, 0.5+ → 1
  const t = Math.min(margin / 0.5, 1);

  if (t < 0.4) {
    // dim green to bright green
    const u = t / 0.4;
    const r = Math.round(0);
    const g = Math.round(170 + u * 85); // 170 → 255
    const b = Math.round(85 + u * 51);  // 85 → 136
    return {
      fill: `rgb(${r},${g},${b})`,
      border: `rgb(${r},${Math.min(255, g + 30)},${Math.min(255, b + 30)})`,
      opacity: 0.55 + u * 0.25,
      glow: u * 0.6,
    };
  } else {
    // bright green to neon cyan
    const u = (t - 0.4) / 0.6;
    const r = Math.round(u * 0);
    const g = Math.round(255 - u * 10);   // 255 → 245
    const b = Math.round(136 + u * 119); // 136 → 255
    return {
      fill: `rgb(${r},${g},${b})`,
      border: `rgb(${Math.min(255, r + 20)},${Math.min(255, g + 10)},255)`,
      opacity: 0.8 + u * 0.15,
      glow: 0.6 + u * 0.4,
    };
  }
}

/**
 * Build DistrictEligibility from raw data.
 *
 * Key change from old version: `rawUniversities` is now an array of
 * `{ name: string; cutoff: number }` objects from the new data.json.
 * Each university is checked individually against the userScore, so a
 * student can see exactly which universities they can enter.
 *
 * The district-level `cutoff` (shown in the stats grid) remains the
 * lowest individual university cutoff — i.e. the floor to enter ANY
 * university in this district.
 */
export function getDistrictEligibility(
  district: string,
  userScore: number,
  districtCutoff: number,
  rawUniversities: { name: string; cutoff: number }[],
  nqc: boolean
): DistrictEligibility {
  if (nqc) {
    return {
      district,
      status: 'nqc',
      cutoff: 0,
      margin: 0,
      universities: [],
      color: NQC_COLOR,
      fillOpacity: 0.6,
      glowIntensity: 0,
    };
  }

  // Per-university eligibility: only include universities the user qualifies for,
  // OR (if none qualify) include all so they can see what they're short of.
  const universitiesWithStatus: University[] = rawUniversities.map(u => ({
    name: u.name,
    shortName: u.name.split(' - ')[0],
    cutoff: u.cutoff,
  }));

  // The overall district margin is based on the lowest cutoff (district floor)
  const margin = parseFloat((userScore - districtCutoff).toFixed(4));
  const status: EligibilityStatus = margin >= 0 ? 'qualified' : 'locked';
  const { fill, opacity, glow } = marginToColor(margin);

  return {
    district,
    status,
    cutoff: districtCutoff,
    margin,
    universities: universitiesWithStatus,
    color: fill,
    fillOpacity: opacity,
    glowIntensity: glow,
  };
}

/**
 * Leaflet style object for a district feature
 */
export function getLeafletStyle(eligibility: DistrictEligibility, isHovered: boolean, isSearchDimmed: boolean) {
  const { color, fillOpacity, status, glowIntensity } = eligibility;

  const baseWeight = isHovered ? 2.5 : 1;
  const dimmed = isSearchDimmed && !isHovered;

  let borderColor = '#334155';
  if (status === 'qualified') {
    borderColor = glowIntensity > 0.6 ? '#00f5ff' : '#00ff88';
  } else if (status === 'nqc') {
    borderColor = NQC_BORDER;
  }

  return {
    fillColor: color,
    fillOpacity: dimmed ? fillOpacity * 0.25 : fillOpacity,
    color: isHovered ? '#ffffff' : borderColor,
    weight: baseWeight,
    opacity: dimmed ? 0.3 : 1,
  };
}

/**
 * Score display helpers
 */
export function formatScore(score: number): string {
  return score.toFixed(4);
}

export function formatMargin(margin: number): string {
  const sign = margin >= 0 ? '+' : '';
  return `${sign}${margin.toFixed(4)}`;
}

export function getStatusLabel(status: EligibilityStatus): string {
  switch (status) {
    case 'qualified': return 'ELIGIBLE';
    case 'locked': return 'LOCKED';
    case 'nqc': return 'NQC';
  }
}

export function getStatusColor(status: EligibilityStatus): string {
  switch (status) {
    case 'qualified': return '#00ff88';
    case 'locked': return '#64748b';
    case 'nqc': return '#f59e0b';
  }
}