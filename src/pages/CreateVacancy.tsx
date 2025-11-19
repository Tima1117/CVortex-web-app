import {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {
    Alert,
    Box,
    Button,
    Chip,
    Divider,
    IconButton,
    InputAdornment,
    Paper,
    Snackbar,
    TextField,
    Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import {CreateVacancyRequest, Question} from '../types';
import {api} from '../services/api';

const TG_URL = import.meta.env.VITE_TG_URL;

// Генератор ID для вопросов
let questionIdCounter = 1;
const generateQuestionId = (): number => {
    return questionIdCounter++;
};

const generateUUID = (): string => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};

// Сброс счетчика при горячей перезагрузке в development
if (import.meta.env.DEV) {
    if (import.meta.hot) {
        import.meta.hot.dispose(() => {
            questionIdCounter = 1;
        });
    }
}

// Градиентная тема на основе логотипа
const gradientTheme = {
    primary: 'linear-gradient(135deg, #0088CC, #764ba2)',
    light: 'linear-gradient(135deg, #e6f4ff, #f3e8ff)',
    hover: 'linear-gradient(135deg, #0077b3, #6a4190)',
};

export default function CreateVacancy() {
    const navigate = useNavigate();
    const [title, setTitle] = useState('');
    const [skillInput, setSkillInput] = useState('');
    const [skills, setSkills] = useState<string[]>([]);
    const [questions, setQuestions] = useState<Question[]>([
        {id: generateQuestionId(), content: '', time_limit: 60, reference: '', vacancy_id: '', position: 1}
    ]);
    const [showSuccess, setShowSuccess] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [botLink, setBotLink] = useState('');
    const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
        open: false,
        message: '',
        severity: 'success'
    });

    const showSnackbar = (message: string, severity: 'success' | 'error' = 'error') => {
        setSnackbar({open: true, message, severity});
    };

    const handleCloseSnackbar = (_event?: React.SyntheticEvent | Event, reason?: string) => {
        if (reason === 'clickaway') {
            return;
        }
        setSnackbar(prev => ({...prev, open: false}));
    };

    const handleAddSkill = (): void => {
        const trimmedSkill = skillInput.trim();
        if (trimmedSkill && !skills.includes(trimmedSkill)) {
            setSkills(prev => [...prev, trimmedSkill]);
            setSkillInput('');
        } else if (skills.includes(trimmedSkill)) {
            showSnackbar('Этот навык уже добавлен', 'error');
        }
    };

    const handleDeleteSkill = (skillToDelete: string): void => {
        setSkills(prev => prev.filter(skill => skill !== skillToDelete));
    };

    const handleAddQuestion = (): void => {
        const newQuestion: Question = {
            id: generateQuestionId(),
            vacancy_id: '', // Будет установлено при создании вакансии
            position: questions.length + 1,
            content: '',
            time_limit: 60,
            reference: ''
        };
        setQuestions(prev => [...prev, newQuestion]);
    };

    const handleQuestionChange = (id: number, field: keyof Question, value: string | number): void => {
        setQuestions(prev => prev.map(q =>
            q.id === id ? {...q, [field]: value} : q
        ));
    };

    const handleDeleteQuestion = (id: number): void => {
        if (questions.length > 1) {
            setQuestions(prev => prev.filter(q => q.id !== id));
        } else {
            showSnackbar('Должен остаться хотя бы один вопрос', 'error');
        }
    };

    const handleSubmit = async (e: React.FormEvent): Promise<void> => {
        e.preventDefault();

        // Валидация формы
        if (!title.trim()) {
            showSnackbar('Название вакансии обязательно для заполнения', 'error');
            return;
        }

        if (skills.length === 0) {
            showSnackbar('Добавьте хотя бы один навык', 'error');
            return;
        }

        const emptyQuestion = questions.find(q => !q.content.trim());
        if (emptyQuestion) {
            showSnackbar('Все вопросы должны содержать текст', 'error');
            return;
        }

        const invalidTimeLimit = questions.find(q => q.time_limit < 30 || q.time_limit > 300);
        if (invalidTimeLimit) {
            showSnackbar('Время на ответ должно быть от 30 до 300 секунд', 'error');
            return;
        }

        setIsLoading(true);

        try {
            const vacancyId = generateUUID();
            const newBotLink = `${TG_URL}${vacancyId}`;

            // Подготавливаем вопросы с правильными позициями
            const preparedQuestions = questions.map((q, index) => ({
                content: q.content.trim(),
                reference: q.reference?.trim() || '',
                time_limit: Math.max(30, Math.min(300, q.time_limit)), // Ограничиваем диапазон
                position: index + 1
            }));

            const vacancyData: CreateVacancyRequest = {
                id: vacancyId,
                title: title.trim(),
                key_requirements: skills,
                questions: preparedQuestions
            };

            const success = await api.createVacancy(vacancyData);

            if (success) {
                setBotLink(newBotLink);
                setShowSuccess(true);
                showSnackbar('Вакансия успешно создана!', 'success');

                setTimeout(() => {
                    navigate('/vacancies');
                }, 2000);
            } else {
                throw new Error('Не удалось создать вакансию');
            }

        } catch (err) {
            console.error('Ошибка при создании вакансии:', err);
            const errorMessage = err instanceof Error ? err.message : 'Произошла неизвестная ошибка';
            showSnackbar(errorMessage, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCopyLink = (): void => {
        if (botLink) {
            navigator.clipboard.writeText(botLink)
                .then(() => {
                    showSnackbar('Ссылка скопирована в буфер обмена', 'success');
                })
                .catch(err => {
                    console.error('Ошибка при копировании ссылки:', err);
                    showSnackbar('Ошибка при копировании ссылки', 'error');
                });
        }
    };

    const isFormValid = (): boolean => {
        return title.trim() !== '' &&
            skills.length > 0 &&
            questions.every(q => q.content.trim() !== '') &&
            questions.every(q => q.time_limit >= 30 && q.time_limit <= 300);
    };

    return (
        <Box>
            {/* Заголовок страницы */}
            <Box sx={{mb: 4}}>
                <Button
                    startIcon={<ArrowBackIcon/>}
                    onClick={() => navigate('/vacancies')}
                    sx={{
                        mb: 2,
                        color: 'text.secondary',
                        '&:hover': {
                            background: gradientTheme.light,
                            color: 'primary.main',
                        },
                        '&:disabled': {
                            color: 'text.disabled',
                        },
                        transition: 'all 0.2s ease',
                    }}
                >
                    Назад к вакансиям
                </Button>
                <Typography
                    variant="h4"
                    gutterBottom
                    sx={{
                        fontWeight: 700,
                        background: gradientTheme.primary,
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        color: 'transparent',
                    }}
                >
                    Создание новой вакансии
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Заполните информацию о вакансии и настройте вопросы для интервью
                </Typography>
            </Box>

            {showSuccess && (
                <Alert
                    severity="success"
                    sx={{
                        mb: 3,
                        borderRadius: 1,
                        border: '1px solid',
                        borderColor: 'success.light',
                    }}
                >
                    Вакансия успешно создана! Перенаправление...
                </Alert>
            )}

            <Paper
                elevation={0}
                sx={{
                    p: 3,
                    borderRadius: 1,
                    background: 'white',
                    border: '1px solid',
                    borderColor: 'divider',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                }}
            >
                <form onSubmit={handleSubmit}>
                    {/* Название вакансии */}
                    <Box sx={{mb: 4}}>
                        <Typography variant="h6" gutterBottom sx={{fontWeight: 600, color: 'text.primary'}}>
                            Название вакансии *
                        </Typography>
                        <TextField
                            fullWidth
                            placeholder="Например: Frontend разработчик (React)"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            error={!title.trim()}
                            helperText={!title.trim() ? "Название вакансии обязательно" : ""}
                            disabled={isLoading}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 1,
                                    '&:hover fieldset': {
                                        borderColor: 'primary.main',
                                    },
                                },
                            }}
                        />
                    </Box>

                    <Divider sx={{my: 4, borderColor: 'divider'}}/>

                    {/* Ключевые навыки */}
                    <Box sx={{mb: 4}}>
                        <Typography variant="h6" gutterBottom sx={{fontWeight: 600, color: 'text.primary'}}>
                            Ключевые пожелания к кандидату *
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{mb: 3}}>
                            Укажите навыки, технологии или требования к кандидату. Эта информация будет использоваться
                            для анализа резюме.
                        </Typography>
                        <Box sx={{display: 'flex', gap: 1, mb: 2}}>
                            <TextField
                                fullWidth
                                placeholder="Например: React, TypeScript, 3+ года опыта"
                                value={skillInput}
                                onChange={(e) => setSkillInput(e.target.value)}
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        handleAddSkill();
                                    }
                                }}
                                disabled={isLoading}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: 1,
                                    },
                                }}
                            />
                            <Button
                                variant="contained"
                                onClick={handleAddSkill}
                                startIcon={<AddIcon/>}
                                disabled={isLoading || !skillInput.trim()}
                                sx={{
                                    borderRadius: 1,
                                    background: skillInput.trim() ? gradientTheme.primary : 'white',
                                    color: skillInput.trim() ? 'white' : 'primary.main',
                                    border: skillInput.trim() ? 'none' : '2px solid',
                                    borderColor: skillInput.trim() ? 'transparent' : gradientTheme.primary,
                                    '&:hover': {
                                        background: skillInput.trim() ? gradientTheme.hover : gradientTheme.light,
                                        transform: skillInput.trim() ? 'translateY(-1px)' : 'none',
                                        borderColor: skillInput.trim() ? 'transparent' : gradientTheme.hover,
                                        boxShadow: skillInput.trim() ? '0 4px 12px rgba(0, 136, 204, 0.3)' : 'none',
                                    },
                                    '&:disabled': {
                                        background: 'white',
                                        color: 'text.disabled',
                                        borderColor: 'grey.300',
                                        transform: 'none',
                                        boxShadow: 'none',
                                    },
                                    transition: 'all 0.2s ease',
                                    minWidth: '120px',
                                    fontWeight: 600,
                                }}
                            >
                                Добавить
                            </Button>
                        </Box>
                        <Box sx={{display: 'flex', flexWrap: 'wrap', gap: 1}}>
                            {skills.map((skill) => (
                                <Chip
                                    key={skill}
                                    label={skill}
                                    onDelete={() => handleDeleteSkill(skill)}
                                    sx={{
                                        background: gradientTheme.light,
                                        color: 'primary.main',
                                        fontWeight: 500,
                                        borderRadius: 1,
                                        '&:hover': {
                                            background: gradientTheme.primary,
                                            color: 'white',
                                        },
                                        '&:disabled': {
                                            color: 'text.disabled',
                                        },
                                        transition: 'all 0.2s ease',
                                    }}
                                    disabled={isLoading}
                                />
                            ))}
                        </Box>
                        {skills.length === 0 && (
                            <Typography variant="caption" color="error" sx={{mt: 1, display: 'block'}}>
                                Добавьте хотя бы один навык
                            </Typography>
                        )}
                    </Box>

                    <Divider sx={{my: 4, borderColor: 'divider'}}/>

                    {/* Ссылка для Telegram бота */}
                    {botLink && (
                        <>
                            <Box sx={{mb: 4}}>
                                <Typography variant="h6" gutterBottom sx={{fontWeight: 600, color: 'text.primary'}}>
                                    Ссылка для кандидатов
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{mb: 2}}>
                                    Уникальная ссылка для перехода в Telegram бота. Отправьте эту ссылку кандидатам для
                                    прохождения интервью.
                                </Typography>
                                <TextField
                                    fullWidth
                                    value={botLink}
                                    InputProps={{
                                        readOnly: true,
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton
                                                    onClick={handleCopyLink}
                                                    edge="end"
                                                    title="Скопировать ссылку"
                                                    disabled={isLoading}
                                                    sx={{
                                                        color: 'primary.main',
                                                        '&:hover': {
                                                            background: gradientTheme.light,
                                                        },
                                                        '&:disabled': {
                                                            color: 'text.disabled',
                                                        },
                                                    }}
                                                >
                                                    <ContentCopyIcon/>
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                    }}
                                    disabled={isLoading}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: 1,
                                        },
                                    }}
                                />
                            </Box>
                            <Divider sx={{my: 4, borderColor: 'divider'}}/>
                        </>
                    )}

                    {/* Вопросы для интервью */}
                    <Box sx={{mb: 4}}>
                        <Typography variant="h6" gutterBottom sx={{fontWeight: 600, color: 'text.primary'}}>
                            Вопросы для интервью *
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{mb: 3}}>
                            Вопросы, которые бот будет задавать кандидату в Telegram
                        </Typography>
                        {questions.map((question, index) => (
                            <Paper
                                key={question.id}
                                variant="outlined"
                                sx={{
                                    p: 2,
                                    mb: 2,
                                    borderRadius: 1,
                                    border: '1px solid',
                                    borderColor: 'divider',
                                    background: 'white',
                                    '&:hover': {
                                        boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
                                    },
                                    transition: 'all 0.2s ease',
                                }}
                            >
                                <Box sx={{display: 'flex', alignItems: 'flex-start', gap: 2}}>
                                    <Box sx={{flex: 1}}>
                                        <Box sx={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            mb: 2
                                        }}>
                                            <Typography variant="subtitle2" sx={{fontWeight: 600}}>
                                                Вопрос {index + 1}
                                            </Typography>
                                            {questions.length > 1 && (
                                                <Button
                                                    size="small"
                                                    color="error"
                                                    onClick={() => handleDeleteQuestion(question.id)}
                                                    disabled={isLoading}
                                                    startIcon={<DeleteIcon/>}
                                                    sx={{
                                                        borderRadius: 1,
                                                        textTransform: 'none',
                                                        '&:disabled': {
                                                            color: 'text.disabled',
                                                        },
                                                    }}
                                                >
                                                    Удалить
                                                </Button>
                                            )}
                                        </Box>
                                        <TextField
                                            fullWidth
                                            multiline
                                            rows={2}
                                            placeholder="Введите текст вопроса"
                                            value={question.content}
                                            onChange={(e) => handleQuestionChange(question.id, 'content', e.target.value)}
                                            error={!question.content.trim()}
                                            helperText={!question.content.trim() ? "Текст вопроса обязателен" : ""}
                                            required
                                            sx={{mb: 2}}
                                            disabled={isLoading}
                                        />
                                        <TextField
                                            fullWidth
                                            multiline
                                            rows={2}
                                            label="Пожелание к ответу (опционально)"
                                            placeholder="Опишите, что вы ожидаете услышать в ответе на этот вопрос"
                                            value={question.reference || ''}
                                            onChange={(e) => handleQuestionChange(question.id, 'reference', e.target.value)}
                                            sx={{mb: 2}}
                                            disabled={isLoading}
                                        />
                                        <TextField
                                            type="number"
                                            label="Время на ответ (секунды)"
                                            value={question.time_limit}
                                            onChange={(e) => handleQuestionChange(question.id, 'time_limit', parseInt(e.target.value) || 60)}
                                            inputProps={{min: 30, max: 300, step: 10}}
                                            error={question.time_limit < 30 || question.time_limit > 300}
                                            helperText={question.time_limit < 30 || question.time_limit > 300 ? "Допустимый диапазон: 30-300 секунд" : ""}
                                            sx={{width: 200}}
                                            disabled={isLoading}
                                        />
                                    </Box>
                                </Box>
                            </Paper>
                        ))}
                        <Button
                            variant="outlined"
                            startIcon={<AddIcon/>}
                            onClick={handleAddQuestion}
                            disabled={isLoading}
                            sx={{
                                borderRadius: 1,
                                borderColor: 'primary.main',
                                color: 'primary.main',
                                '&:hover': {
                                    background: gradientTheme.light,
                                    borderColor: 'primary.main',
                                    transform: 'translateY(-1px)',
                                },
                                '&:disabled': {
                                    borderColor: 'grey.300',
                                    color: 'text.disabled',
                                },
                                transition: 'all 0.2s ease',
                            }}
                        >
                            Добавить вопрос
                        </Button>
                    </Box>

                    <Divider sx={{my: 4}}/>

                    {/* Кнопки */}
                    <Box sx={{display: 'flex', gap: 2, justifyContent: 'flex-end'}}>
                        <Button
                            variant="outlined"
                            onClick={() => navigate('/vacancies')}
                            disabled={isLoading}
                            sx={{
                                borderRadius: 1,
                                px: 3,
                                py: 1,
                                borderColor: 'divider',
                                color: 'text.secondary',
                                '&:hover': {
                                    borderColor: 'primary.main',
                                    color: 'primary.main',
                                    background: gradientTheme.light,
                                },
                                '&:disabled': {
                                    borderColor: 'grey.300',
                                    color: 'text.disabled',
                                },
                                transition: 'all 0.2s ease',
                            }}
                        >
                            Отмена
                        </Button>
                        <Button
                            type="submit"
                            variant="contained"
                            startIcon={<SaveIcon/>}
                            disabled={!isFormValid() || isLoading}
                            sx={{
                                borderRadius: 1,
                                px: 3,
                                py: 1,
                                background: isFormValid() && !isLoading ? gradientTheme.primary : 'white',
                                color: isFormValid() && !isLoading ? 'white' : 'primary.main',
                                border: '2px solid',
                                borderColor: isFormValid() && !isLoading ? 'transparent' : gradientTheme.primary,
                                '&:hover': {
                                    background: isFormValid() && !isLoading ? gradientTheme.hover : gradientTheme.light,
                                    transform: isFormValid() && !isLoading ? 'translateY(-1px)' : 'none',
                                    borderColor: isFormValid() && !isLoading ? 'transparent' : gradientTheme.hover,
                                    boxShadow: isFormValid() && !isLoading ? '0 4px 12px rgba(0, 136, 204, 0.3)' : 'none',
                                },
                                '&:disabled': {
                                    background: 'white',
                                    color: 'text.disabled',
                                    borderColor: 'grey.300',
                                    transform: 'none',
                                    boxShadow: 'none',
                                },
                                transition: 'all 0.2s ease',
                                fontWeight: 600,
                            }}
                        >
                            {isLoading ? 'Создание...' : 'Создать вакансию'}
                        </Button>
                    </Box>
                </form>
            </Paper>

            {/* Snackbar для уведомлений */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{vertical: 'top', horizontal: 'right'}}
            >
                <Alert
                    onClose={handleCloseSnackbar}
                    severity={snackbar.severity}
                    sx={{
                        width: '100%',
                        borderRadius: 1,
                        border: '1px solid',
                        borderColor: snackbar.severity === 'success' ? 'success.light' : 'error.light',
                    }}
                    action={
                        <IconButton
                            size="small"
                            aria-label="close"
                            color="inherit"
                            onClick={handleCloseSnackbar}
                        >
                            <CloseIcon fontSize="small"/>
                        </IconButton>
                    }
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}