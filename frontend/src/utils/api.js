const API_URL = "http://localhost:5000/api";

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

export const registerUser = (full_name, email, password) => {
  return apiCall("/register", "POST", { full_name, email, password });
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
