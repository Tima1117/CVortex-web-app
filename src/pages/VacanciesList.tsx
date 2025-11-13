import {useNavigate} from 'react-router-dom';
import {
    Alert,
    Box,
    Button,
    Card,
    CardActions,
    CardContent,
    Chip,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    Grid,
    IconButton,
    List,
    ListItem,
    ListItemText,
    Snackbar,
    Tooltip,
    Typography
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import WorkIcon from '@mui/icons-material/Work';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import {useEffect, useState} from 'react';
import {Vacancy} from '../types';
import {api} from '../services/api';
import ContentCopyIcon from "@mui/icons-material/ContentCopy";

const TG_URL = import.meta.env.VITE_TG_URL;

interface SnackbarState {
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'warning' | 'info';
}

export default function VacanciesList() {
    const navigate = useNavigate();
    const [vacancies, setVacancies] = useState<Vacancy[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedVacancy, setSelectedVacancy] = useState<Vacancy | null>(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [snackbar, setSnackbar] = useState<SnackbarState>({
        open: false,
        message: '',
        severity: 'info'
    });
    const [copyTooltip, setCopyTooltip] = useState(''); // Состояние для подсказки копирования

    const showSnackbar = (message: string, severity: SnackbarState['severity'] = 'error') => {
        setSnackbar({
            open: true,
            message,
            severity
        });
    };

    const handleCloseSnackbar = (_event?: React.SyntheticEvent | Event, reason?: string) => {
        if (reason === 'clickaway') {
            return;
        }
        setSnackbar(prev => ({...prev, open: false}));
    };

    const fetchVacancies = async () => {
        try {
            setLoading(true);
            const data = await api.getVacancies();
            setVacancies(data);
        } catch (error) {
            console.error('Ошибка при загрузке вакансий:', error);
            showSnackbar(
                'Не удалось загрузить вакансии',
                'error'
            );
        } finally {
            setLoading(false);
        }
    };

    const fetchVacancyDetails = async (vacancyId: string) => {
        try {
            setDetailLoading(true);
            const vacancy = await api.getVacancyByID(vacancyId);
            setSelectedVacancy(vacancy);
            setDialogOpen(true);
        } catch (error) {
            console.error('Ошибка при загрузке деталей вакансии:', error);
            showSnackbar(
                'Не удалось загрузить детали вакансии',
                'error'
            );
        } finally {
            setDetailLoading(false);
        }
    };

    const handleOpenDetails = (vacancyId: string) => {
        fetchVacancyDetails(vacancyId);
    };

    const handleCloseDialog = () => {
        setDialogOpen(false);
        setSelectedVacancy(null);
    };

    const handleDeleteClick = () => {
        setDeleteConfirmOpen(true);
    };

    const handleCloseDeleteConfirm = () => {
        setDeleteConfirmOpen(false);
    };

    const handleConfirmDelete = async () => {
        if (!selectedVacancy) return;

        try {
            setDeleting(true);
            await api.deleteVacancyByID(selectedVacancy.id);

            showSnackbar('Вакансия успешно удалена', 'success');
            setDeleteConfirmOpen(false);
            setDialogOpen(false);
            setSelectedVacancy(null);

            await fetchVacancies();
        } catch (error) {
            console.error('Ошибка при удалении вакансии:', error);
            showSnackbar(
                'Не удалось удалить вакансию',
                'error'
            );
        } finally {
            setDeleting(false);
        }
    };

    // Функция для копирования ссылки
    const handleCopyLink = async (vacancyId: string) => {
        const link = `${TG_URL}${vacancyId}`;
        try {
            await navigator.clipboard.writeText(link);
            setCopyTooltip('Скопировано!');
            setTimeout(() => setCopyTooltip(''), 2000); // Сбрасываем подсказку через 2 секунды
        } catch (error) {
            console.error('Ошибка при копировании:', error);
            setCopyTooltip('Ошибка копирования');
            setTimeout(() => setCopyTooltip(''), 2000);
        }
    };

    useEffect(() => {
        fetchVacancies();
    }, []);

    const formatDate = (dateString: Date) => {
        return new Date(dateString).toLocaleDateString('ru-RU');
    };

    if (loading) {
        return (
            <Box sx={{display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400}}>
                <CircularProgress/>
            </Box>
        );
    }

    return (
        <Box>
            <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3}}>
                <Typography variant="h4" sx={{fontWeight: 600}}>
                    Вакансии
                </Typography>
            </Box>

            <Grid container spacing={3}>
                {vacancies.map((vacancy) => (
                    <Grid item xs={12} md={6} key={vacancy.id}>
                        <Card elevation={3} sx={{height: '100%', display: 'flex', flexDirection: 'column'}}>
                            <CardContent sx={{flex: 1}}>
                                <Box sx={{
                                    display: 'flex',
                                    alignItems: 'flex-start',
                                    justifyContent: 'space-between',
                                    mb: 2
                                }}>
                                    <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                                        <WorkIcon color="primary"/>
                                        <Typography variant="h6" sx={{fontWeight: 600}}>
                                            {vacancy.title}
                                        </Typography>
                                    </Box>
                                </Box>

                                <Typography variant="caption" color="text.secondary" sx={{mb: 1, display: 'block'}}>
                                    Создана: {formatDate(vacancy.created_at)}
                                </Typography>

                                <Divider sx={{my: 2}}/>

                                <Typography variant="subtitle2" sx={{fontWeight: 600, mb: 1}}>
                                    Ключевые навыки:
                                </Typography>
                                <Box sx={{display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2}}>
                                    {(vacancy.key_requirements || []).map((skill) => (
                                        <Chip key={skill} label={skill} size="small" variant="outlined"/>
                                    ))}
                                    {(!vacancy.key_requirements || vacancy.key_requirements.length === 0) && (
                                        <Typography variant="body2" color="text.secondary">
                                            Не указаны
                                        </Typography>
                                    )}
                                </Box>

                                <Typography variant="subtitle2" sx={{fontWeight: 600, mb: 1}}>
                                    Вопросы для интервью:
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{mb: 2}}>
                                    {(vacancy.questions || []).length} вопрос(ов)
                                </Typography>

                                <Divider sx={{my: 2}}/>

                                <Typography variant="subtitle2" sx={{fontWeight: 600, mb: 1}}>
                                    Ссылка для кандидатов:
                                </Typography>
                                <Tooltip
                                    title={copyTooltip || "Копировать ссылку"}
                                    placement="top"
                                    arrow
                                >
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 1,
                                            p: 1,
                                            backgroundColor: 'grey.50',
                                            borderRadius: 1,
                                            border: '1px solid',
                                            borderColor: 'grey.300',
                                            cursor: 'pointer',
                                            '&:hover': {
                                                backgroundColor: 'grey.100',
                                            }
                                        }}
                                        onClick={() => handleCopyLink(vacancy.id)}
                                    >
                                        <Typography variant="body2" color="text.secondary" sx={{
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap',
                                            fontFamily: 'monospace',
                                            fontSize: '0.85rem',
                                            flex: 1,
                                        }}>
                                            {TG_URL}{vacancy.id}
                                        </Typography>
                                        <ContentCopyIcon sx={{fontSize: 16, color: 'grey.500'}}/>
                                    </Box>
                                </Tooltip>
                            </CardContent>

                            <CardActions sx={{p: 2, pt: 0}}>
                                <Button
                                    size="small"
                                    onClick={() => handleOpenDetails(vacancy.id)}
                                >
                                    Подробнее
                                </Button>
                            </CardActions>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {vacancies.length === 0 && !loading && (
                <Box sx={{textAlign: 'center', py: 8}}>
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                        Пока нет созданных вакансий
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{mb: 3}}>
                        Создайте первую вакансию, чтобы начать работу с кандидатами
                    </Typography>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon/>}
                        onClick={() => navigate('/vacancies/create')}
                    >
                        Создать вакансию
                    </Button>
                </Box>
            )}

            {/* Диалог с деталями вакансии */}
            <Dialog
                open={dialogOpen}
                onClose={handleCloseDialog}
                maxWidth="md"
                fullWidth
                scroll="paper"
            >
                <DialogTitle>
                    <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                        <Typography variant="h5" component="div" sx={{fontWeight: 600}}>
                            Детали вакансии
                        </Typography>
                        <IconButton onClick={handleCloseDialog}>
                            <CloseIcon/>
                        </IconButton>
                    </Box>
                </DialogTitle>

                <DialogContent dividers>
                    {detailLoading ? (
                        <Box sx={{display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200}}>
                            <CircularProgress/>
                        </Box>
                    ) : selectedVacancy ? (
                        <Box sx={{py: 1}}>
                            {/* Заголовок и дата */}
                            <Box sx={{display: 'flex', alignItems: 'center', gap: 1, mb: 2}}>
                                <WorkIcon color="primary"/>
                                <Typography variant="h6" sx={{fontWeight: 600}}>
                                    {selectedVacancy.title}
                                </Typography>
                            </Box>

                            <Typography variant="caption" color="text.secondary" sx={{mb: 3, display: 'block'}}>
                                Создана: {formatDate(selectedVacancy.created_at)}
                            </Typography>

                            {/* Ключевые навыки */}
                            <Typography variant="subtitle2" sx={{fontWeight: 600, mb: 1}}>
                                Ключевые навыки:
                            </Typography>
                            <Box sx={{display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 3}}>
                                {(selectedVacancy.key_requirements || []).map((skill) => (
                                    <Chip key={skill} label={skill} size="small" variant="outlined"/>
                                ))}
                                {(!selectedVacancy.key_requirements || selectedVacancy.key_requirements.length === 0) && (
                                    <Typography variant="body2" color="text.secondary">
                                        Не указаны
                                    </Typography>
                                )}
                            </Box>

                            {/* Вопросы для интервью */}
                            <Typography variant="subtitle2" sx={{fontWeight: 600, mb: 1}}>
                                Вопросы для интервью:
                            </Typography>
                            {selectedVacancy.questions && selectedVacancy.questions.length > 0 ? (
                                <List dense sx={{mb: 3}}>
                                    {selectedVacancy.questions.map((question, index) => (
                                        <ListItem key={index} sx={{
                                            border: '1px solid',
                                            borderColor: 'divider',
                                            borderRadius: 1,
                                            mb: 1,
                                            flexDirection: 'column',
                                            alignItems: 'flex-start'
                                        }}>
                                            <ListItemText
                                                primary={`${index + 1}. ${question.content}`}
                                                primaryTypographyProps={{fontWeight: 600, mb: 1}}
                                            />
                                            {question.reference && (
                                                <Typography
                                                    variant="body2"
                                                    color="text.secondary"
                                                    sx={{
                                                        pl: 2,
                                                        fontStyle: 'italic',
                                                        borderLeft: '2px solid',
                                                        borderColor: 'primary.main',
                                                        width: '100%'
                                                    }}
                                                >
                                                    <Box component="span" sx={{fontWeight: 600}}>Ответ: </Box>
                                                    {question.reference}
                                                </Typography>
                                            )}
                                            {!question.reference && (
                                                <Typography
                                                    variant="body2"
                                                    color="text.secondary"
                                                    sx={{fontStyle: 'italic'}}
                                                >
                                                    Ответ не указан
                                                </Typography>
                                            )}
                                        </ListItem>
                                    ))}
                                </List>
                            ) : (
                                <Typography variant="body2" color="text.secondary" sx={{mb: 3}}>
                                    Вопросы не добавлены
                                </Typography>
                            )}

                            {/* Ссылка для кандидатов */}
                            <Typography variant="subtitle2" sx={{fontWeight: 600, mb: 1}}>
                                Ссылка для кандидатов:
                            </Typography>
                            <Tooltip
                                title={copyTooltip || "Копировать ссылку"}
                                placement="top"
                                arrow
                            >
                                <Box
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 1,
                                        p: 1,
                                        backgroundColor: 'grey.100',
                                        borderRadius: 1,
                                        cursor: 'pointer',
                                        '&:hover': {
                                            backgroundColor: 'grey.200',
                                        }
                                    }}
                                    onClick={() => handleCopyLink(selectedVacancy.id)}
                                >
                                    <Typography variant="body2" sx={{
                                        fontFamily: 'monospace',
                                        fontSize: '0.9rem',
                                        flex: 1,
                                    }}>
                                        {TG_URL}{selectedVacancy.id}
                                    </Typography>
                                    <ContentCopyIcon sx={{fontSize: 16, color: 'grey.500'}}/>
                                </Box>
                            </Tooltip>
                        </Box>
                    ) : (
                        <Typography variant="body2" color="text.secondary">
                            Не удалось загрузить данные вакансии
                        </Typography>
                    )}
                </DialogContent>

                <DialogActions sx={{p: 2, gap: 1}}>
                    <Button
                        startIcon={<DeleteIcon/>}
                        onClick={handleDeleteClick}
                        color="error"
                        variant="outlined"
                    >
                        Удалить вакансию
                    </Button>
                    <Button
                        onClick={handleCloseDialog}
                        variant="contained"
                    >
                        Закрыть
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Диалог подтверждения удаления */}
            <Dialog
                open={deleteConfirmOpen}
                onClose={deleting ? undefined : handleCloseDeleteConfirm}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>
                    Подтверждение удаления
                </DialogTitle>
                <DialogContent>
                    <Typography>
                        Вы уверены, что хотите удалить вакансию "{selectedVacancy?.title}"?
                        Это действие невозможно отменить.
                    </Typography>
                </DialogContent>
                <DialogActions sx={{p: 2, gap: 1}}>
                    <Button
                        onClick={handleCloseDeleteConfirm}
                        disabled={deleting}
                    >
                        Отмена
                    </Button>
                    <Button
                        onClick={handleConfirmDelete}
                        color="error"
                        variant="contained"
                        disabled={deleting}
                        startIcon={deleting ? <CircularProgress size={16}/> : <DeleteIcon/>}
                    >
                        {deleting ? 'Удаление...' : 'Удалить'}
                    </Button>
                </DialogActions>
            </Dialog>

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
                    sx={{width: '100%'}}
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