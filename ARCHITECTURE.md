# 🏗️ Архитектура Frontend приложения

## Схема навигации

```
┌─────────────────────────────────────────────────────────┐
│                     Layout (Навигация)                   │
│  ┌───────────────────────────────────────────────────┐  │
│  │  • Кандидаты                                      │  │
│  │  • Вакансии                                       │  │
│  │  • Создать вакансию                               │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                           │
       ┌───────────────────┼───────────────────┐
       │                   │                   │
       ▼                   ▼                   ▼
┌─────────────┐    ┌──────────────┐    ┌─────────────┐
│ Кандидаты   │    │  Вакансии    │    │  Создание   │
│  (список)   │    │   (список)   │    │  вакансии   │
└──────┬──────┘    └──────────────┘    └─────────────┘
       │
       │ Клик по кандидату
       ▼
┌─────────────┐
│  Карточка   │
│  кандидата  │
└─────────────┘
```

## Поток данных (текущий - Mock)

```
┌──────────────────────────────────────────────────────┐
│            src/data/mockData.ts                      │
│  • mockCandidates (8 кандидатов)                    │
│  • mockVacancies (2 вакансии)                       │
│  • mockAnswers (ответы на вопросы)                  │
└────────────────┬─────────────────────────────────────┘
                 │
                 │ import
                 ▼
┌──────────────────────────────────────────────────────┐
│                    Pages                             │
│  • CandidatesList.tsx                               │
│  • CandidateDetails.tsx                             │
│  • VacanciesList.tsx                                │
│  • CreateVacancy.tsx                                │
└──────────────────────────────────────────────────────┘
```

## Поток данных (после интеграции Backend)

```
┌──────────────────────────────────────────────────────┐
│                  Backend API                         │
│  • GET /api/candidates                              │
│  • GET /api/candidates/:id                          │
│  • POST /api/vacancies                              │
│  • GET /api/vacancies                               │
└────────────────┬─────────────────────────────────────┘
                 │
                 │ fetch / axios
                 ▼
┌──────────────────────────────────────────────────────┐
│            src/services/api.ts                       │
│  (создать при интеграции)                           │
└────────────────┬─────────────────────────────────────┘
                 │
                 │ async/await
                 ▼
┌──────────────────────────────────────────────────────┐
│                    Pages                             │
│  • CandidatesList.tsx                               │
│  • CandidateDetails.tsx                             │
│  • VacanciesList.tsx                                │
│  • CreateVacancy.tsx                                │
└──────────────────────────────────────────────────────┘
```

## Компонентная структура

```
App.tsx (Router + Theme)
│
├── Layout.tsx
│   ├── AppBar (Header)
│   ├── Drawer (Sidebar Navigation)
│   └── Main Content Area
│       │
│       ├── Route: /candidates
│       │   └── CandidatesList.tsx
│       │       ├── Search/Filter Controls
│       │       └── MUI Table
│       │           └── Candidate Rows
│       │
│       ├── Route: /candidates/:id
│       │   └── CandidateDetails.tsx
│       │       ├── Personal Info Section
│       │       ├── Resume Section
│       │       ├── Scores Section
│       │       └── Interview Answers Section
│       │
│       ├── Route: /vacancies
│       │   └── VacanciesList.tsx
│       │       └── Grid of Vacancy Cards
│       │
│       └── Route: /vacancies/create
│           └── CreateVacancy.tsx
│               ├── Title Input
│               ├── Skills Chips
│               ├── Questions List
│               └── AI Prompt Input
```

## Типизация данных (TypeScript)

```typescript
// src/types/index.ts

Vacancy
├── id: string
├── title: string
├── keySkills: string[]
├── questions: Question[]
├── aiPrompt: string
├── createdAt: Date
└── isActive: boolean

Question
├── id: string
├── text: string
└── timeLimit: number

Candidate
├── id: string
├── fullName: string
├── vacancyId: string
├── vacancyTitle: string
├── phoneNumber: string
├── telegramNickname: string
├── city: string
├── status: CandidateStatus
├── screeningScore: number | null
├── interviewScore: number | null
├── resumeUrl: string
├── appliedAt: Date
└── answers?: Answer[]

Answer
├── questionId: string
├── questionText: string
├── answer: string
├── wasOnTime: boolean
└── score?: number

CandidateStatus (enum)
├── PENDING
├── SCREENING
├── REJECTED_SCREENING
├── AWAITING_INTERVIEW
├── INTERVIEW_IN_PROGRESS
├── INTERVIEW_COMPLETED
├── REJECTED_INTERVIEW
└── APPROVED
```

## Интеграция с общей архитектурой системы

```
┌─────────────────────────────────────────────────────────────┐
│                     Headhunter / Job Site                   │
│         (Кандидат откликается на вакансию)                  │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    Telegram Bot                             │
│  • Запрашивает личные данные                               │
│  • Принимает резюме                                        │
│  • Проводит интервью                                       │
│  • Отправляет уведомления                                  │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ API calls
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                      Backend                                │
│  • REST API                                                │
│  • База данных (PostgreSQL/MongoDB)                        │
│  • Интеграция с нейросетями                                │
│  • WebSocket для real-time обновлений                      │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ API calls
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              Frontend Web App (ЭТОТ ПРОЕКТ)                │
│  • Просмотр кандидатов                                     │
│  • Создание вакансий                                       │
│  • Анализ результатов                                      │
└─────────────────────────────────────────────────────────────┘
                         │
                         │ используют
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    HR Сотрудники                           │
└─────────────────────────────────────────────────────────────┘
```

## Взаимодействие с нейросетями

```
                    Frontend
                       │
                       │ Создает вакансию с
                       │ (keySkills, aiPrompt)
                       ▼
                    Backend
                       │
                       │ Сохраняет в БД
                       ▼
                  База данных
                       │
                       │ Telegram Bot
                       │ получает резюме
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              AI Model #1: Resume Screening                 │
│  • Анализирует резюме                                      │
│  • Сравнивает с keySkills                                  │
│  • Выставляет screeningScore                               │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ Если прошел
                         ▼
                    Telegram Bot
                         │
                         │ Задает вопросы
                         ▼
┌─────────────────────────────────────────────────────────────┐
│           AI Model #2: Interview Analysis                  │
│  • Анализирует ответы                                      │
│  • Использует aiPrompt для оценки                          │
│  • Выставляет interviewScore                               │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ Результаты
                         ▼
                  База данных
                         │
                         │
                         ▼
                    Frontend
                    (отображает
                     результаты)
```

## Состояния кандидата (State Machine)

```
    PENDING (начало)
        │
        ▼
    SCREENING ──────────► REJECTED_SCREENING (конец)
        │
        ▼
  AWAITING_INTERVIEW
        │
        ▼
 INTERVIEW_IN_PROGRESS
        │
        ▼
 INTERVIEW_COMPLETED ───► REJECTED_INTERVIEW (конец)
        │
        ▼
    APPROVED (конец)
```

## Технологический стек

```
┌─────────────────────────────────────────────────────────────┐
│                    Development                              │
│  • Vite (build tool)                                       │
│  • TypeScript (language)                                   │
│  • ESLint (linter)                                         │
└─────────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                      Core                                   │
│  • React 18 (UI library)                                   │
│  • React Router 6 (routing)                                │
└─────────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                     UI Layer                                │
│  • Material-UI 5 (components)                              │
│  • Emotion (CSS-in-JS)                                     │
│  • MUI Icons (icons)                                       │
└─────────────────────────────────────────────────────────────┘
```

## Рекомендуемые улучшения (для будущего)

1. **State Management** (при усложнении)
   - Redux Toolkit или Zustand
   - Для глобального состояния

2. **Data Fetching** (при интеграции API)
   - React Query или SWR
   - Кеширование и синхронизация

3. **Forms** (если нужна сложная валидация)
   - React Hook Form
   - Yup для схем валидации

4. **Authentication** (обязательно для production)
   - JWT токены
   - Protected Routes
   - Refresh tokens

5. **Real-time Updates**
   - WebSocket подключение
   - Автоматическое обновление статусов

6. **Оптимизация**
   - Code splitting
   - Lazy loading компонентов
   - Memoization

