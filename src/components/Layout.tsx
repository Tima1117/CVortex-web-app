import {ReactNode, useState} from 'react';
import {useLocation, useNavigate} from 'react-router-dom';
import {
    AppBar,
    Avatar,
    Box,
    Button,
    Divider,
    Drawer,
    IconButton,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Menu,
    MenuItem,
    Toolbar,
    Typography,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import LogoutIcon from '@mui/icons-material/Logout';
import PeopleIcon from '@mui/icons-material/People';
import WorkIcon from '@mui/icons-material/Work';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

const drawerWidth = 260;

interface LayoutProps {
    children: ReactNode;
}

export default function Layout({children}: LayoutProps) {
    const [mobileOpen, setMobileOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const navigate = useNavigate();
    const location = useLocation();

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleProfileMenuClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = () => {
        handleProfileMenuClose();
        localStorage.removeItem('isAuthenticated');
        window.location.href = 'https://kekly.ru/api/v1/logout';
    };

    const handleProfile = () => {
        handleProfileMenuClose();
        // Здесь можно добавить переход на страницу профиля
        console.log('Открыть профиль');
    };

    const menuItems = [
        {text: 'Кандидаты', icon: <PeopleIcon/>, path: '/candidates'},
        {text: 'Вакансии', icon: <WorkIcon/>, path: '/vacancies'},
        {text: 'Создать вакансию', icon: <AddCircleIcon/>, path: '/vacancies/create'},
    ];

    const drawer = (
        <Box sx={{display: 'flex', flexDirection: 'column', height: '100%'}}>
            <Toolbar sx={{bgcolor: 'primary.main', display: 'flex', alignItems: 'center', gap: 1.5}}>
                <img src="/Logo.svg" alt="CVortex" style={{height: 32}}/>
                <Typography variant="h6" noWrap component="div" sx={{color: 'white', fontWeight: 600}}>
                    CVortex
                </Typography>
            </Toolbar>
            <Divider/>
            <List sx={{px: 1, py: 2}}>
                {menuItems.map((item) => (
                    <ListItem key={item.text} disablePadding sx={{mb: 0.5}}>
                        <ListItemButton
                            selected={location.pathname === item.path}
                            onClick={() => {
                                navigate(item.path);
                                setMobileOpen(false);
                            }}
                            sx={{
                                borderRadius: 2,
                                '&.Mui-selected': {
                                    bgcolor: 'primary.main',
                                    color: 'white',
                                    '&:hover': {
                                        bgcolor: 'primary.dark',
                                    },
                                    '& .MuiListItemIcon-root': {
                                        color: 'white',
                                    },
                                },
                            }}
                        >
                            <ListItemIcon sx={{color: location.pathname === item.path ? 'white' : 'inherit'}}>
                                {item.icon}
                            </ListItemIcon>
                            <ListItemText primary={item.text}/>
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
            <Box sx={{flexGrow: 1}}/>
            <Divider/>
            <Box sx={{p: 2}}>
                <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<LogoutIcon/>}
                    onClick={handleLogout}
                    sx={{
                        borderRadius: 2,
                        py: 1,
                    }}
                >
                    Выйти
                </Button>
            </Box>
        </Box>
    );

    return (
        <Box sx={{display: 'flex'}}>
            <AppBar
                position="fixed"
                sx={{
                    width: {sm: `calc(100% - ${drawerWidth}px)`},
                    ml: {sm: `${drawerWidth}px`},
                }}
            >
                <Toolbar>
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        edge="start"
                        onClick={handleDrawerToggle}
                        sx={{mr: 2, display: {sm: 'none'}}}
                    >
                        <MenuIcon/>
                    </IconButton>
                    <Box sx={{flexGrow: 1}}/>
                    <IconButton
                        onClick={handleProfileMenuOpen}
                        sx={{p: 0}}
                    >
                        <Avatar sx={{bgcolor: 'white', color: 'primary.main'}}>
                            <AccountCircleIcon/>
                        </Avatar>
                    </IconButton>
                    <Menu
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                        onClose={handleProfileMenuClose}
                        anchorOrigin={{
                            vertical: 'bottom',
                            horizontal: 'right',
                        }}
                        transformOrigin={{
                            vertical: 'top',
                            horizontal: 'right',
                        }}
                        PaperProps={{
                            sx: {
                                mt: 1.5,
                                minWidth: 180,
                            },
                        }}
                    >
                        <MenuItem onClick={handleProfile}>
                            <ListItemIcon>
                                <AccountCircleIcon fontSize="small"/>
                            </ListItemIcon>
                            <ListItemText>Профиль</ListItemText>
                        </MenuItem>
                        <MenuItem onClick={handleLogout} sx={{color: 'error.main'}}>
                            <ListItemIcon>
                                <LogoutIcon fontSize="small" sx={{color: 'error.main'}}/>
                            </ListItemIcon>
                            <ListItemText>Выход</ListItemText>
                        </MenuItem>
                    </Menu>
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
                        '& .MuiDrawer-paper': {boxSizing: 'border-box', width: drawerWidth},
                    }}
                >
                    {drawer}
                </Drawer>
                <Drawer
                    variant="permanent"
                    sx={{
                        display: {xs: 'none', sm: 'block'},
                        '& .MuiDrawer-paper': {boxSizing: 'border-box', width: drawerWidth},
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
                    p: 3,
                    width: {sm: `calc(100% - ${drawerWidth}px)`},
                    mt: 8,
                    minHeight: '100vh',
                    bgcolor: '#f8f9fa',
                }}
            >
                {children}
            </Box>
        </Box>
    );
}

