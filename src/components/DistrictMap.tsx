import { useEffect, useRef, useCallback, useState } from 'react';
import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet';
import type { GeoJsonObject, Feature } from 'geojson';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { DistrictEligibility } from '../types';
import { getLeafletStyle } from '../utils/colorLogic';

interface DistrictMapProps {
  eligibilities: DistrictEligibility[];
  selectedDistrict: string | null;
  searchQuery: string;
  filteredDistricts: Set<string>;
  onDistrictClick: (district: string) => void;
  onDistrictHover: (district: string | null) => void;
}

// Tight bounds around Sri Lanka only — excludes India/Tamil Nadu
const SRI_LANKA_BOUNDS: L.LatLngBoundsExpression = [[5.85, 79.50], [9.95, 81.95]];
const SRI_LANKA_CENTER: L.LatLngExpression = [7.95, 80.75];

/**
 * The GeoJSON file spells the district "Moneragala" but all data sources
 * (UGC PDFs, data.json) use "Monaragala". This map normalises the GeoJSON
 * name so the eligibility lookup never silently misses it.
 */
const GEO_NAME_OVERRIDES: Record<string, string> = {
  'Moneragala': 'Monaragala',
};

function normalizeGeoName(name: string): string {
  return GEO_NAME_OVERRIDES[name] ?? name;
}

function MapUpdater({
  eligibilities,
  selectedDistrict,
  searchQuery,
  filteredDistricts,
  geoJsonRef,
}: {
  eligibilities: DistrictEligibility[];
  selectedDistrict: string | null;
  searchQuery: string;
  filteredDistricts: Set<string>;
  geoJsonRef: React.MutableRefObject<L.GeoJSON | null>;
}) {
  const map = useMap();

  // Fit to Sri Lanka bounds on mount with tight padding
  useEffect(() => {
    map.fitBounds(SRI_LANKA_BOUNDS, { padding: [20, 20], maxZoom: 8 });
  }, [map]);

  // Re-style all layers whenever eligibility data changes
  useEffect(() => {
    if (!geoJsonRef.current) return;
    const eligMap = new Map(eligibilities.map(e => [e.district, e]));
    geoJsonRef.current.eachLayer((layer: L.Layer) => {
      const geoLayer = layer as L.Path & { feature?: Feature };
      const rawName = geoLayer.feature?.properties?.name as string;
      if (!rawName) return;
      const name = normalizeGeoName(rawName);
      const eligibility = eligMap.get(name);
      if (!eligibility) return;
      const isHovered = name === selectedDistrict;
      const isDimmed = searchQuery.length > 0 && !filteredDistricts.has(name);
      (geoLayer as L.Polygon).setStyle(getLeafletStyle(eligibility, isHovered, isDimmed));
      if (isHovered) (geoLayer as L.Polygon).bringToFront();
    });
  }, [eligibilities, selectedDistrict, searchQuery, filteredDistricts, geoJsonRef]);

  return null;
}

export default function DistrictMap({
  eligibilities,
  selectedDistrict,
  searchQuery,
  filteredDistricts,
  onDistrictClick,
  onDistrictHover,
}: DistrictMapProps) {
  const geoJsonRef = useRef<L.GeoJSON | null>(null);
  const [geoData, setGeoData] = useState<GeoJsonObject | null>(null);
  const eligibilitiesRef = useRef(eligibilities);

  useEffect(() => { eligibilitiesRef.current = eligibilities; }, [eligibilities]);

  useEffect(() => {
    fetch('/sri-lanka-districts.geojson').then(r => r.json()).then(setGeoData);
  }, []);

  const styleFeature = useCallback((feature?: Feature): L.PathOptions => {
    const rawName = feature?.properties?.name as string;
    const name = normalizeGeoName(rawName);
    const elig = eligibilitiesRef.current.find(e => e.district === name);
    if (!elig) return { fillColor: '#1e293b', fillOpacity: 0.7, color: '#334155', weight: 1 };
    const isDimmed = searchQuery.length > 0 && !filteredDistricts.has(name);
    return getLeafletStyle(elig, name === selectedDistrict, isDimmed);
  }, [selectedDistrict, searchQuery, filteredDistricts]);

  const onEachFeature = useCallback((feature: Feature, layer: L.Layer) => {
    const rawName = feature.properties?.name as string;
    const name = normalizeGeoName(rawName);
    const polygon = layer as L.Polygon;
    polygon.on({
      mouseover: () => onDistrictHover(name),
      mouseout: () => onDistrictHover(null),
      click: () => onDistrictClick(name),
    });
  }, [onDistrictClick, onDistrictHover]);

  return (
    <MapContainer
      center={SRI_LANKA_CENTER}
      zoom={7}
      minZoom={6}
      maxZoom={11}
      maxBounds={[[5.0, 78.8], [10.6, 83.2]]}
      maxBoundsViscosity={1.0}
      zoomControl={true}
      style={{ height: '100%', width: '100%', background: '#020617' }}
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
        subdomains="abcd"
        maxZoom={19}
      />
      {geoData && (
        <GeoJSON
          key="districts"
          data={geoData}
          style={styleFeature}
          onEachFeature={onEachFeature}
          ref={geoJsonRef}
        />
      )}
      <MapUpdater
        eligibilities={eligibilities}
        selectedDistrict={selectedDistrict}
        searchQuery={searchQuery}
        filteredDistricts={filteredDistricts}
        geoJsonRef={geoJsonRef}
      />
    </MapContainer>
  );
}
