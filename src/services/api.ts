import {CandidateQuestionAnswer, CandidateVacancyInfo, CreateVacancyRequest, Vacancy} from '../types';

const API_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL;

async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const token = localStorage.getItem('authToken');

    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...(token && {Authorization: `Bearer ${token}`}),
        ...options?.headers,
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({message: 'Network error'}));
        throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
}

// API методы
export const api = {
    async createVacancy(data: CreateVacancyRequest): Promise<boolean> {
        await fetchAPI<{ success: boolean }>('/api/v1/vacancy', {
            method: 'POST',
            body: JSON.stringify(data),
        });
        return true;
    },

    async getVacancies(): Promise<Vacancy[]> {
        return fetchAPI<Vacancy[]>(`/api/v1/vacancies`);
    },

    async getVacancyByID(vacancy_id: string): Promise<Vacancy> {
        return fetchAPI<Vacancy>(`/api/v1/vacancy/${vacancy_id}`);
    },

    async getCandidateVacancies(): Promise<CandidateVacancyInfo[]> {
        return fetchAPI<CandidateVacancyInfo[]>(`/api/v1/candidate-vacancy-infos`);
    },

    async getCandidateVacancyByID(candidate_id: number, vacancy_id: string): Promise<CandidateVacancyInfo> {
        return fetchAPI<CandidateVacancyInfo>(`/api/v1/candidate-vacancy-info/${candidate_id}/${vacancy_id}`);
    },

    async getCandidateVacancyAnswers(candidate_id: number, vacancy_id: string): Promise<CandidateQuestionAnswer[]> {
        return fetchAPI<CandidateQuestionAnswer[]>(`/api/v1/candidate/answers/${candidate_id}/${vacancy_id}`);
    },

    // Аутентификация
    async login(username: string, password: string): Promise<{ token: string }> {
        return fetchAPI<{ token: string }>('/auth/login', {
            method: 'POST',
            body: JSON.stringify({username, password}),
        });
    },
};
