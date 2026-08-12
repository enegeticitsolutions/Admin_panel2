import React, { useState, useMemo, useEffect } from 'react';
import { Label } from '../ui/label';
import { Checkbox } from '../ui/checkbox';
import { MapPin, Search, X } from 'lucide-react';

export interface RegionOption {
  id: string;
  name: string;
  city?: string;
  state?: string;
}

export interface RegionSelectorProps {
  isGlobal: boolean;
  setIsGlobal: (isGlobal: boolean) => void;
  selectedRegionIds: string[];
  setSelectedRegionIds: (ids: string[]) => void;
  regions: RegionOption[];
  compact?: boolean;
  title?: string;
  description?: string;
  globalLabel?: string;
  globalDescription?: string;
  disabled?: boolean;
}

export const RegionSelector: React.FC<RegionSelectorProps> = ({
  isGlobal,
  setIsGlobal,
  selectedRegionIds,
  setSelectedRegionIds,
  regions = [],
  compact = false,
  title = "Target Regions",
  description = "Select specific regions this is limited to (applicable only if non-global).",
  globalLabel = "Make Global",
  globalDescription = "When checked, available to all users across all regions.",
  disabled = false,
}) => {
  const [search, setSearch] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  // Filtered regions for dropdown search
  const filteredRegions = useMemo(() => {
    if (!search) return regions;
    const q = search.toLowerCase();
    return regions.filter(
      r =>
        r.name?.toLowerCase().includes(q) ||
        r.city?.toLowerCase().includes(q) ||
        r.state?.toLowerCase().includes(q)
    );
  }, [regions, search]);

  // Rule 1: If isGlobal is checked, clear selected region IDs
  const handleGlobalChange = (checked: boolean) => {
    setIsGlobal(checked);
    if (checked) {
      setSelectedRegionIds([]);
    }
  };

  // Rule 2: When a region is selected or toggled, uncheck isGlobal
  const toggleRegion = (id: string) => {
    if (disabled) return;
    const isSelected = selectedRegionIds.includes(id);
    let next: string[];
    if (isSelected) {
      next = selectedRegionIds.filter(x => x !== id);
    } else {
      next = [...selectedRegionIds, id];
    }

    setSelectedRegionIds(next);
    if (next.length > 0) {
      setIsGlobal(false);
    }
  };

  const removeRegion = (id: string) => {
    if (disabled) return;
    const next = selectedRegionIds.filter(x => x !== id);
    setSelectedRegionIds(next);
  };

  return (
    <div className={`space-y-3 ${compact ? 'text-xs' : ''}`}>
      {/* Global Checkbox Card */}
      <div className={`flex items-start space-x-3 p-3 bg-orange-50/60 border border-orange-200 rounded-lg ${compact ? 'p-2.5' : 'p-3.5'}`}>
        <Checkbox
          id={`global-toggle-${title.replace(/\s+/g, '-').toLowerCase()}`}
          checked={isGlobal}
          disabled={disabled}
          onCheckedChange={(val) => handleGlobalChange(!!val)}
          className="mt-0.5"
        />
        <div className="space-y-0.5 leading-none">
          <Label
            htmlFor={`global-toggle-${title.replace(/\s+/g, '-').toLowerCase()}`}
            className={`font-semibold text-orange-950 cursor-pointer ${compact ? 'text-xs' : 'text-sm'}`}
          >
            {globalLabel}
          </Label>
          {globalDescription && (
            <p className={`text-orange-700 ${compact ? 'text-[11px]' : 'text-xs'}`}>
              {globalDescription}
            </p>
          )}
        </div>
      </div>

      {/* Region Targeting Multi-Select Search */}
      <div className={`flex flex-col gap-2 p-3.5 bg-orange-50/40 border border-orange-200/80 rounded-lg ${disabled || isGlobal ? 'opacity-70' : ''}`}>
        <div className="space-y-0.5">
          <Label className={`font-semibold text-orange-950 ${compact ? 'text-xs' : 'text-sm'}`}>
            {title}
          </Label>
          {description && (
            <p className={`text-orange-700 ${compact ? 'text-[11px]' : 'text-xs'}`}>
              {description}
            </p>
          )}
        </div>

        <div className="relative mt-1">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 pointer-events-none" />
            <input
              type="text"
              placeholder={isGlobal ? "Disabled while Global is enabled" : "Search & select regions..."}
              value={search}
              disabled={disabled || isGlobal}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setTimeout(() => setIsFocused(false), 200)}
              onChange={(e) => setSearch(e.target.value)}
              className={`w-full pl-9 pr-4 ${compact ? 'py-1.5 text-xs' : 'py-2 text-sm'} rounded-xl bg-white border border-[#E7DED6] focus:outline-none focus:border-[#FF7A00] font-medium shadow-sm disabled:bg-slate-100 disabled:cursor-not-allowed`}
            />
          </div>

          {!isGlobal && !disabled && isFocused && (
            <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-[#E7DED6] rounded-xl shadow-xl max-h-[180px] overflow-y-auto">
              {filteredRegions.map(r => {
                const isSelected = selectedRegionIds.includes(r.id);
                return (
                  <button
                    key={r.id}
                    type="button"
                    onMouseDown={() => toggleRegion(r.id)}
                    className={`w-full text-left px-3.5 py-2.5 hover:bg-orange-50 transition border-b border-slate-100 last:border-0 ${compact ? 'text-xs' : 'text-sm'} font-medium flex justify-between items-center ${
                      isSelected ? 'bg-orange-50 text-[#FF7A00]' : 'text-slate-700'
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-orange-400" />
                      {r.name} {r.city ? `(${r.city})` : ''}
                    </span>
                    {isSelected && <span className="w-2 h-2 rounded-full bg-[#FF7A00]" />}
                  </button>
                );
              })}
              {filteredRegions.length === 0 && (
                <div className="p-3 text-xs text-slate-400 text-center italic">
                  {regions.length === 0 ? 'No regions available' : 'No matching regions found'}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Selected Regions chips */}
        <div className="flex flex-wrap gap-1.5 mt-1.5">
          {selectedRegionIds.map(id => {
            const rObj = regions.find(r => r.id === id);
            if (!rObj) return null;
            return (
              <span
                key={id}
                className="bg-white text-orange-800 border border-orange-200 px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 shadow-sm"
              >
                <MapPin className="w-3 h-3 text-orange-500" />
                {rObj.name}
                {!disabled && (
                  <button
                    type="button"
                    onClick={() => removeRegion(id)}
                    className="text-orange-400 hover:text-orange-600 font-bold ml-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </span>
            );
          })}
          {selectedRegionIds.length === 0 && (
            <p className={`text-orange-600/80 italic ${compact ? 'text-[11px]' : 'text-xs'}`}>
              {isGlobal ? "Available to all regions (Global)" : "No regions selected. Specify regions or check Make Global."}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
