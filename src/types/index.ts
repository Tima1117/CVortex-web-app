// Типы для работы с вакансиями и кандидатами

// Сначала определим типы
export interface CreateQuestionRequest {
    content: string;
    reference: string;
    time_limit: number;
}

export interface CreateVacancyRequest {
    id: string;
    title: string;
    key_requirements: string[];
    questions: CreateQuestionRequest[];
}

export interface Question {
    id: number;
    vacancy_id: string;
    content: string;
    reference: string;
    time_limit: number;
    position: number;
}

export interface Vacancy {
    id: string;
    title: string;
    key_requirements: string[];
    questions: Question[];
    created_at: Date;
}


export interface CandidateVacancyInfo {
    candidate: Candidate;
    vacancy: Vacancy;
    meta: Meta;
    resume_screening: ResumeScreening;
}

export interface ResumeScreening {
    score: number;

}

export interface Candidate {
    id: number;
    telegram_id: string;
    full_name: string;
    phone: string;
    city: string;
    created_at: Date;
}

export interface Meta {
    candidate_id: number;
    vacancy_id: string;
    status: string;
    interview_score: number;
    updated_at: Date;
}

export interface CandidateQuestionAnswer {
    question: Question;
    answer: Answer;
}

export interface Question {
    id: number;
    content: string;
    reference: string;
    time_limit: number;
    position: number;
}

export interface Answer {
    id: number;
    content: string;
    score: number;
    time_taken: number;
}

export const getStatusLabel = (status: string): string => {
    const statusLabels: Record<string, string> = {
        'screening_ok': 'Скрининг резюме пройден',
        'screening_failed': 'Скрининг резюме не пройден',
        'interview_ok': 'Интервью пройдено',
        'interview_failed': 'Интервью не пройдено',
    };

    return statusLabels[status] || status;
};

export const getStatusColor = (status: string): "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning" => {
    const statusColors: Record<string, "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning"> = {
        'screening_ok': 'success',
        'interview_ok': 'success',
        'screening_failed': 'error',
        'interview_failed': 'error',
    };

    return statusColors[status] || 'default';
};

export const getScoreColor = (score: number): string => {
    if (score >= 90) return '#4caf50'; // зеленый
    if (score >= 70) return '#8bc34a'; // светло-зеленый
    if (score >= 50) return '#ffc107'; // желтый
    if (score >= 30) return '#ff9800'; // оранжевый
    return '#f44336'; // красный
};

export enum CandidateStatus {
    SCREENING_OK = 'screening_ok',
    SCREENING_FAILED = 'screening_failed',
    INTERVIEW_OK = 'interview_ok',
    INTERVIEW_FAILED = 'interview_failed',
}

