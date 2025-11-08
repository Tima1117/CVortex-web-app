import {useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {
    Alert,
    Box,
    Chip,
    FormControl,
    IconButton,
    InputLabel,
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
import {CandidateVacancyInfo, getScoreColor, getStatusColor, getStatusLabel} from '../types';
import {api} from '../services/api';

type SortField = 'fullName' | 'vacancyTitle' | 'status' | 'screeningScore' | 'interviewScore' | 'appliedAt';
type SortOrder = 'asc' | 'desc' | null;

interface SnackbarState {
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'warning' | 'info';
}

export default function CandidatesList() {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [candidateVacancies, setCandidateVacancies] = useState<CandidateVacancyInfo[]>([]);
    const [loading, setLoading] = useState(true);
    const [sortField, setSortField] = useState<SortField>('appliedAt');
    const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
    const [snackbar, setSnackbar] = useState<SnackbarState>({
        open: false,
        message: '',
        severity: 'info',
    });

    // Загрузка данных из API
    useEffect(() => {
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

        loadCandidateVacancies();
    }, []);

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
        return matchesSearch && matchesStatus;
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

    const handleRowClick = (candidateId: number, vacancy_id: string) => {
        navigate(`/candidates/${candidateId}/${vacancy_id}`);
    };

    const handleStatusFilterChange = (event: SelectChangeEvent) => {
        setStatusFilter(event.target.value);
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
            <Box sx={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400}}>
                <Typography variant="h6">Загрузка данных...</Typography>
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
                <Box sx={{display: 'flex', gap: 2, flexWrap: 'wrap'}}>
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
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {sortedCandidates.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} align="center">
                                    <Typography variant="body1" color="text.secondary" sx={{py: 4}}>
                                        Кандидаты не найдены
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            sortedCandidates.map((candidate) => (
                                <TableRow
                                    key={candidate.id}
                                    hover
                                    sx={{cursor: 'pointer'}}
                                >
                                    <TableCell onClick={() => handleRowClick(candidate.id, candidate.vacancyID)}>
                                        <Typography variant="body1" sx={{fontWeight: 500}}>
                                            {candidate.full_name}
                                        </Typography>
                                    </TableCell>
                                    <TableCell
                                        onClick={() => handleRowClick(candidate.id, candidate.vacancyID)}>{candidate.vacancyTitle}</TableCell>
                                    <TableCell
                                        onClick={() => handleRowClick(candidate.id, candidate.vacancyID)}>{candidate.city}</TableCell>
                                    <TableCell onClick={() => handleRowClick(candidate.id, candidate.vacancyID)}>
                                        <Chip
                                            label={getStatusLabel(candidate.status)}
                                            color={getStatusColor(candidate.status)}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell align="center"
                                               onClick={() => handleRowClick(candidate.id, candidate.vacancyID)}>
                                        {renderScoreCell(candidate.screeningScore)}
                                    </TableCell>
                                    <TableCell align="center"
                                               onClick={() => handleRowClick(candidate.id, candidate.vacancyID)}>
                                        {renderScoreCell(candidate.interviewScore)}
                                    </TableCell>
                                    <TableCell onClick={() => handleRowClick(candidate.id, candidate.vacancyID)}>
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