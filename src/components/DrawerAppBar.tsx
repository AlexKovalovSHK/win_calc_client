import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import MenuIcon from '@mui/icons-material/Menu';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';

// Импортируем новые компоненты (предполагается, что они лежат в папке ./components или в корне)
import SimpleCalculator from './SimpleCalculator'; // Или './components/SimpleCalculator'
import ProjectList from './ProjectList';           // Или './components/ProjectList'
import ProjectDetail from './ProjectDetail';       // Или './components/ProjectDetail'
import { Project } from '../features/types';

interface Props {
  window?: () => Window;
}

const drawerWidth = 240;

const navItems = [
  { label: 'Simple Calc', key: 'simple' },
  { label: 'My Projects', key: 'projects' } // Переименовали для ясности
];

export default function DrawerAppBar(props: Props) {
  const { window } = props;
  const [mobileOpen, setMobileOpen] = React.useState(false);

  // --- Состояние навигации ---
  // 1. Какая вкладка выбрана в меню
  const [currentView, setCurrentView] = React.useState('simple'); 
  // 2. Какой проект открыт (для вкладки 'projects')
  const [selectedProject, setSelectedProject] = React.useState<Project | null>(null);

  const handleDrawerToggle = () => {
    setMobileOpen((prevState) => !prevState);
  };

  // Клик по пункту меню (Simple Calc / My Projects)
  const handleNavClick = (key: string) => {
    setCurrentView(key);
    // При переключении главных вкладок сбрасываем выбранный проект, 
    // чтобы вернуться к списку
    setSelectedProject(null); 
    setMobileOpen(false);
  };

  // Логика перехода: Список -> Детали проекта
  const handleSelectProject = (project: Project) => {
    setSelectedProject(project);
    // currentView остается 'projects', но меняется контент внутри
  };

  // Логика перехода: Детали проекта -> Список
  const handleBackToProjects = () => {
    setSelectedProject(null);
  };

  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center' }}>
      <Typography variant="h6" sx={{ my: 2 }}>
        WinCalc
      </Typography>
      <Divider />
      <List>
        {navItems.map((item) => (
          <ListItem key={item.key} disablePadding>
            <ListItemButton sx={{ textAlign: 'center' }} onClick={() => handleNavClick(item.key)}>
              <ListItemText primary={item.label} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  const container = window !== undefined ? () => window().document.body : undefined;

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar component="nav">
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          
          <Typography
            variant="h6"
            component="div"
            sx={{ flexGrow: 1, display: { xs: 'none', sm: 'block' }, cursor: 'pointer' }}
            onClick={() => handleNavClick('simple')}
          >
            WinCalc v1.0
          </Typography>
          
          <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
            {navItems.map((item) => (
              <Button key={item.key} sx={{ color: '#fff' }} onClick={() => handleNavClick(item.key)}>
                {item.label}
              </Button>
            ))}
          </Box>
        </Toolbar>
      </AppBar>
      
      <nav>
        <Drawer
          container={container}
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
      </nav>
      
      <Box component="main" sx={{ p: 3, width: '100%', mt: 8 }}>
        {/* --- ЛОГИКА ОТОБРАЖЕНИЯ КОНТЕНТА --- */}
        
        {/* 1. Простой калькулятор */}
        {currentView === 'simple' && <SimpleCalculator />}

        {/* 2. Секция проектов */}
        {currentView === 'projects' && (
          // Если проект не выбран -> показываем СПИСОК
          !selectedProject ? (
            <ProjectList 
              onSelectProject={handleSelectProject} 
            />
          ) : (
            // Если проект выбран -> показываем ДЕТАЛИ
            <ProjectDetail 
              project={selectedProject} 
              onBack={handleBackToProjects} 
            />
          )
        )}
      </Box>
    </Box>
  );
}