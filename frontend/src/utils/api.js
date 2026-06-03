const defaultOrigin = typeof window !== "undefined" ? window.location.origin : "http://localhost:5000";

// Use VITE_API_URL when set in the build environment. Otherwise fall back to
// the current frontend origin and assume the backend is mounted at /api.
export const API_URL = import.meta.env.VITE_API_URL || `${defaultOrigin}/api`;

/**
 * Make an authenticated API request
 * @param {string} endpoint - The API endpoint (e.g., "/login")
 * @param {string} method - HTTP method (GET, POST, etc.)
 * @param {object} data - Request body data
 * @returns {Promise<object>} - Response data
 */
export const apiCall = async (endpoint, method = "GET", data = null) => {
  const headers = {
    "Content-Type": "application/json",
  };

  const token = localStorage.getItem("authToken");
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const config = {
    method,
    headers,
  };

  if (data) {
    config.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(`${API_URL}${endpoint}`, config);
    const responseData = await response.json();

    if (!response.ok) {
      throw new Error(responseData.message || "API request failed");
    }

    return responseData;
  } catch (error) {
    throw error;
  }
};

export const loginUser = (email, password) => {
  return apiCall("/login", "POST", { email, password });
};

export const registerUser = (full_name, email, password, phone, nid, address) => {
  return apiCall("/register", "POST", { full_name, email, password, phone, nid, address });
};

export const getMe = () => {
  return apiCall("/me", "GET");
};

export const getCampaigns = () => {
  return apiCall("/campaigns");
};

export const createCampaign = (payload) => {
  return apiCall("/campaign/create", "POST", payload);
};

export const logoutUser = () => {
  localStorage.removeItem("authToken");
};

export const getAuthToken = () => {
  return localStorage.getItem("authToken");
};

export const initiateBkashPayment = (payload) => {
  return apiCall("/payment/bkash/initiate", "POST", payload);
};

export const initiateCardPayment = (payload) => {
  return apiCall("/payment/card/initiate", "POST", payload);
};

export const initiateNagadPayment = (payload) => {
  return apiCall("/payment/nagad/initiate", "POST", payload);
};

export const initiateDirectDonation = (payload) => {
  return apiCall("/donate", "POST", payload);
};

export const getTransactions = () => {
  return apiCall("/transactions");
};

export const getAdminStats = () => {
  return apiCall("/admin/stats", "GET");
};

export const getAdminCampaigns = () => {
  return apiCall("/admin/campaigns", "GET");
};

export const getAdminDonations = () => {
  return apiCall("/admin/donations", "GET");
};

export const getAdminLogs = () => {
  return apiCall("/admin/logs", "GET");
};

export const verifyIntegrity = () => {
  return apiCall("/verify", "GET");
};

export const getAdminUsers = () => {
  return apiCall("/admin/users", "GET");
};

export const makeUserAdmin = (email) => {
  return apiCall("/admin/make-admin", "POST", { email });
};
