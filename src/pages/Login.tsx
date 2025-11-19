import {Box, Button, Container, Divider, Fade, Paper, Typography} from '@mui/material';
import LoginIcon from '@mui/icons-material/Login';

export default function Login() {
    const handleLogin = () => {
        localStorage.setItem('isAuthenticated', 'true');
        window.location.href = 'https://kekly.ru/api/v1/login?provider=demo';
    };

    const handleYandexLogin = () => {
        localStorage.setItem('isAuthenticated', 'true');
        window.location.href = 'https://kekly.ru/api/v1/login?provider=yandex';
    };

    const buttonStyles = {
        height: '48px',
        fontSize: '0.95rem',
        fontWeight: 600,
        borderRadius: 2,
        transition: 'all 0.2s ease',
        '&:hover': {
            transform: 'translateY(-1px)',
        },
    };

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #667eea 100%)',
                backgroundSize: '400% 400%',
                animation: 'gradientShift 10s ease infinite',
                position: 'relative',
                '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'radial-gradient(circle at 30% 50%, rgba(120, 119, 198, 0.3) 0%, transparent 50%)',
                },
                '@keyframes gradientShift': {
                    '0%': {backgroundPosition: '0% 50%'},
                    '50%': {backgroundPosition: '100% 50%'},
                    '100%': {backgroundPosition: '0% 50%'},
                },
            }}
        >
            <Container maxWidth="xs" sx={{display: 'flex', justifyContent: 'center'}}>
                <Fade in timeout={600}>
                    <Paper
                        elevation={16}
                        sx={{
                            width: '100%',
                            maxWidth: 400,
                            p: 4,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            borderRadius: 3,
                            backgroundColor: 'rgba(255, 255, 255, 0.95)',
                            backdropFilter: 'blur(10px)',
                            border: '1px solid rgba(255, 255, 255, 0.3)',
                            boxShadow: '0 15px 35px rgba(0, 0, 0, 0.1)',
                        }}
                    >
                        {/* Header Section - Improved alignment */}
                        <Box sx={{
                            mb: 3,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2,
                            width: '100%',
                            justifyContent: 'center'
                        }}>
                            <img
                                src="/Alt_logo.svg"
                                alt="CVortex"
                                style={{
                                    width: 50,
                                    height: 50,
                                    objectFit: 'contain',
                                }}
                            />
                            <Box sx={{display: 'flex', flexDirection: 'column', alignItems: 'flex-start'}}>
                                <Typography
                                    variant="h4"
                                    sx={{
                                        fontWeight: 700,
                                        background: 'linear-gradient(135deg, #0088CC, #764ba2)',
                                        backgroundClip: 'text',
                                        WebkitBackgroundClip: 'text',
                                        color: 'transparent',
                                        lineHeight: 1,
                                        fontSize: {xs: '1.8rem', sm: '2rem'},
                                    }}
                                >
                                    CVortex
                                </Typography>
                                <Typography
                                    variant="caption"
                                    sx={{
                                        color: 'text.secondary',
                                        fontWeight: 500,
                                        fontSize: '0.75rem',
                                        lineHeight: 1.2,
                                    }}
                                >
                                    HR Platform
                                </Typography>
                            </Box>
                        </Box>

                        {/* Main Content */}
                        <Box sx={{textAlign: 'center', mb: 2, width: '100%'}}>
                            <Typography
                                variant="h6"
                                sx={{
                                    mb: 3,
                                    fontWeight: 600,
                                    color: 'text.primary',
                                }}
                            >
                                Вход в систему
                            </Typography>

                            {/* Yandex Login Button */}
                            <Button
                                variant="contained"
                                size="large"
                                fullWidth
                                onClick={handleYandexLogin}
                                sx={{
                                    ...buttonStyles,
                                    backgroundColor: '#000',
                                    '&:hover': {
                                        ...buttonStyles['&:hover'],
                                        backgroundColor: '#000',
                                        boxShadow: '0 8px 20px rgba(0, 0, 0, 0.3)',
                                    },
                                    mb: 0,
                                }}
                            >
                                <Box sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1.5,
                                    width: '100%',
                                    justifyContent: 'center'
                                }}>
                                    {/* Яндекс логотип */}
                                    <img
                                        src="/Yandex_icon.svg"
                                        alt="Yandex"
                                        style={{
                                            width: '20px',
                                            height: '20px',
                                        }}
                                    />
                                    <Typography sx={{fontSize: '0.9rem'}}>
                                        Войти через Яндекс
                                    </Typography>
                                </Box>
                            </Button>

                            {/* Divider */}
                            <Divider sx={{width: '100%', my: 3}}>
                                <Typography variant="caption" sx={{color: 'text.secondary', px: 1}}>
                                    или
                                </Typography>
                            </Divider>

                            {/* Demo Login Button */}
                            <Button
                                variant="outlined"
                                size="large"
                                fullWidth
                                startIcon={<LoginIcon/>}
                                onClick={handleLogin}
                                sx={{
                                    ...buttonStyles,
                                    borderColor: '#0088CC',
                                    color: '#0088CC',
                                    '&:hover': {
                                        ...buttonStyles['&:hover'],
                                        borderColor: '#006699',
                                        backgroundColor: 'rgba(0, 136, 204, 0.04)',
                                        boxShadow: '0 6px 15px rgba(0, 136, 204, 0.15)',
                                    },
                                    mt: 0,
                                }}
                            >
                                Демо доступ
                            </Button>
                        </Box>
                    </Paper>
                </Fade>
            </Container>
        </Box>
    );
}