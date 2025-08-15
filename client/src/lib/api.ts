// Simple environment detection
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

export async function apiCall(endpoint: string, options: RequestInit = {}) {
  // Ensure endpoint starts with a slash if it's not a full URL
  const path = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const url = `${API_BASE_URL}${path}`;

  console.log("API Call:", url);

  return fetch(url, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
}

export const api = {
  get: (endpoint: string) => apiCall(endpoint),
  post: (endpoint: string, data?: any) =>
    apiCall(endpoint, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    }),
  put: (endpoint: string, data?: any) =>
    apiCall(endpoint, {
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    }),
  delete: (endpoint: string) => apiCall(endpoint, { method: "DELETE" }),
};

// Health check function
export const checkApiHealth = async () => {
  try {
    const response = await api.get("/api/health");
    return await response.json();
  } catch (error) {
    console.error("API health check failed:", error);
    throw error;
  }
};
