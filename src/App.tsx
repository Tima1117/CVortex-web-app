import {Navigate, Route, Routes} from 'react-router-dom';
import {createTheme, ThemeProvider} from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import CandidatesList from './pages/CandidatesList';
import CandidateDetails from './pages/CandidateDetails';
import CreateVacancy from './pages/CreateVacancy';
import VacanciesList from './pages/VacanciesList';

// Создаем тему с поддержкой русского языка и мягкими углами
const theme = createTheme({
    palette: {
        mode: 'light',
        primary: {
            main: '#0088CC', // Основной синий цвет
        },
        secondary: {
            main: '#dc004e',
        },
        text: {
            primary: '#333333', // Основной цвет текста вместо черного
            secondary: '#666666',
        },
        background: {
            default: '#FFFFFF',
            paper: '#FFFFFF',
        },
    },
    typography: {
        fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    },
    shape: {
        borderRadius: 12, // Закругленные углы как в Telegram
    },
    components: {
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: 16,
                    boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    borderRadius: 12,
                },
                rounded: {
                    borderRadius: 12,
                },
                elevation1: {
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                },
                elevation2: {
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                },
                elevation3: {
                    boxShadow: '0 6px 16px rgba(0,0,0,0.12)',
                },
            },
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 10,
                    textTransform: 'none',
                    fontWeight: 500,
                    padding: '8px 20px',
                },
                contained: {
                    boxShadow: '0 2px 8px rgba(0, 136, 204, 0.25)',
                    '&:hover': {
                        boxShadow: '0 4px 12px rgba(0, 136, 204, 0.35)',
                    },
                },
            },
        },
        MuiChip: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    fontWeight: 500,
                },
            },
        },
        MuiTextField: {
            styleOverrides: {
                root: {
                    '& .MuiOutlinedInput-root': {
                        borderRadius: 10,
                    },
                },
            },
        },
        MuiTableContainer: {
            styleOverrides: {
                root: {
                    borderRadius: 12,
                },
            },
        },
        MuiAppBar: {
            styleOverrides: {
                root: {
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    borderRadius: 0, // Убираем закругление сверху
                },
            },
        },
        MuiDrawer: {
            styleOverrides: {
                paper: {
                    borderRadius: 0, // Убираем закругление у бокового меню
                },
            },
        },
        MuiAlert: {
            styleOverrides: {
                root: {
                    borderRadius: 10,
                },
            },
        },
    },
});

function App() {
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline/>
            <Routes>
                {/* Публичная страница входа */}
                <Route path="/login" element={<Login/>}/>

                {/* Защищенные маршруты */}
                <Route
                    path="/*"
                    element={
                        <ProtectedRoute>
                            <Layout>
                                <Routes>
                                    <Route path="/" element={<Navigate to="/candidates" replace/>}/>
                                    <Route path="/candidates" element={<CandidatesList/>}/>
                                    <Route path="/candidates/:id/:vacancyId" element={<CandidateDetails/>}/>
                                    <Route path="/vacancies" element={<VacanciesList/>}/>
                                    <Route path="/vacancies/create" element={<CreateVacancy/>}/>
                                </Routes>
                            </Layout>
                        </ProtectedRoute>
                    }
                />
            </Routes>
        </ThemeProvider>
    );
}

export default App;

