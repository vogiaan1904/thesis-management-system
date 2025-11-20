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
    // Extract data from the response
    return response.data?.data !== undefined ? response.data.data : response.data;
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
  async login(email: string, password: string): Promise<{ user: any; token: string }> {
    const response = await apiClient.post('/auth/login', { email, password });
    if (response.token) {
      localStorage.setItem('auth_token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
    }
    return response;
  },

  async register(data: {
    userId: string;
    email: string;
    password: string;
    name: string;
    role: string;
    department?: string;
    major?: string;
  }): Promise<{ user: any; token: string }> {
    const response = await apiClient.post('/auth/register', data);
    if (response.token) {
      localStorage.setItem('auth_token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
    }
    return response;
  },

  async getProfile(): Promise<any> {
    return await apiClient.get('/auth/profile');
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
    return await apiClient.get(`/topics?${params.toString()}`);
  },

  async getById(id: string): Promise<ThesisTopic> {
    return await apiClient.get(`/topics/${id}`);
  },

  async getByInstructor(): Promise<ThesisTopic[]> {
    return await apiClient.get('/topics/my-topics');
  },

  async create(data: TopicFormData): Promise<ThesisTopic> {
    return await apiClient.post('/topics', data);
  },

  async update(id: string, data: Partial<TopicFormData>): Promise<ThesisTopic> {
    return await apiClient.patch(`/topics/${id}`, data);
  },

  async delete(id: string): Promise<void> {
    return await apiClient.delete(`/topics/${id}`);
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
    return await apiClient.get(`/registrations?${params.toString()}`);
  },

  async getByStudent(): Promise<ThesisApplication[]> {
    return await apiClient.get('/registrations/my-applications');
  },

  async getPendingReviews(): Promise<ThesisApplication[]> {
    return await apiClient.get('/registrations/pending-reviews');
  },

  async getMyStudents(): Promise<ThesisApplication[]> {
    return await apiClient.get('/registrations/my-students');
  },

  async create(data: ApplicationFormData): Promise<ThesisApplication> {
    const formData = new FormData();
    formData.append('topicId', data.topicId);
    formData.append('selfReportedCredits', data.selfReportedCredits.toString());
    formData.append('motivationLetter', data.motivationLetter);

    // Handle file uploads
    data.documents?.forEach((file, index) => {
      formData.append(`documents`, file);
    });

    return await apiClient.post('/registrations/apply', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  async updateStatus(
    registrationId: string,
    status: RegistrationStatus,
    notes?: string
  ): Promise<ThesisApplication> {
    return await apiClient.post('/registrations/review', {
      registrationId,
      status,
      notes,
    });
  },

  async update(id: string, data: Partial<ApplicationFormData>): Promise<ThesisApplication> {
    return await apiClient.patch(`/registrations/${id}`, data);
  },

  async withdraw(id: string): Promise<void> {
    return await apiClient.delete(`/registrations/${id}`);
  },
};

// Verification APIs
export const verificationService = {
  async uploadFile(file: File, semester: string): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('semester', semester);

    return await apiClient.post('/verification/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  async getHistory(): Promise<any[]> {
    return await apiClient.get('/verification/history');
  },

  async getLatest(): Promise<any> {
    return await apiClient.get('/verification/latest');
  },

  async getBatch(batchId: string): Promise<any> {
    return await apiClient.get(`/verification/${batchId}`);
  },

  async reprocessBatch(batchId: string): Promise<any> {
    return await apiClient.post(`/verification/process/${batchId}`);
  },
};

// Reports APIs
export const reportService = {
  async getSummary(): Promise<DashboardStats> {
    return await apiClient.get('/reports/summary');
  },

  async getInstructorLoad(): Promise<any[]> {
    return await apiClient.get('/reports/instructor-load');
  },

  async getDepartmentStats(department?: string): Promise<any> {
    const params = department ? `?department=${department}` : '';
    return await apiClient.get(`/reports/department-stats${params}`);
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
