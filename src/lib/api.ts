// API configuration and helper functions
// Get API base URL from environment variable or use localhost as default
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
const FIREBASE_API_KEY = import.meta.env.VITE_FIREBASE_API_KEY;

// Standard API response envelope
interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
  errors?: any[];
}

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

const getRefreshToken = (): string | null => {
  return localStorage.getItem('refreshToken');
};

export const setRefreshToken = (token: string): void => {
  localStorage.setItem('refreshToken', token);
};

export const removeRefreshToken = (): void => {
  localStorage.removeItem('refreshToken');
};

async function refreshAuthToken(): Promise<boolean> {
  const storedRefreshToken = getRefreshToken();

  if (!storedRefreshToken || !FIREBASE_API_KEY) {
    return false;
  }

  const body = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: storedRefreshToken,
  });

  try {
    const response = await fetch(
      `https://securetoken.googleapis.com/v1/token?key=${FIREBASE_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body,
      }
    );

    if (!response.ok) {
      removeAuthToken();
      removeRefreshToken();
      return false;
    }

    const data = await response.json();

    if (!data.id_token || !data.refresh_token) {
      removeAuthToken();
      removeRefreshToken();
      return false;
    }

    setAuthToken(data.id_token);
    setRefreshToken(data.refresh_token);

    return true;
  } catch {
    removeAuthToken();
    removeRefreshToken();
    return false;
  }
}

// Generic API call wrapper with auth
async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {},
  canRetry: boolean = true
): Promise<T> {
  const token = getAuthToken();

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api${endpoint}`, {
      ...options,
      headers,
    });

    const data: ApiResponse<T> = await response.json();

    if (!response.ok || !data.success) {
      // Handle specific error cases
      if (response.status === 401) {
        if (canRetry) {
          const refreshed = await refreshAuthToken();

          if (refreshed) {
            return await apiCall<T>(endpoint, options, false);
          }
        }

        removeAuthToken();
        removeRefreshToken();
        localStorage.removeItem('user');
        throw new Error('Session expired. Please login again.');
      }

      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }

    return data.data;
  } catch (error) {
    // Network errors (CORS, connection refused, etc.)
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      throw new Error(
        'Cannot connect to backend. Please ensure:\n' +
        '1. Your backend server is running\n' +
        '2. CORS is configured correctly\n' +
        '3. API URL is correct in environment variables'
      );
    }
    throw error;
  }
}

// Auth APIs
export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await apiCall<{
      uid: string;
      email: string;
      name: string;
      idToken: string;
      refreshToken: string;
      expiresIn: string;
      profile: any;
    }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    if (response.idToken) {
      setAuthToken(response.idToken);
    }

    if (response.refreshToken) {
      setRefreshToken(response.refreshToken);
    }
    
    return {
      token: response.idToken,
      user: {
        uid: response.uid,
        email: response.email,
        name: response.name,
      },
      profile: response.profile,
    };
  },

  register: async (email: string, password: string, name: string) => {
    const response = await apiCall<{
      uid: string;
      email: string;
      name: string;
    }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });
    
    // After registration, automatically login
    return await authAPI.login(email, password);
  },

  logout: async () => {
    try {
      await apiCall('/auth/logout', { method: 'POST' });
    } catch (error) {
      // Even if logout fails, clear local data
      console.error('Logout error:', error);
    } finally {
      removeAuthToken();
      removeRefreshToken();
      localStorage.removeItem('user');
    }
  },

  verify: () => apiCall<{
    uid: string;
    email: string;
    emailVerified: boolean;
    name: string;
  }>('/auth/verify'),
};

// User APIs
export const userAPI = {
  getProfile: () => apiCall<{
    uid: string;
    email: string;
    name: string;
    currency: string;
    monthlyBudget: number;
    savingsGoal: number;
    preferences: any;
    createdAt: string;
    updatedAt: string;
  }>('/user/profile'),
  
  updateProfile: (data: any) =>
    apiCall<any>('/user/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  getBudget: (month: number, year: number) =>
    apiCall<{
      period: {
        month: number;
        year: number;
        daysRemaining: number;
      };
      budget: {
        monthly: number;
        spent: number;
        remaining: number;
        percentageUsed: number;
        dailyBudget: number;
        status: string;
        savingsGoal?: number;
      };
      categoryBreakdown: Array<{
        category: string;
        amount: number;
        percentage: string;
      }>;
    }>(`/user/budget?month=${month}&year=${year}`),

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
  getAll: (params?: { 
    type?: string; 
    page?: number; 
    limit?: number;
    startDate?: string;
    endDate?: string;
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.type) queryParams.append('type', params.type);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);
    
    const queryString = queryParams.toString();
    return apiCall<{
      transactions: any[];
      summary: {
        totalIncome: number;
        totalExpenses: number;
        totalSavings: number;
        count: number;
      };
      pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      };
    }>(`/transactions${queryString ? `?${queryString}` : ''}`);
  },

  create: (data: any) =>
    apiCall<any>('/transactions', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: any) =>
    apiCall<any>(`/transactions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    apiCall<any>(`/transactions/${id}`, {
      method: 'DELETE',
    }),
};

// Insights API
export const insightsAPI = {
  analyze: (payload?: { transactions?: any[]; period?: string }) =>
    apiCall<any>('/insights/analyze', {
      method: 'POST',
      body: JSON.stringify(payload ?? {}),
    }),

  chat: (message: string) =>
    apiCall<{
      response: string;
      suggestions?: string[];
    }>('/insights/chat', {
      method: 'POST',
      body: JSON.stringify({ message }),
    }),

  getHistory: (params?: { page?: number; limit?: number }) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    
    const queryString = queryParams.toString();
    return apiCall<{
      insights: any[];
      pagination: any;
    }>(`/insights/history${queryString ? `?${queryString}` : ''}`);
  },
};

export type AIConversationEntry = {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
};

export const aiAPI = {
  chat: (payload: { message: string; conversationHistory: AIConversationEntry[] }) =>
    apiCall<{
      message: string;
      conversationHistory: AIConversationEntry[];
      timestamp?: string;
    }>('/ai/chat', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
};

