import {useEffect, useState} from 'react';
import ArchiveIcon from '@mui/icons-material/Archive';
import UnarchiveIcon from '@mui/icons-material/Unarchive';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Checkbox,
    Chip,
    CircularProgress,
    Dialog,
    DialogContent,
    DialogTitle,
    FormControl,
    FormControlLabel,
    Grid,
    IconButton,
    InputLabel,
    LinearProgress,
    Link,
    Menu,
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
    Tooltip,
    Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PhoneIcon from '@mui/icons-material/Phone';
import TelegramIcon from '@mui/icons-material/Telegram';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import WorkIcon from '@mui/icons-material/Work';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import GradingIcon from '@mui/icons-material/Grading';
import {CandidateQuestionAnswer, CandidateVacancyInfo, getScoreColor, getStatusColor, getStatusLabel} from '../types';
import {api} from '../services/api';

type SortField = 'fullName' | 'vacancyTitle' | 'status' | 'screeningScore' | 'interviewScore' | 'appliedAt';
type SortOrder = 'asc' | 'desc' | null;

interface SnackbarState {
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'warning' | 'info';
}

interface MenuState {
    anchorEl: HTMLElement | null;
    candidateId: number | null;
    vacancyId: string | null;
    isArchived: boolean | null;
}

// Градиентная тема на основе логотипа
const gradientTheme = {
    primary: 'linear-gradient(135deg, #0088CC, #764ba2)',
    light: 'linear-gradient(135deg, #e6f4ff, #f3e8ff)',
    hover: 'linear-gradient(135deg, #0077b3, #6a4190)',
};

export default function CandidatesList() {
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [showArchived, setShowArchived] = useState(false);
    const [candidateVacancies, setCandidateVacancies] = useState<CandidateVacancyInfo[]>([]);
    const [loading, setLoading] = useState(true);
    const [sortField, setSortField] = useState<SortField>('appliedAt');
    const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
    const [snackbar, setSnackbar] = useState<SnackbarState>({
        open: false,
        message: '',
        severity: 'info',
    });
    const [menu, setMenu] = useState<MenuState>({
        anchorEl: null,
        candidateId: null,
        vacancyId: null,
        isArchived: null,
    });

    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedCandidate, setSelectedCandidate] = useState<CandidateVacancyInfo | null>(null);
    const [answers, setAnswers] = useState<CandidateQuestionAnswer[]>([]);
    const [detailLoading, setDetailLoading] = useState(false);
    const [answersLoading, setAnswersLoading] = useState(false);

    // Загрузка данных из API
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
        if (reason === 'clickaway') {
            return;
        }
        setSnackbar(prev => ({...prev, open: false}));
    };

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, candidateId: number, vacancyId: string, isArchived: boolean) => {
        event.stopPropagation();
        setMenu({
            anchorEl: event.currentTarget,
            candidateId,
            vacancyId,
            isArchived,
        });
    };

    const handleMenuClose = () => {
        setMenu({
            anchorEl: null,
            candidateId: null,
            vacancyId: null,
            isArchived: null,
        });
    };

    const handleArchiveToggle = async (candidateId: number, vacancyId: string, isCurrentlyArchived: boolean) => {
        try {
            if (isCurrentlyArchived) {
                showSnackbar('Функционал разархивации пока не реализован', 'warning');
            } else {
                await api.archiveCandidateVacancy(candidateId, vacancyId);
                showSnackbar('Кандидат успешно заархивирован', 'success');
            }

            handleMenuClose();
            await loadCandidateVacancies();
        } catch (error) {
            console.error('Ошибка при архивации кандидата:', error);
            showSnackbar('Ошибка при архивации кандидата', 'error');
        }
    };

    const handleOpenDetails = (candidateId: number, vacancyId: string) => {
        setDialogOpen(true);
        fetchCandidateDetails(candidateId, vacancyId);
    };

    const handleCloseDialog = () => {
        setDialogOpen(false);
        setSelectedCandidate(null);
        setAnswers([]);
    };

    const uniqueStatuses = Array.from(
        new Set(candidateVacancies.map(cv => cv.meta.status))
    );

    const candidates = candidateVacancies.map(cv => ({
        ...cv.candidate,
        vacancyTitle: cv.vacancy.title,
        vacancyID: cv.vacancy.id,
        status: cv.meta.status,
        appliedAt: new Date(cv.resume_screening.created_at),
        screeningScore: cv.resume_screening.score,
        interviewScore: cv.meta.interview_score,
        isArchived: cv.meta.is_archived,
        uniqueKey: `${cv.candidate.id}_${cv.vacancy.id}`,
    }));

    const statusOrder: Record<string, number> = {
        'screening_ok': 1,
        'screening_failed': 2,
        'interview_ok': 3,
        'interview_failed': 4,
    };

    const filteredCandidates = candidates.filter((candidate) => {
        const matchesSearch = candidate.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            candidate.vacancyTitle.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'all' || candidate.status === statusFilter;
        const matchesArchived = showArchived ? true : !candidate.isArchived;

        return matchesSearch && matchesStatus && matchesArchived && candidate.type == 0;
    });

    const sortedCandidates = [...filteredCandidates].sort((a, b) => {
        if (!sortOrder) return 0;

        let comparison = 0;

        switch (sortField) {
            case 'fullName':
                comparison = a.full_name.localeCompare(b.full_name, 'ru');
                break;
            case 'vacancyTitle':
                comparison = a.vacancyTitle.localeCompare(b.vacancyTitle, 'ru');
                break;
            case 'status':
                comparison = (statusOrder[a.status] || 999) - (statusOrder[b.status] || 999);
                break;
            case 'screeningScore': {
                const scoreA = a.screeningScore ?? -1;
                const scoreB = b.screeningScore ?? -1;
                comparison = scoreA - scoreB;
                break;
            }
            case 'interviewScore': {
                const intScoreA = a.interviewScore ?? -1;
                const intScoreB = b.interviewScore ?? -1;
                comparison = intScoreA - intScoreB;
                break;
            }
            case 'appliedAt':
                comparison = a.appliedAt.getTime() - b.appliedAt.getTime();
                break;
        }

        return sortOrder === 'asc' ? comparison : -comparison;
    });

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            if (sortOrder === 'asc') {
                setSortOrder('desc');
            } else if (sortOrder === 'desc') {
                setSortOrder(null);
                setSortField('appliedAt');
            }
        } else {
            setSortField(field);
            setSortOrder('asc');
        }
    };

    const handleStatusFilterChange = (event: SelectChangeEvent) => {
        setStatusFilter(event.target.value);
    };

    const handleShowArchivedChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setShowArchived(event.target.checked);
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
            {/* Заголовок страницы */}
            <Box sx={{mb: 4}}>
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
                    Кандидаты
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Управление кандидатами и отслеживание процесса отбора
                </Typography>
            </Box>

            {/* Фильтры */}
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
                <Box sx={{display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'flex-start'}}>
                    <TextField
                        label="Поиск по имени или вакансии"
                        variant="outlined"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        sx={{
                            flex: 1,
                            minWidth: 250,
                            '& .MuiOutlinedInput-root': {
                                borderRadius: 1,
                            },
                        }}
                    />
                    <FormControl sx={{minWidth: 200}}>
                        <InputLabel>Статус</InputLabel>
                        <Select
                            value={statusFilter}
                            label="Статус"
                            onChange={handleStatusFilterChange}
                            sx={{
                                borderRadius: 1,
                            }}
                        >
                            <MenuItem value="all">Все статусы</MenuItem>
                            {uniqueStatuses.map(status => (
                                <MenuItem key={status} value={status}>
                                    {getStatusLabel(status)}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <Tooltip title={showArchived ? "Скрыть архивные" : "Показать архивные"}>
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={showArchived}
                                    onChange={handleShowArchivedChange}
                                    color="primary"
                                    icon={<ArchiveIcon fontSize="small"/>}
                                    checkedIcon={<ArchiveIcon fontSize="small"/>}
                                />
                            }
                            label=""
                            sx={{
                                mt: 1,
                                '& .MuiFormControlLabel-label': {display: 'none'},
                                '&:hover': {
                                    backgroundColor: gradientTheme.light,
                                    borderRadius: 1,
                                },
                            }}
                        />
                    </Tooltip>
                </Box>
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
                            <TableCell sx={{fontWeight: 600, py: 2}}>
                                <TableSortLabel
                                    active={sortField === 'fullName' && sortOrder !== null}
                                    direction={sortField === 'fullName' && sortOrder ? sortOrder : 'asc'}
                                    onClick={() => handleSort('fullName')}
                                >
                                    ФИО
                                </TableSortLabel>
                            </TableCell>
                            <TableCell sx={{fontWeight: 600, py: 2}}>
                                <TableSortLabel
                                    active={sortField === 'vacancyTitle' && sortOrder !== null}
                                    direction={sortField === 'vacancyTitle' && sortOrder ? sortOrder : 'asc'}
                                    onClick={() => handleSort('vacancyTitle')}
                                >
                                    Вакансия
                                </TableSortLabel>
                            </TableCell>
                            <TableCell sx={{fontWeight: 600, py: 2}}>Город</TableCell>
                            <TableCell sx={{fontWeight: 600, py: 2}}>
                                <TableSortLabel
                                    active={sortField === 'status' && sortOrder !== null}
                                    direction={sortField === 'status' && sortOrder ? sortOrder : 'asc'}
                                    onClick={() => handleSort('status')}
                                >
                                    Статус
                                </TableSortLabel>
                            </TableCell>
                            <TableCell sx={{fontWeight: 600, py: 2}} align="center">
                                <TableSortLabel
                                    active={sortField === 'screeningScore' && sortOrder !== null}
                                    direction={sortField === 'screeningScore' && sortOrder ? sortOrder : 'asc'}
                                    onClick={() => handleSort('screeningScore')}
                                >
                                    Скрининг
                                </TableSortLabel>
                            </TableCell>
                            <TableCell sx={{fontWeight: 600, py: 2}} align="center">
                                <TableSortLabel
                                    active={sortField === 'interviewScore' && sortOrder !== null}
                                    direction={sortField === 'interviewScore' && sortOrder ? sortOrder : 'asc'}
                                    onClick={() => handleSort('interviewScore')}
                                >
                                    Интервью
                                </TableSortLabel>
                            </TableCell>
                            <TableCell sx={{fontWeight: 600, py: 2}}>
                                <TableSortLabel
                                    active={sortField === 'appliedAt' && sortOrder !== null}
                                    direction={sortField === 'appliedAt' && sortOrder ? sortOrder : 'asc'}
                                    onClick={() => handleSort('appliedAt')}
                                >
                                    Дата подачи
                                </TableSortLabel>
                            </TableCell>
                            <TableCell sx={{fontWeight: 600, py: 2}} align="center">
                                Действия
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {sortedCandidates.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} align="center" sx={{py: 4}}>
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
                                    onClick={() => handleOpenDetails(candidate.id, candidate.vacancyID)}
                                    sx={{
                                        cursor: candidate.isArchived ? 'default' : 'pointer',
                                        bgcolor: candidate.isArchived ? 'action.hover' : 'inherit',
                                        opacity: candidate.isArchived ? 0.6 : 1,
                                        transition: 'all 0.2s ease',
                                        '&:hover': {
                                            bgcolor: candidate.isArchived ? 'action.hover' : gradientTheme.light,
                                        }
                                    }}
                                >
                                    <TableCell sx={{py: 2}}>
                                        <Box sx={{display: 'flex', alignItems: 'center'}}>
                                            <Typography
                                                variant="body1"
                                                sx={{
                                                    fontWeight: 500,
                                                    color: candidate.isArchived ? 'text.secondary' : 'text.primary'
                                                }}
                                            >
                                                {candidate.full_name}
                                            </Typography>
                                            {candidate.isArchived && (
                                                <Chip
                                                    label="Архив"
                                                    size="small"
                                                    color="default"
                                                    variant="outlined"
                                                    sx={{
                                                        ml: 1,
                                                        fontSize: '0.7rem',
                                                        height: 24,
                                                        borderRadius: 1,
                                                    }}
                                                />
                                            )}
                                        </Box>
                                    </TableCell>
                                    <TableCell sx={{py: 2, color: candidate.isArchived ? 'text.secondary' : 'inherit'}}>
                                        {candidate.vacancyTitle}
                                    </TableCell>
                                    <TableCell sx={{py: 2, color: candidate.isArchived ? 'text.secondary' : 'inherit'}}>
                                        {candidate.city}
                                    </TableCell>
                                    <TableCell sx={{py: 2}}>
                                        <Chip
                                            label={getStatusLabel(candidate.status)}
                                            color={getStatusColor(candidate.status)}
                                            size="small"
                                            variant={candidate.isArchived ? "outlined" : "filled"}
                                            sx={{
                                                borderRadius: 1,
                                                opacity: candidate.isArchived ? 0.7 : 1,
                                                fontWeight: 500,
                                            }}
                                        />
                                    </TableCell>
                                    <TableCell align="center" sx={{py: 2}}>
                                        {renderScoreCell(candidate.screeningScore)}
                                    </TableCell>
                                    <TableCell align="center" sx={{py: 2}}>
                                        {renderScoreCell(candidate.interviewScore)}
                                    </TableCell>
                                    <TableCell sx={{py: 2, color: candidate.isArchived ? 'text.secondary' : 'inherit'}}>
                                        {candidate.appliedAt.toLocaleDateString('ru-RU')}
                                    </TableCell>
                                    <TableCell align="center" sx={{py: 2}} onClick={(e) => e.stopPropagation()}>
                                        <IconButton
                                            onClick={(e) => handleMenuOpen(e, candidate.id, candidate.vacancyID, candidate.isArchived)}
                                            size="small"
                                            sx={{
                                                '&:hover': {
                                                    background: gradientTheme.light,
                                                },
                                                transition: 'all 0.2s ease',
                                            }}
                                        >
                                            <MoreVertIcon/>
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Модальное окно деталей кандидата */}
            <Dialog
                open={dialogOpen}
                onClose={handleCloseDialog}
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
                            onClick={handleCloseDialog}
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


                                    {/* Аккордеоны с ответами */}
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
                                                                label={`${item.answer.score}%`} size="small"
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
                                                                <Chip icon={<AccessTimeIcon
                                                                    sx={{fontSize: '1rem !important'}}/>}
                                                                      label={`Время: ${formatTime(item.answer.time_taken)}`}
                                                                      size="small" variant="outlined"/>
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

            {/* Меню действий */}
            <Menu
                anchorEl={menu.anchorEl}
                open={Boolean(menu.anchorEl)}
                onClose={handleMenuClose}
                onClick={(e) => e.stopPropagation()}
                PaperProps={{
                    sx: {borderRadius: 1, boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}
                }}
            >
                {menu.isArchived ? (
                    <MenuItem disabled sx={{borderRadius: 0.5, m: 0.5}}>
                        <UnarchiveIcon sx={{mr: 1, fontSize: 20}}/> Разархивировать
                    </MenuItem>
                ) : (
                    <MenuItem
                        onClick={() => {
                            if (menu.candidateId && menu.vacancyId) {
                                handleArchiveToggle(menu.candidateId, menu.vacancyId, false);
                            }
                        }}
                        sx={{
                            borderRadius: 0.5,
                            m: 0.5,
                            '&:hover': {background: gradientTheme.light},
                        }}
                    >
                        <ArchiveIcon sx={{mr: 1, fontSize: 20}}/> Архивировать
                    </MenuItem>
                )}
            </Menu>

            <Box sx={{mt: 2}}>
                <Typography variant="body2" color="text.secondary">
                    Всего кандидатов: {sortedCandidates.length}
                    {showArchived && (
                        <span>{' '}(включая архивные: {candidates.filter(c => c.isArchived).length})</span>
                    )}
                </Typography>
            </Box>

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
                        <IconButton size="small" aria-label="close" color="inherit" onClick={handleCloseSnackbar}>
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