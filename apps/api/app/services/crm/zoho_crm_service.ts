import { config } from '../../core/config';

interface ZohoLeadData {
  firstName?: string;
  lastName: string; // Mandatory in Zoho
  email: string;
  phone: string;
  company: string; // Mandatory in Zoho
  description?: string;
}

export class ZohoCrmService {
  private static readonly ZOHO_WEB_TO_LEAD_URL = 'https://crm.zoho.in/crm/WebToLeadForm';

  /**
   * Submit a lead directly to Zoho CRM Web-to-Lead endpoint
   * @param leadData The lead details
   * @returns true if successful, false otherwise
   */
  public static async createLead(leadData: ZohoLeadData): Promise<boolean> {
    try {
      const { xnQsjsdp, xmIwtLD, actionType, returnURL } = config.zohoCrm;

      if (!xnQsjsdp || !xmIwtLD) {
        console.warn('⚠️ [Zoho CRM] Missing Zoho secrets in environment variables. Lead will not be sent to Zoho.');
        return false;
      }

      // Prepare form data using URLSearchParams
      const formData = new URLSearchParams();
      formData.append('xnQsjsdp', xnQsjsdp);
      formData.append('xmIwtLD', xmIwtLD);
      formData.append('actionType', actionType);
      formData.append('returnURL', returnURL);

      // Zoho form fields matching the exact name attributes generated
      if (leadData.firstName) formData.append('First Name', leadData.firstName);
      formData.append('Last Name', leadData.lastName);
      formData.append('Email', leadData.email);
      formData.append('Phone', leadData.phone);
      formData.append('Company', leadData.company);
      if (leadData.description) formData.append('Description', leadData.description);
      
      // Honeypot field (should be empty)
      formData.append('aG9uZXlwb3Q', '');

      const response = await fetch(ZohoCrmService.ZOHO_WEB_TO_LEAD_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
        },
        body: formData.toString(),
      });

      if (!response.ok) {
        console.error(`❌ [Zoho CRM] Failed to submit lead. Status: ${response.status}`);
        return false;
      }

      console.log(`✅ [Zoho CRM] Successfully created lead for ${leadData.email}`);
      return true;

    } catch (error: any) {
      console.error('❌ [Zoho CRM] Exception while submitting lead:', error.message);
      return false;
    }
  }
}
