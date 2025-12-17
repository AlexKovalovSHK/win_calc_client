import React, { useState, useEffect } from 'react';
import { 
  Box, TextField, Button, Typography, Paper, 
  Accordion, AccordionSummary, AccordionDetails, 
  List, ListItem, ListItemText, Divider, IconButton,
  MenuItem, Select, FormControl, InputLabel, Chip, Tooltip, Grid 
} from '@mui/material';

// Иконки
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EnergySavingsLeafIcon from '@mui/icons-material/EnergySavingsLeaf';
import { CalculatedWindow, Project, Room } from '../features/types';
import { updateProjectInStorage } from '../features/project/projectService';
import { PROFILES } from '../db/profiles';
import { GLAZING_LIST } from '../db/doubleGlazingList';
import { calculateFullStats } from '../utils/utils';

interface Props {
  project: Project;
  onBack: () => void;
}

export default function ProjectDetail({ project: initialProject, onBack }: Props) {
  // 1. Состояние проекта (теперь получаем через props, а не грузим сами из session)
  const [project, setProject] = useState<Project>(initialProject);
  
  // 2. Состояния для формы комнаты
  const [newRoomName, setNewRoomName] = useState("");
  const [newRoomArea, setNewRoomArea] = useState<number>(0);
  const [newRoomHeight, setNewRoomHeight] = useState<number>(2.5);

  // 3. Состояния для формы окна (добавили выбор профиля и стекла)
  const [winWidth, setWinWidth] = useState(1200);
  const [winHeight, setWinHeight] = useState(1400);
  const [selectedProfileId, setSelectedProfileId] = useState<string>(PROFILES[0].id);
  const [selectedGlazingId, setSelectedGlazingId] = useState<string>(GLAZING_LIST[0].id);

  // Автосохранение при каждом изменении project
  useEffect(() => {
    updateProjectInStorage(project);
  }, [project]);

  // --- ЛОГИКА КОМНАТ ---

  const addRoom = () => {
    if (!newRoomName.trim()) return alert("Введите название комнаты");
    
    const newRoom: Room = {
      id: crypto.randomUUID(), // Используем UUID вместо Date.now()
      name: newRoomName,
      area: newRoomArea,     // Новое поле
      height: newRoomHeight, // Новое поле
      windows: []
    };

    setProject(prev => ({ ...prev, rooms: [...prev.rooms, newRoom] }));
    
    // Сброс полей
    setNewRoomName("");
    setNewRoomArea(0);
  };

  const deleteRoom = (roomId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Чтобы аккордеон не переключался при клике на удаление
    if (confirm("Удалить комнату?")) {
      setProject(prev => ({ 
        ...prev, 
        rooms: prev.rooms.filter(r => r.id !== roomId) 
      }));
    }
  };

  // --- ЛОГИКА ОКОН ---

  const addWindowToRoom = (roomId: string) => {
    // Находим выбранные объекты данных
    const profile = PROFILES.find(p => p.id === selectedProfileId);
    const glazing = GLAZING_LIST.find(g => g.id === selectedGlazingId);

    if (!profile || !glazing) return;

    // 1. ВЫЗЫВАЕМ СЛОЖНЫЙ РАСЧЕТ
    const stats = calculateFullStats(winWidth, winHeight, profile, glazing);
    
    if (!stats.isValid) {
      alert(stats.error);
      return;
    }

    // 2. Создаем объект окна со ВСЕМИ данными (цена, субсидии, экономия)
    const newWindow: CalculatedWindow = {
      id: crypto.randomUUID(),
      width: winWidth,
      height: winHeight,
      profileId: profile.id,
      profileName: profile.name,
      glazingId: glazing.id,
      glazingName: glazing.name,
      
      // Результаты расчета
      uw: stats.uw,
      price: stats.priceTotal,
      isBafa: stats.isBafaEligible,
      subsidy: stats.subsidyAmount,
      savings: stats.savingsEuro,
      heatLoss: stats.heatLoss
    };

    // 3. Обновляем состояние
    setProject(prev => ({
      ...prev,
      rooms: prev.rooms.map(room => {
        if (room.id === roomId) {
          return { ...room, windows: [...room.windows, newWindow] };
        }
        return room;
      })
    }));
  };

  const deleteWindow = (roomId: string, windowId: string) => {
    setProject(prev => ({
      ...prev,
      rooms: prev.rooms.map(room => {
        if (room.id === roomId) {
          return { ...room, windows: room.windows.filter(w => w.id !== windowId) };
        }
        return room;
      })
    }));
  };

  // Подсчет итоговой суммы проекта
  const totalProjectPrice = project.rooms.reduce((acc, room) => 
    acc + room.windows.reduce((wAcc, win) => wAcc + win.price, 0), 0
  );

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={onBack}>Назад к списку</Button>
        <Typography variant="h5">{project.name}</Typography>
      </Box>

      <Paper sx={{ p: 2, mb: 3, bgcolor: '#e3f2fd' }}>
        <Typography variant="h6">Итого: {totalProjectPrice} €</Typography>
        <Typography variant="caption">Автосохранение включено</Typography>
      </Paper>
      
      {/* Форма создания комнаты */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="subtitle2" gutterBottom>Новая комната</Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <TextField 
            label="Название" size="small" 
            value={newRoomName} onChange={(e) => setNewRoomName(e.target.value)}
          />
          <TextField 
            label="Площадь м²" size="small" type="number" sx={{ width: 100 }}
            value={newRoomArea || ''} onChange={(e) => setNewRoomArea(+e.target.value)}
          />
          <Button variant="contained" onClick={addRoom} startIcon={<AddCircleOutlineIcon />}>
            Добавить
          </Button>
        </Box>
      </Paper>

      {/* Список комнат (Accordion) */}
      {project.rooms.map((room) => (
        <Accordion key={room.id} defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: 'flex', width: '100%', justifyContent: 'space-between', pr: 2 }}>
              <Typography>
                {room.name} ({room.windows.length} окон)
              </Typography>
              <IconButton size="small" color="error" onClick={(e) => deleteRoom(room.id, e)}>
                <DeleteIcon />
              </IconButton>
            </Box>
          </AccordionSummary>
          
          <AccordionDetails>
            {/* ПАНЕЛЬ ДОБАВЛЕНИЯ ОКНА ВНУТРИ КОМНАТЫ */}
            <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
              <Grid container spacing={2} alignItems="center">
                <div>
                  <TextField label="Ширина" size="small" type="number" fullWidth
                    value={winWidth} onChange={(e) => setWinWidth(+e.target.value)} />
                </div>
                <div>
                  <TextField label="Высота" size="small" type="number" fullWidth
                    value={winHeight} onChange={(e) => setWinHeight(+e.target.value)} />
                </div>
                <div>
                  <FormControl fullWidth size="small">
                    <InputLabel>Профиль</InputLabel>
                    <Select value={selectedProfileId} label="Профиль" onChange={(e) => setSelectedProfileId(e.target.value)}>
                      {PROFILES.map(p => <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>)}
                    </Select>
                  </FormControl>
                </div>
                <div>
                  <FormControl fullWidth size="small">
                    <InputLabel>Стеклопакет</InputLabel>
                    <Select value={selectedGlazingId} label="Стеклопакет" onChange={(e) => setSelectedGlazingId(e.target.value)}>
                      {GLAZING_LIST.map(g => <MenuItem key={g.id} value={g.id}>{g.name}</MenuItem>)}
                    </Select>
                  </FormControl>
                </div>
                <div>
                  <Button variant="contained" fullWidth onClick={() => addWindowToRoom(room.id)}>+ Окно</Button>
                </div>
              </Grid>
            </Paper>

            {/* СПИСОК ДОБАВЛЕННЫХ ОКОН */}
            <List dense>
              {room.windows.map((win) => (
                <React.Fragment key={win.id}>
                  <ListItem secondaryAction={
                    <IconButton edge="end" onClick={() => deleteWindow(room.id, win.id)}>
                      <DeleteIcon />
                    </IconButton>
                  }>
                    <ListItemText 
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="subtitle1">{win.width}x{win.height} мм</Typography>
                          {/* Индикатор BAFA */}
                          {win.isBafa && (
                            <Tooltip title={`Субсидия BAFA: ${win.subsidy}€`}>
                              <Chip label="BAFA" color="success" size="small" icon={<CheckCircleIcon />} sx={{ height: 20 }} />
                            </Tooltip>
                          )}
                        </Box>
                      }
                      secondary={
                        <Box>
                          <div>{win.profileName} + {win.glazingName}</div>
                          <Box sx={{ display: 'flex', gap: 2, mt: 0.5, alignItems: 'center' }}>
                            <Typography variant="body2" fontWeight="bold">{win.price} €</Typography>
                            <Typography variant="caption" sx={{ color: win.uw <= 0.95 ? 'green' : 'orange' }}>Uw: {win.uw}</Typography>
                            {win.savings > 0 && (
                                <Typography variant="caption" sx={{ color: 'green', display: 'flex', alignItems: 'center' }}>
                                    <EnergySavingsLeafIcon fontSize="inherit" /> -{win.savings}€/год
                                </Typography>
                            )}
                          </Box>
                        </Box>
                      }
                    />
                  </ListItem>
                  <Divider />
                </React.Fragment>
              ))}
              {room.windows.length === 0 && <Typography color="text.secondary" sx={{p:1}}>Нет окон</Typography>}
            </List>
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  );
}