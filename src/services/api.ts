import { Vacancy, Candidate, CreateVacancyRequest } from '../types';

// Базовый URL API (замените на ваш реальный URL бэкенда)
const API_BASE_URL = process.env.VITE_API_URL || 'http://localhost:8000/api';

// Вспомогательная функция для выполнения запросов
async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const token = localStorage.getItem('authToken');
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options?.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Network error' }));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

// API методы
export const api = {
  // Вакансии
  async createVacancy(data: CreateVacancyRequest): Promise<Vacancy> {
    // Отправляем данные вакансии вместе с уникальной ссылкой на бота
    // botLink содержит UUID, который бэкенд будет использовать для идентификации
    return fetchAPI<Vacancy>('/vacancies', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async getVacancies(): Promise<Vacancy[]> {
    return fetchAPI<Vacancy[]>('/vacancies');
  },

  async getVacancy(id: string): Promise<Vacancy> {
    return fetchAPI<Vacancy>(`/vacancies/${id}`);
  },

  async updateVacancy(id: string, data: Partial<Vacancy>): Promise<Vacancy> {
    return fetchAPI<Vacancy>(`/vacancies/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async deleteVacancy(id: string): Promise<void> {
    return fetchAPI<void>(`/vacancies/${id}`, {
      method: 'DELETE',
    });
  },

  // Кандидаты
  async getCandidates(filters?: {
    vacancyId?: string;
    status?: string;
    isArchived?: boolean;
  }): Promise<Candidate[]> {
    const params = new URLSearchParams();
    if (filters?.vacancyId) params.append('vacancyId', filters.vacancyId);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.isArchived !== undefined) {
      params.append('isArchived', String(filters.isArchived));
    }

    const query = params.toString() ? `?${params.toString()}` : '';
    return fetchAPI<Candidate[]>(`/candidates${query}`);
  },

  async getCandidate(id: string): Promise<Candidate> {
    return fetchAPI<Candidate>(`/candidates/${id}`);
  },

  async updateCandidateStatus(
    id: string,
    status: string
  ): Promise<Candidate> {
    return fetchAPI<Candidate>(`/candidates/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  async archiveCandidate(id: string): Promise<Candidate> {
    return fetchAPI<Candidate>(`/candidates/${id}/archive`, {
      method: 'PATCH',
    });
  },

  async unarchiveCandidate(id: string): Promise<Candidate> {
    return fetchAPI<Candidate>(`/candidates/${id}/unarchive`, {
      method: 'PATCH',
    });
  },

  // Аутентификация
  async login(username: string, password: string): Promise<{ token: string }> {
    return fetchAPI<{ token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  },

  async logout(): Promise<void> {
    localStorage.removeItem('authToken');
    localStorage.removeItem('isAuthenticated');
  },
};

// Пример использования в компоненте:
// 
// import { api } from '../services/api';
// 
// const handleSubmit = async (e: React.FormEvent) => {
//   e.preventDefault();
//   try {
//     const vacancy = await api.createVacancy({
//       title,
//       keySkills: skills,
//       questions,
//       botLink // Уникальная ссылка генерируется на фронте
//     });
//     console.log('Вакансия создана:', vacancy);
//     navigate('/vacancies');
//   } catch (error) {
//     console.error('Ошибка создания вакансии:', error);
//   }
// };

