import {ReactNode, useState} from 'react';
import {useLocation, useNavigate} from 'react-router-dom';
import {
    AppBar,
    Avatar,
    Box,
    Button,
    Drawer,
    IconButton,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Toolbar,
    Typography,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import LogoutIcon from '@mui/icons-material/Logout';
import PeopleIcon from '@mui/icons-material/People';
import WorkIcon from '@mui/icons-material/Work';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

const drawerWidth = 280;

interface LayoutProps {
    children: ReactNode;
}

export default function Layout({children}: LayoutProps) {
    const [mobileOpen, setMobileOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const handleLogout = () => {
        localStorage.removeItem('isAuthenticated');
        window.location.href = 'https://kekly.ru/api/v1/logout';
    };

    const handleProfile = () => {
        // Заглушка для перехода в аккаунт
        console.log('Переход в аккаунт');
        // В будущем можно добавить: navigate('/profile');
    };

    const menuItems = [
        {text: 'Кандидаты', icon: <PeopleIcon/>, path: '/candidates'},
        {text: 'Вакансии', icon: <WorkIcon/>, path: '/vacancies'},
        {text: 'Создать вакансию', icon: <AddCircleIcon/>, path: '/vacancies/create'},
    ];

    // Градиентная тема на основе логотипа
    const gradientTheme = {
        primary: 'linear-gradient(135deg, #0088CC, #764ba2)',
        light: 'linear-gradient(135deg, #e6f4ff, #f3e8ff)',
        hover: 'linear-gradient(135deg, #0077b3, #6a4190)',
    };

    const drawer = (
        <Box sx={{display: 'flex', flexDirection: 'column', height: '100%', background: '#ffffff'}}>
            {/* Заголовок с логотипом */}
            <Toolbar sx={{
                px: 3,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                background: 'white',
                borderBottom: '1px solid',
                borderColor: 'divider'
            }}>
                <Box
                    sx={{
                        p: 1,
                        borderRadius: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <img
                        src="/Alt_logo.svg"
                        alt="CVortex"
                        style={{
                            width: 32,
                            height: 32,
                            objectFit: 'contain',
                        }}
                    />
                </Box>
                <Box sx={{display: 'flex', flexDirection: 'column', alignItems: 'flex-start'}}>
                    <Typography
                        variant="h6"
                        sx={{
                            fontWeight: 700,
                            background: gradientTheme.primary,
                            backgroundClip: 'text',
                            WebkitBackgroundClip: 'text',
                            color: 'transparent',
                            lineHeight: 1,
                            fontSize: '1.5rem',
                        }}
                    >
                        CVortex
                    </Typography>
                    <Typography
                        variant="caption"
                        sx={{
                            color: 'text.secondary',
                            fontWeight: 500,
                            fontSize: '0.7rem',
                            lineHeight: 1.2,
                        }}
                    >
                        HR Platform
                    </Typography>
                </Box>
            </Toolbar>

            <List sx={{px: 2, py: 2, flex: 1}}>
                {menuItems.map((item) => (
                    <ListItem key={item.text} disablePadding sx={{mb: 1}}>
                        <ListItemButton
                            selected={location.pathname === item.path}
                            onClick={() => {
                                navigate(item.path);
                                setMobileOpen(false);
                            }}
                            sx={{
                                borderRadius: 2,
                                px: 2,
                                py: 1.5,
                                '&.Mui-selected': {
                                    background: gradientTheme.primary,
                                    color: 'white',
                                    boxShadow: '0 4px 12px rgba(0, 136, 204, 0.3)',
                                    '&:hover': {
                                        background: gradientTheme.hover,
                                    },
                                    '& .MuiListItemIcon-root': {
                                        color: 'white',
                                    },
                                },
                                '&:hover': {
                                    background: gradientTheme.light,
                                    transform: 'translateY(-1px)',
                                    transition: 'all 0.2s ease',
                                },
                                transition: 'all 0.2s ease',
                            }}
                        >
                            <ListItemIcon sx={{
                                color: location.pathname === item.path ? 'white' : 'primary.main',
                                minWidth: 45
                            }}>
                                {item.icon}
                            </ListItemIcon>
                            <ListItemText
                                primary={item.text}
                                primaryTypographyProps={{
                                    fontWeight: location.pathname === item.path ? 600 : 500,
                                    fontSize: '0.95rem'
                                }}
                            />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>

            <Box sx={{p: 2}}>
                <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<LogoutIcon/>}
                    onClick={handleLogout}
                    sx={{
                        borderRadius: 2,
                        py: 1.5,
                        borderColor: 'divider',
                        color: 'text.secondary',
                        fontWeight: 500,
                        '&:hover': {
                            borderColor: 'error.main',
                            color: 'error.main',
                            background: 'rgba(211, 47, 47, 0.04)',
                            transform: 'translateY(-1px)',
                        },
                        transition: 'all 0.2s ease',
                    }}
                >
                    Выйти
                </Button>
            </Box>
        </Box>
    );

    return (
        <Box sx={{display: 'flex', minHeight: '100vh', background: '#f8fafc'}}>
            <AppBar
                position="fixed"
                sx={{
                    width: {sm: `calc(100% - ${drawerWidth}px)`},
                    ml: {sm: `${drawerWidth}px`},
                    background: 'white',
                    color: 'text.primary',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    borderBottom: '1px solid',
                    borderColor: 'divider'
                }}
            >
                <Toolbar>
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        edge="start"
                        onClick={handleDrawerToggle}
                        sx={{
                            mr: 2,
                            display: {sm: 'none'},
                            color: 'text.primary'
                        }}
                    >
                        <MenuIcon/>
                    </IconButton>

                    <Box sx={{flexGrow: 1}}/>

                    {/* Кнопка аккаунта без меню - просто заглушка */}
                    <IconButton
                        onClick={handleProfile}
                        sx={{
                            p: 0,
                            border: '2px solid',
                            borderColor: 'divider',
                            '&:hover': {
                                borderColor: 'primary.main',
                            },
                            transition: 'all 0.2s ease',
                        }}
                    >
                        <Avatar sx={{
                            bgcolor: 'transparent',
                            background: gradientTheme.primary,
                            width: 36,
                            height: 36,
                        }}>
                            <AccountCircleIcon sx={{color: 'white', fontSize: 20}}/>
                        </Avatar>
                    </IconButton>
                </Toolbar>
            </AppBar>

            <Box
                component="nav"
                sx={{width: {sm: drawerWidth}, flexShrink: {sm: 0}}}
            >
                <Drawer
                    variant="temporary"
                    open={mobileOpen}
                    onClose={handleDrawerToggle}
                    ModalProps={{
                        keepMounted: true,
                    }}
                    sx={{
                        display: {xs: 'block', sm: 'none'},
                        '& .MuiDrawer-paper': {
                            boxSizing: 'border-box',
                            width: drawerWidth,
                            border: 'none'
                        },
                    }}
                >
                    {drawer}
                </Drawer>
                <Drawer
                    variant="permanent"
                    sx={{
                        display: {xs: 'none', sm: 'block'},
                        '& .MuiDrawer-paper': {
                            boxSizing: 'border-box',
                            width: drawerWidth,
                            border: 'none',
                            boxShadow: '2px 0 10px rgba(0,0,0,0.05)',
                        },
                    }}
                    open
                >
                    {drawer}
                </Drawer>
            </Box>

            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: {xs: 2, sm: 3},
                    width: {sm: `calc(100% - ${drawerWidth}px)`},
                    mt: 8,
                    minHeight: 'calc(100vh - 64px)',
                    background: '#f8fafc',
                }}
            >
                {children}
            </Box>
        </Box>
    );
}