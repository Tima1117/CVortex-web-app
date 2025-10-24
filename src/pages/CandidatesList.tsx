import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Box,
  Typography,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  SelectChangeEvent,
  IconButton,
  Tooltip,
  FormControlLabel,
  Checkbox,
  TableSortLabel,
} from '@mui/material';
import ArchiveIcon from '@mui/icons-material/Archive';
import UnarchiveIcon from '@mui/icons-material/Unarchive';
import { mockCandidates } from '../data/mockData';
import { Candidate, CandidateStatus, getStatusLabel, getStatusColor, getScoreColor } from '../types';

type SortField = 'fullName' | 'vacancyTitle' | 'status' | 'screeningScore' | 'interviewScore' | 'appliedAt';
type SortOrder = 'asc' | 'desc' | null;

export default function CandidatesList() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showArchived, setShowArchived] = useState(false);
  const [candidates, setCandidates] = useState<Candidate[]>(mockCandidates);
  const [sortField, setSortField] = useState<SortField>('appliedAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc'); // По умолчанию новые сначала

  // Порядок статусов для сортировки (отклоненные в конце)
  const statusOrder: Record<CandidateStatus, number> = {
    [CandidateStatus.PENDING]: 1,
    [CandidateStatus.SCREENING]: 2,
    [CandidateStatus.AWAITING_INTERVIEW]: 3,
    [CandidateStatus.INTERVIEW_IN_PROGRESS]: 4,
    [CandidateStatus.INTERVIEW_COMPLETED]: 5,
    [CandidateStatus.APPROVED]: 6,
    [CandidateStatus.REJECTED_SCREENING]: 7,
    [CandidateStatus.REJECTED_INTERVIEW]: 8,
  };

  // Фильтрация кандидатов
  const filteredCandidates = candidates.filter((candidate) => {
    const matchesSearch = candidate.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         candidate.vacancyTitle.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || candidate.status === statusFilter;
    const matchesArchived = showArchived || !candidate.isArchived;
    return matchesSearch && matchesStatus && matchesArchived;
  });

  // Сортировка кандидатов
  const sortedCandidates = [...filteredCandidates].sort((a, b) => {
    if (!sortOrder) return 0;

    let comparison = 0;

    switch (sortField) {
      case 'fullName':
        comparison = a.fullName.localeCompare(b.fullName, 'ru');
        break;
      case 'vacancyTitle':
        comparison = a.vacancyTitle.localeCompare(b.vacancyTitle, 'ru');
        break;
      case 'status':
        comparison = statusOrder[a.status] - statusOrder[b.status];
        break;
      case 'screeningScore':
        const scoreA = a.screeningScore ?? -1;
        const scoreB = b.screeningScore ?? -1;
        comparison = scoreA - scoreB;
        break;
      case 'interviewScore':
        const intScoreA = a.interviewScore ?? -1;
        const intScoreB = b.interviewScore ?? -1;
        comparison = intScoreA - intScoreB;
        break;
      case 'appliedAt':
        comparison = a.appliedAt.getTime() - b.appliedAt.getTime();
        break;
    }

    return sortOrder === 'asc' ? comparison : -comparison;
  });

  // Обработчик клика по заголовку для сортировки
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // Цикл: asc -> desc -> null
      if (sortOrder === 'asc') {
        setSortOrder('desc');
      } else if (sortOrder === 'desc') {
        setSortOrder(null);
        setSortField('appliedAt'); // Возвращаем к дате по умолчанию
      }
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const handleArchiveToggle = (candidateId: string, currentlyArchived: boolean) => {
    setCandidates(candidates.map(c => 
      c.id === candidateId ? { ...c, isArchived: !currentlyArchived } : c
    ));
    // Здесь будет API вызов: await api.archiveCandidate(candidateId, !currentlyArchived)
  };

  const handleRowClick = (candidateId: string) => {
    navigate(`/candidates/${candidateId}`);
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

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
        Кандидаты
      </Typography>

      {/* Фильтры */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
          <TextField
            label="Поиск по имени или вакансии"
            variant="outlined"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ flex: 1, minWidth: 250 }}
          />
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Статус</InputLabel>
            <Select
              value={statusFilter}
              label="Статус"
              onChange={handleStatusFilterChange}
            >
              <MenuItem value="all">Все статусы</MenuItem>
              <MenuItem value={CandidateStatus.PENDING}>Ожидает</MenuItem>
              <MenuItem value={CandidateStatus.SCREENING}>Анализ резюме</MenuItem>
              <MenuItem value={CandidateStatus.REJECTED_SCREENING}>Отклонен (скрининг)</MenuItem>
              <MenuItem value={CandidateStatus.AWAITING_INTERVIEW}>Ожидает интервью</MenuItem>
              <MenuItem value={CandidateStatus.INTERVIEW_IN_PROGRESS}>Проходит интервью</MenuItem>
              <MenuItem value={CandidateStatus.INTERVIEW_COMPLETED}>Интервью завершено</MenuItem>
              <MenuItem value={CandidateStatus.REJECTED_INTERVIEW}>Отклонен (интервью)</MenuItem>
              <MenuItem value={CandidateStatus.APPROVED}>Одобрен</MenuItem>
            </Select>
          </FormControl>
        </Box>
        <FormControlLabel
          control={
            <Checkbox
              checked={showArchived}
              onChange={(e) => setShowArchived(e.target.checked)}
            />
          }
          label="Показывать архивных кандидатов"
        />
      </Box>

      {/* Таблица кандидатов */}
      <TableContainer component={Paper} elevation={2}>
        <Table>
          <TableHead sx={{ bgcolor: '#f5f5f5' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>
                <TableSortLabel
                  active={sortField === 'fullName' && sortOrder !== null}
                  direction={sortField === 'fullName' && sortOrder ? sortOrder : 'asc'}
                  onClick={() => handleSort('fullName')}
                >
                  ФИО
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{ fontWeight: 600 }}>
                <TableSortLabel
                  active={sortField === 'vacancyTitle' && sortOrder !== null}
                  direction={sortField === 'vacancyTitle' && sortOrder ? sortOrder : 'asc'}
                  onClick={() => handleSort('vacancyTitle')}
                >
                  Вакансия
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Город</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>
                <TableSortLabel
                  active={sortField === 'status' && sortOrder !== null}
                  direction={sortField === 'status' && sortOrder ? sortOrder : 'asc'}
                  onClick={() => handleSort('status')}
                >
                  Статус
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{ fontWeight: 600 }} align="center">
                <TableSortLabel
                  active={sortField === 'screeningScore' && sortOrder !== null}
                  direction={sortField === 'screeningScore' && sortOrder ? sortOrder : 'asc'}
                  onClick={() => handleSort('screeningScore')}
                >
                  Скрининг
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{ fontWeight: 600 }} align="center">
                <TableSortLabel
                  active={sortField === 'interviewScore' && sortOrder !== null}
                  direction={sortField === 'interviewScore' && sortOrder ? sortOrder : 'asc'}
                  onClick={() => handleSort('interviewScore')}
                >
                  Интервью
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{ fontWeight: 600 }}>
                <TableSortLabel
                  active={sortField === 'appliedAt' && sortOrder !== null}
                  direction={sortField === 'appliedAt' && sortOrder ? sortOrder : 'asc'}
                  onClick={() => handleSort('appliedAt')}
                >
                  Дата подачи
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{ fontWeight: 600 }} align="center">Действия</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedCandidates.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  <Typography variant="body1" color="text.secondary" sx={{ py: 4 }}>
                    Кандидаты не найдены
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              sortedCandidates.map((candidate) => (
                <TableRow
                  key={candidate.id}
                  hover
                  sx={{ 
                    cursor: 'pointer',
                    opacity: candidate.isArchived ? 0.6 : 1,
                    bgcolor: candidate.isArchived ? '#f5f5f5' : 'transparent'
                  }}
                >
                  <TableCell onClick={() => handleRowClick(candidate.id)}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {candidate.fullName}
                      </Typography>
                      {candidate.isArchived && (
                        <Chip label="Архив" size="small" variant="outlined" />
                      )}
                    </Box>
                  </TableCell>
                  <TableCell onClick={() => handleRowClick(candidate.id)}>{candidate.vacancyTitle}</TableCell>
                  <TableCell onClick={() => handleRowClick(candidate.id)}>{candidate.city}</TableCell>
                  <TableCell onClick={() => handleRowClick(candidate.id)}>
                    <Chip
                      label={getStatusLabel(candidate.status)}
                      color={getStatusColor(candidate.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center" onClick={() => handleRowClick(candidate.id)}>
                    {renderScoreCell(candidate.screeningScore)}
                  </TableCell>
                  <TableCell align="center" onClick={() => handleRowClick(candidate.id)}>
                    {renderScoreCell(candidate.interviewScore)}
                  </TableCell>
                  <TableCell onClick={() => handleRowClick(candidate.id)}>
                    {candidate.appliedAt.toLocaleDateString('ru-RU')}
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title={candidate.isArchived ? "Разархивировать" : "Архивировать"}>
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleArchiveToggle(candidate.id, candidate.isArchived);
                        }}
                        color="primary"
                      >
                        {candidate.isArchived ? <UnarchiveIcon /> : <ArchiveIcon />}
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ mt: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Всего кандидатов: {sortedCandidates.length}
        </Typography>
      </Box>
    </Box>
  );
}

