// components/ProjectList.tsx
import React, { useState, useEffect } from 'react';
import { 
  Box, Button, TextField, Typography, Paper, 
  List, ListItem, ListItemText, IconButton, Divider, Grid 
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import { Project } from '../features/types';
import { createNewProject, getProjects, saveProjects } from '../features/project/projectService';

interface Props {
  onSelectProject: (project: Project) => void;
}

export default function ProjectList({ onSelectProject }: Props) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [newProjectName, setNewProjectName] = useState('');

  // Загрузка при старте
  useEffect(() => {
    setProjects(getProjects());
  }, []);

  const handleCreate = () => {
    // Ручная валидация
    if (!newProjectName.trim()) {
      alert("Введите название проекта");
      return;
    }

    const newProj = createNewProject(newProjectName);
    const updatedList = [newProj, ...projects];
    
    setProjects(updatedList);
    saveProjects(updatedList);
    setNewProjectName('');
  };

  const handleDelete = (id: string) => {
    if (!confirm('Удалить проект?')) return;
    const updatedList = projects.filter(p => p.id !== id);
    setProjects(updatedList);
    saveProjects(updatedList);
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Мои Проекты</Typography>
      
      {/* Форма создания */}
      <Paper sx={{ p: 2, mb: 3, display: 'flex', gap: 2 }}>
        <TextField 
          label="Название нового проекта" 
          fullWidth 
          value={newProjectName}
          onChange={(e) => setNewProjectName(e.target.value)}
          size="small"
        />
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={handleCreate}
        >
          Создать
        </Button>
      </Paper>

      {/* Список */}
      <div className='w-100 mb-2'>
        {projects.length === 0 && (
          <Typography sx={{ p: 3, color: 'text.secondary' }}>Нет проектов. Создайте первый!</Typography>
        )}
        
        {projects.map((project) => (
          <div className='w-100 mb-2' key={project.id}>
            <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: '100%' }} className=''>
                <div className='d-flex justify-content-between align-items-center'>
  <div>
 <Typography variant="h6">{project.name}</Typography>
              <Typography variant="caption" color="text.secondary">
                Создан: {new Date(project.createdAt).toLocaleDateString()}
              </Typography>
              <Typography variant="body2" sx={{ mt: 1, mb: 2 }}>
                Комнат: {project.rooms.length}
              </Typography>
                </div>

                <Box sx={{ mt: 'auto', display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                <Button 
                  size="small" 
                  variant="outlined" 
                  startIcon={<EditIcon />}
                  onClick={() => onSelectProject(project)}
                >
                  Открыть
                </Button>
                <IconButton 
                  color="error" 
                  onClick={() => handleDelete(project.id)}
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
                </div>
              
             
              
             
            </Paper>
          </div>
        ))}
      </div>
    </Box>
  );
}