import axios, { AxiosInstance, AxiosError } from 'axios';
import {
  ThesisTopic,
  ThesisApplication,
  RegistrationStatus,
  ApplicationFormData,
  TopicFormData,
  DashboardStats,
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

interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    lastPage: number;
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
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authService = {
  async login(userId: string, password: string): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/login', { userId, password });
    const data = response.data;

    if (data.access_token) {
      localStorage.setItem('auth_token', data.access_token);
      localStorage.setItem('user', JSON.stringify(data.user));
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
    return response.data;
  },

  logout() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
  },
};

// Topic APIs
export const topicService = {
  async getAll(filters?: {
    topicType?: string;
    programType?: string;
    department?: string;
    researchArea?: string;
    search?: string;
    status?: string;
  }): Promise<ThesisTopic[]> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
    }
    const response = await apiClient.get<PaginatedResponse<ThesisTopic> | ThesisTopic[]>(
      `/topics?${params.toString()}`
    );

    // Handle both paginated and non-paginated responses
    if (response.data && typeof response.data === 'object' && 'data' in response.data) {
      return (response.data as PaginatedResponse<ThesisTopic>).data;
    }
    return response.data as ThesisTopic[];
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
    return response.data;
  },

  async update(id: string, data: Partial<TopicFormData>): Promise<ThesisTopic> {
    const response = await apiClient.patch<ThesisTopic>(`/topics/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/topics/${id}`);
  },
};

// Application/Registration APIs
export const applicationService = {
  async getAll(filters?: { status?: string; topicId?: string }): Promise<ThesisApplication[]> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
    }
    const response = await apiClient.get<ThesisApplication[]>(`/registrations?${params.toString()}`);
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
    const formData = new FormData();
    formData.append('topicId', data.topicId);
    formData.append('selfReportedCredits', data.selfReportedCredits.toString());
    formData.append('motivationLetter', data.motivationLetter);

    // Handle file uploads
    if (data.documents && data.documents.length > 0) {
      data.documents.forEach((file) => {
        formData.append('documents', file);
      });
    }

    const response = await apiClient.post<ThesisApplication>('/registrations/apply', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async updateStatus(
    registrationId: string,
    status: RegistrationStatus,
    notes?: string
  ): Promise<ThesisApplication> {
    const response = await apiClient.post<ThesisApplication>('/registrations/review', {
      registrationId,
      decision: status === 'INSTRUCTOR_ACCEPTED' ? 'ACCEPT' : 'REJECT',
      notes,
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
