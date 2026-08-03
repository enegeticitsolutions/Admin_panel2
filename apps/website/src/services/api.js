// API Service for Website Frontend using backend routes (same as mobile app)

const getApiBase = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl) {
    return envUrl.replace(/\/api\/?$/, '') + '/api';
  }
  return '/api';
};

export const API_BASE = getApiBase();

/**
 * Allowed user roles for website login
 */
export const ALLOWED_WEBSITE_ROLES = ['subscriber', 'prospect'];

/**
 * Validate role for website login access
 */
export const checkWebsiteRoleAccess = (user) => {
  if (!user || !user.role) return;
  const role = String(user.role).toLowerCase();
  if (!ALLOWED_WEBSITE_ROLES.includes(role)) {
    const formattedRole = role.replace(/_/g, ' ');
    throw new Error(`Login restricted: Only Subscriber and Prospect accounts can log in on the website. Your account role (${formattedRole}) is not permitted on this portal.`);
  }
};

/**
 * Format 10-digit phone to 91XXXXXXXXXX or +91XXXXXXXXXX
 */
export const formatPhone = (phoneRaw, prefixPlus = true) => {
  const clean = String(phoneRaw || '').replace(/\D/g, '').slice(-10);
  if (!clean) return '';
  return prefixPlus ? `+91${clean}` : `91${clean}`;
};

/**
 * 1. Send OTP to user phone
 * Endpoint: POST /api/auth/send-otp
 */
export const sendOtp = async (phoneRaw) => {
  const phone = formatPhone(phoneRaw, false); // "919999999999"
  const response = await fetch(`${API_BASE}/auth/send-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone }),
  });
  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Failed to send OTP.');
  }
  return data.data; // { success: true, isNewUser: boolean, ... }
};

/**
 * 2. Verify OTP entered by user
 * Endpoint: POST /api/auth/verify-otp
 */
export const verifyOtp = async (phoneRaw, otpCode) => {
  const phone = formatPhone(phoneRaw, true); // "+919999999999"
  const response = await fetch(`${API_BASE}/auth/verify-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, otp: otpCode }),
  });
  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Invalid or expired OTP entered.');
  }
  const result = data.data;
  if (result && result.user) {
    checkWebsiteRoleAccess(result.user);
  }
  return result; // { isNewUser, user, token, ... }
};

/**
 * 3. Register user with password & profile
 * Endpoint: POST /api/auth/register-password
 */
export const registerUser = async ({ phoneRaw, name, age, password }) => {
  const phone = formatPhone(phoneRaw, true); // "+919999999999"
  const response = await fetch(`${API_BASE}/auth/register-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      phone,
      name,
      age: Number(age) || 30,
      password,
    }),
  });
  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Registration failed.');
  }
  const result = data.data;
  if (result && result.user) {
    checkWebsiteRoleAccess(result.user);
  }
  return result; // { token, user, ... }
};

/**
 * 4. Login with phone & password
 * Endpoint: POST /api/auth/login-password
 */
export const loginWithPassword = async ({ phoneRaw, password }) => {
  const phone = formatPhone(phoneRaw, true); // "+919999999999"
  const response = await fetch(`${API_BASE}/auth/login-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, password }),
  });
  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Login failed. Check phone or password.');
  }
  const result = data.data;
  if (result && result.user) {
    checkWebsiteRoleAccess(result.user);
  }
  return result; // { token, user, ... }
};

/**
 * 5. Fetch subscription packages
 * Endpoint: GET /api/subscriber/subscriptions/packages
 */
export const fetchSubscriptionPackages = async () => {
  const response = await fetch(`${API_BASE}/subscriber/subscriptions/packages`);
  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Failed to load subscription packages.');
  }
  return data.data || [];
};

/**
 * 6. Validate coupon code
 * Endpoint: POST /api/subscriber/coupons/validate
 */
export const validateCouponCode = async (token, couponCode, packageId) => {
  const response = await fetch(`${API_BASE}/subscriber/coupons/validate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ couponCode, packageId }),
  });
  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Invalid coupon code.');
  }
  return data.data;
};

/**
 * 6b. Create Razorpay Order
 * Endpoint: POST /api/subscriber/subscriptions/create-order
 */
export const createRazorpayOrder = async (token, packageId, couponCode) => {
  const response = await fetch(`${API_BASE}/subscriber/subscriptions/create-order`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ packageId, couponCode: couponCode || undefined }),
  });
  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Failed to create Razorpay order.');
  }
  return data.data; // { order_id, amount, currency, receipt }
};

/**
 * 7. Purchase Subscription
 * Endpoint: POST /api/subscriber/subscriptions/purchase
 */
export const purchaseSubscription = async (token, payload) => {
  const response = await fetch(`${API_BASE}/subscriber/subscriptions/purchase`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      packageId: payload.packageId,
      couponCode: payload.couponCode || undefined,
      beneficiaryData: payload.beneficiaryData || null,
      medicalData: payload.medicalData || null,
      emergencyContacts: payload.emergencyContacts || null,
      razorpay_payment_id: payload.razorpay_payment_id || 'DEV_MOCK_PAYMENT_' + Date.now(),
      razorpay_order_id: payload.razorpay_order_id || 'order_mock_' + Date.now(),
      razorpay_signature: payload.razorpay_signature || 'DEV_MOCK_SIGNATURE',
    }),
  });
  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Failed to complete subscription purchase.');
  }
  return data;
};

/**
 * 8. Fetch current subscriber dashboard profile & active subscription
 * Endpoint: GET /api/subscriber/dashboard/me
 */
export const fetchSubscriberDashboard = async (token) => {
  const response = await fetch(`${API_BASE}/subscriber/dashboard/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Failed to fetch account details.');
  }
  return data.data || data;
};
