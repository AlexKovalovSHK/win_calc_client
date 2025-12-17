// projectService.ts

import { Project } from "../types";

const STORAGE_KEY = 'wincalc_projects';

export const getProjects = (): Project[] => {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) return [];
  try {
    return JSON.parse(data);
  } catch (e) {
    console.error("Ошибка чтения localStorage", e);
    return [];
  }
};

export const saveProjects = (projects: Project[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
};

export const createNewProject = (name: string): Project => {
  return {
    id: crypto.randomUUID(), // Или Date.now().toString(), если старый браузер
    name: name,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    rooms: []
  };
};

export const updateProjectInStorage = (updatedProject: Project) => {
  const projects = getProjects();
  const index = projects.findIndex(p => p.id === updatedProject.id);
  
  if (index !== -1) {
    updatedProject.updatedAt = new Date().toISOString();
    projects[index] = updatedProject;
    saveProjects(projects);
  }
};