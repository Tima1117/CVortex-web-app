import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
  Grid,
  Chip,
  Divider,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import WorkIcon from '@mui/icons-material/Work';
import { mockVacancies } from '../data/mockData';

export default function VacanciesList() {
  const navigate = useNavigate();

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          Вакансии
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/vacancies/create')}
          size="large"
        >
          Создать вакансию
        </Button>
      </Box>

      <Grid container spacing={3}>
        {mockVacancies.map((vacancy) => (
          <Grid item xs={12} md={6} key={vacancy.id}>
            <Card elevation={3} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flex: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <WorkIcon color="primary" />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {vacancy.title}
                    </Typography>
                  </Box>
                  <Chip
                    label={vacancy.isActive ? 'Активна' : 'Неактивна'}
                    color={vacancy.isActive ? 'success' : 'default'}
                    size="small"
                  />
                </Box>

                <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                  Создана: {vacancy.createdAt.toLocaleDateString('ru-RU')}
                </Typography>

                <Divider sx={{ my: 2 }} />

                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                  Ключевые навыки:
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
                  {vacancy.keySkills.map((skill) => (
                    <Chip key={skill} label={skill} size="small" variant="outlined" />
                  ))}
                </Box>

                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                  Вопросы для интервью:
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {vacancy.questions.length} вопрос(ов)
                </Typography>

                <Divider sx={{ my: 2 }} />

                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                  Инструкции для AI:
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ 
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                }}>
                  {vacancy.aiPrompt}
                </Typography>
              </CardContent>

              <CardActions sx={{ p: 2, pt: 0 }}>
                <Button 
                  size="small" 
                  onClick={() => {
                    // Здесь можно добавить функционал просмотра деталей вакансии
                    alert('Функционал просмотра деталей вакансии будет добавлен');
                  }}
                >
                  Подробнее
                </Button>
                <Button 
                  size="small" 
                  onClick={() => {
                    // Здесь можно добавить функционал редактирования
                    alert('Функционал редактирования будет добавлен');
                  }}
                >
                  Редактировать
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {mockVacancies.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Пока нет созданных вакансий
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Создайте первую вакансию, чтобы начать работу с кандидатами
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/vacancies/create')}
          >
            Создать вакансию
          </Button>
        </Box>
      )}
    </Box>
  );
}

