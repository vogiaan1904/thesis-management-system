import axios, { AxiosInstance, AxiosError } from 'axios';
import toast from 'react-hot-toast';
import {
  ThesisTopic,
  ThesisApplication,
  RegistrationStatus,
  ApplicationFormData,
  TopicFormData,
  DashboardStats,
  PaginatedResponse,
} from '../types';

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

// Response Types
interface AuthResponse {
  access_token: string;
  user: {
    id: string;
    userId: string;
    fullName: string;
    email: string;
    role: string;
    department?: string;
    major?: string;
    program?: string;
  };
}

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError<{ message?: string; error?: string }>) => {
    // Handle specific error cases
    if (error.response?.status === 401) {
      // Unauthorized - clear token and let React Router handle redirect
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');

      // Dispatch custom event to notify AuthContext of logout
      window.dispatchEvent(new Event('auth-logout'));

      // Only show toast if we're not already on the login page
      if (!window.location.pathname.includes('/login')) {
        toast.error('Session expired. Please log in again.');
      }

      // Don't force redirect here - let React Router's ProtectedRoute handle it
      // This prevents navigation issues and allows proper React state cleanup
    } else if (error.response?.status === 403) {
      toast.error('You do not have permission to perform this action.');
    } else if (error.response?.status === 404) {
      toast.error('Resource not found.');
    } else if (error.response?.status === 409) {
      const message = error.response?.data?.message || 'Conflict error occurred.';
      toast.error(message);
    } else if (error.response?.status === 500) {
      toast.error('Server error. Please try again later.');
    } else if (error.code === 'ERR_NETWORK') {
      toast.error('Network error. Please check your connection.');
    } else if (error.response?.data?.message) {
      // Show server error message if available
      const message = Array.isArray(error.response.data.message)
        ? error.response.data.message.join(', ')
        : error.response.data.message;
      toast.error(message);
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authService = {
  async login(userId: string, password: string): Promise<AuthResponse> {
    console.log('authService.login called with userId:', userId);
    const response = await apiClient.post<AuthResponse>('/auth/login', { userId, password });
    console.log('API response:', response);
    console.log('Response data:', response.data);
    console.log('Response status:', response.status);

    const data = response.data;

    // Check if response.data has access_token or if it's nested
    console.log('Checking for access_token:', data.access_token);
    console.log('Full data object:', JSON.stringify(data, null, 2));

    if (data.access_token) {
      // Normalize role to lowercase before storing
      const normalizedUser = {
        ...data.user,
        role: data.user.role.toLowerCase(),
      };
      localStorage.setItem('auth_token', data.access_token);
      localStorage.setItem('user', JSON.stringify(normalizedUser));
      // Return normalized data
      data.user = normalizedUser;
      localStorage.setItem('user', JSON.stringify(data.user));
      console.log('Stored token and user in localStorage');
    } else {
      console.error('No access_token in response data');
    }

    return data;
  },

  async register(data: {
    userId: string;
    email: string;
    password: string;
    fullName: string;
    role: string;
    department?: string;
    major?: string;
  }): Promise<any> {
    const response = await apiClient.post('/auth/register', data);
    return response.data;
  },

  async getProfile(): Promise<any> {
    const response = await apiClient.get('/auth/profile');
    const profile = response.data;
    // Normalize role to lowercase
    return {
      ...profile,
      role: profile.role.toLowerCase(),
    };
  },

  logout() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
  },
};

// Topic APIs
export const topicService = {
  async getAll(filters?: {
    semester?: string;
    topicType?: string;
    programType?: string;
    department?: string;
    search?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<ThesisTopic>> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value));
        }
      });
    }
    // Set default pagination
    if (!params.has('page')) params.append('page', '1');
    if (!params.has('limit')) params.append('limit', '100');

    const response = await apiClient.get<PaginatedResponse<ThesisTopic>>(
      `/topics?${params.toString()}`
    );
    return response.data;
  },

  async getById(id: string): Promise<ThesisTopic> {
    const response = await apiClient.get<ThesisTopic>(`/topics/${id}`);
    return response.data;
  },

  async getByInstructor(): Promise<ThesisTopic[]> {
    const response = await apiClient.get<ThesisTopic[]>('/topics/my-topics');
    return response.data;
  },

  async create(data: TopicFormData): Promise<ThesisTopic> {
    const response = await apiClient.post<ThesisTopic>('/topics', data);
    toast.success('Topic created successfully!');
    return response.data;
  },

  async update(id: string, data: Partial<TopicFormData>): Promise<ThesisTopic> {
    const response = await apiClient.patch<ThesisTopic>(`/topics/${id}`, data);
    toast.success('Topic updated successfully!');
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/topics/${id}`);
    toast.success('Topic deleted successfully!');
  },
};

// Application/Registration APIs
export const applicationService = {
  async getAll(filters?: { status?: string; topicId?: string; page?: number; limit?: number }): Promise<PaginatedResponse<ThesisApplication>> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value));
        }
      });
    }
    // Set default pagination
    if (!params.has('page')) params.append('page', '1');
    if (!params.has('limit')) params.append('limit', '100');

    const response = await apiClient.get<PaginatedResponse<ThesisApplication>>(`/registrations?${params.toString()}`);
    return response.data;
  },

  async getByStudent(): Promise<ThesisApplication[]> {
    const response = await apiClient.get<ThesisApplication[]>('/registrations/my-applications');
    return response.data;
  },

  async getPendingReviews(): Promise<ThesisApplication[]> {
    const response = await apiClient.get<ThesisApplication[]>('/registrations/pending-reviews');
    return response.data;
  },

  async getMyStudents(): Promise<ThesisApplication[]> {
    const response = await apiClient.get<ThesisApplication[]>('/registrations/my-students');
    return response.data;
  },

  async create(data: ApplicationFormData): Promise<ThesisApplication> {
    // TODO: Handle file upload separately if transcriptFile is provided
    const payload = {
      topicId: data.topicId,
      creditsClaimed: data.creditsClaimed,
      motivationLetter: data.motivationLetter,
      transcriptUrl: undefined, // File upload should be handled separately
    };

    const response = await apiClient.post<ThesisApplication>('/registrations/apply', payload);
    toast.success('Application submitted successfully!');
    return response.data;
  },

  async updateStatus(
    registrationId: string,
    status: RegistrationStatus,
    comment?: string
  ): Promise<ThesisApplication> {
    const response = await apiClient.post<ThesisApplication>('/registrations/review', {
      registrationId,
      decision: status === 'INSTRUCTOR_ACCEPTED' ? 'ACCEPT' : 'REJECT',
      comment,
    });
    return response.data;
  },

  async update(id: string, data: Partial<ApplicationFormData>): Promise<ThesisApplication> {
    const response = await apiClient.patch<ThesisApplication>(`/registrations/${id}`, data);
    return response.data;
  },

  async withdraw(id: string): Promise<void> {
    await apiClient.delete(`/registrations/${id}`);
  },
};

// Verification APIs
export const verificationService = {
  async uploadFile(file: File, semester: string): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('semester', semester);

    const response = await apiClient.post('/verification/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async getHistory(): Promise<any[]> {
    const response = await apiClient.get('/verification/history');
    return response.data;
  },

  async getLatest(): Promise<any> {
    const response = await apiClient.get('/verification/latest');
    return response.data;
  },

  async getBatch(batchId: string): Promise<any> {
    const response = await apiClient.get(`/verification/${batchId}`);
    return response.data;
  },

  async reprocessBatch(batchId: string): Promise<any> {
    const response = await apiClient.post(`/verification/process/${batchId}`);
    return response.data;
  },
};

// Reports APIs
export const reportService = {
  async getSummary(): Promise<DashboardStats> {
    const response = await apiClient.get<DashboardStats>('/reports/summary');
    return response.data;
  },

  async getInstructorLoad(): Promise<any[]> {
    const response = await apiClient.get('/reports/instructor-load');
    return response.data;
  },

  async getDepartmentStats(department?: string): Promise<any> {
    const params = department ? `?department=${department}` : '';
    const response = await apiClient.get(`/reports/department-stats${params}`);
    return response.data;
  },

  async exportToExcel(type: 'topics' | 'registrations' | 'instructor-load'): Promise<Blob> {
    const response = await axios.get(`${API_BASE_URL}/reports/export?type=${type}`, {
      responseType: 'blob',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
      },
    });
    return response.data;
  },
};

// Export the API client for custom requests
export default apiClient;
