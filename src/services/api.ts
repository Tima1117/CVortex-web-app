import {CandidateQuestionAnswer, CandidateVacancyInfo, CreateVacancyRequest, Empty, Vacancy} from '../types';

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
        console.error(`[API] Error response:`, error);
        throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }

    const contentLength = response.headers.get('content-length');
    if (response.status === 204 || contentLength === '0') {
        return null as T;
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

    async deleteVacancyByID(vacancy_id: string): Promise<void> {
        await fetchAPI<Empty>(`/api/v1/vacancy/${vacancy_id}`, {method: 'DELETE'});
    },

    async getCandidateVacancies(): Promise<CandidateVacancyInfo[]> {
        return fetchAPI<CandidateVacancyInfo[]>(`/api/v1/candidate-vacancy-infos`);
    },

    async getCandidateVacancyByID(candidate_id: number, vacancy_id: string): Promise<CandidateVacancyInfo> {
        return fetchAPI<CandidateVacancyInfo>(`/api/v1/candidate-vacancy-info/${candidate_id}/${vacancy_id}`);
    },

    async archiveCandidateVacancy(candidate_id: number, vacancy_id: string): Promise<CandidateVacancyInfo[]> {
        return fetchAPI<CandidateVacancyInfo[]>(`/api/v1/vacancy/archive`, {
            method: 'POST',
            body: JSON.stringify({
                id: vacancy_id,
                candidate_id: candidate_id
            }),
        });
    },

    async getCandidateVacancyAnswers(candidate_id: number, vacancy_id: string): Promise<CandidateQuestionAnswer[]> {
        return fetchAPI<CandidateQuestionAnswer[]>(`/api/v1/candidate/answers/${candidate_id}/${vacancy_id}`);
    },

    // todo Аутентификация
    async login(username: string, password: string): Promise<{ token: string }> {
        return fetchAPI<{ token: string }>('/auth/login', {
            method: 'POST',
            body: JSON.stringify({username, password}),
        });
    },
};
