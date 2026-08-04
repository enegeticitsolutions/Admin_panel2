import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { configApi } from '../../services/api';

export interface SystemConfigValues {
  maxPrimaryCc: number;
  maxSecondaryCc: number;
  maxCcPerTeam: number;
  maxBeneficiaryPerTeam: number;
  maxTeamsPerZone: number;
  maxBeneficiariesPerVolunteer: number;
  maxVolunteersPerBeneficiary: number;
  maxVolunteerSearchRadiusKm: number;
  globalLunchStart: string;
  globalLunchEnd: string;
  sathiCreditRate: number;
  sathiMinBillingMinutes: number;
  sathiReapplyCooldownDays: number;
  volunteerCreditConversionRate: number;
  regionRadiusKm: number;
  zoneRadiusKm: number;
}

const defaultConfigValues: SystemConfigValues = {
  maxPrimaryCc: 10,
  maxSecondaryCc: 5,
  maxCcPerTeam: 15,
  maxBeneficiaryPerTeam: 10,
  maxTeamsPerZone: 5,
  maxBeneficiariesPerVolunteer: 4,
  maxVolunteersPerBeneficiary: 2,
  maxVolunteerSearchRadiusKm: 15,
  globalLunchStart: '13:00',
  globalLunchEnd: '14:00',
  sathiCreditRate: 10,
  sathiMinBillingMinutes: 60,
  sathiReapplyCooldownDays: 30,
  volunteerCreditConversionRate: 10,
  regionRadiusKm: 31,
  zoneRadiusKm: 15,
};

interface SystemConfigContextType {
  config: SystemConfigValues;
  loading: boolean;
  refreshConfig: () => Promise<void>;
}

const SystemConfigContext = createContext<SystemConfigContextType>({
  config: defaultConfigValues,
  loading: false,
  refreshConfig: async () => {},
});

export const SystemConfigProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<SystemConfigValues>(defaultConfigValues);
  const [loading, setLoading] = useState(true);

  const refreshConfig = useCallback(async () => {
    try {
      const res: any = await configApi.getAll();
      const rawList: any[] = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : [];
      const map: Record<string, string> = {};
      rawList.forEach((item: any) => {
        if (item && item.key) map[item.key] = String(item.value);
      });

      const parseNum = (val: string | undefined, fallback: number) => {
        if (!val) return fallback;
        const n = Number(val);
        return isNaN(n) ? fallback : n;
      };

      setConfig({
        maxPrimaryCc: parseNum(map.max_primary_cc, 10),
        maxSecondaryCc: parseNum(map.max_secondary_cc, 5),
        maxCcPerTeam: parseNum(map.max_cc_per_team, 15),
        maxBeneficiaryPerTeam: parseNum(map.max_beneficiary_per_team, 10),
        maxTeamsPerZone: parseNum(map.max_teams_per_zone, 5),
        maxBeneficiariesPerVolunteer: parseNum(map.max_beneficiaries_per_volunteer, 4),
        maxVolunteersPerBeneficiary: parseNum(map.max_volunteers_per_beneficiary, 2),
        maxVolunteerSearchRadiusKm: parseNum(map.max_volunteer_search_radius_km, 15),
        globalLunchStart: map.globalLunchStart || '13:00',
        globalLunchEnd: map.globalLunchEnd || '14:00',
        sathiCreditRate: parseNum(map.SATHI_CREDIT_RATE, 10),
        sathiMinBillingMinutes: parseNum(map.SATHI_MIN_BILLING_MINUTES, 60),
        sathiReapplyCooldownDays: parseNum(map.sathi_reapply_cooldown_days, 30),
        volunteerCreditConversionRate: parseNum(map.VOLUNTEER_CREDIT_CONVERSION_RATE, 10),
        regionRadiusKm: parseNum(map.region_radius_km, 31),
        zoneRadiusKm: parseNum(map.zone_radius_km, 15),
      });
    } catch (err) {
      console.warn('Failed to load dynamic system config, using defaults:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshConfig();
  }, [refreshConfig]);

  return (
    <SystemConfigContext.Provider value={{ config, loading, refreshConfig }}>
      {children}
    </SystemConfigContext.Provider>
  );
};

export const useSystemConfig = () => useContext(SystemConfigContext);
