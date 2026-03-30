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

    // ========== Новые методы для массового скрининга ==========

    /**
     * Создание кандидата
     * @returns Promise с объектом кандидата (содержит id)
     * @param fullName
     */
    async createCandidate(fullName: string): Promise<{ id: number }> {
        const apiData = {
            full_name: fullName,
            type: 2,
        };

        return fetchAPI<{ id: number }>('/api/bot/v1/candidate', {
            method: 'POST',
            body: JSON.stringify(apiData),
        });
    },

    /**
     * Запуск процесса скрининга для кандидата и вакансии
     * POST /api/bot/v1/screening/process
     */
    async processScreening(candidateId: number, vacancyId: string): Promise<void> {
        await fetchAPI<void>('/api/bot/v1/screening/process', {
            method: 'POST',
            body: JSON.stringify({
                candidate_id: candidateId,
                vacancy_id: vacancyId,
            }),
        });
    },


    async uploadResume(candidateId: number, vacancyId: string, file: File): Promise<void> {
        // 1. Получаем presigned URL для загрузки
        const presignedData = await fetchAPI<{
            upload_url: string
        }>('/api/v1/candidates/upload-url', {
            method: 'POST',
            body: JSON.stringify({
                candidate_id: candidateId,
                vacancy_id: vacancyId,
            }),
        });

        // 2. Загружаем файл по presigned URL
        // Предполагаем, что используется PUT-запрос (наиболее частый случай для S3)
        const uploadResponse = await fetch(presignedData.upload_url, {
            method: 'PUT',
            body: file,
            headers: {
                'Content-Type': file.type,
            },
        });

        if (!uploadResponse.ok) {
            // Если сервер возвращает детали ошибки, можно попытаться прочитать
            const errorText = await uploadResponse.text().catch(() => 'No error details');
            throw new Error(`Failed to upload file: ${uploadResponse.status} ${uploadResponse.statusText} - ${errorText}`);
        }

        // При необходимости можно обработать успешный ответ (например, вернуть что-то)
        return;
    }
};