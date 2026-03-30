import {useEffect, useState} from 'react';
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
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    Grid,
    IconButton,
    InputLabel,
    LinearProgress,
    Link,
    List,
    ListItem,
    ListItemText,
    MenuItem,
    Paper,
    Select,
    SelectChangeEvent,
    Snackbar,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TableSortLabel,
    TextField,
    Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import GradingIcon from '@mui/icons-material/Grading';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import WorkIcon from '@mui/icons-material/Work';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PhoneIcon from '@mui/icons-material/Phone';
import TelegramIcon from '@mui/icons-material/Telegram';
import {useDropzone} from 'react-dropzone';
import {CandidateQuestionAnswer, CandidateVacancyInfo, getScoreColor, getStatusColor, getStatusLabel} from '../types';
import {api} from '../services/api';

type SortOrder = 'asc' | 'desc';

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

// Тип для вакансии (можно вынести в types, если уже есть)
interface Vacancy {
    id: string;
    title: string;
}

export default function MassScreening() {
    const [searchQuery, setSearchQuery] = useState('');
    const [candidateVacancies, setCandidateVacancies] = useState<CandidateVacancyInfo[]>([]);
    const [loading, setLoading] = useState(true);
    const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
    const [snackbar, setSnackbar] = useState<SnackbarState>({
        open: false,
        message: '',
        severity: 'info',
    });

    // Состояния для диалога загрузки
    const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
    const [vacancies, setVacancies] = useState<Vacancy[]>([]);
    const [selectedVacancyId, setSelectedVacancyId] = useState<string>('');
    const [files, setFiles] = useState<File[]>([]);
    const [uploading, setUploading] = useState(false);
    const [vacancySearchQuery, setVacancySearchQuery] = useState('');

    // Состояния для модального окна деталей кандидата
    const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
    const [selectedCandidate, setSelectedCandidate] = useState<CandidateVacancyInfo | null>(null);
    const [answers, setAnswers] = useState<CandidateQuestionAnswer[]>([]);
    const [detailLoading, setDetailLoading] = useState(false);
    const [answersLoading, setAnswersLoading] = useState(false);

    useEffect(() => {
        loadCandidateVacancies();
    }, []);

    const loadCandidateVacancies = async () => {
        try {
            setLoading(true);
            const data = await api.getCandidateVacancies();
            setCandidateVacancies(data);
        } catch (error) {
            console.error('Ошибка при загрузке данных кандидатов:', error);
            showSnackbar('Ошибка при загрузке данных кандидатов', 'error');
        } finally {
            setLoading(false);
        }
    };

    const loadVacancies = async () => {
        try {
            const data = await api.getVacancies(); // предполагаемый метод
            setVacancies(data);
        } catch (error) {
            console.error('Ошибка загрузки вакансий:', error);
            showSnackbar('Не удалось загрузить список вакансий', 'error');
        }
    };

    const fetchCandidateDetails = async (candidateId: number, vacancyId: string) => {
        try {
            setDetailLoading(true);
            const candidateData = await api.getCandidateVacancyByID(candidateId, vacancyId);
            setSelectedCandidate(candidateData);

            setAnswersLoading(true);
            const answersData = await api.getCandidateVacancyAnswers(candidateId, vacancyId);
            setAnswers(answersData);
        } catch (error) {
            console.error('Ошибка при загрузке деталей кандидата:', error);
            showSnackbar('Не удалось загрузить данные кандидата', 'error');
        } finally {
            setDetailLoading(false);
            setAnswersLoading(false);
        }
    };

    const showSnackbar = (message: string, severity: SnackbarState['severity'] = 'info') => {
        setSnackbar({
            open: true,
            message,
            severity,
        });
    };

    const handleCloseSnackbar = (_event?: React.SyntheticEvent | Event, reason?: string) => {
        if (reason === 'clickaway') return;
        setSnackbar(prev => ({...prev, open: false}));
    };

    // Формируем плоскую структуру для отображения
    const candidates = candidateVacancies
        .filter(cv => !cv.meta.is_archived && cv.candidate.type == 1)
        .map(cv => ({
            ...cv.candidate,
            vacancyTitle: cv.vacancy.title,
            vacancyID: cv.vacancy.id,
            status: cv.meta.status,
            appliedAt: new Date(cv.resume_screening.created_at),
            screeningScore: cv.resume_screening.score,
            uniqueKey: `${cv.candidate.id}_${cv.vacancy.id}`,
        }));

    // Фильтрация только по имени кандидата
    const filteredCandidates = candidates.filter((candidate) =>
        candidate.full_name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Сортировка только по дате подачи
    const sortedCandidates = [...filteredCandidates].sort((a, b) => {
        const comparison = a.appliedAt.getTime() - b.appliedAt.getTime();
        return sortOrder === 'asc' ? comparison : -comparison;
    });

    const handleSort = () => {
        setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    };

    // Обработчик клика по строке: открываем модальное окно вместо навигации
    const handleRowClick = (candidateId: number, vacancyId: string) => {
        setDetailsDialogOpen(true);
        fetchCandidateDetails(candidateId, vacancyId);
    };

    const renderScoreCell = (score: number | null) => {
        if (score === null) {
            return <Typography variant="body2" color="text.secondary">—</Typography>;
        }
        return (
            <Box
                sx={{
                    display: 'inline-block',
                    px: 1.5,
                    py: 0.5,
                    borderRadius: 1,
                    bgcolor: getScoreColor(score),
                    color: 'white',
                    fontWeight: 600,
                    fontSize: '0.875rem',
                }}
            >
                {score}
            </Box>
        );
    };

    // Обработчики диалога загрузки
    const handleOpenUploadDialog = () => {
        setUploadDialogOpen(true);
        setSelectedVacancyId('');
        setFiles([]);
        setVacancySearchQuery('');
        loadVacancies();
    };

    const handleCloseUploadDialog = () => {
        setUploadDialogOpen(false);
    };

    const handleVacancyChange = (event: SelectChangeEvent) => {
        setSelectedVacancyId(event.target.value);
    };

    const onDrop = (acceptedFiles: File[]) => {
        setFiles(prev => [...prev, ...acceptedFiles]);
    };

    const removeFile = (index: number) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };

    const {getRootProps, getInputProps, isDragActive} = useDropzone({onDrop, multiple: true});

    const handleUpload = async () => {
        if (!selectedVacancyId) {
            showSnackbar('Выберите вакансию', 'warning');
            return;
        }
        if (files.length === 0) {
            showSnackbar('Добавьте файлы для загрузки', 'warning');
            return;
        }

        setUploading(true);
        let successCount = 0;
        let errorCount = 0;

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const candidateName = `Кандидат ${crypto.randomUUID()}`;

            try {
                // 1. Создаём кандидата
                const newCandidate = await api.createCandidate(candidateName);
                const candidateId = newCandidate.id;

                // 2. Загружаем файл в S3
                await api.uploadResume(candidateId, selectedVacancyId, file);

                // 3. Запускаем скрининг
                await api.processScreening(candidateId, selectedVacancyId);

                successCount++;
            } catch (error) {
                console.error(`Ошибка при обработке файла ${file.name}:`, error);
                errorCount++;
            }
        }

        setUploading(false);
        showSnackbar(`Загружено: ${successCount}, ошибок: ${errorCount}`, errorCount === 0 ? 'success' : 'warning');
        if (successCount > 0) {
            handleCloseUploadDialog();
            // Обновить список кандидатов, чтобы увидеть новых
            loadCandidateVacancies();
        }
    };

    // Фильтрация вакансий по поисковому запросу
    const filteredVacancies = vacancies.filter(v =>
        v.title.toLowerCase().includes(vacancySearchQuery.toLowerCase())
    );

    // Вспомогательные функции для форматирования (скопированы из CandidatesList)
    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    const formatDate = (dateString: Date) => {
        try {
            return new Date(dateString).toLocaleDateString('ru-RU');
        } catch (error) {
            return 'Неверная дата';
        }
    };

    // Расчет статистики для диалога
    const totalAnswers = answers.length;
    const totalScore = answers.reduce((sum, item) => sum + (item.answer?.score || 0), 0);
    const averageScore = totalAnswers > 0 ? Math.round(totalScore / totalAnswers) : 0;
    const totalTimeTaken = answers.reduce((sum, item) => sum + (item.answer?.time_taken || 0), 0);

    if (loading) {
        return (
            <Box sx={{display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400}}>
                <CircularProgress/>
            </Box>
        );
    }

    return (
        <Box>
            {/* Заголовок страницы с кнопкой загрузки */}
            <Box sx={{mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <Box>
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
                        Массовый скрининг
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Управление кандидатами, прошедшими скрининг, и подготовка к интервью
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<CloudUploadIcon/>}
                    onClick={handleOpenUploadDialog}
                    sx={{
                        background: gradientTheme.primary,
                        color: 'white',
                        '&:hover': {
                            background: gradientTheme.hover,
                        },
                    }}
                >
                    Загрузить резюме
                </Button>
            </Box>

            {/* Поле поиска на всю ширину */}
            <Paper
                elevation={0}
                sx={{
                    p: 3,
                    mb: 3,
                    borderRadius: 1,
                    background: 'white',
                    border: '1px solid',
                    borderColor: 'divider',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                }}
            >
                <TextField
                    label="Поиск по имени"
                    variant="outlined"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    sx={{
                        width: '100%',
                        '& .MuiOutlinedInput-root': {borderRadius: 1},
                    }}
                />
            </Paper>

            {/* Таблица кандидатов */}
            <TableContainer
                component={Paper}
                elevation={0}
                sx={{
                    borderRadius: 1,
                    border: '1px solid',
                    borderColor: 'divider',
                    background: 'white',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                }}
            >
                <Table>
                    <TableHead>
                        <TableRow sx={{bgcolor: 'grey.50'}}>
                            <TableCell sx={{fontWeight: 600, py: 2}}>Наименование</TableCell>
                            <TableCell sx={{fontWeight: 600, py: 2}}>Вакансия</TableCell>
                            <TableCell sx={{fontWeight: 600, py: 2}}>Статус</TableCell>
                            <TableCell sx={{fontWeight: 600, py: 2}} align="center">Скрининг</TableCell>
                            <TableCell sx={{fontWeight: 600, py: 2}}>
                                <TableSortLabel
                                    active={true}
                                    direction={sortOrder}
                                    onClick={handleSort}
                                >
                                    Дата подачи
                                </TableSortLabel>
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {sortedCandidates.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} align="center" sx={{py: 4}}>
                                    <Typography variant="body1" color="text.secondary">
                                        Кандидаты не найдены
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            sortedCandidates.map((candidate) => (
                                <TableRow
                                    key={candidate.uniqueKey}
                                    hover
                                    onClick={() => handleRowClick(candidate.id, candidate.vacancyID)}
                                    sx={{
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease',
                                        '&:hover': {
                                            bgcolor: gradientTheme.light,
                                        }
                                    }}
                                >
                                    <TableCell sx={{py: 2}}>
                                        <Typography variant="body1" sx={{fontWeight: 500}}>
                                            {candidate.full_name}
                                        </Typography>
                                    </TableCell>
                                    <TableCell sx={{py: 2}}>
                                        <Typography variant="body2">
                                            {candidate.vacancyTitle}
                                        </Typography>
                                    </TableCell>
                                    <TableCell sx={{py: 2}}>
                                        <Chip
                                            label={getStatusLabel(candidate.status)}
                                            color={getStatusColor(candidate.status)}
                                            size="small"
                                            sx={{
                                                borderRadius: 1,
                                                fontWeight: 500,
                                            }}
                                        />
                                    </TableCell>
                                    <TableCell align="center" sx={{py: 2}}>
                                        {renderScoreCell(candidate.screeningScore)}
                                    </TableCell>
                                    <TableCell sx={{py: 2}}>
                                        {candidate.appliedAt.toLocaleDateString('ru-RU')}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <Box sx={{mt: 2}}>
                <Typography variant="body2" color="text.secondary">
                    Всего кандидатов: {sortedCandidates.length}
                </Typography>
            </Box>

            {/* Диалог загрузки файлов */}
            <Dialog open={uploadDialogOpen} onClose={handleCloseUploadDialog} maxWidth="sm" fullWidth>
                <DialogTitle>Загрузка резюме</DialogTitle>
                <DialogContent>
                    <Box sx={{mt: 2, display: 'flex', flexDirection: 'column', gap: 3}}>
                        {/* Выбор вакансии с поиском */}
                        <FormControl fullWidth>
                            <InputLabel id="vacancy-select-label">Вакансия</InputLabel>
                            <Select
                                labelId="vacancy-select-label"
                                value={selectedVacancyId}
                                label="Вакансия"
                                onChange={handleVacancyChange}
                                MenuProps={{autoFocus: false}}
                            >
                                <Box sx={{p: 1, position: 'sticky', top: 0, bgcolor: 'background.paper', zIndex: 1}}>
                                    <TextField
                                        size="small"
                                        placeholder="Поиск..."
                                        value={vacancySearchQuery}
                                        onChange={(e) => setVacancySearchQuery(e.target.value)}
                                        onClick={(e) => e.stopPropagation()}
                                        fullWidth
                                    />
                                </Box>
                                {filteredVacancies.map((vacancy) => (
                                    <MenuItem key={vacancy.id} value={vacancy.id}>
                                        {vacancy.title}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        {/* Drag and drop область */}
                        <Box
                            {...getRootProps()}
                            sx={{
                                border: '2px dashed',
                                borderColor: isDragActive ? 'primary.main' : 'grey.300',
                                borderRadius: 2,
                                p: 3,
                                textAlign: 'center',
                                bgcolor: isDragActive ? 'action.hover' : 'background.default',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                            }}
                        >
                            <input {...getInputProps()} />
                            <CloudUploadIcon sx={{fontSize: 48, color: 'grey.400', mb: 1}}/>
                            <Typography variant="body1" gutterBottom>
                                {isDragActive
                                    ? 'Отпустите файлы для загрузки'
                                    : 'Перетащите файлы сюда или нажмите для выбора'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                Любые форматы, несколько файлов
                            </Typography>
                        </Box>

                        {/* Список выбранных файлов */}
                        {files.length > 0 && (
                            <List dense>
                                {files.map((file, index) => (
                                    <ListItem
                                        key={index}
                                        secondaryAction={
                                            <IconButton edge="end" onClick={() => removeFile(index)} size="small">
                                                <CloseIcon fontSize="small"/>
                                            </IconButton>
                                        }
                                    >
                                        <ListItemText primary={file.name}
                                                      secondary={`${(file.size / 1024).toFixed(2)} KB`}/>
                                    </ListItem>
                                ))}
                            </List>
                        )}
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseUploadDialog}>Отмена</Button>
                    <Button
                        onClick={handleUpload}
                        variant="contained"
                        disabled={uploading || !selectedVacancyId || files.length === 0}
                        startIcon={uploading ? <CircularProgress size={20}/> : null}
                    >
                        {uploading ? 'Загрузка...' : 'Загрузить'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Модальное окно деталей кандидата (скопировано из CandidatesList) */}
            <Dialog
                open={detailsDialogOpen}
                onClose={() => setDetailsDialogOpen(false)}
                maxWidth="md"
                fullWidth
                scroll="paper"
                PaperProps={{
                    sx: {
                        borderRadius: 1,
                    }
                }}
            >
                <DialogTitle sx={{p: 3, pb: 2}}>
                    <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                        <Typography variant="h5" component="div" sx={{fontWeight: 700}}>
                            Детали кандидата
                        </Typography>
                        <IconButton
                            onClick={() => setDetailsDialogOpen(false)}
                            sx={{
                                '&:hover': {
                                    background: gradientTheme.light,
                                },
                            }}
                        >
                            <CloseIcon/>
                        </IconButton>
                    </Box>
                </DialogTitle>

                <DialogContent dividers sx={{p: 3}}>
                    {detailLoading ? (
                        <Box sx={{display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200}}>
                            <CircularProgress/>
                        </Box>
                    ) : selectedCandidate ? (
                        <Box sx={{py: 1}}>
                            {/* Основная инфо: ФИО и статус */}
                            <Box sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'flex-start',
                                mb: 3,
                                flexDirection: {xs: 'column', md: 'row'},
                                gap: 2
                            }}>
                                <Box>
                                    <Typography variant="h5" sx={{fontWeight: 600}}>
                                        {selectedCandidate.candidate.full_name}
                                    </Typography>
                                    <Box sx={{my: 1}}/>
                                    <Chip
                                        label={getStatusLabel(selectedCandidate.meta.status)}
                                        color={getStatusColor(selectedCandidate.meta.status)}
                                        size="small"
                                        sx={{borderRadius: 2, fontWeight: 600}}
                                    />
                                </Box>
                                <Box sx={{textAlign: {xs: 'left', md: 'right'}}}>
                                    <Typography variant="caption" color="text.secondary">Дата подачи заявки</Typography>
                                    <Typography variant="body2" sx={{mb: 1, fontWeight: 500}}>
                                        {formatDate(selectedCandidate.resume_screening.created_at)}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">Последнее
                                        обновление</Typography>
                                    <Typography variant="body2" sx={{fontWeight: 500}}>
                                        {formatDate(selectedCandidate.meta.updated_at)}
                                    </Typography>
                                </Box>
                            </Box>

                            <Box sx={{my: 3}}/>

                            {/* Личные данные */}
                            <Typography variant="subtitle1" gutterBottom sx={{fontWeight: 600, mb: 2}}>
                                Личные данные
                            </Typography>
                            <Grid container spacing={3}>
                                <Grid item xs={12} md={3}>
                                    <Box sx={{display: 'flex', alignItems: 'center'}}>
                                        <WorkIcon sx={{mr: 1.5, color: 'primary.main'}}/>
                                        <Box>
                                            <Typography variant="caption" color="text.secondary">Вакансия</Typography>
                                            <Typography variant="body2"
                                                        sx={{fontWeight: 500}}>{selectedCandidate.vacancy.title}</Typography>
                                        </Box>
                                    </Box>
                                </Grid>
                                <Grid item xs={12} md={3}>
                                    <Box sx={{display: 'flex', alignItems: 'center'}}>
                                        <LocationOnIcon sx={{mr: 1.5, color: 'primary.main'}}/>
                                        <Box>
                                            <Typography variant="caption" color="text.secondary">Город
                                                проживания</Typography>
                                            <Typography variant="body2"
                                                        sx={{fontWeight: 500}}>{selectedCandidate.candidate.city || 'Не указан'}</Typography>
                                        </Box>
                                    </Box>
                                </Grid>
                                <Grid item xs={12} md={3}>
                                    <Box sx={{display: 'flex', alignItems: 'center'}}>
                                        <PhoneIcon sx={{mr: 1.5, color: 'primary.main'}}/>
                                        <Box>
                                            <Typography variant="caption" color="text.secondary">Номер
                                                телефона</Typography>
                                            <Typography variant="body2"
                                                        sx={{fontWeight: 500}}>{selectedCandidate.candidate.phone || 'Не указан'}</Typography>
                                        </Box>
                                    </Box>
                                </Grid>
                                <Grid item xs={12} md={3}>
                                    <Box sx={{display: 'flex', alignItems: 'center'}}>
                                        <TelegramIcon sx={{mr: 1.5, color: 'primary.main'}}/>
                                        <Box>
                                            <Typography variant="caption" color="text.secondary">Telegram</Typography>
                                            <Typography variant="body2" sx={{fontWeight: 500}}>
                                                {selectedCandidate.candidate.telegram_username ? (
                                                    <Link
                                                        href={`https://t.me/${selectedCandidate.candidate.telegram_username}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        sx={{textDecoration: 'none', color: 'primary.main'}}
                                                    >
                                                        {`@${selectedCandidate.candidate.telegram_username}`}
                                                    </Link>
                                                ) : 'Не указан'}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Grid>
                            </Grid>

                            <Box sx={{my: 3}}/>

                            <Box sx={{display: 'flex', alignItems: 'center', gap: 1.5, mb: 3}}>
                                <InsertDriveFileIcon
                                    sx={{color: 'primary.main', borderRadius: 1}}/>
                                <Button
                                    variant="outlined"
                                    size="small"
                                    href={selectedCandidate.resume_link}
                                    target="_blank"
                                    sx={{
                                        borderRadius: 4,
                                        textTransform: 'none',
                                        px: 2,
                                    }}
                                >
                                    Скачать резюме
                                </Button>
                            </Box>

                            <Box sx={{my: 3}}/>

                            {/* Результаты оценки */}
                            <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2}}>
                                <Typography variant="subtitle1" sx={{fontWeight: 700}}>Результаты оценки</Typography>
                                <Box sx={{display: 'flex', alignItems: 'baseline', gap: 0.5}}>
                                    <Typography variant="body2"
                                                sx={{
                                                    color: getScoreColor(selectedCandidate.resume_screening?.score || 0),
                                                    fontWeight: 700
                                                }}>
                                        {selectedCandidate.resume_screening?.score}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        скрининг
                                    </Typography>
                                </Box>
                            </Box>

                            {/* Фидбек от LLM */}
                            {selectedCandidate.resume_screening?.feedback && (
                                <>
                                    <Box sx={{my: 2}}/>
                                    <Box>
                                        <Card variant="outlined" sx={{borderRadius: 1}}>
                                            <CardContent>
                                                <Typography variant="body2"
                                                            sx={{whiteSpace: 'pre-wrap', lineHeight: 1.6}}>
                                                    {selectedCandidate.resume_screening.feedback}
                                                </Typography>
                                            </CardContent>
                                        </Card>
                                    </Box>
                                </>
                            )}

                            <Box sx={{my: 3}}/>

                            {/* Ответы на вопросы */}
                            <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', mb: 2}}>
                                <Typography variant="subtitle1" sx={{fontWeight: 600}}>
                                    Ответы на вопросы интервью
                                </Typography>
                                {!answersLoading && answers.length > 0 && (
                                    <Box sx={{display: 'flex', gap: 2}}>
                                        <Box sx={{display: 'flex', alignItems: 'baseline', gap: 0.5}}>
                                            <Typography variant="body2" color="primary.main" fontWeight={700}>
                                                {totalAnswers}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                вопросов
                                            </Typography>
                                        </Box>
                                        <Box sx={{display: 'flex', alignItems: 'baseline', gap: 0.5}}>
                                            <Typography variant="body2"
                                                        sx={{color: getScoreColor(averageScore), fontWeight: 700}}>
                                                {averageScore}%
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                ср. балл
                                            </Typography>
                                        </Box>
                                        <Box sx={{display: 'flex', alignItems: 'baseline', gap: 0.5}}>
                                            <Typography variant="body2" color="secondary.main" fontWeight={700}>
                                                {formatTime(totalTimeTaken)}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                время
                                            </Typography>
                                        </Box>
                                    </Box>
                                )}
                            </Box>

                            {answersLoading ? (
                                <Box sx={{textAlign: 'center', py: 2}}>
                                    <Typography variant="body2" color="text.secondary">Загрузка ответов...</Typography>
                                    <LinearProgress sx={{mt: 1}}/>
                                </Box>
                            ) : answers.length > 0 ? (
                                <Box>
                                    {answers.map((item, index) => (
                                        <Accordion key={item.question.id} sx={{
                                            mb: 1,
                                            border: '1px solid',
                                            borderColor: 'divider',
                                            boxShadow: 'none'
                                        }}>
                                            <AccordionSummary expandIcon={<ExpandMoreIcon/>}>
                                                <Box sx={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    width: '100%',
                                                    justifyContent: 'space-between'
                                                }}>
                                                    <Typography variant="body2" sx={{fontWeight: 600}}>
                                                        Вопрос {index + 1}: {item.question.content.length > 50 ? `${item.question.content.substring(0, 50)}...` : item.question.content}
                                                    </Typography>
                                                    <Box sx={{display: 'flex', gap: 1, ml: 1}}>
                                                        {item.answer?.score !== undefined && (
                                                            <Chip
                                                                icon={<GradingIcon sx={{fontSize: '1rem !important'}}/>}
                                                                label={`${item.answer.score}%`}
                                                                size="small"
                                                                color={item.answer.score >= 70 ? 'success' : item.answer.score >= 40 ? 'warning' : 'error'}
                                                                variant="outlined"
                                                            />
                                                        )}
                                                    </Box>
                                                </Box>
                                            </AccordionSummary>
                                            <AccordionDetails sx={{borderTop: '1px solid', borderColor: 'divider'}}>
                                                <Grid container spacing={2}>
                                                    <Grid item xs={12} md={6}>
                                                        <Typography variant="caption" color="text.secondary"
                                                                    sx={{fontWeight: 600}}>Вопрос:</Typography>
                                                        <Typography variant="body2" sx={{
                                                            fontWeight: 500,
                                                            mb: 1
                                                        }}>{item.question.content}</Typography>
                                                        {item.question.reference && (
                                                            <>
                                                                <Typography variant="caption" color="text.secondary"
                                                                            sx={{fontWeight: 600}}>Идеальный
                                                                    ответ:</Typography>
                                                                <Box sx={{
                                                                    p: 1.5,
                                                                    mb: 1,
                                                                    borderRadius: 1,
                                                                    background: '#e8f5e9',
                                                                    border: '1px solid #c8e6c9'
                                                                }}>
                                                                    <Typography variant="body2"
                                                                                color="success.dark">{item.question.reference}</Typography>
                                                                </Box>
                                                            </>
                                                        )}
                                                    </Grid>
                                                    <Grid item xs={12} md={6}>
                                                        <Typography variant="caption" color="text.secondary"
                                                                    sx={{fontWeight: 600}}>Ответ кандидата:</Typography>
                                                        <Typography variant="body2" sx={{fontWeight: 500, mb: 1}}>
                                                            {item.answer?.content || 'Ответ не предоставлен'}
                                                        </Typography>
                                                        <Box sx={{display: 'flex', gap: 1}}>
                                                            {item.answer?.time_taken !== undefined && (
                                                                <Chip
                                                                    icon={<AccessTimeIcon
                                                                        sx={{fontSize: '1rem !important'}}/>}
                                                                    label={`Время: ${formatTime(item.answer.time_taken)}`}
                                                                    size="small"
                                                                    variant="outlined"
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
                                <Typography variant="body2" color="text.secondary">Кандидат еще не отвечал на вопросы
                                    интервью.</Typography>
                            )}
                        </Box>
                    ) : (
                        <Typography variant="body2" color="text.secondary">Не удалось загрузить данные
                            кандидата</Typography>
                    )}
                </DialogContent>
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