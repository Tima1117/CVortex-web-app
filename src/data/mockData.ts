import { Vacancy, Candidate, CandidateStatus, Answer } from '../types';

// Mock данные для вакансий
export const mockVacancies: Vacancy[] = [
  {
    id: '1',
    title: 'Frontend разработчик (React)',
    keySkills: ['React', 'TypeScript', 'JavaScript', 'HTML/CSS', 'REST API'],
    questions: [
      { id: 'q1', text: 'Расскажите о своем опыте работы с React', timeLimit: 60 },
      { id: 'q2', text: 'Какие методы оптимизации производительности React-приложений вы знаете?', timeLimit: 60 },
      { id: 'q3', text: 'Объясните разницу между useMemo и useCallback', timeLimit: 60 }
    ],
    aiPrompt: 'Кандидат должен иметь опыт коммерческой разработки на React от 2 лет, знать TypeScript, понимать принципы оптимизации и работы с состоянием.',
    createdAt: new Date('2024-01-15'),
    isActive: true
  },
  {
    id: '2',
    title: 'Backend разработчик (Python)',
    keySkills: ['Python', 'Django', 'PostgreSQL', 'Docker', 'REST API'],
    questions: [
      { id: 'q4', text: 'Расскажите о вашем опыте с Django', timeLimit: 60 },
      { id: 'q5', text: 'Как вы оптимизируете запросы к базе данных?', timeLimit: 60 },
      { id: 'q6', text: 'Опишите архитектуру микросервисов', timeLimit: 60 }
    ],
    aiPrompt: 'Ищем кандидата с опытом разработки backend на Python от 3 лет, знанием Django/FastAPI, опытом работы с PostgreSQL и понимаем архитектуры микросервисов.',
    createdAt: new Date('2024-01-10'),
    isActive: true
  }
];

// Mock ответы на вопросы
const mockAnswers1: Answer[] = [
  {
    questionId: 'q1',
    questionText: 'Расскажите о своем опыте работы с React',
    answer: 'Я работаю с React уже 3 года. Разрабатывал SPA приложения, использовал Redux и Context API для управления состоянием...',
    wasOnTime: true,
    score: 85
  },
  {
    questionId: 'q2',
    questionText: 'Какие методы оптимизации производительности React-приложений вы знаете?',
    answer: 'Использование React.memo, useMemo, useCallback, code splitting с React.lazy, виртуализация списков...',
    wasOnTime: true,
    score: 90
  },
  {
    questionId: 'q3',
    questionText: 'Объясните разницу между useMemo и useCallback',
    answer: '',
    wasOnTime: false,
    score: 0
  }
];

const mockAnswers2: Answer[] = [
  {
    questionId: 'q1',
    questionText: 'Расскажите о своем опыте работы с React',
    answer: 'Изучал React на курсах, делал пет-проекты...',
    wasOnTime: true,
    score: 45
  },
  {
    questionId: 'q2',
    questionText: 'Какие методы оптимизации производительности React-приложений вы знаете?',
    answer: 'Не знаю',
    wasOnTime: true,
    score: 10
  },
  {
    questionId: 'q3',
    questionText: 'Объясните разницу между useMemo и useCallback',
    answer: '',
    wasOnTime: false,
    score: 0
  }
];

// Mock данные для кандидатов
export const mockCandidates: Candidate[] = [
  {
    id: '1',
    fullName: 'Иванов Иван Иванович',
    vacancyId: '1',
    vacancyTitle: 'Frontend разработчик (React)',
    phoneNumber: '+7 (999) 123-45-67',
    telegramNickname: '@ivanov_ivan',
    city: 'Москва',
    status: CandidateStatus.APPROVED,
    screeningScore: 95,
    interviewScore: 85,
    resumeUrl: 'https://example.com/resumes/ivanov.pdf',
    appliedAt: new Date('2024-01-20'),
    answers: mockAnswers1,
    isArchived: false
  },
  {
    id: '2',
    fullName: 'Петрова Мария Сергеевна',
    vacancyId: '1',
    vacancyTitle: 'Frontend разработчик (React)',
    phoneNumber: '+7 (999) 234-56-78',
    telegramNickname: '@maria_petrova',
    city: 'Санкт-Петербург',
    status: CandidateStatus.INTERVIEW_COMPLETED,
    screeningScore: 88,
    interviewScore: 92,
    resumeUrl: 'https://example.com/resumes/petrova.pdf',
    appliedAt: new Date('2024-01-21'),
    answers: mockAnswers1,
    isArchived: false
  },
  {
    id: '3',
    fullName: 'Сидоров Петр Александрович',
    vacancyId: '2',
    vacancyTitle: 'Backend разработчик (Python)',
    phoneNumber: '+7 (999) 345-67-89',
    telegramNickname: '@petr_sidorov',
    city: 'Новосибирск',
    status: CandidateStatus.SCREENING,
    screeningScore: null,
    interviewScore: null,
    resumeUrl: 'https://example.com/resumes/sidorov.pdf',
    appliedAt: new Date('2024-01-22'),
    isArchived: false
  },
  {
    id: '4',
    fullName: 'Кузнецова Анна Дмитриевна',
    vacancyId: '1',
    vacancyTitle: 'Frontend разработчик (React)',
    phoneNumber: '+7 (999) 456-78-90',
    telegramNickname: '@anna_kuznetsova',
    city: 'Казань',
    status: CandidateStatus.REJECTED_SCREENING,
    screeningScore: 42,
    interviewScore: null,
    resumeUrl: 'https://example.com/resumes/kuznetsova.pdf',
    appliedAt: new Date('2024-01-22'),
    isArchived: false
  },
  {
    id: '5',
    fullName: 'Смирнов Алексей Владимирович',
    vacancyId: '1',
    vacancyTitle: 'Frontend разработчик (React)',
    phoneNumber: '+7 (999) 567-89-01',
    telegramNickname: '@alex_smirnov',
    city: 'Екатеринбург',
    status: CandidateStatus.AWAITING_INTERVIEW,
    screeningScore: 78,
    interviewScore: null,
    resumeUrl: 'https://example.com/resumes/smirnov.pdf',
    appliedAt: new Date('2024-01-23'),
    isArchived: false
  },
  {
    id: '6',
    fullName: 'Попова Елена Игоревна',
    vacancyId: '1',
    vacancyTitle: 'Frontend разработчик (React)',
    phoneNumber: '+7 (999) 678-90-12',
    telegramNickname: '@elena_popova',
    city: 'Москва',
    status: CandidateStatus.INTERVIEW_IN_PROGRESS,
    screeningScore: 91,
    interviewScore: null,
    resumeUrl: 'https://example.com/resumes/popova.pdf',
    appliedAt: new Date('2024-01-23'),
    isArchived: false
  },
  {
    id: '7',
    fullName: 'Новиков Дмитрий Андреевич',
    vacancyId: '2',
    vacancyTitle: 'Backend разработчик (Python)',
    phoneNumber: '+7 (999) 789-01-23',
    telegramNickname: '@dmitry_novikov',
    city: 'Санкт-Петербург',
    status: CandidateStatus.REJECTED_INTERVIEW,
    screeningScore: 75,
    interviewScore: 48,
    resumeUrl: 'https://example.com/resumes/novikov.pdf',
    appliedAt: new Date('2024-01-24'),
    answers: mockAnswers2,
    isArchived: false
  },
  {
    id: '8',
    fullName: 'Федорова Ольга Павловна',
    vacancyId: '2',
    vacancyTitle: 'Backend разработчик (Python)',
    phoneNumber: '+7 (999) 890-12-34',
    telegramNickname: '@olga_fedorova',
    city: 'Красноярск',
    status: CandidateStatus.PENDING,
    screeningScore: null,
    interviewScore: null,
    resumeUrl: 'https://example.com/resumes/fedorova.pdf',
    appliedAt: new Date('2024-01-25'),
    isArchived: false
  }
];

// ░░░░░░▄█▀█▄░░░░░░░░░░░░░░░
// ░▄█▀▀▀▀░░░░▀█▄▄▄▄▄▄▄░░░░░░
// █▀░░░░░░░░░░░░░░░░░▀█░░░░░
// ▀▄░▄░░░░░░░░░░░░░░░▄█░░░░░
// ░█████▄▄▄▄▄██▄▄▄█▀▀█░░░░░░
// ░█▀█░░░░▀░░░░░▀░░░░█▀▀▀▀▀█
// ░█░███▄▄▄▄░░░▄▄▄▄▄██▀▀██░█
// ░█░███░████▀████░███░░█░░█
// ░█▄███░████░████░███░░█░█▀
// ░░░███░████░████░███░░█░█░
// ░░░███░████░████░███▄▄█░█░
// ░░░███░████░████░███░░░▄█░
// ░░░███░████░████░███▀▀▀▀░░
// ░░▄███▄████░████▄███▄░░░░░
// ░░███▀███████████▀███░░░░░
