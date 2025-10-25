// Типы для работы с вакансиями и кандидатами

export interface Vacancy {
  id: string;
  title: string;
  keySkills: string[];
  questions: Question[];
  botLink: string; // Уникальная ссылка для перехода в Telegram бота
  createdAt: Date;
  isActive: boolean;
}

export interface Question {
  id: string;
  text: string;
  timeLimit: number; // в секундах
  expectedAnswer?: string; // пожелание к ответу для нейросети
}

export interface Candidate {
  id: string;
  fullName: string;
  vacancyId: string;
  vacancyTitle: string;
  phoneNumber: string;
  telegramNickname: string;
  city: string;
  status: CandidateStatus;
  screeningScore: number | null; // баллы от 0 до 100
  interviewScore: number | null; // баллы от 0 до 100
  resumeUrl: string;
  appliedAt: Date;
  answers?: Answer[];
  isArchived: boolean; // Архивирован ли кандидат
}

export interface Answer {
  questionId: string;
  questionText: string;
  answer: string;
  wasOnTime: boolean;
  score?: number;
}

export enum CandidateStatus {
  PENDING = 'pending', // Ожидает скрининга
  SCREENING = 'screening', // Резюме анализируется
  REJECTED_SCREENING = 'rejected_screening', // Отклонен на этапе скрининга
  AWAITING_INTERVIEW = 'awaiting_interview', // Ожидает интервью
  INTERVIEW_IN_PROGRESS = 'interview_in_progress', // Проходит интервью
  INTERVIEW_COMPLETED = 'interview_completed', // Интервью завершено
  REJECTED_INTERVIEW = 'rejected_interview', // Отклонен после интервью
  APPROVED = 'approved' // Одобрен
}

export interface CreateVacancyRequest {
  title: string;
  keySkills: string[];
  questions: Question[];
}

// Утилитарные функции для статусов
export const getStatusLabel = (status: CandidateStatus): string => {
  const labels: Record<CandidateStatus, string> = {
    [CandidateStatus.PENDING]: 'Ожидает',
    [CandidateStatus.SCREENING]: 'Анализ резюме',
    [CandidateStatus.REJECTED_SCREENING]: 'Отклонен (скрининг)',
    [CandidateStatus.AWAITING_INTERVIEW]: 'Ожидает интервью',
    [CandidateStatus.INTERVIEW_IN_PROGRESS]: 'Проходит интервью',
    [CandidateStatus.INTERVIEW_COMPLETED]: 'Интервью завершено',
    [CandidateStatus.REJECTED_INTERVIEW]: 'Отклонен (интервью)',
    [CandidateStatus.APPROVED]: 'Одобрен'
  };
  return labels[status];
};

export const getStatusColor = (status: CandidateStatus): 'default' | 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success' => {
  const colors: Record<CandidateStatus, 'default' | 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success'> = {
    [CandidateStatus.PENDING]: 'default',
    [CandidateStatus.SCREENING]: 'info',
    [CandidateStatus.REJECTED_SCREENING]: 'error',
    [CandidateStatus.AWAITING_INTERVIEW]: 'warning',
    [CandidateStatus.INTERVIEW_IN_PROGRESS]: 'primary',
    [CandidateStatus.INTERVIEW_COMPLETED]: 'secondary',
    [CandidateStatus.REJECTED_INTERVIEW]: 'error',
    [CandidateStatus.APPROVED]: 'success'
  };
  return colors[status];
};

export const getScoreColor = (score: number | null): string => {
  if (score === null) return '#9e9e9e';
  if (score >= 80) return '#4caf50'; // зеленый
  if (score >= 60) return '#ff9800'; // оранжевый
  return '#f44336'; // красный
};

