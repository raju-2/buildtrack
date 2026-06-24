import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import api from '../services/api';

const ProjectContext = createContext();

export const ProjectProvider = ({ children }) => {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(() => localStorage.getItem('buildtrack_selected_project') || '');
  const [loading, setLoading] = useState(false);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/projects');
      setProjects(data.data);
      if (!selectedProject && data.data.length > 0) {
        setSelectedProject(data.data[0]._id);
      }
    } finally {
      setLoading(false);
    }
  }, [selectedProject]);

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    if (selectedProject) localStorage.setItem('buildtrack_selected_project', selectedProject);
  }, [selectedProject]);

  return (
    <ProjectContext.Provider value={{ projects, selectedProject, setSelectedProject, fetchProjects, loading }}>
      {children}
    </ProjectContext.Provider>
  );
};

export const useProjects = () => useContext(ProjectContext);
