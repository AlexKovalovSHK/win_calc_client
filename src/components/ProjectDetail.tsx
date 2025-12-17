// components/ProjectDetail.tsx
import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Button, Paper, TextField, 
  Accordion, AccordionSummary, AccordionDetails, 
  Divider, List, ListItem, ListItemText, IconButton,
  MenuItem, Select, FormControl, InputLabel, Chip, Tooltip, Grid 
} from '@mui/material';

// Иконки
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DeleteIcon from '@mui/icons-material/Delete';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EnergySavingsLeafIcon from '@mui/icons-material/EnergySavingsLeaf';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

// Импорты (убедитесь, что пути совпадают с вашей структурой)
import { CalculatedWindow, Project, Room } from '../features/types';
import { updateProjectInStorage } from '../features/project/projectService';
import { PROFILES } from '../db/profiles'; 
import { GLAZING_LIST } from '../db/doubleGlazingList'; 
import { calculateFullStats } from '../utils/utils'; // <-- Важно: используем новую функцию
import { my_randomUUID } from '../utils/my_random';

interface Props {
  project: Project;
  onBack: () => void;
}

export default function ProjectDetail({ project: initialProject, onBack }: Props) {
  const [project, setProject] = useState<Project>(initialProject);
  
  // --- State: Создание комнаты ---
  const [roomName, setRoomName] = useState('');
  const [roomArea, setRoomArea] = useState<number>(0);
  const [roomHeight, setRoomHeight] = useState<number>(2.7);

  // --- State: Добавление окна ---
  const [winWidth, setWinWidth] = useState(1200);
  const [winHeight, setWinHeight] = useState(1400);
  const [selectedProfileId, setSelectedProfileId] = useState<string>(PROFILES[0]?.id || '');
  const [selectedGlazingId, setSelectedGlazingId] = useState<string>(GLAZING_LIST[0]?.id || '');

  // Авто-сохранение
  useEffect(() => {
    updateProjectInStorage(project);
  }, [project]);

  // --- Логика Комнат ---
  const addRoom = () => {
    if (!roomName.trim()) return alert("Введите название комнаты");
    if (roomArea <= 0) return alert("Площадь должна быть > 0");

    const newRoom: Room = {
      id: my_randomUUID(),
      name: roomName,
      area: roomArea,
      height: roomHeight,
      windows: []
    };

    setProject(prev => ({ ...prev, rooms: [...prev.rooms, newRoom] }));
    setRoomName('');
    setRoomArea(0);
  };

  const deleteRoom = (roomId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Удалить комнату и все окна в ней?")) return;
    setProject(prev => ({ ...prev, rooms: prev.rooms.filter(r => r.id !== roomId) }));
  };

  // --- Логика Окон (Расширенная) ---
  const addWindow = (roomId: string) => {
    const profile = PROFILES.find(p => p.id === selectedProfileId);
    const glazing = GLAZING_LIST.find(g => g.id === selectedGlazingId);

    if (!profile || !glazing) {
      alert("Выберите профиль и стеклопакет");
      return;
    }

    // 1. Считаем полную статистику (BAFA, HeatLoss, etc.)
    const stats = calculateFullStats(winWidth, winHeight, profile, glazing);

    if (!stats.isValid) {
      alert(`Ошибка расчета: ${stats.error}`);
      return;
    }

    // 2. Формируем объект окна
    const newWindow: CalculatedWindow = {
      id: my_randomUUID(),
      width: winWidth,
      height: winHeight,
      
      profileId: profile.id,
      profileName: profile.name,
      glazingId: glazing.id,
      glazingName: glazing.name,
      
      uw: stats.uw,
      price: stats.priceTotal, // Цена в Евро
      
      // Новые поля для аналитики
      isBafa: stats.isBafaEligible,
      subsidy: stats.subsidyAmount,
      savings: stats.savingsEuro,
      heatLoss: stats.heatLoss
    };

    // 3. Обновляем стейт
    setProject(prev => ({
      ...prev,
      rooms: prev.rooms.map(r => {
        if (r.id === roomId) {
          return { ...r, windows: [...r.windows, newWindow] };
        }
        return r;
      })
    }));
  };

  const deleteWindow = (roomId: string, windowId: string) => {
    setProject(prev => ({
      ...prev,
      rooms: prev.rooms.map(r => {
        if (r.id === roomId) {
          return { ...r, windows: r.windows.filter(w => w.id !== windowId) };
        }
        return r;
      })
    }));
  };

  // Подсчет итогов по всему проекту
  const totalCost = project.rooms.reduce((acc, r) => acc + r.windows.reduce((wAcc, w) => wAcc + w.price, 0), 0);
  const totalSubsidy = project.rooms.reduce((acc, r) => acc + r.windows.reduce((wAcc, w) => wAcc + (w.subsidy || 0), 0), 0);

  return (
    <Box>
      {/* --- Заголовок --- */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, justifyContent: 'space-between' }}>
        <Button startIcon={<ArrowBackIcon />} onClick={onBack} variant="outlined" size="small">
          Назад
        </Button>
        <Typography variant="caption" color="text.secondary">ID: {project.id}</Typography>
      </Box>

      <Typography variant="h4" gutterBottom>{project.name}</Typography>
      
      {/* Карточка с итогами */}
      <Paper sx={{ p: 2, bgcolor: '#e8f5e9', mb: 3, border: '1px solid #c8e6c9' }}>
        <Grid container spacing={2}>
          <div>
            <Typography variant="subtitle2" color="text.secondary">Общая стоимость:</Typography>
            <Typography variant="h5" color="primary.main" fontWeight="bold">
              {totalCost.toLocaleString()} €
            </Typography>
          </div>
          <div>
            <Typography variant="subtitle2" color="text.secondary">Возможная субсидия (BAFA):</Typography>
            <Typography variant="h6" color="success.main">
              ~ {totalSubsidy.toLocaleString()} €
            </Typography>
          </div>
        </Grid>
      </Paper>

      {/* --- Форма добавления комнаты --- */}
      <Paper sx={{ p: 2, mb: 4, bgcolor: '#f8f9fa' }} elevation={1}>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
          <AddCircleOutlineIcon sx={{ mr: 1 }} /> Создать новую комнату
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <TextField 
            label="Название" size="small" variant="outlined"
            value={roomName} onChange={e => setRoomName(e.target.value)} 
          />
          <TextField 
            label="Площадь (м²)" type="number" size="small" sx={{ width: 150 }}
            value={roomArea || ''} onChange={e => setRoomArea(+e.target.value)} 
          />
          <TextField 
            label="Высота (м)" type="number" size="small" sx={{ width: 100 }}
            value={roomHeight} onChange={e => setRoomHeight(+e.target.value)} 
          />
          <Button variant="contained" onClick={addRoom}>Добавить</Button>
        </Box>
      </Paper>

      {/* --- Список комнат --- */}
      {project.rooms.map(room => (
        <Accordion key={room.id} defaultExpanded sx={{ mb: 1 }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ bgcolor: '#fafafa' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'space-between', pr: 2 }}>
              <Box>
                <Typography variant="h6">{room.name}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {room.area} м² • Окон: {room.windows.length}
                </Typography>
              </Box>
              <IconButton size="small" color="error" onClick={(e) => deleteRoom(room.id, e)}>
                <DeleteIcon />
              </IconButton>
            </Box>
          </AccordionSummary>
          
          <AccordionDetails>
            {/* Панель добавления окна */}
            <Paper variant="outlined" sx={{ p: 2, mb: 2, bgcolor: '#fff' }}>
              <Typography variant="subtitle2" gutterBottom>Конфигуратор окна</Typography>
              <Grid container spacing={2} alignItems="center">
                <div>
                  <TextField fullWidth label="Ширина" size="small" type="number" 
                    value={winWidth} onChange={e => setWinWidth(+e.target.value)} InputProps={{ endAdornment: 'mm' }}
                  />
                </div>
                <div>
                  <TextField fullWidth label="Высота" size="small" type="number" 
                    value={winHeight} onChange={e => setWinHeight(+e.target.value)} InputProps={{ endAdornment: 'mm' }}
                  />
                </div>
                <div>
                  <FormControl fullWidth size="small">
                    <InputLabel>Профиль</InputLabel>
                    <Select value={selectedProfileId} label="Профиль" onChange={e => setSelectedProfileId(e.target.value)}>
                      {PROFILES.map(p => <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>)}
                    </Select>
                  </FormControl>
                </div>
                <div>
                  <FormControl fullWidth size="small">
                    <InputLabel>Стеклопакет</InputLabel>
                    <Select value={selectedGlazingId} label="Стеклопакет" onChange={e => setSelectedGlazingId(e.target.value)}>
                      {GLAZING_LIST.map(g => <MenuItem key={g.id} value={g.id}>{g.name}</MenuItem>)}
                    </Select>
                  </FormControl>
                </div>
               <div>
                  <Button fullWidth variant="contained" onClick={() => addWindow(room.id)}>
                    Добавить
                  </Button>
                </div>
              </Grid>
            </Paper>

            {/* Список добавленных окон */}
            <List dense>
              {room.windows.map(win => (
                <React.Fragment key={win.id}>
                  <ListItem
                    disablePadding
                    sx={{ py: 1 }}
                    secondaryAction={
                      <IconButton edge="end" aria-label="delete" onClick={() => deleteWindow(room.id, win.id)}>
                        <DeleteIcon />
                      </IconButton>
                    }
                  >
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                          <Typography variant="subtitle1" fontWeight="bold">
                            {win.width} x {win.height} mm
                          </Typography>
                          
                          {/* Индикатор BAFA */}
                          {win.isBafa && (
                            <Tooltip title={`Подходит для субсидии (Uw <= 0.95). Возврат: ~${win.subsidy} €`}>
                              <Chip 
                                label="BAFA 15%" 
                                color="success" 
                                size="small" 
                                icon={<CheckCircleIcon />} 
                                sx={{ height: 24, fontWeight: 'bold' }} 
                              />
                            </Tooltip>
                          )}
                        </Box>
                      }
                      secondary={
                        <Box component="span" sx={{ display: 'flex', flexDirection: 'column', mt: 0.5, gap: 0.5 }}>
                          <Typography variant="body2" color="text.secondary">
                            {win.profileName} + {win.glazingName}
                          </Typography>
                          
                          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                            {/* Цена */}
                            <Chip 
                              label={`${win.price} €`} 
                              variant="outlined" 
                              size="small" 
                              color="primary" 
                            />

                            {/* Uw Значение */}
                            <Tooltip title="Коэффициент теплопередачи (чем меньше, тем лучше)">
                              <Typography variant="caption" sx={{ 
                                color: win.uw <= 0.95 ? 'green' : 'orange', 
                                border: '1px solid', borderColor: 'currentColor', 
                                px: 0.5, borderRadius: 1, fontWeight: 'bold'
                              }}>
                                Uw: {win.uw}
                              </Typography>
                            </Tooltip>

                            {/* Экономия энергии */}
                            {win.savings && win.savings > 0 && (
                              <Tooltip title="Экономия на отоплении по сравнению со старыми окнами">
                                <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', color: '#2e7d32' }}>
                                  <EnergySavingsLeafIcon sx={{ fontSize: 16, mr: 0.5 }} />
                                  -{win.savings} €/год
                                </Typography>
                              </Tooltip>
                            )}
                          </Box>
                        </Box>
                      }
                    />
                  </ListItem>
                  <Divider component="li" />
                </React.Fragment>
              ))}
              {room.windows.length === 0 && (
                <Typography variant="body2" color="text.secondary" sx={{ p: 2, textAlign: 'center' }}>
                  В этой комнате пока нет окон. Добавьте первое окно выше.
                </Typography>
              )}
            </List>
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  );
}