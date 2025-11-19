import {useEffect, useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Divider,
    Grid,
    IconButton,
    LinearProgress,
    Link,
    Paper,
    Snackbar,
    Typography
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PhoneIcon from '@mui/icons-material/Phone';
import TelegramIcon from '@mui/icons-material/Telegram';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import WorkIcon from '@mui/icons-material/Work';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import CloseIcon from '@mui/icons-material/Close';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import GradingIcon from '@mui/icons-material/Grading';
import FeedbackIcon from '@mui/icons-material/Feedback';
import {CandidateQuestionAnswer, CandidateVacancyInfo, getScoreColor, getStatusColor, getStatusLabel} from '../types';
import {api} from "../services/api.ts";

interface SnackbarState {
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'warning' | 'info';
}

// Градиентная тема на основе логотипа
const gradientTheme = {
    primary: 'linear-gradient(135deg, #0088CC, #764ba2)',
    light: 'linear-gradient(135deg, #e6f4ff, #f3e8ff)',
    hover: 'linear-gradient(135deg, #0077b3, #6a4190)',
};

export default function CandidateDetails() {
    const {id, vacancyId} = useParams<{ id: string; vacancyId: string }>();
    const navigate = useNavigate();

    const [candidateData, setCandidateData] = useState<CandidateVacancyInfo | undefined>();
    const [answers, setAnswers] = useState<CandidateQuestionAnswer[]>([]);
    const [loading, setLoading] = useState(true);
    const [answersLoading, setAnswersLoading] = useState(false);
    const [snackbar, setSnackbar] = useState<SnackbarState>({
        open: false,
        message: '',
        severity: 'info',
    });

    useEffect(() => {
        const loadCandidateData = async () => {
            try {
                setLoading(true);
                if (!id || !vacancyId) {
                    showSnackbar('ID кандидата или вакансии не указан', 'error');
                    return;
                }

                const candidateId = parseInt(id);
                if (isNaN(candidateId)) {
                    showSnackbar('Некорректный ID кандидата', 'error');
                    return;
                }

                const data = await api.getCandidateVacancyByID(candidateId, vacancyId);
                setCandidateData(data);

                await loadCandidateAnswers(candidateId, vacancyId);
            } catch (error) {
                console.error('Ошибка при загрузке данных кандидата:', error);
                showSnackbar('Ошибка при загрузке данных кандидата', 'error');
            } finally {
                setLoading(false);
            }
        };

        const loadCandidateAnswers = async (candidateId: number, vacancyId: string) => {
            try {
                setAnswersLoading(true);
                const answersData = await api.getCandidateVacancyAnswers(candidateId, vacancyId);
                setAnswers(answersData);
            } catch (error) {
                console.error('Ошибка при загрузке ответов кандидата:', error);
                showSnackbar('Ошибка при загрузке ответов кандидата', 'error');
            } finally {
                setAnswersLoading(false);
            }
        };

        loadCandidateData();
    }, [id, vacancyId]);

    const showSnackbar = (message: string, severity: SnackbarState['severity'] = 'info') => {
        setSnackbar({
            open: true,
            message,
            severity,
        });
    };

    const handleCloseSnackbar = () => {
        setSnackbar(prev => ({...prev, open: false}));
    };

    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    if (loading) {
        return (
            <Box sx={{display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400}}>
                <Typography variant="h6">Загрузка данных кандидата...</Typography>
            </Box>
        );
    }

    if (!candidateData) {
        return (
            <Box sx={{p: 3}}>
                <Alert
                    severity="error"
                    sx={{
                        borderRadius: 1,
                        border: '1px solid',
                        borderColor: 'error.light',
                    }}
                >
                    Кандидат не найден
                </Alert>
                <Button
                    startIcon={<ArrowBackIcon/>}
                    onClick={() => navigate('/candidates')}
                    sx={{
                        mt: 2,
                        borderRadius: 1,
                        '&:hover': {
                            background: gradientTheme.light,
                        },
                    }}
                >
                    Вернуться к списку
                </Button>
            </Box>
        );
    }

    const {candidate, vacancy, meta, resume_screening, resume_link} = candidateData;

    const formatDate = (dateString: Date) => {
        try {
            return new Date(dateString).toLocaleDateString('ru-RU');
        } catch (error) {
            return 'Неверная дата';
        }
    };

    // Расчет общего времени и среднего балла
    const totalAnswers = answers.length;
    const totalScore = answers.reduce((sum, item) => sum + (item.answer?.score || 0), 0);
    const averageScore = totalAnswers > 0 ? Math.round(totalScore / totalAnswers) : 0;
    const totalTimeTaken = answers.reduce((sum, item) => sum + (item.answer?.time_taken || 0), 0);

    return (
        <Box>
            {/* Заголовок страницы */}
            <Box sx={{mb: 4}}>
                <Button
                    startIcon={<ArrowBackIcon/>}
                    onClick={() => navigate('/candidates')}
                    sx={{
                        mb: 2,
                        color: 'text.secondary',
                        '&:hover': {
                            background: gradientTheme.light,
                            color: 'primary.main',
                        },
                        transition: 'all 0.2s ease',
                    }}
                >
                    Назад к списку кандидатов
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
                    Детали кандидата
                </Typography>
            </Box>

            <Paper
                elevation={0}
                sx={{
                    p: 4,
                    mb: 3,
                    borderRadius: 1,
                    background: 'white',
                    border: '1px solid',
                    borderColor: 'divider',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                }}
            >
                {/* Заголовок и статус */}
                <Box sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    mb: 3,
                    flexDirection: {xs: 'column', md: 'row'},
                    gap: 2
                }}>
                    <Box>
                        <Typography variant="h4"
                                    sx={{fontWeight: 600, fontSize: {xs: '1.75rem', md: '2.125rem'}, mb: 1}}>
                            {candidate.full_name}
                        </Typography>
                        <Chip
                            label={getStatusLabel(meta.status)}
                            color={getStatusColor(meta.status)}
                            size="medium"
                            sx={{
                                borderRadius: 1,
                                fontWeight: 600,
                            }}
                        />
                    </Box>
                    <Box sx={{textAlign: {xs: 'left', md: 'right'}}}>
                        <Typography variant="caption" color="text.secondary">
                            Дата подачи заявки
                        </Typography>
                        <Typography variant="body1" sx={{mb: 1, fontWeight: 500}}>
                            {formatDate(candidate.created_at)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            Последнее обновление
                        </Typography>
                        <Typography variant="body1" sx={{fontWeight: 500}}>
                            {formatDate(meta.updated_at)}
                        </Typography>
                    </Box>
                </Box>

                <Divider sx={{my: 3, borderColor: 'divider'}}/>

                {/* Личные данные */}
                <Typography variant="h6" gutterBottom sx={{fontWeight: 600, mb: 3}}>
                    Личные данные
                </Typography>
                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                        <Box sx={{display: 'flex', alignItems: 'center', mb: 2}}>
                            <WorkIcon sx={{mr: 1.5, color: 'primary.main'}}/>
                            <Box>
                                <Typography variant="caption" color="text.secondary">
                                    Вакансия
                                </Typography>
                                <Typography variant="body1" sx={{fontWeight: 500}}>{vacancy.title}</Typography>
                            </Box>
                        </Box>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Box sx={{display: 'flex', alignItems: 'center', mb: 2}}>
                            <LocationOnIcon sx={{mr: 1.5, color: 'primary.main'}}/>
                            <Box>
                                <Typography variant="caption" color="text.secondary">
                                    Город проживания
                                </Typography>
                                <Typography variant="body1"
                                            sx={{fontWeight: 500}}>{candidate.city || 'Не указан'}</Typography>
                            </Box>
                        </Box>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Box sx={{display: 'flex', alignItems: 'center', mb: 2}}>
                            <PhoneIcon sx={{mr: 1.5, color: 'primary.main'}}/>
                            <Box>
                                <Typography variant="caption" color="text.secondary">
                                    Номер телефона
                                </Typography>
                                <Typography variant="body1"
                                            sx={{fontWeight: 500}}>{candidate.phone || 'Не указан'}</Typography>
                            </Box>
                        </Box>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Box sx={{display: 'flex', alignItems: 'center', mb: 2}}>
                            <TelegramIcon sx={{mr: 1.5, color: 'primary.main'}}/>
                            <Box>
                                <Typography variant="caption" color="text.secondary">
                                    Telegram
                                </Typography>
                                <Typography variant="body1" sx={{fontWeight: 500}}>
                                    {candidate.telegram_username ? (
                                        <Link
                                            href={`https://t.me/${candidate.telegram_username}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            sx={{
                                                textDecoration: 'none',
                                                color: 'primary.main',
                                                fontWeight: 500,
                                                '&:hover': {
                                                    textDecoration: 'underline',
                                                    color: 'primary.dark'
                                                }
                                            }}
                                        >
                                            {`https://t.me/${candidate.telegram_username}`}
                                        </Link>
                                    ) : (
                                        'Не указан'
                                    )}
                                </Typography>
                            </Box>
                        </Box>
                    </Grid>
                </Grid>

                <Divider sx={{my: 3, borderColor: 'divider'}}/>

                {/* Резюме */}
                <Typography variant="h6" gutterBottom sx={{fontWeight: 600, mb: 2}}>
                    Резюме
                </Typography>
                <Box sx={{display: 'flex', alignItems: 'center', gap: 2}}>
                    <InsertDriveFileIcon sx={{fontSize: 40, color: 'primary.main'}}/>
                    {resume_link && (
                        <Button
                            variant="outlined"
                            size="small"
                            href={resume_link}
                            target="_blank"
                            sx={{
                                borderRadius: 1,
                                borderColor: 'primary.main',
                                color: 'primary.main',
                                '&:hover': {
                                    background: gradientTheme.light,
                                    borderColor: 'primary.main',
                                },
                            }}
                        >
                            Скачать резюме
                        </Button>
                    )}
                </Box>

                <Divider sx={{my: 3, borderColor: 'divider'}}/>

                {/* Результаты скрининга и интервью */}
                <Typography variant="h6" gutterBottom sx={{fontWeight: 600, mb: 3}}>
                    Результаты оценки
                </Typography>
                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                        <Card
                            variant="outlined"
                            sx={{
                                borderRadius: 1,
                                borderColor: 'divider',
                                transition: 'all 0.2s ease',
                                '&:hover': {
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                },
                            }}
                        >
                            <CardContent>
                                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                    Скрининг резюме
                                </Typography>
                                {resume_screening?.score !== null && resume_screening?.score !== undefined ? (
                                    <Box
                                        sx={{
                                            display: 'inline-block',
                                            px: 2,
                                            py: 1,
                                            borderRadius: 1,
                                            bgcolor: getScoreColor(resume_screening.score),
                                            color: 'white',
                                            fontSize: 24,
                                            fontWeight: 700,
                                        }}
                                    >
                                        {resume_screening.score} / 100
                                    </Box>
                                ) : (
                                    <Typography variant="body1" color="text.secondary">
                                        Еще не оценено
                                    </Typography>
                                )}
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Card
                            variant="outlined"
                            sx={{
                                borderRadius: 1,
                                borderColor: 'divider',
                                transition: 'all 0.2s ease',
                                '&:hover': {
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                },
                            }}
                        >
                            <CardContent>
                                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                    Результаты интервью
                                </Typography>
                                {meta.interview_score !== null ? (
                                    <Box
                                        sx={{
                                            display: 'inline-block',
                                            px: 2,
                                            py: 1,
                                            borderRadius: 1,
                                            bgcolor: getScoreColor(meta.interview_score),
                                            color: 'white',
                                            fontSize: 24,
                                            fontWeight: 700,
                                        }}
                                    >
                                        {meta.interview_score} / 100
                                    </Box>
                                ) : (
                                    <Typography variant="body1" color="text.secondary">
                                        Еще не пройдено
                                    </Typography>
                                )}
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                {/* Фидбек от LLM о резюме */}
                {resume_screening?.feedback && (
                    <>
                        <Divider sx={{my: 3, borderColor: 'divider'}}/>
                        <Box>
                            <Typography variant="h6" gutterBottom
                                        sx={{fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center'}}>
                                <FeedbackIcon sx={{mr: 1, color: 'primary.main'}}/>
                                Результат скрининга резюме
                            </Typography>
                            <Card
                                variant="outlined"
                                sx={{
                                    borderRadius: 1,
                                    borderColor: 'divider',
                                }}
                            >
                                <CardContent>
                                    <Typography
                                        variant="body1"
                                        sx={{
                                            whiteSpace: 'pre-wrap',
                                            lineHeight: 1.6
                                        }}
                                    >
                                        {resume_screening.feedback}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Box>
                    </>
                )}

                {/* Ответы кандидата на вопросы */}
                <Divider sx={{my: 3, borderColor: 'divider'}}/>

                <Typography variant="h6" gutterBottom sx={{fontWeight: 600, mb: 3}}>
                    Ответы на вопросы интервью
                </Typography>

                {answersLoading ? (
                    <Box sx={{textAlign: 'center', py: 4}}>
                        <Typography variant="body1" color="text.secondary">
                            Загрузка ответов...
                        </Typography>
                        <LinearProgress sx={{mt: 2}}/>
                    </Box>
                ) : answers.length > 0 ? (
                    <Box>
                        {/* Общая статистика по ответам */}
                        <Card
                            sx={{
                                mb: 3,
                                background: gradientTheme.light,
                                borderRadius: 1,
                                border: 'none',
                            }}
                        >
                            <CardContent>
                                <Grid container spacing={3}>
                                    <Grid item xs={12} sm={4}>
                                        <Box sx={{textAlign: 'center'}}>
                                            <Typography variant="h4" color="primary.main" fontWeight={700}>
                                                {totalAnswers}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Всего вопросов
                                            </Typography>
                                        </Box>
                                    </Grid>
                                    <Grid item xs={12} sm={4}>
                                        <Box sx={{textAlign: 'center'}}>
                                            <Typography
                                                variant="h4"
                                                sx={{
                                                    color: getScoreColor(averageScore),
                                                    fontWeight: 700
                                                }}
                                            >
                                                {averageScore}%
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Средний балл
                                            </Typography>
                                        </Box>
                                    </Grid>
                                    <Grid item xs={12} sm={4}>
                                        <Box sx={{textAlign: 'center'}}>
                                            <Typography variant="h4" color="secondary.main" fontWeight={700}>
                                                {formatTime(totalTimeTaken)}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Общее время
                                            </Typography>
                                        </Box>
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </Card>

                        {/* Список вопросов и ответов */}
                        {answers.map((item, index) => (
                            <Accordion
                                key={item.question.id}
                                sx={{
                                    mb: 2,
                                    borderRadius: '1px !important',
                                    '&:before': {display: 'none'},
                                    border: '1px solid',
                                    borderColor: 'divider',
                                    boxShadow: 'none',
                                }}
                            >
                                <AccordionSummary
                                    expandIcon={<ExpandMoreIcon/>}
                                    sx={{
                                        borderRadius: '1px !important',
                                        '&:hover': {
                                            background: gradientTheme.light,
                                        },
                                    }}
                                >
                                    <Box sx={{display: 'flex', alignItems: 'center', width: '100%'}}>
                                        <Typography variant="h6" sx={{flex: 1, fontWeight: 600}}>
                                            Вопрос {index + 1}: {item.question.content}
                                        </Typography>
                                        <Box sx={{display: 'flex', alignItems: 'center', gap: 2, ml: 2}}>
                                            {item.answer?.score !== undefined && (
                                                <Chip
                                                    icon={<GradingIcon/>}
                                                    label={`${item.answer.score}%`}
                                                    color={item.answer.score >= 70 ? 'success' : item.answer.score >= 40 ? 'warning' : 'error'}
                                                    variant="outlined"
                                                    sx={{
                                                        borderRadius: 1,
                                                        fontWeight: 600,
                                                    }}
                                                />
                                            )}
                                            {item.answer?.time_taken !== undefined && (
                                                <Chip
                                                    icon={<AccessTimeIcon/>}
                                                    label={formatTime(item.answer.time_taken)}
                                                    variant="outlined"
                                                    sx={{
                                                        borderRadius: 1,
                                                        fontWeight: 600,
                                                    }}
                                                />
                                            )}
                                        </Box>
                                    </Box>
                                </AccordionSummary>
                                <AccordionDetails sx={{borderTop: '1px solid', borderColor: 'divider'}}>
                                    <Grid container spacing={3}>
                                        <Grid item xs={12} md={6}>
                                            <Typography variant="subtitle2" color="text.secondary" gutterBottom
                                                        sx={{fontWeight: 600}}>
                                                Вопрос:
                                            </Typography>
                                            <Typography variant="body1" paragraph sx={{fontWeight: 500}}>
                                                {item.question.content}
                                            </Typography>
                                            {item.question.reference && (
                                                <>
                                                    <Typography variant="subtitle2" color="text.secondary" gutterBottom
                                                                sx={{mt: 2, fontWeight: 600}}>
                                                        Правильный ответ:
                                                    </Typography>
                                                    <Card
                                                        variant="outlined"
                                                        sx={{
                                                            borderColor: 'success.main',
                                                            p: 2,
                                                            mb: 2,
                                                            borderRadius: 1,
                                                            background: 'success.light',
                                                        }}
                                                    >
                                                        <Typography
                                                            variant="body1"
                                                            sx={{
                                                                whiteSpace: 'pre-wrap',
                                                                color: 'success.dark',
                                                                fontWeight: 500,
                                                            }}
                                                        >
                                                            {item.question.reference}
                                                        </Typography>
                                                    </Card>
                                                </>
                                            )}
                                            <Box sx={{display: 'flex', gap: 2, flexWrap: 'wrap'}}>
                                                <Chip
                                                    label={`Лимит времени: ${formatTime(item.question.time_limit)}`}
                                                    size="small"
                                                    variant="outlined"
                                                    sx={{borderRadius: 1}}
                                                />
                                            </Box>
                                        </Grid>
                                        <Grid item xs={12} md={6}>
                                            <Typography variant="subtitle2" color="text.secondary" gutterBottom
                                                        sx={{fontWeight: 600}}>
                                                Ответ кандидата:
                                            </Typography>
                                            {item.answer?.content ? (
                                                <Typography variant="body1"
                                                            sx={{whiteSpace: 'pre-wrap', fontWeight: 500}}>
                                                    {item.answer.content}
                                                </Typography>
                                            ) : (
                                                <Typography variant="body1" color="text.secondary" fontStyle="italic">
                                                    Ответ не предоставлен
                                                </Typography>
                                            )}
                                            <Box sx={{display: 'flex', gap: 2, mt: 2, flexWrap: 'wrap'}}>
                                                {item.answer?.score !== undefined && (
                                                    <Chip
                                                        icon={<GradingIcon/>}
                                                        label={`Оценка: ${item.answer.score}%`}
                                                        color={item.answer.score >= 70 ? 'success' : item.answer.score >= 40 ? 'warning' : 'error'}
                                                        sx={{borderRadius: 1, fontWeight: 600}}
                                                    />
                                                )}
                                                {item.answer?.time_taken !== undefined && (
                                                    <Chip
                                                        icon={<AccessTimeIcon/>}
                                                        label={`Затрачено времени: ${formatTime(item.answer.time_taken)}`}
                                                        sx={{borderRadius: 1, fontWeight: 600}}
                                                    />
                                                )}
                                            </Box>
                                        </Grid>
                                    </Grid>
                                </AccordionDetails>
                            </Accordion>
                        ))}
                    </Box>
                ) : (
                    <Card
                        sx={{
                            borderRadius: 1,
                            border: '1px solid',
                            borderColor: 'divider',
                        }}
                    >
                        <CardContent sx={{textAlign: 'center', py: 4}}>
                            <GradingIcon sx={{fontSize: 48, color: 'text.secondary', mb: 2}}/>
                            <Typography variant="h6" color="text.secondary" gutterBottom>
                                Ответы не найдены
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Кандидат еще не отвечал на вопросы интервью или ответы не были сохранены.
                            </Typography>
                        </CardContent>
                    </Card>
                )}
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
                        borderColor: snackbar.severity === 'success' ? 'success.light' :
                            snackbar.severity === 'error' ? 'error.light' :
                                snackbar.severity === 'warning' ? 'warning.light' : 'info.light',
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