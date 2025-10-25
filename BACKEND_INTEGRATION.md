# Интеграция с Backend

## Формат уникальной ссылки для Telegram бота

При создании вакансии на фронтенде генерируется уникальная ссылка следующего формата:

```
https://t.me/Human_resourse_bot?start={UUID}
```

Где `{UUID}` - это уникальный идентификатор в формате UUID v4, например:
```
a1b2c3d4-e5f6-4789-a0b1-c2d3e4f5a6b7
```

### Полный пример ссылки:
```
https://t.me/Human_resourse_bot?start=a1b2c3d4-e5f6-4789-a0b1-c2d3e4f5a6b7
```

## Как это работает

1. **Фронтенд** генерирует UUID и создает ссылку при создании вакансии
2. **Фронтенд** отправляет данные вакансии вместе с `botLink` на бэкенд
3. **Бэкенд** сохраняет вакансию с этой ссылкой в базе данных
4. **HR** отправляет эту ссылку кандидату
5. **Кандидат** переходит по ссылке и попадает в Telegram бота
6. **Telegram бот** получает UUID из параметра `start` и определяет вакансию
7. **Бэкенд** использует UUID для связи кандидата с вакансией

## Структура запроса на создание вакансии

### POST `/api/vacancies`

**Request Body:**
```json
{
  "title": "Frontend разработчик (React)",
  "keySkills": [
    "React",
    "TypeScript",
    "JavaScript"
  ],
  "questions": [
    {
      "id": "1",
      "text": "Расскажите о своем опыте работы с React",
      "timeLimit": 60,
      "expectedAnswer": "Ожидаем опыт коммерческой разработки от 2 лет"
    }
  ],
  "botLink": "https://t.me/Human_resourse_bot?start=a1b2c3d4-e5f6-4789-a0b1-c2d3e4f5a6b7"
}
```

**Response:**
```json
{
  "id": "vac_123",
  "title": "Frontend разработчик (React)",
  "keySkills": ["React", "TypeScript", "JavaScript"],
  "questions": [...],
  "botLink": "https://t.me/Human_resourse_bot?start=a1b2c3d4-e5f6-4789-a0b1-c2d3e4f5a6b7",
  "createdAt": "2024-01-15T10:00:00Z",
  "isActive": true
}
```

## Извлечение UUID из ссылки на бэкенде

### Python (FastAPI/Django):
```python
from urllib.parse import urlparse, parse_qs

def extract_uuid_from_bot_link(bot_link: str) -> str:
    """Извлекает UUID из ссылки на Telegram бота"""
    parsed = urlparse(bot_link)
    params = parse_qs(parsed.query)
    return params.get('start', [None])[0]

# Пример использования
bot_link = "https://t.me/Human_resourse_bot?start=a1b2c3d4-e5f6-4789-a0b1-c2d3e4f5a6b7"
uuid = extract_uuid_from_bot_link(bot_link)
# uuid = "a1b2c3d4-e5f6-4789-a0b1-c2d3e4f5a6b7"
```

### JavaScript/TypeScript (Node.js):
```typescript
function extractUuidFromBotLink(botLink: string): string | null {
  const url = new URL(botLink);
  return url.searchParams.get('start');
}

// Пример использования
const botLink = "https://t.me/Human_resourse_bot?start=a1b2c3d4-e5f6-4789-a0b1-c2d3e4f5a6b7";
const uuid = extractUuidFromBotLink(botLink);
// uuid = "a1b2c3d4-e5f6-4789-a0b1-c2d3e4f5a6b7"
```

## Обработка в Telegram боте

Когда кандидат переходит по ссылке, Telegram бот получает команду `/start` с параметром:

```python
from aiogram import Bot, Dispatcher, types

@dp.message_handler(commands=['start'])
async def cmd_start(message: types.Message):
    # Получаем UUID из команды
    args = message.get_args()  # Возвращает UUID
    
    if args:
        # args = "a1b2c3d4-e5f6-4789-a0b1-c2d3e4f5a6b7"
        vacancy = await get_vacancy_by_uuid(args)
        
        if vacancy:
            # Начинаем интервью с кандидатом
            await start_interview(message.from_user.id, vacancy)
        else:
            await message.answer("Вакансия не найдена")
    else:
        await message.answer("Добро пожаловать!")
```

## База данных

### Рекомендуемая структура таблицы вакансий:

```sql
CREATE TABLE vacancies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    key_skills JSONB NOT NULL,
    questions JSONB NOT NULL,
    bot_link VARCHAR(500) UNIQUE NOT NULL,  -- Уникальная ссылка
    bot_uuid UUID UNIQUE NOT NULL,          -- Извлеченный UUID для быстрого поиска
    created_at TIMESTAMP DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE
);

-- Индекс для быстрого поиска по UUID из ссылки
CREATE INDEX idx_vacancies_bot_uuid ON vacancies(bot_uuid);
```

### Связь кандидата с вакансией:

```sql
CREATE TABLE candidates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vacancy_id UUID REFERENCES vacancies(id),
    telegram_user_id BIGINT NOT NULL,
    full_name VARCHAR(255),
    phone_number VARCHAR(20),
    status VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW()
);
```

## Пример полного flow

1. **HR создает вакансию на фронтенде**
   - Фронтенд генерирует: `https://t.me/Human_resourse_bot?start=abc-123-def`
   - Отправляет POST запрос на `/api/vacancies` с этой ссылкой

2. **Бэкенд сохраняет вакансию**
   ```python
   vacancy = Vacancy(
       title=data.title,
       key_skills=data.keySkills,
       questions=data.questions,
       bot_link=data.botLink,
       bot_uuid=extract_uuid_from_bot_link(data.botLink)
   )
   db.add(vacancy)
   db.commit()
   ```

3. **HR отправляет ссылку кандидату**
   - Через email, WhatsApp, или любой другой канал

4. **Кандидат переходит по ссылке**
   - Открывается Telegram бот с параметром `start=abc-123-def`

5. **Бот обрабатывает запрос**
   ```python
   @dp.message_handler(commands=['start'])
   async def cmd_start(message: types.Message):
       uuid = message.get_args()
       vacancy = await db.get_vacancy_by_uuid(uuid)
       
       # Создаем запись кандидата
       candidate = Candidate(
           vacancy_id=vacancy.id,
           telegram_user_id=message.from_user.id,
           status="pending"
       )
       await db.save(candidate)
       
       # Начинаем интервью
       await start_interview(message, vacancy)
   ```

## Важные замечания

1. **UUID должен быть уникальным** для каждой вакансии
2. **Ссылка должна быть сохранена** в базе данных вместе с вакансией
3. **Бот должен валидировать** UUID перед началом интервью
4. **Один UUID = одна вакансия** (связь 1:1)
5. **Несколько кандидатов** могут использовать одну и ту же ссылку (связь 1:N)

## Тестирование

Для тестирования можно использовать mock данные:

```typescript
const testVacancy = {
  title: "Test Vacancy",
  keySkills: ["React", "TypeScript"],
  questions: [
    {
      id: "1",
      text: "Test question?",
      timeLimit: 60,
      expectedAnswer: "Expected answer"
    }
  ],
  botLink: "https://t.me/Human_resourse_bot?start=test-uuid-123"
};
```

## Контакты

- Telegram бот: [@Human_resourse_bot](https://t.me/Human_resourse_bot)
- GitHub: [CVortex-web-app](https://github.com/Tima1117/CVortex-web-app)

