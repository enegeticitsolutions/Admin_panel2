/**
 * Add-ons Management Page
 * Configure which benefits can be sold as Add-ons and set their pricing.
 */

import React, { useEffect, useState } from 'react';
import { PageHeader } from '../components/common/PageHeader';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent } from '../components/ui/card';
import { benefitApi, benefitTypeApi } from '../../services/api';
import { Loader2, DollarSign, Check, ToggleLeft, ToggleRight, Save } from 'lucide-react';
import { toast } from 'sonner';

interface BenefitType { id: string; name: string; iconCode?: string; }
interface Benefit {
  id: string;
  code?: string;
  name: string;
  description?: string;
  isActive: boolean;
  benefitTypeId: string;
  benefitType: BenefitType;
  isAddon: boolean;
  cost?: number;
  addonPrice?: number;
  addonDiscountPrice?: number;
  addonIncludedUnits?: number;
}

export default function AddonsPage() {
  const [benefits, setBenefits] = useState<Benefit[]>([]);
  const [benefitTypes, setBenefitTypes] = useState<BenefitType[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterTypeId, setFilterTypeId] = useState('all');

  // Track edits locally before saving
  const [edits, setEdits] = useState<Record<string, Partial<Benefit>>>({});
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const [b, t] = await Promise.all([benefitApi.getAll(), benefitTypeApi.getAll()]);
      setBenefits(b);
      setBenefitTypes(t);
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

  const saveAddon = async (b: Benefit) => {
    const currentEdits = edits[b.id];
    if (!currentEdits) return; // Nothing to save

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
        description="Select benefits to offer as add-ons and configure their pricing"
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
                const isAddon = currentEdits.isAddon !== undefined ? currentEdits.isAddon : b.isAddon;
                const addonPrice = currentEdits.addonPrice !== undefined ? currentEdits.addonPrice : b.addonPrice;
                const addonDiscountPrice = currentEdits.addonDiscountPrice !== undefined ? currentEdits.addonDiscountPrice : b.addonDiscountPrice;
                const addonIncludedUnits = currentEdits.addonIncludedUnits !== undefined ? currentEdits.addonIncludedUnits : b.addonIncludedUnits;
                const hasChanges = Object.keys(currentEdits).length > 0;

                return (
                  <Card key={b.id} className={`border-l-4 transition-all ${isAddon ? 'border-l-primary shadow-sm' : 'border-l-slate-200'}`}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-500">{b.code}</span>
                            <h3 className="font-semibold text-[15px]">{b.name}</h3>
                          </div>
                          {b.description && (
                            <p className="text-xs text-slate-500 mt-1 line-clamp-1">{b.description}</p>
                          )}
                        </div>
                        <button
                          onClick={() => handleEditChange(b.id, 'isAddon', !isAddon)}
                          className="flex items-center gap-1.5 text-sm"
                        >
                          {isAddon ? <ToggleRight className="w-7 h-7 text-green-500" /> : <ToggleLeft className="w-7 h-7 text-slate-300" />}
                        </button>
                      </div>

                      {isAddon && (
                        <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-slate-100">
                          <div>
                            <Label className="text-[11px] text-slate-500 mb-1 block">Included Units</Label>
                            <Input
                              type="number"
                              className="h-8 text-sm"
                              value={addonIncludedUnits || ''}
                              onChange={(e) => handleEditChange(b.id, 'addonIncludedUnits', Number(e.target.value) || undefined)}
                              placeholder="1"
                            />
                          </div>
                          <div>
                            <Label className="text-[11px] text-slate-500 mb-1 block">Price (₹)</Label>
                            <Input
                              type="number"
                              className="h-8 text-sm"
                              value={addonPrice || ''}
                              onChange={(e) => handleEditChange(b.id, 'addonPrice', Number(e.target.value) || undefined)}
                              placeholder="0"
                            />
                          </div>
                          <div>
                            <Label className="text-[11px] text-slate-500 mb-1 block">Discount (₹)</Label>
                            <Input
                              type="number"
                              className="h-8 text-sm"
                              value={addonDiscountPrice || ''}
                              onChange={(e) => handleEditChange(b.id, 'addonDiscountPrice', Number(e.target.value) || undefined)}
                              placeholder="0"
                            />
                          </div>
                        </div>
                      )}

                      {hasChanges && (
                        <div className="mt-4 pt-3 flex justify-end">
                          <Button 
                            size="sm" 
                            className="bg-primary hover:bg-primary/90 h-8 text-xs" 
                            onClick={() => saveAddon(b)}
                            disabled={savingId === b.id}
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
