declare module 'react-native-razorpay' {
  export interface CheckoutOptions {
    key: string;
    amount: number | string;
    currency: string;
    name: string;
    description?: string;
    image?: string;
    order_id: string;
    prefill?: {
      email?: string;
      contact?: string;
      name?: string;
      method?: string;
    };
    notes?: Record<string, string>;
    theme?: {
      color?: string;
      backdrop_color?: string;
      hide_topbar?: boolean;
    };
    modal?: {
      backdropclose?: boolean;
      escape?: boolean;
      handleback?: boolean;
      confirm_close?: boolean;
      ondismiss?: () => void;
      animation?: boolean;
    };
    send_sms_hash?: boolean;
    retry?: {
      enabled?: boolean;
      max_count?: number;
    };
    [key: string]: any;
  }

  export interface SuccessResponse {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
    [key: string]: any;
  }

  export interface ErrorResponse {
    code: number;
    description: string;
    error?: {
      field?: string;
      source?: string;
      step?: string;
      reason?: string;
      metadata?: Record<string, any>;
    };
    [key: string]: any;
  }

  export default class RazorpayCheckout {
    static open(
      options: CheckoutOptions,
      successCallback?: (data: SuccessResponse) => void,
      errorCallback?: (data: ErrorResponse) => void
    ): Promise<SuccessResponse>;
    static onExternalWalletSelection(externalWalletCallback: (data: any) => void): void;
  }
}
