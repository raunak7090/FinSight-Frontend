// API configuration and helper functions
const API_BASE_URL = 'http://localhost:3000/api';

// Get auth token from localStorage
const getAuthToken = (): string | null => {
  return localStorage.getItem('authToken');
};

// Set auth token to localStorage
export const setAuthToken = (token: string): void => {
  localStorage.setItem('authToken', token);
};

// Remove auth token from localStorage
export const removeAuthToken = (): void => {
  localStorage.removeItem('authToken');
};

// Generic API call wrapper with auth
async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAuthToken();
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

// Auth APIs
export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await apiCall<{ token: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (response.token) {
      setAuthToken(response.token);
    }
    return response;
  },

  register: async (email: string, password: string, name: string) => {
    const response = await apiCall<{ token: string; user: any }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });
    if (response.token) {
      setAuthToken(response.token);
    }
    return response;
  },

  logout: () => {
    removeAuthToken();
  },
};

// User APIs
export const userAPI = {
  getProfile: () => apiCall<any>('/user/profile'),
  
  updateProfile: (data: any) =>
    apiCall<any>('/user/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  getBudget: (month: number, year: number) =>
    apiCall<any>(`/user/budget?month=${month}&year=${year}`),

  updateBudget: (data: any) =>
    apiCall<any>('/user/budget', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getSettings: () => apiCall<any>('/user/settings'),

  updateSettings: (data: any) =>
    apiCall<any>('/user/settings', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
};

// Transaction APIs
export const transactionAPI = {
  getAll: (params?: { type?: string; page?: number; limit?: number }) => {
    const queryParams = new URLSearchParams();
    if (params?.type) queryParams.append('type', params.type);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    
    const queryString = queryParams.toString();
    return apiCall<any>(`/transactions${queryString ? `?${queryString}` : ''}`);
  },

  create: (data: any) =>
    apiCall<any>('/transactions', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: any) =>
    apiCall<any>(`/transactions/${id}`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    apiCall<any>(`/transactions/${id}`, {
      method: 'DELETE',
    }),
};

// Insights API (placeholder - to be implemented when backend is ready)
export const insightsAPI = {
  getInsights: (message: string) =>
    apiCall<any>('/insights', {
      method: 'POST',
      body: JSON.stringify({ message }),
    }),
};
