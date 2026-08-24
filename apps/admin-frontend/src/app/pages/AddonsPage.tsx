/**
 * Add-ons Management Page
 * Configure which benefits can be sold as Add-ons and set their pricing and region targeting.
 */

import React, { useEffect, useState } from 'react';
import { PageHeader } from '../components/common/PageHeader';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent } from '../components/ui/card';
import { benefitApi, benefitTypeApi, regionApi } from '../../services/api';
import { Loader2, DollarSign, Check, ToggleLeft, ToggleRight, Save, Info, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { RegionSelector } from '../components/common/RegionSelector';
import type { Benefit } from '../../types';

interface BenefitType { id: string; name: string; iconCode?: string; }

export default function AddonsPage() {
  const [benefits, setBenefits] = useState<Benefit[]>([]);
  const [benefitTypes, setBenefitTypes] = useState<BenefitType[]>([]);
  const [regions, setRegions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterTypeId, setFilterTypeId] = useState('all');

  // Track edits locally before saving
  const [edits, setEdits] = useState<Record<string, Partial<Benefit>>>({});
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const [b, t, r] = await Promise.all([
        benefitApi.getAll(),
        benefitTypeApi.getAll(),
        regionApi.getAll()
      ]);
      setBenefits(b);
      setBenefitTypes(t);
      setRegions(r || []);
      setEdits({});
    } catch {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleEditChange = (id: string, field: keyof Benefit, value: any) => {
    setEdits(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value
      }
    }));
  };

  const toggleAddon = (b: Benefit, currentIsAddon: boolean) => {
    const nextIsAddon = !currentIsAddon;
    const updates: Partial<Benefit> = { isAddon: nextIsAddon };
    
    if (nextIsAddon) {
      // Auto-activate the benefit so it is visible in the app
      if (!b.isActive && edits[b.id]?.isActive !== true) {
        updates.isActive = true;
      }

      const baseUnits = b.defaultUnits || 1;
      const baseUnitPrice = b.unitCost || 0;
      
      const units = edits[b.id]?.addonIncludedUnits !== undefined 
        ? edits[b.id]?.addonIncludedUnits 
        : (b.addonIncludedUnits ?? baseUnits);
      
      updates.addonIncludedUnits = units;

      if (edits[b.id]?.addonPrice === undefined && (b.addonPrice === undefined || b.addonPrice === null)) {
        updates.addonPrice = baseUnitPrice * (units || 1);
      }
    }

    setEdits(prev => ({
      ...prev,
      [b.id]: {
        ...prev[b.id],
        ...updates
      }
    }));
  };

  const saveAddon = async (b: Benefit) => {
    const currentEdits = edits[b.id];
    if (!currentEdits) return; // Nothing to save

    const baseUnitPrice = b.unitCost || 0;
    const isAddon = currentEdits.isAddon !== undefined ? currentEdits.isAddon : (b.isAddon ?? false);
    const units = currentEdits.addonIncludedUnits !== undefined ? currentEdits.addonIncludedUnits : (b.addonIncludedUnits ?? b.defaultUnits ?? 1);
    const price = currentEdits.addonPrice !== undefined ? currentEdits.addonPrice : (b.addonPrice ?? (baseUnitPrice * units));
    const minAllowedPrice = units * baseUnitPrice;

    if (isAddon && baseUnitPrice > 0 && price < minAllowedPrice) {
      toast.error(`Price (₹${price}) cannot be lower than base unit price calculation (${units} units × ₹${baseUnitPrice} = ₹${minAllowedPrice})`);
      return;
    }

    setSavingId(b.id);
    try {
      await benefitApi.update(b.id, currentEdits);
      toast.success(`${b.name} add-on settings saved`);
      // Update local state to reflect saved changes
      setBenefits(prev => prev.map(item => item.id === b.id ? { ...item, ...currentEdits } : item));
      // Remove from edits
      const newEdits = { ...edits };
      delete newEdits[b.id];
      setEdits(newEdits);
    } catch (err: any) {
      toast.error(err.message || 'Failed to save');
    } finally {
      setSavingId(null);
    }
  };

  const filtered = filterTypeId === 'all' ? benefits : benefits.filter(b => b.benefitTypeId === filterTypeId);
  const grouped = filtered.reduce<Record<string, Benefit[]>>((acc, b) => {
    const key = b.benefitType?.name ?? 'Other';
    acc[key] = [...(acc[key] ?? []), b];
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="pb-20">
      <PageHeader
        title="Add-ons Management"
        description="Select benefits to offer as add-ons and configure their pricing and region targeting"
      />

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-3 mb-8 border-b pb-4">
        <button
          onClick={() => setFilterTypeId('all')}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
            filterTypeId === 'all' ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          All
        </button>
        {benefitTypes.map(t => (
          <button
            key={t.id}
            onClick={() => setFilterTypeId(t.id)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              filterTypeId === t.id ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {t.iconCode} {t.name}
          </button>
        ))}
      </div>

      <div className="space-y-8">
        {Object.entries(grouped).map(([typeName, groupBenefits]) => (
          <div key={typeName} className="space-y-3">
            <h2 className="font-semibold text-xs tracking-wider text-slate-500 uppercase">{typeName}</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {groupBenefits.map(b => {
                const currentEdits = edits[b.id] || {};
                const isAddon = currentEdits.isAddon !== undefined ? currentEdits.isAddon : (b.isAddon ?? false);
                
                const baseDefaultUnits = b.defaultUnits || 1;
                const baseUnitPrice = b.unitCost || 0;

                const addonIncludedUnits = currentEdits.addonIncludedUnits !== undefined 
                  ? currentEdits.addonIncludedUnits 
                  : (b.addonIncludedUnits ?? baseDefaultUnits);
                
                const defaultPrice = (b.addonPrice !== null && b.addonPrice !== undefined) 
                  ? b.addonPrice 
                  : (baseUnitPrice * addonIncludedUnits);
                
                const addonPrice = currentEdits.addonPrice !== undefined 
                  ? currentEdits.addonPrice 
                  : defaultPrice;

                const addonDiscountPrice = currentEdits.addonDiscountPrice !== undefined 
                  ? currentEdits.addonDiscountPrice 
                  : (b.addonDiscountPrice ?? 0);

                const isGlobal = currentEdits.isGlobal !== undefined ? currentEdits.isGlobal : (b.isGlobal ?? true);
                const selectedRegionIds = currentEdits.regionIds !== undefined ? (currentEdits.regionIds as string[]) : (b.regionIds || []);

                const minAllowedPrice = (addonIncludedUnits || 1) * baseUnitPrice;
                const isPriceTooLow = isAddon && baseUnitPrice > 0 && (addonPrice < minAllowedPrice);

                const hasChanges = Object.keys(currentEdits).length > 0;

                return (
                  <Card key={b.id} className={`border-l-4 transition-all ${isAddon ? 'border-l-primary shadow-sm' : 'border-l-slate-200'}`}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-500">{b.code}</span>
                            <h3 className="font-semibold text-[15px]">{b.name}</h3>
                          </div>
                          {b.description && (
                            <p className="text-xs text-slate-500 line-clamp-1">{b.description}</p>
                          )}
                          
                          {/* Base Benefit Config Banner */}
                          <div className="mt-1.5">
                            <span className="text-[11px] font-medium bg-amber-50 text-amber-900 border border-amber-200/80 px-2 py-0.5 rounded-full inline-flex items-center gap-1 shadow-2xs">
                              <Info className="w-3 h-3 text-amber-600" />
                              Base: {baseDefaultUnits} {b.unitLabel || 'unit'} @ ₹{baseUnitPrice}/unit
                            </span>
                          </div>
                        </div>
                        
                        <button
                          type="button"
                          onClick={() => toggleAddon(b, isAddon)}
                          className="flex items-center gap-1.5 text-sm ml-2"
                        >
                          {isAddon ? <ToggleRight className="w-7 h-7 text-green-500" /> : <ToggleLeft className="w-7 h-7 text-slate-300" />}
                        </button>
                      </div>

                      {isAddon && (
                        <div className="space-y-4 mt-4 pt-4 border-t border-slate-100">
                          <div className="grid grid-cols-3 gap-3">
                            <div>
                              <Label className="text-[11px] text-slate-500 mb-1 block">Included Units</Label>
                              <Input
                                type="number"
                                min={1}
                                className="h-8 text-sm"
                                value={addonIncludedUnits || ''}
                                onChange={(e) => handleEditChange(b.id, 'addonIncludedUnits', Number(e.target.value) || 1)}
                                placeholder="1"
                              />
                            </div>
                            <div>
                              <Label className="text-[11px] text-slate-500 mb-1 block">Price (₹)</Label>
                              <Input
                                type="number"
                                className={`h-8 text-sm transition-colors ${
                                  isPriceTooLow 
                                    ? 'border-red-500 bg-red-50 text-red-900 focus-visible:ring-red-500' 
                                    : ''
                                }`}
                                value={addonPrice !== undefined && addonPrice !== null ? addonPrice : ''}
                                onChange={(e) => handleEditChange(b.id, 'addonPrice', Number(e.target.value) || 0)}
                                placeholder="0"
                              />
                              {isPriceTooLow ? (
                                <p className="text-[10px] text-red-600 font-semibold mt-1 flex items-center gap-0.5">
                                  <AlertTriangle className="w-3 h-3 shrink-0" />
                                  Min ₹{minAllowedPrice} ({addonIncludedUnits}×₹{baseUnitPrice})
                                </p>
                              ) : (
                                <p className="text-[10px] text-slate-400 mt-1">
                                  Min: ₹{minAllowedPrice}
                                </p>
                              )}
                            </div>
                            <div>
                              <Label className="text-[11px] text-slate-500 mb-1 block">Discount (₹)</Label>
                              <Input
                                type="number"
                                className="h-8 text-sm"
                                value={addonDiscountPrice || ''}
                                onChange={(e) => handleEditChange(b.id, 'addonDiscountPrice', Number(e.target.value) || 0)}
                                placeholder="0"
                              />
                            </div>
                          </div>

                          {/* Region Targeting for Add-on */}
                          <div className="pt-3 border-t border-slate-100">
                            <RegionSelector
                              compact
                              isGlobal={isGlobal}
                              setIsGlobal={(val) => handleEditChange(b.id, 'isGlobal', val)}
                              selectedRegionIds={selectedRegionIds}
                              setSelectedRegionIds={(ids) => handleEditChange(b.id, 'regionIds', ids)}
                              regions={regions}
                              globalLabel="Global Add-on"
                              globalDescription="Available to all users across all regions"
                              title="Add-on Region Targeting"
                              description="Limit this add-on to specific regions"
                            />
                          </div>
                        </div>
                      )}

                      {hasChanges && (
                        <div className="mt-4 pt-3 flex justify-end border-t border-slate-100">
                          <Button 
                            size="sm" 
                            className="bg-primary hover:bg-primary/90 h-8 text-xs disabled:opacity-50" 
                            onClick={() => saveAddon(b)}
                            disabled={savingId === b.id || isPriceTooLow}
                          >
                            {savingId === b.id ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" /> : <Save className="w-3.5 h-3.5 mr-1.5" />}
                            Save Changes
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="py-12 text-center text-slate-500">No benefits found</div>
        )}
      </div>
    </div>
  );
}
