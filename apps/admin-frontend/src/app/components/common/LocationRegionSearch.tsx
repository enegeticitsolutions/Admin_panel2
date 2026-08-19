import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  Search,
  X,
  MapPin,
  CheckCircle2,
  Loader2,
  Navigation,
  Compass,
  Map,
  Building,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';
import { regionApi, zoneApi } from '../../../services/api';
import { locationApi } from '../../../services/location';
import LocationPickerModal from './LocationPickerModal';

/**
 * Calculate distance in km between two GPS coordinates using Haversine formula
 */
function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Normalize and expand search terms with known Indian city/region synonyms
 */
function expandSynonyms(str: string): string[] {
  const clean = str.toLowerCase().replace(/[^a-z0-9\s]/g, ' ');
  const tokens = clean.split(/\s+/).filter(Boolean);
  const expanded: string[] = [...tokens];

  tokens.forEach((t) => {
    if (t === 'gurgaon' || t === 'gurugram' || t === 'ggn') {
      expanded.push('gurgaon', 'gurugram', 'ggn');
    }
    if (t === 'delhi' || t === 'dli' || t === 'ncr') {
      expanded.push('delhi', 'new delhi', 'ncr');
    }
    if (t === 'noida' || t === 'gautam' || t === 'buddha') {
      expanded.push('noida', 'noida sector', 'gb nagar');
    }
    if (t === 'faridabad' || t === 'fbd') {
      expanded.push('faridabad', 'fbd');
    }
  });

  return Array.from(new Set(expanded));
}

export interface DetectedRegionResult {
  query: string;
  formattedAddress?: string;
  regionId: string;
  regionName: string;
  cityName?: string;
  distanceKm?: number;
  latitude?: number;
  longitude?: number;
  matchedZoneId?: string;
  matchedZoneName?: string;
  rawRegion?: any;
  rawZone?: any;
}

export interface LocationRegionSearchProps {
  /** Currently selected Location ID ('all' | regionId | zoneId) */
  selectedLocationId?: string;
  /** Callback triggered when a location is detected or selected */
  onLocationChange: (
    locationId: string,
    detectedDetails?: DetectedRegionResult | null
  ) => void;
  /** Initial pincode to auto-match */
  defaultPincode?: string;
  /** Preloaded regions (optional, fetched automatically if not provided) */
  regions?: any[];
  /** Preloaded zones (optional, fetched automatically if not provided) */
  zones?: any[];
  /** Custom placeholder text */
  placeholder?: string;
  /** Custom label */
  label?: string;
  /** Header badge (e.g. count) */
  headerBadge?: React.ReactNode;
  /** Whether to show the manual dropdown */
  showDropdown?: boolean;
  /** Allow launching the interactive map modal */
  enableMapPicker?: boolean;
  /** Compact style */
  compact?: boolean;
  className?: string;
}

export const LocationRegionSearch: React.FC<LocationRegionSearchProps> = ({
  selectedLocationId = 'all',
  onLocationChange,
  defaultPincode,
  regions: initialRegions,
  zones: initialZones,
  placeholder = 'Type location (e.g. Gurgaon Sector 53, Saket Delhi, Cyber City)...',
  label = 'Google Location Search & Region Detection',
  headerBadge,
  showDropdown = true,
  enableMapPicker = true,
  compact = false,
  className = '',
}) => {
  const [regions, setRegions] = useState<any[]>(initialRegions || []);
  const [zones, setZones] = useState<any[]>(initialZones || []);
  const [loadingData, setLoadingData] = useState(false);
  const [searching, setSearching] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [detectedLocation, setDetectedLocation] = useState<DetectedRegionResult | null>(null);
  const [showMapModal, setShowMapModal] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // 1. Fetch Regions & Zones if not passed as props
  useEffect(() => {
    if (initialRegions && initialZones) return;

    let isMounted = true;
    const fetchData = async () => {
      setLoadingData(true);
      try {
        const [regionsRes, zonesRes] = await Promise.all([
          !initialRegions ? regionApi.getAll().catch(() => []) : Promise.resolve(initialRegions),
          !initialZones ? zoneApi.getAll().catch(() => []) : Promise.resolve(initialZones),
        ]);
        if (isMounted) {
          if (!initialRegions) setRegions(regionsRes || []);
          if (!initialZones) setZones(zonesRes || []);
        }
      } catch (err) {
        console.warn('Failed to load regions/zones for LocationRegionSearch:', err);
      } finally {
        if (isMounted) setLoadingData(false);
      }
    };

    fetchData();
    return () => {
      isMounted = false;
    };
  }, [initialRegions, initialZones]);

  // Click outside listener to close suggestions
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 2. Auto-match default pincode if supplied
  useEffect(() => {
    if (!defaultPincode || zones.length === 0 || selectedLocationId !== 'all') return;

    const matchedZone = zones.find(
      (z: any) =>
        z.pincode === defaultPincode ||
        z.pincodes?.some((p: any) =>
          typeof p === 'string' ? p === defaultPincode : p.code === defaultPincode
        )
    );

    if (matchedZone) {
      const targetId = matchedZone.regionId || matchedZone.id;
      const detected: DetectedRegionResult = {
        query: `Pincode: ${defaultPincode}`,
        regionId: targetId,
        regionName: matchedZone.region?.name || matchedZone.name,
        cityName: matchedZone.city,
        matchedZoneId: matchedZone.id,
        matchedZoneName: matchedZone.name,
        rawZone: matchedZone,
      };
      setDetectedLocation(detected);
      onLocationChange(targetId, detected);
    }
  }, [defaultPincode, zones]);

  // 3. Compute live local suggestions as user types
  const liveSuggestions = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q || q.length < 1) return [];

    const tokens = expandSynonyms(q);
    const results: Array<{
      type: 'zone' | 'region';
      title: string;
      subtitle: string;
      regionId: string;
      regionName: string;
      zoneId?: string;
      zoneName?: string;
      city?: string;
      raw: any;
      score: number;
    }> = [];

    // Match Zones
    zones.forEach((z) => {
      const text = `${z.name} ${z.city || ''} ${z.address || ''} ${z.pincode || ''} ${z.region?.name || ''}`.toLowerCase();
      let score = 0;
      tokens.forEach((t) => {
        if (text.includes(t)) score += t.length * 2;
      });
      if (text.startsWith(q)) score += 10;
      if (score > 0) {
        results.push({
          type: 'zone',
          title: z.name,
          subtitle: `Zone · ${z.city || 'City'}${z.pincode ? ` (${z.pincode})` : ''}`,
          regionId: z.regionId || z.region?.id || z.id,
          regionName: z.region?.name || z.name,
          zoneId: z.id,
          zoneName: z.name,
          city: z.city,
          raw: z,
          score,
        });
      }
    });

    // Match Regions
    regions.forEach((r) => {
      const text = `${r.name} ${r.city || ''} ${r.state || ''}`.toLowerCase();
      let score = 0;
      tokens.forEach((t) => {
        if (text.includes(t)) score += t.length * 3;
      });
      if (text.startsWith(q)) score += 10;
      if (score > 0) {
        results.push({
          type: 'region',
          title: r.name,
          subtitle: `Region · ${r.city || ''} ${r.state || ''}`.trim(),
          regionId: r.id,
          regionName: r.name,
          city: r.city,
          raw: r,
          score,
        });
      }
    });

    return results.sort((a, b) => b.score - a.score).slice(0, 5);
  }, [searchQuery, zones, regions]);

  // 4. Core Resolution: Lat/Lng -> Region & Zone
  const matchCoordsToRegion = async (lat: number, lng: number, addressName: string) => {
    setSearching(true);
    try {
      // Step A: Call backend detect route
      const matching = await regionApi.detect(lat, lng).catch(() => []);
      let bestRegion = matching && matching.length > 0 ? matching[0] : null;

      // Step B: Proximity fallback
      if (!bestRegion && regions.length > 0) {
        const sorted = regions
          .map((r: any) => {
            const rLat = parseFloat(r.latitude);
            const rLng = parseFloat(r.longitude);
            const dist =
              !isNaN(rLat) && !isNaN(rLng)
                ? calculateDistanceKm(lat, lng, rLat, rLng)
                : 99999;
            return { ...r, distance: dist };
          })
          .sort((a: any, b: any) => a.distance - b.distance);

        if (sorted[0] && sorted[0].distance < 100) {
          bestRegion = sorted[0];
        }
      }

      // Step C: Match Zone by proximity or address name
      const matchedZone = zones.find(
        (z: any) =>
          addressName.toLowerCase().includes(z.name.toLowerCase()) ||
          (z.city && addressName.toLowerCase().includes(z.city.toLowerCase()))
      );

      if (bestRegion) {
        const distanceKm =
          bestRegion.distance !== undefined
            ? Math.round(bestRegion.distance * 10) / 10
            : undefined;

        const result: DetectedRegionResult = {
          query: addressName,
          formattedAddress: addressName,
          regionId: bestRegion.id,
          regionName: bestRegion.name,
          cityName: bestRegion.city,
          distanceKm,
          latitude: lat,
          longitude: lng,
          matchedZoneId: matchedZone?.id,
          matchedZoneName: matchedZone?.name,
          rawRegion: bestRegion,
          rawZone: matchedZone,
        };

        setDetectedLocation(result);
        onLocationChange(bestRegion.id, result);
        toast.success(
          `📍 Detected Region: ${bestRegion.name}${
            distanceKm !== undefined ? ` (~${distanceKm} km away)` : ''
          }`
        );
      } else if (matchedZone) {
        const regId = matchedZone.regionId || matchedZone.id;
        const result: DetectedRegionResult = {
          query: addressName,
          formattedAddress: addressName,
          regionId: regId,
          regionName: matchedZone.name,
          cityName: matchedZone.city,
          matchedZoneId: matchedZone.id,
          matchedZoneName: matchedZone.name,
          rawZone: matchedZone,
        };
        setDetectedLocation(result);
        onLocationChange(regId, result);
        toast.success(`📍 Matched Zone: ${matchedZone.name}`);
      } else {
        toast.info(`Location searched: "${addressName}". Displaying global options.`);
      }
    } catch (err) {
      console.warn('Location detection failed:', err);
    } finally {
      setSearching(false);
    }
  };

  // 5. Apply suggestion selection
  const handleSelectSuggestion = (item: any) => {
    setSearchQuery(item.title);
    setShowSuggestions(false);

    const result: DetectedRegionResult = {
      query: item.title,
      regionId: item.regionId,
      regionName: item.regionName,
      cityName: item.city,
      matchedZoneId: item.zoneId,
      matchedZoneName: item.zoneName,
      rawRegion: item.type === 'region' ? item.raw : undefined,
      rawZone: item.type === 'zone' ? item.raw : undefined,
    };

    setDetectedLocation(result);
    onLocationChange(item.regionId, result);
    toast.success(
      `📍 Selected: ${item.title} → Region: ${item.regionName}`
    );
  };

  // 6. Submit search handler
  const handleSearchSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setShowSuggestions(false);
    const query = searchQuery.trim();
    if (!query) {
      handleClear();
      return;
    }

    setSearching(true);

    // Try Top Live Suggestion first if matched
    if (liveSuggestions.length > 0) {
      handleSelectSuggestion(liveSuggestions[0]);
      setSearching(false);
      return;
    }

    try {
      // Geocode via backend (Google or OSM Nominatim fallback)
      const geo = await locationApi.geocode(query);
      if (geo && geo.latitude && geo.longitude) {
        await matchCoordsToRegion(geo.latitude, geo.longitude, geo.formattedAddress || query);
        return;
      }
    } catch (err) {
      console.warn('Geocoding notice:', err);
    }

    toast.error(`Could not detect region for "${query}". You can select manually from the dropdown.`);
    setSearching(false);
  };

  // 7. Clear search
  const handleClear = () => {
    setSearchQuery('');
    setDetectedLocation(null);
    setShowSuggestions(false);
    onLocationChange('all', null);
  };

  return (
    <>
      <div
        ref={containerRef}
        className={`bg-gradient-to-b from-orange-50/80 to-amber-50/40 border border-orange-200/80 rounded-2xl p-4 space-y-3 shadow-sm ${className}`}
      >
        <div className="flex items-center justify-between">
          <Label className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
            <Compass className="w-4 h-4 text-[#FF7A00]" /> {label}
          </Label>
          {headerBadge}
        </div>

        {/* Search Box with Custom Dropdown */}
        <div className="relative">
          <form onSubmit={handleSearchSubmit} className="flex gap-2 items-center relative">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                ref={searchInputRef}
                type="text"
                placeholder={placeholder}
                value={searchQuery}
                onFocus={() => {
                  if (liveSuggestions.length > 0) setShowSuggestions(true);
                }}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSuggestions(true);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSearchSubmit();
                  }
                }}
                className="pl-9 pr-8 bg-white border-orange-200 focus:border-[#FF7A00] focus:ring-[#FF7A00] h-10 rounded-xl text-xs font-medium placeholder:text-gray-400 shadow-sm"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <Button
              type="submit"
              disabled={searching || !searchQuery.trim()}
              className="bg-[#FF7A00] hover:bg-orange-600 text-white font-bold h-10 px-4 rounded-xl text-xs flex items-center gap-1.5 shadow-sm shrink-0"
            >
              {searching ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Navigation className="w-3.5 h-3.5" />
              )}
              Detect Region
            </Button>

            {enableMapPicker && (
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowMapModal(true)}
                className="border-orange-300 hover:bg-orange-100/50 text-[#FF7A00] font-bold h-10 px-3 rounded-xl text-xs flex items-center gap-1 shadow-sm shrink-0 bg-white"
                title="Pick on Google Map"
              >
                <Map className="w-3.5 h-3.5" />
                Map
              </Button>
            )}
          </form>

          {/* Live Auto-Suggestions Dropdown */}
          {showSuggestions && liveSuggestions.length > 0 && (
            <div className="absolute left-0 right-0 top-12 z-50 bg-white rounded-2xl border border-orange-200 shadow-xl overflow-hidden animate-in fade-in-50 slide-in-from-top-2 duration-150">
              <div className="p-1.5">
                <div className="px-2.5 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  Matching Places & Regions
                </div>
                {liveSuggestions.map((item, idx) => (
                  <button
                    key={`${item.type}-${item.title}-${idx}`}
                    type="button"
                    onClick={() => handleSelectSuggestion(item)}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-orange-50/80 transition-colors flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-orange-100/70 text-[#FF7A00] flex items-center justify-center flex-shrink-0 group-hover:bg-[#FF7A00] group-hover:text-white transition-colors">
                        {item.type === 'region' ? (
                          <MapPin className="w-3.5 h-3.5" />
                        ) : (
                          <Building className="w-3.5 h-3.5" />
                        )}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-800">{item.title}</p>
                        <p className="text-[10px] text-gray-500">{item.subtitle}</p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-[9px] px-1.5 h-4 bg-orange-100 text-[#FF7A00] border-none font-semibold">
                      → {item.regionName}
                    </Badge>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Detected Region Badge / Banner */}
        {detectedLocation && (
          <div className="bg-white border-2 border-emerald-400/80 rounded-xl p-2.5 flex items-center justify-between shadow-xs animate-in fade-in slide-in-from-top-1 duration-200">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-gray-900">
                    Region: {detectedLocation.regionName}
                  </span>
                  {detectedLocation.distanceKm !== undefined && (
                    <Badge
                      variant="outline"
                      className="text-[9px] h-4 text-emerald-700 bg-emerald-50 border-emerald-200 px-1 font-semibold"
                    >
                      ~{detectedLocation.distanceKm} km away
                    </Badge>
                  )}
                </div>
                <p className="text-[10px] text-gray-500 line-clamp-1">
                  Matched for: <em>"{detectedLocation.query}"</em>
                  {detectedLocation.matchedZoneName && ` · Zone: ${detectedLocation.matchedZoneName}`}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="text-[10px] h-6 px-2 text-gray-500 hover:text-red-500 rounded-lg"
            >
              Reset Filter
            </Button>
          </div>
        )}

        {/* Manual Dropdown Selector */}
        {showDropdown && (
          <div className="pt-1">
            <Select
              value={selectedLocationId}
              onValueChange={(val) => {
                if (val === 'all') {
                  handleClear();
                } else {
                  const reg = regions.find((r) => r.id === val);
                  const zn = zones.find((z) => z.id === val);
                  if (reg) {
                    const result: DetectedRegionResult = {
                      query: reg.name,
                      regionId: reg.id,
                      regionName: reg.name,
                      cityName: reg.city,
                      rawRegion: reg,
                    };
                    setDetectedLocation(result);
                    onLocationChange(reg.id, result);
                  } else if (zn) {
                    const regId = zn.regionId || zn.id;
                    const result: DetectedRegionResult = {
                      query: zn.name,
                      regionId: regId,
                      regionName: zn.name,
                      cityName: zn.city,
                      matchedZoneId: zn.id,
                      matchedZoneName: zn.name,
                      rawZone: zn,
                    };
                    setDetectedLocation(result);
                    onLocationChange(regId, result);
                  } else {
                    onLocationChange(val);
                  }
                }
              }}
            >
              <SelectTrigger className="bg-white/90 border-orange-200 focus:ring-[#FF7A00] h-9 rounded-xl text-xs font-medium">
                <SelectValue placeholder="Or select location manually" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="font-semibold">
                  🌍 All Locations (Global + All Regional Add-ons)
                </SelectItem>
                {regions.length > 0 && (
                  <>
                    <div className="px-2 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                      Regions ({regions.length})
                    </div>
                    {regions.map((r) => (
                      <SelectItem key={r.id} value={r.id}>
                        📍 Region: {r.name} {r.city ? `(${r.city})` : ''}
                      </SelectItem>
                    ))}
                  </>
                )}
                {zones.length > 0 && (
                  <>
                    <div className="px-2 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-1">
                      Zones ({zones.length})
                    </div>
                    {zones.map((z) => (
                      <SelectItem key={z.id} value={z.id}>
                        🏢 Zone: {z.name} {z.city ? `(${z.city})` : ''}
                      </SelectItem>
                    ))}
                  </>
                )}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Interactive Map Picker Modal */}
      {showMapModal && (
        <LocationPickerModal
          isOpen={showMapModal}
          onClose={() => setShowMapModal(false)}
          initialLat={detectedLocation?.latitude || 28.6139}
          initialLng={detectedLocation?.longitude || 77.2090}
          initialAddress={searchQuery || detectedLocation?.formattedAddress}
          onSelectLocation={async (lat, lng, addressDetails) => {
            const addr =
              addressDetails?.fullAddress ||
              `${addressDetails?.city || ''} ${addressDetails?.state || ''}`.trim() ||
              `Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`;
            setSearchQuery(addr);
            await matchCoordsToRegion(lat, lng, addr);
          }}
        />
      )}
    </>
  );
};
