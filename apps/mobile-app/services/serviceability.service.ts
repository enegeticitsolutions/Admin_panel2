import { API_URL } from '@/constants/api';

export interface ServiceableRegionInfo {
  id: string;
  name: string;
  city: string;
  state: string;
  radiusKm: number;
  distanceKm: number;
}

export interface ServiceabilityStats {
  companions: number;
  centers: number;
}

export interface ServiceabilityResult {
  isServiceable: boolean;
  available: boolean;
  location?: string;
  region?: ServiceableRegionInfo;
  stats: ServiceabilityStats;
  message: string;
}

/**
 * ServiceabilityService — Object-Oriented Client Service for evaluating whether
 * a user's chosen location or GPS coordinates fall within active service regions.
 */
export class ServiceabilityService {
  private static instance: ServiceabilityService;

  public static getInstance(): ServiceabilityService {
    if (!ServiceabilityService.instance) {
      ServiceabilityService.instance = new ServiceabilityService();
    }
    return ServiceabilityService.instance;
  }

  /**
   * Evaluates serviceability using precise GPS coordinates (and optional fallback pincode).
   */
  public async checkLocation(
    latitude?: number,
    longitude?: number,
    pincode?: string
  ): Promise<ServiceabilityResult> {
    try {
      const queryParams = new URLSearchParams();
      if (latitude !== undefined && !isNaN(latitude)) queryParams.append('lat', latitude.toString());
      if (longitude !== undefined && !isNaN(longitude)) queryParams.append('lng', longitude.toString());
      if (pincode && pincode.trim()) queryParams.append('pincode', pincode.trim());

      const response = await fetch(`${API_URL}/public/zones/check-serviceability?${queryParams.toString()}`);
      const json = await response.json();

      if (json.success && json.data) {
        return {
          isServiceable: Boolean(json.data.isServiceable || json.data.available),
          available: Boolean(json.data.isServiceable || json.data.available),
          location: json.data.location || '',
          region: json.data.region,
          stats: json.data.stats || { companions: 0, centers: 0 },
          message: json.data.message || (json.data.isServiceable ? 'Service Available' : 'Service Unavailable'),
        };
      }

      return {
        isServiceable: false,
        available: false,
        stats: { companions: 0, centers: 0 },
        message: json.message || 'We are not serving this area yet.',
      };
    } catch (error) {
      console.error('[ServiceabilityService] checkLocation error:', error);
      return {
        isServiceable: false,
        available: false,
        stats: { companions: 0, centers: 0 },
        message: 'Could not verify serviceability. Please check your network connection.',
      };
    }
  }

  /**
   * Evaluates serviceability using only a 6-digit postal pincode.
   */
  public async checkPincode(pincode: string): Promise<ServiceabilityResult> {
    return this.checkLocation(undefined, undefined, pincode);
  }
}

export const serviceabilityService = ServiceabilityService.getInstance();
