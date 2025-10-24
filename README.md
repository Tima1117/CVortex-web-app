# CVortex - HR Платформа

Веб-приложение для автоматизации процесса найма: скрининг резюме и первичное интервью с кандидатами через Telegram-бота.

## Функции основные

- Сортировка по всем полям в таблице кандидатов
- Архивация кандидатов
- Простая авторизация (готова к интеграции с backend)
- Цветовая схема: основной #0088CC, текст #333333
- Полностью адаптивный дизайн

## Старт

### Установка зависимостей

```bash
npm install
```

### Запуск в режиме разработки

```bash
npm run dev
```

Приложение откроется по адресу: `http://localhost:3000`

### Сборка для production

```bash
npm run build
```

### Предварительный просмотр production-сборки

```bash
npm run preview
```

## Функциональность

### 1. Управление вакансиями
- **Создание вакансии** - форма с полями:
  - Название вакансии
  - Ключевые навыки для скрининга
  - Вопросы для интервью с временными ограничениями
  - Инструкции для нейросети
- **Просмотр списка вакансий** - карточки с информацией о всех вакансиях

### 2. Управление кандидатами
- **Таблица кандидатов** с:
  - Фильтрацией по ФИО, вакансии, статусу
  - Сортировкой по всем полям (клик на заголовок)
  - Архивацией/разархивацией кандидатов
  - Чекбоксом для показа архивных кандидатов
- **Сортировка работает так**:
  - 1 клик: сортировка по возрастанию ↑
  - 2 клик: сортировка по убыванию ↓
  - 3 клик: отключение сортировки (возврат к дате)
  - По умолчанию: сортировка по дате (новые сначала)
- **Карточка кандидата** с информацией:
  - Личные данные (ФИО, телефон, Telegram, город)
  - Резюме (файл PDF)
  - Результаты скрининга
  - Результаты интервью
  - Ответы на вопросы
  - Кнопка архивации

### 3. Авторизация
- **Простая страница входа** (`/login`)
- Кнопка "Войти" без полей (готова к интеграции с backend)
- Защита всех маршрутов через `ProtectedRoute`
- Кнопка "Выйти" в боковом меню
- Состояние хранится в `localStorage`

### 4. Статусы кандидатов
- `pending` - Ожидает скрининга
- `screening` - Резюме анализируется
- `rejected_screening` - Отклонен на этапе скрининга
- `awaiting_interview` - Ожидает интервью
- `interview_in_progress` - Проходит интервью
- `interview_completed` - Интервью завершено
- `rejected_interview` - Отклонен после интервью
- `approved` - Одобрен

## 🔌 Интеграция с Backend

### API Endpoints

Приложение использует следующие эндпоинты (сейчас работает на заглушках):

#### Вакансии

**GET /api/vacancies**
- Получение списка всех вакансий
- Ответ:
```json
[
  {
    "id": "string",
    "title": "string",
    "keySkills": ["string"],
    "questions": [
      {
        "id": "string",
        "text": "string",
        "timeLimit": number
      }
    ],
    "aiPrompt": "string",
    "createdAt": "ISO date string",
    "isActive": boolean
  }
]
```

**POST /api/vacancies**
- Создание новой вакансии
- Тело запроса:
```json
{
  "title": "string",
  "keySkills": ["string"],
  "questions": [
    {
      "text": "string",
      "timeLimit": number
    }
  ],
  "aiPrompt": "string"
}
```
- Ответ: созданная вакансия с ID

**GET /api/vacancies/:id**
- Получение деталей вакансии
- Ответ: объект вакансии

**PUT /api/vacancies/:id**
- Обновление вакансии
- Тело запроса: аналогично POST

**DELETE /api/vacancies/:id**
- Удаление вакансии

#### Кандидаты

**GET /api/candidates**
- Получение списка всех кандидатов
- Параметры запроса (опционально):
  - `status` - фильтр по статусу
  - `vacancyId` - фильтр по вакансии
  - `search` - поиск по ФИО
- Ответ:
```json
[
  {
    "id": "string",
    "fullName": "string",
    "vacancyId": "string",
    "vacancyTitle": "string",
    "phoneNumber": "string",
    "telegramNickname": "string",
    "city": "string",
    "status": "pending|screening|rejected_screening|awaiting_interview|interview_in_progress|interview_completed|rejected_interview|approved",
    "screeningScore": number | null,
    "interviewScore": number | null,
    "resumeUrl": "string",
    "appliedAt": "ISO date string",
    "isArchived": boolean,
    "answers": [
      {
        "questionId": "string",
        "questionText": "string",
        "answer": "string",
        "wasOnTime": boolean,
        "score": number
      }
    ]
  }
]
```

**GET /api/candidates/:id**
- Получение детальной информации о кандидате
- Ответ: объект кандидата

**PATCH /api/candidates/:id/status**
- Обновление статуса кандидата
- Тело запроса:
```json
{
  "status": "string"
}
```

**GET /api/candidates/:id/resume**
- Получение файла резюме
- Ответ: PDF файл

**PATCH /api/candidates/:id/archive**
- Архивация/разархивация кандидата
- Тело запроса:
```json
{
  "isArchived": boolean
}
```

#### Авторизация

**POST /api/auth/login**
- Авторизация пользователя
- Тело запроса:
```json
{
  "email": "string",
  "password": "string"
}
```
- Ответ:
```json
{
  "token": "string",
  "user": {
    "id": "string",
    "email": "string",
    "name": "string"
  }
}
```

**GET /api/auth/verify**
- Проверка токена
- Headers: `Authorization: Bearer <token>`
- Ответ:
```json
{
  "valid": true
}
```

**POST /api/auth/logout**
- Выход из системы
- Headers: `Authorization: Bearer <token>`

#### Webhook для обновлений от Telegram-бота

Frontend должен подписаться на обновления статусов кандидатов через WebSocket или использовать polling.

**WebSocket: ws://your-backend/api/ws/candidates**
- Подписка на обновления в реальном времени
- Формат сообщения:
```json
{
  "type": "candidate_update",
  "candidateId": "string",
  "status": "string",
  "screeningScore": number | null,
  "interviewScore": number | null
}
```

### Подключение к Backend

#### Шаг 1: Создайте API клиент

Создайте файл `src/services/api.ts`:

```typescript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

export const api = {
  // Вакансии
  getVacancies: async () => {
    const response = await fetch(`${API_BASE_URL}/vacancies`);
    return response.json();
  },
  
  createVacancy: async (data: CreateVacancyRequest) => {
    const response = await fetch(`${API_BASE_URL}/vacancies`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return response.json();
  },
  
  // Кандидаты
  getCandidates: async (filters?: { status?: string; vacancyId?: string; search?: string }) => {
    const params = new URLSearchParams(filters as any);
    const response = await fetch(`${API_BASE_URL}/candidates?${params}`);
    return response.json();
  },
  
  getCandidate: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/candidates/${id}`);
    return response.json();
  },
  
  updateCandidateStatus: async (id: string, status: string) => {
    const response = await fetch(`${API_BASE_URL}/candidates/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    return response.json();
  },
  
  // Архивация
  archiveCandidate: async (id: string, isArchived: boolean) => {
    const response = await fetch(`${API_BASE_URL}/candidates/${id}/archive`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isArchived })
    });
    return response.json();
  },
  
  // Авторизация
  login: async (email: string, password: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    return response.json();
  },
  
  verifyToken: async (token: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/verify`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.json();
  }
};
```

#### Шаг 2: Создайте файл переменных окружения

Создайте файл `.env` в корне проекта:

```
VITE_API_BASE_URL=http://localhost:8000/api
```

Для production:
```
VITE_API_BASE_URL=https://your-production-api.com/api
```

#### Шаг 3: Замените mock данные на реальные API вызовы

**В файле `src/pages/CandidatesList.tsx`:**

Замените:
```typescript
import { mockCandidates } from '../data/mockData';
```

На:
```typescript
import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Candidate } from '../types';

// Внутри компонента:
const [candidates, setCandidates] = useState<Candidate[]>([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  const fetchCandidates = async () => {
    try {
      const data = await api.getCandidates();
      setCandidates(data);
    } catch (error) {
      console.error('Ошибка загрузки кандидатов:', error);
    } finally {
      setLoading(false);
    }
  };
  fetchCandidates();
}, []);

// И используйте candidates вместо mockCandidates
```

**В файле `src/pages/CandidateDetails.tsx`:**

Замените:
```typescript
const candidate = mockCandidates.find((c) => c.id === id);
```

На:
```typescript
const [candidate, setCandidate] = useState<Candidate | null>(null);
const [loading, setLoading] = useState(true);

useEffect(() => {
  const fetchCandidate = async () => {
    try {
      const data = await api.getCandidate(id!);
      setCandidate(data);
    } catch (error) {
      console.error('Ошибка загрузки кандидата:', error);
    } finally {
      setLoading(false);
    }
  };
  fetchCandidate();
}, [id]);
```

**В файле `src/pages/CreateVacancy.tsx`:**

В функции `handleSubmit` замените:
```typescript
console.log('Создание вакансии:', { ... });
```

На:
```typescript
try {
  await api.createVacancy({ title, keySkills: skills, questions, aiPrompt });
  setShowSuccess(true);
  setTimeout(() => {
    navigate('/vacancies');
  }, 2000);
} catch (error) {
  console.error('Ошибка создания вакансии:', error);
  // Показать ошибку пользователю
}
```

**В файле `src/pages/VacanciesList.tsx`:**

Замените:
```typescript
import { mockVacancies } from '../data/mockData';
```

На:
```typescript
import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Vacancy } from '../types';

// Внутри компонента:
const [vacancies, setVacancies] = useState<Vacancy[]>([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  const fetchVacancies = async () => {
    try {
      const data = await api.getVacancies();
      setVacancies(data);
    } catch (error) {
      console.error('Ошибка загрузки вакансий:', error);
    } finally {
      setLoading(false);
    }
  };
  fetchVacancies();
}, []);
```

#### Шаг 4: Подключите WebSocket для real-time обновлений

Создайте файл `src/services/websocket.ts`:

```typescript
export const connectWebSocket = (onMessage: (data: any) => void) => {
  const ws = new WebSocket('ws://your-backend/api/ws/candidates');
  
  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    onMessage(data);
  };
  
  ws.onerror = (error) => {
    console.error('WebSocket error:', error);
  };
  
  return ws;
};
```

Используйте в компонентах для обновления данных в реальном времени.

#### Шаг 5: Настройте CORS на Backend

Убедитесь, что backend разрешает запросы с фронтенда:

```python
# Пример для FastAPI
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://your-frontend.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⣿⣿⠿⠻⠛⠛⠻⢿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⣿⠁⠄⠄⠄⠄⠄⠄⠘⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣏⢻⣿⣿⣿⣿⡀⢠⣶⡆⢠⣶⡄⢀⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣦⠻⣿⣿⣿⣋⡈⠉⠡⠎⠉⠁⣈⣿⣿⣿⣿⠋⣼⣿⣿
⣿⣿⣿⣿⣦⠙⢿⣿⣿⡏⢦⣀⣀⣠⢪⣿⣿⣿⠟⢡⣾⣿⣿⣿
⣿⣿⣿⣿⣿⣷⣄⠙⠿⣷⣌⠉⠉⢁⣾⡿⠟⢁⣴⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⡟⢛⣷⣄⡈⢙⡻⠿⡟⠉⣂⣴⡛⢿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⡔⡿⢟⣛⡫⠥⢈⣑⡠⠭⣛⡻⢿⢸⣿⣿⣿⣿⣿
⣿⣄⣠⣄⣠⣆⠩⣽⣶⣶⣿⣿⣿⣿⣷⣶⡮⢁⣤⣀⣄⣄⣄⣿
⣿⣿⣿⣿⣿⣿⣀⣼⣿⣿⣿⣿⣿⣿⣿⣿⣅⣸⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿

## Структура проекта

```
CVortex-web-app/
├── public/
│   ├── Logo.svg             # Логотип приложения
│   └── Alt_logo.svg         # Альтернативный логотип
├── src/
│   ├── components/          # Переиспользуемые компоненты
│   │   ├── Layout.tsx       # Основной layout с навигацией
│   │   └── ProtectedRoute.tsx  # Защита маршрутов
│   ├── data/                # Mock данные (удалить после интеграции)
│   │   └── mockData.ts
│   ├── pages/               # Страницы приложения
│   │   ├── Login.tsx        # Страница входа
│   │   ├── CandidatesList.tsx
│   │   ├── CandidateDetails.tsx
│   │   ├── CreateVacancy.tsx
│   │   └── VacanciesList.tsx
│   ├── services/            # API сервисы (создать при интеграции)
│   │   ├── api.ts
│   │   └── websocket.ts
│   ├── types/               # TypeScript типы
│   │   └── index.ts
│   ├── App.tsx              # Главный компонент
│   ├── main.tsx             # Точка входа
│   └── index.css            # Глобальные стили
├── package.json
├── tsconfig.json
├── vite.config.ts
├── README.md
├── QUICKSTART.md            # Быстрый старт
├── INSTALLATION.md          # Детальная установка
├── UPDATE_NOTES.md          # Заметки по обновлениям
├── NEW_FEATURES.md          # Описание новых функций
└── DESIGN_UPDATE.md         # Обновления дизайна
```

## Технологии

- **React 18** - UI библиотека
- **TypeScript** - типизация
- **Vite** - сборщик и dev-сервер
- **React Router** - роутинг
- **Material-UI (MUI)** - компоненты UI
- **Emotion** - CSS-in-JS (используется MUI)

## Дизайн

Приложение использует Material-UI для современного и профессионального внешнего вида:
- Адаптивный дизайн для мобильных устройств
- Боковая навигация с иконками
- Цветовая индикация статусов и оценок
- Карточки и таблицы для представления данных

## Безопасность

При подключении к реальному backend добавьте:
- Аутентификацию (JWT токены)
- Защиту роутов
- Валидацию форм
- Обработку ошибок API

## Дополнительная документация

- **QUICKSTART.md** - быстрый старт (3 команды для запуска)
- **INSTALLATION.md** - детальная инструкция по установке
- **UPDATE_NOTES.md** - заметки по обновлениям и интеграции
- **NEW_FEATURES.md** - описание новых функций (сортировка, архивация, авторизация)
- **DESIGN_UPDATE.md** - обновления дизайна (закругленные углы, цвета)
- **ARCHITECTURE.md** - архитектура приложения
- **PROJECT_SUMMARY.md** - итоговое описание проекта

## Ссылки

- **GitHub**: [https://github.com/Tima1117/CVortex-web-app](https://github.com/Tima1117/CVortex-web-app)
