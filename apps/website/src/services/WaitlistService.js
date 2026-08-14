/**
 * WaitlistService - Object-Oriented Service Model
 * Encapsulates validation and API network calls for waitlist registrations.
 */
import { API_BASE } from './api';

export class WaitlistService {
  constructor() {
    this.apiBaseUrl = API_BASE;
  }

  /**
   * Validate form fields
   * @param {Object} formData { name, phone, pinCode, email }
   * @returns {Object} { isValid: boolean, error: string|null }
   */
  validate(formData) {
    if (!formData.name?.trim()) {
      return { isValid: false, error: 'Full name is required.' };
    }
    if (!formData.phone?.trim()) {
      return { isValid: false, error: 'Mobile number is required.' };
    }
    if (!formData.pinCode?.trim() || !/^\d{6}$/.test(formData.pinCode.trim())) {
      return { isValid: false, error: 'Please enter a valid 6-digit pin code.' };
    }
    if (!formData.email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      return { isValid: false, error: 'Please enter a valid email address.' };
    }
    return { isValid: true, error: null };
  }

  /**
   * Submit waitlist form data to backend
   * @param {Object} formData 
   * @returns {Promise<Object>} API response object { success: boolean, message?: string }
   */
  async submitWaitlist(formData) {
    const validation = this.validate(formData);
    if (!validation.isValid) {
      throw new Error(validation.error);
    }

    const payload = {
      name: formData.name.trim(),
      phone: formData.phone.trim(),
      pinCode: formData.pinCode.trim(),
      email: formData.email.trim(),
    };

    const response = await fetch(`${this.apiBaseUrl}/website/submit-form`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Something went wrong. Please try again.');
    }

    return data;
  }
}

export default new WaitlistService();
