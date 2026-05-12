export interface University {
  name: string;
  shortName: string;
}

export interface DistrictData {
  cutoff_zscore: number;
  universities: University[];
  nqc: boolean; // No Qualified Candidates
}

export interface YearData {
  [district: string]: DistrictData;
}

export interface CourseData {
  [year: string]: YearData;
}

export interface ZScoreDatabase {
  [course: string]: CourseData;
}

export interface DistrictFeature {
  type: 'Feature';
  properties: {
    name: string;
    id: string;
    province: string;
  };
  geometry: {
    type: 'Polygon' | 'MultiPolygon';
    coordinates: number[][][] | number[][][][];
  };
}

export interface DistrictGeoJSON {
  type: 'FeatureCollection';
  features: DistrictFeature[];
}

export type EligibilityStatus = 'qualified' | 'locked' | 'nqc';

export interface DistrictEligibility {
  district: string;
  status: EligibilityStatus;
  cutoff: number;
  margin: number; // userScore - cutoff (can be negative)
  universities: University[];
  color: string;
  fillOpacity: number;
  glowIntensity: number; // 0–1
}

export interface FilterState {
  search: string;
  showEligible: boolean;
  showLocked: boolean;
  showNQC: boolean;
}
