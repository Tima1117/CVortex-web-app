import {useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import ArchiveIcon from '@mui/icons-material/Archive';
import UnarchiveIcon from '@mui/icons-material/Unarchive';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import {
    Alert,
    Box,
    Checkbox,
    Chip,
    CircularProgress,
    FormControl,
    FormControlLabel,
    IconButton,
    InputLabel,
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
import {CandidateVacancyInfo, getScoreColor, getStatusColor, getStatusLabel} from '../types';
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

export default function CandidatesList() {
    const navigate = useNavigate();
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

    // Функции для управления меню
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

    // Функция архивации/разархивации
    const handleArchiveToggle = async (candidateId: number, vacancyId: string, isCurrentlyArchived: boolean) => {
        try {
            if (isCurrentlyArchived) {
                // Разархивация - здесь нужно добавить соответствующий метод API
                // await api.unarchiveCandidateVacancy(candidateId, vacancyId);
                showSnackbar('Функционал разархивации пока не реализован', 'warning');
            } else {
                // Архивация
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

    const uniqueStatuses = Array.from(
        new Set(candidateVacancies.map(cv => cv.meta.status))
    );

    const candidates = candidateVacancies.map(cv => ({
        ...cv.candidate,
        vacancyTitle: cv.vacancy.title,
        vacancyID: cv.vacancy.id,
        status: cv.meta.status,
        appliedAt: new Date(cv.candidate.created_at),
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

        return matchesSearch && matchesStatus && matchesArchived;
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

    const handleRowClick = (candidateId: number, vacancyId: string) => {
        // if (isArchived) {
        //     showSnackbar('Заархивированная запись недоступна для редактирования', 'warning'); // todo
        //     return;
        // }
        navigate(`/candidates/${candidateId}/${vacancyId}`);
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
                    borderRadius: 3,
                    bgcolor: getScoreColor(score),
                    color: 'white',
                    fontWeight: 600,
                }}
            >
                {score}
            </Box>
        );
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
            <Typography variant="h4" gutterBottom sx={{fontWeight: 600, mb: 3}}>
                Кандидаты
            </Typography>

            {/* Фильтры */}
            <Box sx={{mb: 3}}>
                <Box sx={{display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'flex-start'}}>
                    <TextField
                        label="Поиск по имени или вакансии"
                        variant="outlined"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        sx={{flex: 1, minWidth: 250}}
                    />
                    <FormControl sx={{minWidth: 200}}>
                        <InputLabel>Статус</InputLabel>
                        <Select
                            value={statusFilter}
                            label="Статус"
                            onChange={handleStatusFilterChange}
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
                            sx={{mt: 1, '& .MuiFormControlLabel-label': {display: 'none'}}}
                        />
                    </Tooltip>
                </Box>
            </Box>

            {/* Таблица кандидатов */}
            <TableContainer component={Paper} elevation={2}>
                <Table>
                    <TableHead sx={{bgcolor: '#f5f5f5'}}>
                        <TableRow>
                            <TableCell sx={{fontWeight: 600}}>
                                <TableSortLabel
                                    active={sortField === 'fullName' && sortOrder !== null}
                                    direction={sortField === 'fullName' && sortOrder ? sortOrder : 'asc'}
                                    onClick={() => handleSort('fullName')}
                                >
                                    ФИО
                                </TableSortLabel>
                            </TableCell>
                            <TableCell sx={{fontWeight: 600}}>
                                <TableSortLabel
                                    active={sortField === 'vacancyTitle' && sortOrder !== null}
                                    direction={sortField === 'vacancyTitle' && sortOrder ? sortOrder : 'asc'}
                                    onClick={() => handleSort('vacancyTitle')}
                                >
                                    Вакансия
                                </TableSortLabel>
                            </TableCell>
                            <TableCell sx={{fontWeight: 600}}>Город</TableCell>
                            <TableCell sx={{fontWeight: 600}}>
                                <TableSortLabel
                                    active={sortField === 'status' && sortOrder !== null}
                                    direction={sortField === 'status' && sortOrder ? sortOrder : 'asc'}
                                    onClick={() => handleSort('status')}
                                >
                                    Статус
                                </TableSortLabel>
                            </TableCell>
                            <TableCell sx={{fontWeight: 600}} align="center">
                                <TableSortLabel
                                    active={sortField === 'screeningScore' && sortOrder !== null}
                                    direction={sortField === 'screeningScore' && sortOrder ? sortOrder : 'asc'}
                                    onClick={() => handleSort('screeningScore')}
                                >
                                    Скрининг
                                </TableSortLabel>
                            </TableCell>
                            <TableCell sx={{fontWeight: 600}} align="center">
                                <TableSortLabel
                                    active={sortField === 'interviewScore' && sortOrder !== null}
                                    direction={sortField === 'interviewScore' && sortOrder ? sortOrder : 'asc'}
                                    onClick={() => handleSort('interviewScore')}
                                >
                                    Интервью
                                </TableSortLabel>
                            </TableCell>
                            <TableCell sx={{fontWeight: 600}}>
                                <TableSortLabel
                                    active={sortField === 'appliedAt' && sortOrder !== null}
                                    direction={sortField === 'appliedAt' && sortOrder ? sortOrder : 'asc'}
                                    onClick={() => handleSort('appliedAt')}
                                >
                                    Дата подачи
                                </TableSortLabel>
                            </TableCell>
                            <TableCell sx={{fontWeight: 600}} align="center">
                                Действия
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {sortedCandidates.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} align="center">
                                    <Typography variant="body1" color="text.secondary" sx={{py: 4}}>
                                        Кандидаты не найдены
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            sortedCandidates.map((candidate) => (
                                <TableRow
                                    key={candidate.uniqueKey}
                                    hover
                                    sx={{
                                        cursor: candidate.isArchived ? 'default' : 'pointer',
                                        bgcolor: candidate.isArchived ? 'action.hover' : 'inherit',
                                        opacity: candidate.isArchived ? 0.6 : 1,
                                        '&:hover': {
                                            bgcolor: candidate.isArchived ? 'action.hover' : 'action.hover',
                                        }
                                    }}
                                >
                                    <TableCell
                                        onClick={() => handleRowClick(candidate.id, candidate.vacancyID)}
                                    >
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
                                                    sx={{ml: 1, fontSize: '0.7rem', height: 24}}
                                                />
                                            )}
                                        </Box>
                                    </TableCell>
                                    <TableCell
                                        onClick={() => handleRowClick(candidate.id, candidate.vacancyID)}
                                        sx={{color: candidate.isArchived ? 'text.secondary' : 'inherit'}}
                                    >
                                        {candidate.vacancyTitle}
                                    </TableCell>
                                    <TableCell
                                        onClick={() => handleRowClick(candidate.id, candidate.vacancyID)}
                                        sx={{color: candidate.isArchived ? 'text.secondary' : 'inherit'}}
                                    >
                                        {candidate.city}
                                    </TableCell>
                                    <TableCell
                                        onClick={() => handleRowClick(candidate.id, candidate.vacancyID)}
                                    >
                                        <Chip
                                            label={getStatusLabel(candidate.status)}
                                            color={getStatusColor(candidate.status)}
                                            size="small"
                                            variant={candidate.isArchived ? "outlined" : "filled"}
                                            sx={{
                                                opacity: candidate.isArchived ? 0.7 : 1
                                            }}
                                        />
                                    </TableCell>
                                    <TableCell
                                        align="center"
                                        onClick={() => handleRowClick(candidate.id, candidate.vacancyID)}
                                    >
                                        {renderScoreCell(candidate.screeningScore)}
                                    </TableCell>
                                    <TableCell
                                        align="center"
                                        onClick={() => handleRowClick(candidate.id, candidate.vacancyID)}
                                    >
                                        {renderScoreCell(candidate.interviewScore)}
                                    </TableCell>
                                    <TableCell
                                        onClick={() => handleRowClick(candidate.id, candidate.vacancyID)}
                                        sx={{color: candidate.isArchived ? 'text.secondary' : 'inherit'}}
                                    >
                                        {candidate.appliedAt.toLocaleDateString('ru-RU')}
                                    </TableCell>
                                    <TableCell align="center">
                                        <IconButton
                                            onClick={(e) => handleMenuOpen(e, candidate.id, candidate.vacancyID, candidate.isArchived)}
                                            size="small"
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

            {/* Меню действий */}
            <Menu
                anchorEl={menu.anchorEl}
                open={Boolean(menu.anchorEl)}
                onClose={handleMenuClose}
                onClick={(e) => e.stopPropagation()}
            >
                {menu.isArchived ? (
                    <MenuItem
                        onClick={() => {
                            if (menu.candidateId && menu.vacancyId) {
                                handleArchiveToggle(menu.candidateId, menu.vacancyId, true);
                            }
                        }}
                        disabled // Заглушка для разархивации
                    >
                        <UnarchiveIcon sx={{mr: 1, fontSize: 20}}/>
                        Разархивировать
                    </MenuItem>
                ) : (
                    <MenuItem
                        onClick={() => {
                            if (menu.candidateId && menu.vacancyId) {
                                handleArchiveToggle(menu.candidateId, menu.vacancyId, false);
                            }
                        }}
                    >
                        <ArchiveIcon sx={{mr: 1, fontSize: 20}}/>
                        Архивировать
                    </MenuItem>
                )}
                {/* Можно добавить другие пункты меню в будущем */}
                {/* <MenuItem onClick={handleMenuClose}>
                    <EditIcon sx={{ mr: 1, fontSize: 20 }} />
                    Редактировать
                </MenuItem> */}
            </Menu>

            <Box sx={{mt: 2}}>
                <Typography variant="body2" color="text.secondary">
                    Всего кандидатов: {sortedCandidates.length}
                    {showArchived && (
                        <span>
                            {' '}(включая архивные: {candidates.filter(c => c.isArchived).length})
                        </span>
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