import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Button,
  Chip,
  Grid,
  Divider,
  Card,
  CardContent,
  Alert,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArchiveIcon from '@mui/icons-material/Archive';
import UnarchiveIcon from '@mui/icons-material/Unarchive';
import PhoneIcon from '@mui/icons-material/Phone';
import TelegramIcon from '@mui/icons-material/Telegram';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import WorkIcon from '@mui/icons-material/Work';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { mockCandidates } from '../data/mockData';
import { Candidate, getStatusLabel, getStatusColor, getScoreColor } from '../types';

export default function CandidateDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [candidate, setCandidate] = useState<Candidate | undefined>(
    mockCandidates.find((c) => c.id === id)
  );

  const handleArchiveToggle = () => {
    if (candidate) {
      setCandidate({ ...candidate, isArchived: !candidate.isArchived });
      // Здесь будет API вызов: await api.archiveCandidate(candidate.id, !candidate.isArchived)
    }
  };

  if (!candidate) {
    return (
      <Box>
        <Alert severity="error">Кандидат не найден</Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/candidates')}
          sx={{ mt: 2 }}
        >
          Вернуться к списку
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/candidates')}
        sx={{ mb: 3 }}
      >
        Назад к списку
      </Button>

      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
              <Typography variant="h4" sx={{ fontWeight: 600 }}>
                {candidate.fullName}
              </Typography>
              {candidate.isArchived && (
                <Chip label="В архиве" color="default" size="medium" />
              )}
            </Box>
            <Chip
              label={getStatusLabel(candidate.status)}
              color={getStatusColor(candidate.status)}
              size="medium"
            />
          </Box>
          <Box sx={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Typography variant="caption" color="text.secondary">
              Дата подачи заявки
            </Typography>
            <Typography variant="body1" sx={{ mb: 1 }}>
              {candidate.appliedAt.toLocaleDateString('ru-RU')}
            </Typography>
            <Button
              variant={candidate.isArchived ? "outlined" : "contained"}
              startIcon={candidate.isArchived ? <UnarchiveIcon /> : <ArchiveIcon />}
              onClick={handleArchiveToggle}
              size="small"
            >
              {candidate.isArchived ? "Разархивировать" : "Архивировать"}
            </Button>
          </Box>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Личные данные */}
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
          Личные данные
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <WorkIcon sx={{ mr: 1.5, color: 'text.secondary' }} />
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Вакансия
                </Typography>
                <Typography variant="body1">{candidate.vacancyTitle}</Typography>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <LocationOnIcon sx={{ mr: 1.5, color: 'text.secondary' }} />
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Город проживания
                </Typography>
                <Typography variant="body1">{candidate.city}</Typography>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <PhoneIcon sx={{ mr: 1.5, color: 'text.secondary' }} />
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Номер телефона
                </Typography>
                <Typography variant="body1">{candidate.phoneNumber}</Typography>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <TelegramIcon sx={{ mr: 1.5, color: 'text.secondary' }} />
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Telegram
                </Typography>
                <Typography variant="body1">{candidate.telegramNickname}</Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        {/* Резюме */}
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
          Резюме
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <InsertDriveFileIcon sx={{ fontSize: 40, color: 'primary.main' }} />
          <Box>
            <Typography variant="body1">resume.pdf</Typography>
            <Button
              variant="outlined"
              size="small"
              href={candidate.resumeUrl}
              target="_blank"
              sx={{ mt: 1 }}
            >
              Открыть резюме
            </Button>
          </Box>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Результаты скрининга и интервью */}
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
          Результаты оценки
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Скрининг резюме
                </Typography>
                {candidate.screeningScore !== null ? (
                  <Box
                    sx={{
                      display: 'inline-block',
                      px: 2,
                      py: 1,
                      borderRadius: 3,
                      bgcolor: getScoreColor(candidate.screeningScore),
                      color: 'white',
                      fontSize: 24,
                      fontWeight: 700,
                    }}
                  >
                    {candidate.screeningScore} / 100
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
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Результаты интервью
                </Typography>
                {candidate.interviewScore !== null ? (
                  <Box
                    sx={{
                      display: 'inline-block',
                      px: 2,
                      py: 1,
                      borderRadius: 3,
                      bgcolor: getScoreColor(candidate.interviewScore),
                      color: 'white',
                      fontSize: 24,
                      fontWeight: 700,
                    }}
                  >
                    {candidate.interviewScore} / 100
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

        {/* Ответы на вопросы */}
        {candidate.answers && candidate.answers.length > 0 && (
          <>
            <Divider sx={{ my: 3 }} />
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
              Ответы на вопросы интервью
            </Typography>
            {candidate.answers.map((answer, index) => (
              <Card key={answer.questionId} variant="outlined" sx={{ mb: 2 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      Вопрос {index + 1}: {answer.questionText}
                    </Typography>
                    {answer.wasOnTime ? (
                      <Chip
                        icon={<CheckCircleIcon />}
                        label="В срок"
                        color="success"
                        size="small"
                      />
                    ) : (
                      <Chip
                        icon={<CancelIcon />}
                        label="Пропущен"
                        color="error"
                        size="small"
                      />
                    )}
                  </Box>
                  {answer.answer ? (
                    <>
                      <Typography variant="body2" sx={{ mt: 2, mb: 1 }}>
                        <strong>Ответ:</strong>
                      </Typography>
                      <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                        {answer.answer}
                      </Typography>
                      {answer.score !== undefined && (
                        <Box sx={{ mt: 2 }}>
                          <Typography variant="body2" component="span" sx={{ mr: 1 }}>
                            <strong>Оценка:</strong>
                          </Typography>
                          <Box
                            component="span"
                            sx={{
                              px: 1.5,
                              py: 0.5,
                              borderRadius: 3,
                              bgcolor: getScoreColor(answer.score),
                              color: 'white',
                              fontWeight: 600,
                            }}
                          >
                            {answer.score}
                          </Box>
                        </Box>
                      )}
                    </>
                  ) : (
                    <Alert severity="warning" sx={{ mt: 1 }}>
                      Кандидат не успел ответить на этот вопрос
                    </Alert>
                  )}
                </CardContent>
              </Card>
            ))}
          </>
        )}
      </Paper>
    </Box>
  );
}

