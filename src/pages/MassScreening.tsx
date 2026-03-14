import {useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {
    Alert,
    Box,
    Button,
    Chip,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    IconButton,
    InputLabel,
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
import {useDropzone} from 'react-dropzone';
import {CandidateVacancyInfo, getScoreColor, getStatusColor, getStatusLabel} from '../types';
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
    const navigate = useNavigate();
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
        .filter(cv => !cv.meta.is_archived)
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

    const handleRowClick = (candidateId: number, vacancyId: string) => {
        navigate(`/candidates/${candidateId}/${vacancyId}`);
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
            const candidateName = `Чурбашвили ${i + 1}`;

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

            {/* Таблица кандидатов (без изменений) */}
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
                                <TableCell colSpan={4} align="center" sx={{py: 4}}>
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