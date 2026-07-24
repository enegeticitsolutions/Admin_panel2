/**
 * Requested Visits Page - Central Operations Hub for Service Requests
 * Features multi-select filtering by Beneficiary, Care Companion, Team, Zone, Read Status, and Historical Date Range.
 */

import React, { useEffect, useState, useMemo } from 'react';
import { PageHeader } from '../components/common/PageHeader';
import {
  Clock,
  UserCheck,
  Users,
  MapPin,
  Filter,
  Search,
  CheckCircle2,
  Calendar,
  User,
  ShieldAlert,
  ChevronDown,
  X,
  Sparkles,
} from 'lucide-react';
import {
  visitRequestApi,
  beneficiaryApi,
  careCompanionApi,
  teamApi,
  scheduleApi,
} from '../../services/api';
import { Button } from '../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/dialog';

interface ServiceRequestItem {
  id: string;
  beneficiaryId: string;
  subscriberId?: string;
  benefitId?: string;
  preferredDate?: string;
  preferredTiming?: string;
  additionalNote?: string;
  isRead: boolean;
  requestedByUserId?: string;
  requestedByRole?: string;
  createdAt: string;
  beneficiary?: {
    id: string;
    name: string;
    age?: number;
    address?: string;
    city?: string;
    pincode?: string;
    teamId?: string;
    primaryCcId?: string;
    secondaryCcId?: string;
    team?: { id: string; name: string };
    primaryCC?: { id: string; name: string; phone?: string };
    secondaryCC?: { id: string; name: string; phone?: string };
    subscriptions?: Array<{
      id: string;
      package?: { name: string };
      benefitBalances?: Array<{
        id: string;
        benefitId: string;
        totalUnits: number;
        usedUnits: number;
        availableUnits?: number;
        benefit?: { id: string; name: string; unitLabel?: string };
      }>;
    }>;
  };
  subscriber?: { id: string; name: string; phone?: string };
  requestedByUser?: { id: string; name: string; phone?: string };
  benefit?: {
    id: string;
    name: string;
    unitLabel?: string;
    benefitType?: { id: string; name: string };
  };
}

interface StatCardProps {
  label: string;
  value: number;
  icon: React.ElementType;
  color: string;
  bgColor: string;
}

function StatCard({ label, value, icon: Icon, color, bgColor }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-4">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${bgColor}`}>
        <Icon size={20} className={color} />
      </div>
      <div>
        <p className="text-2xl font-bold text-slate-800">{value}</p>
        <p className="text-xs font-medium text-slate-500">{label}</p>
      </div>
    </div>
  );
}

export default function RequestedVisitsPage() {
  const [requests, setRequests] = useState<ServiceRequestItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter Option Lists
  const [beneficiaries, setBeneficiaries] = useState<any[]>([]);
  const [careCompanions, setCareCompanions] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);

  // Selected Filter States (Multi-select)
  const [selectedBeneficiaryIds, setSelectedBeneficiaryIds] = useState<string[]>([]);
  const [selectedCcIds, setSelectedCcIds] = useState<string[]>([]);
  const [selectedTeamIds, setSelectedTeamIds] = useState<string[]>([]);
  const [readFilter, setReadFilter] = useState<'ALL' | 'UNREAD' | 'READ'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Historical Date Filter States
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [datePreset, setDatePreset] = useState<'ALL_TIME' | 'PAST_7_DAYS' | 'PAST_30_DAYS' | 'THIS_MONTH' | 'CUSTOM'>('ALL_TIME');

  // Dropdown Open States
  const [openBenDropdown, setOpenBenDropdown] = useState(false);
  const [openCcDropdown, setOpenCcDropdown] = useState(false);
  const [openTeamDropdown, setOpenTeamDropdown] = useState(false);

  // Quick Schedule Modal State
  const [scheduleModalReq, setScheduleModalReq] = useState<ServiceRequestItem | null>(null);
  const [scheduleCcId, setScheduleCcId] = useState('');
  const [scheduleDate, setScheduleDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [scheduleTime, setScheduleTime] = useState('10:00');
  const [scheduleDuration, setScheduleDuration] = useState('60');
  const [submittingSchedule, setSubmittingSchedule] = useState(false);

  useEffect(() => {
    loadFilterOptions();
    loadRequests();
  }, []);

  const loadFilterOptions = async () => {
    try {
      const [bensData, ccsData, teamsData] = await Promise.all([
        beneficiaryApi.getAll(),
        careCompanionApi.getAll(),
        teamApi.getAll(),
      ]);
      setBeneficiaries(bensData || []);
      setCareCompanions(ccsData || []);
      setTeams(teamsData || []);
    } catch (err) {
      console.error('Failed to load filter options:', err);
    }
  };

  const loadRequests = async () => {
    setLoading(true);
    try {
      const data = await visitRequestApi.getAll({
        beneficiaryIds: selectedBeneficiaryIds,
        careCompanionIds: selectedCcIds,
        teamIds: selectedTeamIds,
        isRead: readFilter === 'ALL' ? undefined : readFilter === 'READ',
        search: searchQuery,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      });
      setRequests(data || []);
    } catch (err) {
      console.error('Failed to load requested visits:', err);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  // Re-fetch when major filters change
  useEffect(() => {
    loadRequests();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBeneficiaryIds, selectedCcIds, selectedTeamIds, readFilter, startDate, endDate]);

  const handleDatePresetChange = (preset: 'ALL_TIME' | 'PAST_7_DAYS' | 'PAST_30_DAYS' | 'THIS_MONTH' | 'CUSTOM') => {
    setDatePreset(preset);
    const now = new Date();
    if (preset === 'ALL_TIME') {
      setStartDate('');
      setEndDate('');
    } else if (preset === 'PAST_7_DAYS') {
      const past = new Date();
      past.setDate(now.getDate() - 7);
      setStartDate(past.toISOString().split('T')[0]);
      setEndDate(now.toISOString().split('T')[0]);
    } else if (preset === 'PAST_30_DAYS') {
      const past = new Date();
      past.setDate(now.getDate() - 30);
      setStartDate(past.toISOString().split('T')[0]);
      setEndDate(now.toISOString().split('T')[0]);
    } else if (preset === 'THIS_MONTH') {
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      setStartDate(firstDay.toISOString().split('T')[0]);
      setEndDate(now.toISOString().split('T')[0]);
    }
  };

  const handleMarkAsRead = async (requestId: string) => {
    try {
      await visitRequestApi.markAsRead(requestId);
      setRequests((prev) =>
        prev.map((r) => (r.id === requestId ? { ...r, isRead: true } : r))
      );
    } catch (err) {
      console.error('Failed to mark request as read:', err);
    }
  };

  const openQuickSchedule = (reqItem: ServiceRequestItem) => {
    setScheduleModalReq(reqItem);
    if (reqItem.beneficiary?.primaryCcId) {
      setScheduleCcId(reqItem.beneficiary.primaryCcId);
    } else if (careCompanions.length > 0) {
      setScheduleCcId(careCompanions[0].id);
    }
    if (reqItem.preferredDate) {
      try {
        setScheduleDate(new Date(reqItem.preferredDate).toISOString().split('T')[0]);
      } catch {
        setScheduleDate(new Date().toISOString().split('T')[0]);
      }
    }
  };

  const handleConfirmSchedule = async () => {
    if (!scheduleModalReq || !scheduleCcId || !scheduleDate || !scheduleTime) {
      alert('Please select Care Companion, Date and Time.');
      return;
    }

    setSubmittingSchedule(true);
    try {
      const scheduledDateTime = new Date(`${scheduleDate}T${scheduleTime}:00`).toISOString();
      await scheduleApi.createVisit({
        beneficiaryId: scheduleModalReq.beneficiaryId,
        careCompanionId: scheduleCcId,
        scheduledTime: scheduledDateTime,
        durationMinutes: parseInt(scheduleDuration, 10),
        benefitId: scheduleModalReq.benefitId || scheduleModalReq.benefit?.id,
      });

      await visitRequestApi.markAsRead(scheduleModalReq.id);
      setRequests((prev) =>
        prev.map((r) => (r.id === scheduleModalReq!.id ? { ...r, isRead: true } : r))
      );

      alert('Visit scheduled successfully! Unit reserved in ledger.');
      setScheduleModalReq(null);
    } catch (err: any) {
      alert(`Scheduling error: ${err.message || 'Failed to schedule visit'}`);
    } finally {
      setSubmittingSchedule(false);
    }
  };

  const toggleSelection = (
    id: string,
    selectedList: string[],
    setSelectedList: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    if (selectedList.includes(id)) {
      setSelectedList(selectedList.filter((x) => x !== id));
    } else {
      setSelectedList([...selectedList, id]);
    }
  };

  const resetAllFilters = () => {
    setSelectedBeneficiaryIds([]);
    setSelectedCcIds([]);
    setSelectedTeamIds([]);
    setReadFilter('ALL');
    setSearchQuery('');
    setStartDate('');
    setEndDate('');
    setDatePreset('ALL_TIME');
  };

  const filteredRequests = useMemo(() => {
    if (!searchQuery.trim()) return requests;
    const q = searchQuery.toLowerCase().trim();
    return requests.filter((r) => {
      const bName = r.beneficiary?.name?.toLowerCase() || '';
      const sName = r.subscriber?.name?.toLowerCase() || '';
      const benefitName = r.benefit?.name?.toLowerCase() || '';
      const pincode = r.beneficiary?.pincode || '';
      return bName.includes(q) || sName.includes(q) || benefitName.includes(q) || pincode.includes(q);
    });
  }, [requests, searchQuery]);

  const hasActiveFilters =
    selectedBeneficiaryIds.length > 0 ||
    selectedCcIds.length > 0 ||
    selectedTeamIds.length > 0 ||
    readFilter !== 'ALL' ||
    datePreset !== 'ALL_TIME' ||
    !!startDate ||
    !!endDate ||
    !!searchQuery;

  return (
    <div className="p-6 space-y-6 bg-slate-50/50 min-h-screen">
      <PageHeader
        title="Requested Visits & Service Claims"
        description="Central Control Tower for all incoming visit requests from Beneficiaries, Subscribers, and Care Companions"
      />

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Requests"
          value={requests.length}
          icon={Clock}
          color="text-primary"
          bgColor="bg-primary/10"
        />
        <StatCard
          label="Action Needed (Unread)"
          value={requests.filter((r) => !r.isRead).length}
          icon={ShieldAlert}
          color="text-red-600"
          bgColor="bg-red-100"
        />
        <StatCard
          label="Beneficiaries Requesting"
          value={new Set(requests.map((r) => r.beneficiaryId)).size}
          icon={Users}
          color="text-blue-600"
          bgColor="bg-blue-100"
        />
        <StatCard
          label="Active Teams Represented"
          value={new Set(requests.map((r) => r.beneficiary?.team?.name).filter(Boolean)).size}
          icon={MapPin}
          color="text-emerald-600"
          bgColor="bg-emerald-100"
        />
      </div>

      {/* Multi-Select & Date Filter Control Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 space-y-4">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-slate-800 font-semibold text-sm">
            <Filter size={18} className="text-primary" />
            <span>Multi-Select & Date Range Filters</span>
            {hasActiveFilters && (
              <span className="bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full font-medium">
                Active
              </span>
            )}
          </div>

          {/* Global Search Bar */}
          <div className="relative w-full lg:w-80">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search beneficiary, benefit, pincode..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Filter Dropdowns Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 pt-2 border-t border-slate-100">

          {/* 1. Beneficiary Multi-Select */}
          <div className="relative">
            <button
              type="button"
              onClick={() => { setOpenBenDropdown(!openBenDropdown); setOpenCcDropdown(false); setOpenTeamDropdown(false); }}
              className="w-full flex items-center justify-between bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 transition-colors"
            >
              <span className="truncate">
                {selectedBeneficiaryIds.length === 0 ? '👤 All Beneficiaries' : `👤 Beneficiaries (${selectedBeneficiaryIds.length})`}
              </span>
              <ChevronDown size={14} className="text-slate-400 ml-1 shrink-0" />
            </button>
            {openBenDropdown && (
              <div className="absolute z-30 mt-1 w-64 bg-white border border-slate-200 rounded-xl shadow-lg p-2 max-h-60 overflow-y-auto">
                <div className="flex justify-between items-center pb-2 mb-2 border-b border-slate-100 text-xs text-slate-500 font-medium">
                  <span>Select Beneficiary</span>
                  {selectedBeneficiaryIds.length > 0 && (
                    <button onClick={() => setSelectedBeneficiaryIds([])} className="text-primary hover:underline text-[11px]">Clear</button>
                  )}
                </div>
                {beneficiaries.length === 0 && <p className="text-xs text-slate-400 px-2 py-1">Loading...</p>}
                {beneficiaries.map((b) => (
                  <label key={b.id} className="flex items-center gap-2 px-2 py-1.5 hover:bg-slate-50 rounded text-xs text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedBeneficiaryIds.includes(b.id)}
                      onChange={() => toggleSelection(b.id, selectedBeneficiaryIds, setSelectedBeneficiaryIds)}
                      className="rounded h-3.5 w-3.5"
                    />
                    <span className="truncate">{b.name}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* 2. Care Companion Multi-Select */}
          <div className="relative">
            <button
              type="button"
              onClick={() => { setOpenCcDropdown(!openCcDropdown); setOpenBenDropdown(false); setOpenTeamDropdown(false); }}
              className="w-full flex items-center justify-between bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 transition-colors"
            >
              <span className="truncate">
                {selectedCcIds.length === 0 ? '🩺 All Care Companions' : `🩺 Companions (${selectedCcIds.length})`}
              </span>
              <ChevronDown size={14} className="text-slate-400 ml-1 shrink-0" />
            </button>
            {openCcDropdown && (
              <div className="absolute z-30 mt-1 w-64 bg-white border border-slate-200 rounded-xl shadow-lg p-2 max-h-60 overflow-y-auto">
                <div className="flex justify-between items-center pb-2 mb-2 border-b border-slate-100 text-xs text-slate-500 font-medium">
                  <span>Select Care Companion</span>
                  {selectedCcIds.length > 0 && (
                    <button onClick={() => setSelectedCcIds([])} className="text-primary hover:underline text-[11px]">Clear</button>
                  )}
                </div>
                {careCompanions.length === 0 && <p className="text-xs text-slate-400 px-2 py-1">Loading...</p>}
                {careCompanions.map((cc) => (
                  <label key={cc.id} className="flex items-center gap-2 px-2 py-1.5 hover:bg-slate-50 rounded text-xs text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedCcIds.includes(cc.id)}
                      onChange={() => toggleSelection(cc.id, selectedCcIds, setSelectedCcIds)}
                      className="rounded h-3.5 w-3.5"
                    />
                    <span className="truncate">{cc.name}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* 3. Team Multi-Select */}
          <div className="relative">
            <button
              type="button"
              onClick={() => { setOpenTeamDropdown(!openTeamDropdown); setOpenBenDropdown(false); setOpenCcDropdown(false); }}
              className="w-full flex items-center justify-between bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 transition-colors"
            >
              <span className="truncate">
                {selectedTeamIds.length === 0 ? '👥 All Teams' : `👥 Teams (${selectedTeamIds.length})`}
              </span>
              <ChevronDown size={14} className="text-slate-400 ml-1 shrink-0" />
            </button>
            {openTeamDropdown && (
              <div className="absolute z-30 mt-1 w-64 bg-white border border-slate-200 rounded-xl shadow-lg p-2 max-h-60 overflow-y-auto">
                <div className="flex justify-between items-center pb-2 mb-2 border-b border-slate-100 text-xs text-slate-500 font-medium">
                  <span>Select Team</span>
                  {selectedTeamIds.length > 0 && (
                    <button onClick={() => setSelectedTeamIds([])} className="text-primary hover:underline text-[11px]">Clear</button>
                  )}
                </div>
                {teams.length === 0 && <p className="text-xs text-slate-400 px-2 py-1">Loading...</p>}
                {teams.map((t) => (
                  <label key={t.id} className="flex items-center gap-2 px-2 py-1.5 hover:bg-slate-50 rounded text-xs text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedTeamIds.includes(t.id)}
                      onChange={() => toggleSelection(t.id, selectedTeamIds, setSelectedTeamIds)}
                      className="rounded h-3.5 w-3.5"
                    />
                    <span className="truncate">{t.name}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* 4. Read / Unread Filter */}
          <div>
            <select
              value={readFilter}
              onChange={(e) => setReadFilter(e.target.value as 'ALL' | 'UNREAD' | 'READ')}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="ALL">⚡ All Statuses</option>
              <option value="UNREAD">🔴 Unread / Action Needed</option>
              <option value="READ">🟢 Read / Actioned</option>
            </select>
          </div>

          {/* 5. Date Presets (Move into Past) */}
          <div>
            <select
              value={datePreset}
              onChange={(e) => handleDatePresetChange(e.target.value as any)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="ALL_TIME">📅 All History (Past & Future)</option>
              <option value="PAST_7_DAYS">🕒 Past 7 Days</option>
              <option value="PAST_30_DAYS">🗓️ Past 30 Days</option>
              <option value="THIS_MONTH">📆 This Month</option>
              <option value="CUSTOM">🛠️ Custom Date Range</option>
            </select>
          </div>

          {/* 6. Reset All Button */}
          <div>
            <button
              onClick={resetAllFilters}
              className="w-full flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg px-3 py-2 text-xs font-medium transition-colors"
            >
              <X size={14} />
              <span>Reset Filters</span>
            </button>
          </div>
        </div>

        {/* Custom Date Range Picker Row (shown when CUSTOM selected or dates set) */}
        {(datePreset === 'CUSTOM' || startDate || endDate) && (
          <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-100 bg-slate-50/50 p-3 rounded-lg text-xs">
            <span className="font-semibold text-slate-700 flex items-center gap-1">
              <Calendar size={14} className="text-primary" /> Filter by Request Date Range:
            </span>
            <div className="flex items-center gap-2">
              <label className="text-slate-500 font-medium">From:</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => { setStartDate(e.target.value); setDatePreset('CUSTOM'); }}
                className="bg-white border border-slate-200 rounded px-2 py-1 text-xs text-slate-800"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-slate-500 font-medium">To:</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => { setEndDate(e.target.value); setDatePreset('CUSTOM'); }}
                className="bg-white border border-slate-200 rounded px-2 py-1 text-xs text-slate-800"
              />
            </div>
            {(startDate || endDate) && (
              <button
                onClick={() => { setStartDate(''); setEndDate(''); setDatePreset('ALL_TIME'); }}
                className="text-primary hover:underline text-[11px] font-semibold"
              >
                Clear Date Filter
              </button>
            )}
          </div>
        )}
      </div>

      {/* Requests List */}
      {loading ? (
        <div className="flex items-center justify-center py-20 bg-white rounded-xl border border-slate-200">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm font-medium text-slate-600">Loading visit requests...</span>
          </div>
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center space-y-3">
          <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
            <Clock size={24} />
          </div>
          <h3 className="text-base font-semibold text-slate-800">No Visit Requests Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            No requests match your active filters. Try adjusting your search query, date range, or reset filters.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredRequests.map((reqItem) => {
            const b = reqItem.beneficiary;
            const sub = reqItem.subscriber;
            const benefit = reqItem.benefit;
            const primaryCC = b?.primaryCC;
            const secondaryCC = b?.secondaryCC;
            const activePackage = b?.subscriptions?.[0]?.package?.name || 'Active Package';

            return (
              <div
                key={reqItem.id}
                className={`bg-white rounded-2xl border transition-all hover:shadow-md p-5 flex flex-col justify-between space-y-4 ${
                  !reqItem.isRead
                    ? 'border-orange-200 ring-1 ring-orange-400/20 bg-gradient-to-br from-orange-50/30 to-white'
                    : 'border-slate-200'
                }`}
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="bg-primary/10 text-primary font-bold text-sm px-3 py-1 rounded-lg">
                        {benefit?.name || 'Requested Benefit'}
                      </span>
                      {benefit?.unitLabel && (
                        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                          / {benefit.unitLabel}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 font-medium">
                      Package: <span className="text-slate-700 font-semibold">{activePackage}</span>
                    </p>
                  </div>
                  <div>
                    {!reqItem.isRead ? (
                      <span className="bg-red-500 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 animate-pulse">
                        <span className="w-1.5 h-1.5 bg-white rounded-full"></span> Action Needed
                      </span>
                    ) : (
                      <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                        <CheckCircle2 size={12} /> Read
                      </span>
                    )}
                  </div>
                </div>

                {/* Details */}
                <div className="grid grid-cols-2 gap-3 bg-slate-50/80 p-3.5 rounded-xl border border-slate-100 text-xs">
                  <div className="space-y-1">
                    <p className="text-[11px] font-semibold text-slate-400 flex items-center gap-1 uppercase">
                      <User size={11} /> Beneficiary
                    </p>
                    <p className="font-bold text-slate-800 text-sm">{b?.name || 'N/A'}</p>
                    <p className="text-slate-500 text-[11px]">
                      {b?.city || b?.address || 'No location'} {b?.pincode ? `(${b.pincode})` : ''}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[11px] font-semibold text-slate-400 flex items-center gap-1 uppercase">
                      <Users size={11} /> Requested By
                    </p>
                    <p className="font-semibold text-slate-700">
                      {reqItem.requestedByUser?.name || sub?.name || 'Subscriber'}
                    </p>
                    <p className="text-slate-500 text-[11px]">
                      Role: <span className="font-medium text-slate-700 capitalize">{reqItem.requestedByRole || 'subscriber'}</span>
                    </p>
                  </div>

                  {reqItem.preferredDate && (
                    <div className="col-span-2 pt-2 border-t border-slate-200/60 flex items-center justify-between text-slate-700 font-medium">
                      <span className="flex items-center gap-1.5 text-slate-600">
                        <Calendar size={13} className="text-primary" /> Preferred Time:
                      </span>
                      <span className="font-bold text-primary">
                        {new Date(reqItem.preferredDate).toLocaleDateString('en-IN', {
                          day: 'numeric', month: 'short', year: 'numeric',
                        })} ({reqItem.preferredTiming || 'Flexible'})
                      </span>
                    </div>
                  )}

                  {reqItem.additionalNote && (
                    <div className="col-span-2 text-[11px] text-slate-600 italic bg-amber-50/50 border border-amber-100 p-2 rounded-lg">
                      "{reqItem.additionalNote}"
                    </div>
                  )}

                  <div className="col-span-2 text-[10px] text-slate-400 font-medium pt-1">
                    Requested on: {new Date(reqItem.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                  </div>
                </div>

                {/* CC Badges */}
                <div className="flex items-center justify-between text-xs pt-1">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 font-medium text-[11px]">Primary CC:</span>
                    {primaryCC ? (
                      <span className="font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded flex items-center gap-1">
                        <UserCheck size={12} className="text-emerald-600" /> {primaryCC.name}
                      </span>
                    ) : (
                      <span className="text-slate-400 italic text-[11px]">Unassigned</span>
                    )}
                  </div>
                  {secondaryCC && (
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-400 text-[11px]">Sec:</span>
                      <span className="font-medium text-slate-600">{secondaryCC.name}</span>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                  <Button
                    onClick={() => openQuickSchedule(reqItem)}
                    className="flex-1 bg-primary hover:bg-primary/90 text-white font-semibold text-xs py-2 rounded-xl flex items-center justify-center gap-1.5 shadow-sm shadow-primary/20"
                  >
                    <Sparkles size={14} /> Schedule Visit Now
                  </Button>
                  {!reqItem.isRead && (
                    <Button
                      variant="outline"
                      onClick={() => handleMarkAsRead(reqItem.id)}
                      className="text-xs py-2 px-3 text-slate-600 hover:text-slate-800 border-slate-200 hover:bg-slate-50"
                    >
                      Mark Read
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Quick Schedule Modal */}
      {scheduleModalReq && (
        <Dialog open={true} onOpenChange={() => setScheduleModalReq(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-base font-bold text-slate-800 flex items-center gap-2">
                <Sparkles className="text-primary" size={18} />
                Schedule Visit for {scheduleModalReq.beneficiary?.name}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-2">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs space-y-1">
                <p className="font-semibold text-slate-800">
                  Benefit: <span className="text-primary">{scheduleModalReq.benefit?.name || 'N/A'}</span>
                </p>
                <p className="text-slate-500">
                  Requested by: {scheduleModalReq.subscriber?.name || scheduleModalReq.beneficiary?.name}
                </p>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Assign Care Companion *</label>
                <select
                  value={scheduleCcId}
                  onChange={(e) => setScheduleCcId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="">-- Select Care Companion --</option>
                  {careCompanions.map((cc) => (
                    <option key={cc.id} value={cc.id}>
                      {cc.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Date *</label>
                  <input
                    type="date"
                    value={scheduleDate}
                    onChange={(e) => setScheduleDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-medium text-slate-800"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Time *</label>
                  <input
                    type="time"
                    value={scheduleTime}
                    onChange={(e) => setScheduleTime(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-medium text-slate-800"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Duration</label>
                <select
                  value={scheduleDuration}
                  onChange={(e) => setScheduleDuration(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs font-medium text-slate-800"
                >
                  <option value="30">30 Minutes</option>
                  <option value="60">1 Hour</option>
                  <option value="120">2 Hours</option>
                  <option value="180">3 Hours</option>
                  <option value="240">4 Hours</option>
                </select>
              </div>
            </div>

            <DialogFooter className="flex gap-2">
              <Button variant="outline" onClick={() => setScheduleModalReq(null)} className="flex-1 text-xs">
                Cancel
              </Button>
              <Button
                onClick={handleConfirmSchedule}
                disabled={submittingSchedule}
                className="flex-1 bg-primary text-white text-xs font-semibold"
              >
                {submittingSchedule ? 'Scheduling...' : 'Confirm & Reserve Unit'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
