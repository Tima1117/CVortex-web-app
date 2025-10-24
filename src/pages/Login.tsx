import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Paper,
  Typography,
} from '@mui/material';
import LoginIcon from '@mui/icons-material/Login';

export default function Login() {
  const navigate = useNavigate();

  const handleLogin = () => {
    // Сохраняем состояние авторизации в localStorage
    localStorage.setItem('isAuthenticated', 'true');
    // Перенаправляем на главную страницу
    navigate('/candidates');
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: '#f8f9fa',
        backgroundImage: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}
    >
      <Paper
        elevation={8}
        sx={{
          p: 6,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          maxWidth: 450,
          width: '100%',
          mx: 2,
          borderRadius: 4,
        }}
      >
        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
          <img src="/Alt_logo.svg" alt="CVortex" style={{ height: 48 }} />
          <Typography variant="h3" sx={{ fontWeight: 700, color: '#0088CC' }}>
            CVortex
          </Typography>
        </Box>

        <Typography variant="h5" sx={{ mb: 1, fontWeight: 600, textAlign: 'center' }}>
          Добро пожаловать!
        </Typography>
        
        <Typography 
          variant="body1" 
          color="text.secondary" 
          sx={{ mb: 4, textAlign: 'center' }}
        >
          HR платформа для автоматизации найма
        </Typography>

        <Button
          variant="contained"
          size="large"
          startIcon={<LoginIcon />}
          onClick={handleLogin}
          sx={{
            py: 1.5,
            px: 6,
            fontSize: '1.1rem',
            fontWeight: 600,
            borderRadius: 3,
            boxShadow: '0 4px 14px rgba(0, 136, 204, 0.4)',
            '&:hover': {
              boxShadow: '0 6px 20px rgba(0, 136, 204, 0.5)',
            },
          }}
        >
          Войти
        </Button>

        <Typography 
          variant="caption" 
          color="text.secondary" 
          sx={{ mt: 4, textAlign: 'center' }}
        >
          Нажмите "Войти" для доступа к платформе
        </Typography>
      </Paper>
    </Box>
  );
}

