import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { loadProjects, saveProjects } from '../data/projects';

const ProjectsContext = createContext(null);

export function ProjectsProvider({ children }) {
  const [projects, setProjects] = useState(() => loadProjects());

  // Persist whenever projects change
  useEffect(() => {
    saveProjects(projects);
  }, [projects]);

  const addProject = useCallback((project) => {
    setProjects((prev) => [project, ...prev]);
  }, []);

  const updateProject = useCallback((id, updates) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );
  }, []);

  const deleteProject = useCallback((id) => {
    setProjects((prev) => prev.filter((p) => p.id !== id));
  }, []);

  return (
    <ProjectsContext.Provider value={{ projects, addProject, updateProject, deleteProject }}>
      {children}
    </ProjectsContext.Provider>
  );
}

export function useProjects() {
  const ctx = useContext(ProjectsContext);
  if (!ctx) throw new Error('useProjects must be used inside ProjectsProvider');
  return ctx;
}
